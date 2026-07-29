/* =============================================
   Creativos Craft — Shopping Cart System
   ============================================= */

(function () {
    'use strict';

    const STORAGE_KEY = 'creative_craft_cart';
    let cartItems = loadCart();

    // ==================== Data Layer ====================

    function loadCart() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch { return []; }
    }

    function saveCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    }

    function addItem(product) {
        const existing = cartItems.find(i => i.id === product.id);
        if (existing) existing.quantity += 1;
        else cartItems.push({ ...product, quantity: 1 });
        saveCart();
        updateAllUI();
        showToast(`"${product.name}" agregado al carrito`);
    }

    function removeItem(id) {
        cartItems = cartItems.filter(i => i.id !== id);
        saveCart();
        updateAllUI();
    }

    function updateQuantity(id, qty) {
        if (qty <= 0) { removeItem(id); return; }
        const item = cartItems.find(i => i.id === id);
        if (item) { item.quantity = qty; saveCart(); updateAllUI(); }
    }

    function getTotal() {
        return cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    }

    function getCount() {
        return cartItems.reduce((s, i) => s + i.quantity, 0);
    }

    function clearCart() {
        cartItems = [];
        saveCart();
        updateAllUI();
    }

    function fmt(n) {
        return '$' + n.toLocaleString('es-AR');
    }

    // ==================== UI Injection ====================

    function injectCartButton() {
        const nav = document.querySelector('.nav-container');
        if (!nav || document.getElementById('navCart')) return;

        const btn = document.createElement('button');
        btn.className = 'nav-cart';
        btn.id = 'navCart';
        btn.setAttribute('aria-label', 'Carrito de compras');
        btn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span class="cart-badge" id="cartBadge"></span>`;

        const toggle = nav.querySelector('.nav-toggle');
        toggle ? nav.insertBefore(btn, toggle) : nav.appendChild(btn);
        btn.addEventListener('click', toggleDrawer);
    }

    function injectCartDrawer() {
        if (document.getElementById('cartDrawer')) return;

        const overlay = document.createElement('div');
        overlay.className = 'cart-overlay';
        overlay.id = 'cartOverlay';
        overlay.addEventListener('click', closeDrawer);

        const drawer = document.createElement('div');
        drawer.className = 'cart-drawer';
        drawer.id = 'cartDrawer';
        drawer.innerHTML = `
            <div class="cart-drawer-header">
                <h3>🛒 Tu Carrito</h3>
                <button class="cart-drawer-close" id="cartDrawerClose" aria-label="Cerrar carrito">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="cart-drawer-body" id="cartDrawerBody"></div>
            <div class="cart-drawer-footer" id="cartDrawerFooter"></div>`;

        document.body.appendChild(overlay);
        document.body.appendChild(drawer);
        document.getElementById('cartDrawerClose').addEventListener('click', closeDrawer);
    }

    function injectToastContainer() {
        if (document.getElementById('toastContainer')) return;
        const c = document.createElement('div');
        c.className = 'toast-container';
        c.id = 'toastContainer';
        document.body.appendChild(c);
    }

    // ==================== Drawer ====================

    function toggleDrawer() {
        document.getElementById('cartDrawer')?.classList.contains('open') ? closeDrawer() : openDrawer();
    }

    function openDrawer() {
        document.getElementById('cartDrawer')?.classList.add('open');
        document.getElementById('cartOverlay')?.classList.add('active');
        document.body.style.overflow = 'hidden';
        renderDrawer();
    }

    function closeDrawer() {
        document.getElementById('cartDrawer')?.classList.remove('open');
        document.getElementById('cartOverlay')?.classList.remove('active');
        document.body.style.overflow = '';
    }

    function renderDrawer() {
        const body = document.getElementById('cartDrawerBody');
        const footer = document.getElementById('cartDrawerFooter');
        if (!body || !footer) return;

        if (cartItems.length === 0) {
            body.innerHTML = `
                <div class="cart-empty">
                    <span class="cart-empty-icon">🛒</span>
                    <p>Tu carrito está vacío</p>
                    <span class="cart-empty-sub">Agregá productos para comenzar</span>
                </div>`;
            footer.innerHTML = '';
            return;
        }

        body.innerHTML = cartItems.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-icon">${item.icon}</div>
                <div class="cart-item-details">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">${fmt(item.price)} c/u</span>
                </div>
                <div class="cart-item-actions">
                    <div class="cart-qty-controls">
                        <button class="qty-btn qty-minus" data-id="${item.id}">−</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
                    </div>
                    <span class="cart-item-subtotal">${fmt(item.price * item.quantity)}</span>
                    <button class="cart-item-remove" data-id="${item.id}" aria-label="Eliminar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg>
                    </button>
                </div>
            </div>`).join('');

        footer.innerHTML = `
            <div class="cart-total">
                <span>Total</span>
                <span class="cart-total-amount">${fmt(getTotal())}</span>
            </div>
            <a href="checkout.html" class="btn btn-primary cart-checkout-btn">
                <span>Ir al Checkout</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <button class="btn btn-secondary cart-continue-btn" id="cartContinueBtn">Seguir Comprando</button>`;

        // Wire quantity + remove events
        body.querySelectorAll('.qty-minus').forEach(b => b.addEventListener('click', () => {
            const it = cartItems.find(i => i.id === b.dataset.id);
            if (it) { updateQuantity(b.dataset.id, it.quantity - 1); renderDrawer(); }
        }));
        body.querySelectorAll('.qty-plus').forEach(b => b.addEventListener('click', () => {
            const it = cartItems.find(i => i.id === b.dataset.id);
            if (it) { updateQuantity(b.dataset.id, it.quantity + 1); renderDrawer(); }
        }));
        body.querySelectorAll('.cart-item-remove').forEach(b => b.addEventListener('click', () => {
            removeItem(b.dataset.id);
            renderDrawer();
        }));
        document.getElementById('cartContinueBtn')?.addEventListener('click', closeDrawer);
    }

    // ==================== Badge ====================

    function updateBadge() {
        const badge = document.getElementById('cartBadge');
        if (!badge) return;
        const c = getCount();
        badge.textContent = c;
        badge.style.display = c > 0 ? 'flex' : 'none';
    }

    // ==================== Toast ====================

    function showToast(msg) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const t = document.createElement('div');
        t.className = 'toast';
        t.innerHTML = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg><span>${msg}</span>`;
        container.appendChild(t);
        requestAnimationFrame(() => t.classList.add('show'));
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2800);
    }

    // ==================== Customization Modal ====================

    function injectCustomModal() {
        if (document.getElementById('customOptionsModal')) return;
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'custom-modal-overlay';
        modalOverlay.id = 'customOptionsModal';
        modalOverlay.innerHTML = `
            <div class="custom-modal">
                <div class="custom-modal-header">
                    <div class="custom-modal-title">
                        <span>✨</span>
                        <span id="customModalProductName">Personalizá tu producto</span>
                    </div>
                    <button class="custom-modal-close" id="customModalClose">&times;</button>
                </div>
                <p class="custom-modal-subtitle">Seleccioná la opción de personalización que preferís:</p>
                <div class="custom-options-list">
                    <label class="custom-option-item">
                        <input type="radio" name="customOption" value="Opción 1" checked>
                        <img src="img/opcion1.jpg" alt="Opción 1" class="custom-option-img">
                        <div class="custom-option-text">
                            <span class="custom-option-label">Opción 1</span>
                            <span class="custom-option-desc">Diseño estándar con colores vibrantes y acabado brillante.</span>
                        </div>
                    </label>
                    <label class="custom-option-item">
                        <input type="radio" name="customOption" value="Opción 2">
                        <img src="img/opcion2.jpg" alt="Opción 2" class="custom-option-img">
                        <div class="custom-option-text">
                            <span class="custom-option-label">Opción 2</span>
                            <span class="custom-option-desc">Textura suave con gradientes de tonos cálidos y pastel.</span>
                        </div>
                    </label>
                    <label class="custom-option-item">
                        <input type="radio" name="customOption" value="Opción 3">
                        <img src="img/opcion3.jpg" alt="Opción 3" class="custom-option-img">
                        <div class="custom-option-text">
                            <span class="custom-option-label">Opción 3</span>
                            <span class="custom-option-desc">Estilo geométrico moderno con contrastes marcados y neón.</span>
                        </div>
                    </label>
                </div>
                <div class="custom-modal-actions">
                    <button class="custom-modal-btn-confirm" id="customModalConfirm">Confirmar y Agregar al Carrito</button>
                </div>
            </div>`;
        document.body.appendChild(modalOverlay);

        document.getElementById('customModalClose').addEventListener('click', closeCustomModal);
        modalOverlay.addEventListener('click', e => {
            if (e.target === modalOverlay) closeCustomModal();
        });
    }

    let pendingProductData = null;

    function openCustomModal(productData, btnElement) {
        injectCustomModal();
        pendingProductData = { data: productData, btn: btnElement };
        const modalName = document.getElementById('customModalProductName');
        if (modalName) modalName.textContent = productData.name;

        const modal = document.getElementById('customOptionsModal');
        if (modal) modal.classList.add('active');

        const confirmBtn = document.getElementById('customModalConfirm');
        const newConfirm = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);

        newConfirm.addEventListener('click', () => {
            const selectedRadio = document.querySelector('input[name="customOption"]:checked');
            const selectedOption = selectedRadio ? selectedRadio.value : 'Opción 1';

            if (pendingProductData) {
                const itemToSave = {
                    ...pendingProductData.data,
                    id: `${pendingProductData.data.id}-${selectedOption.replace(/\s+/g, '-').toLowerCase()}`,
                    name: `${pendingProductData.data.name} (${selectedOption})`
                };
                addItem(itemToSave);

                if (pendingProductData.btn) {
                    const btn = pendingProductData.btn;
                    btn.classList.add('added');
                    const orig = btn.innerHTML;
                    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg><span>¡Agregado!</span>`;
                    setTimeout(() => { btn.classList.remove('added'); btn.innerHTML = orig; }, 1500);
                }
            }
            closeCustomModal();
        });
    }

    function closeCustomModal() {
        const modal = document.getElementById('customOptionsModal');
        if (modal) modal.classList.remove('active');
        pendingProductData = null;
    }

    // ==================== Add-to-Cart Buttons ====================

    function wireAddButtons() {
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', e => {
                e.preventDefault();
                const card = btn.closest('.product-card');
                if (!card?.dataset.id) return;

                const isCustomizable = Array.from(card.querySelectorAll('.badge')).some(b => 
                    b.textContent.toLowerCase().includes('personaliz')
                ) || card.dataset.customizable === 'true';

                const productData = {
                    id: card.dataset.id,
                    name: card.querySelector('.product-name')?.textContent || 'Producto',
                    price: parseFloat(card.dataset.price) || 0,
                    icon: card.dataset.icon || '📦'
                };

                if (isCustomizable) {
                    openCustomModal(productData, btn);
                } else {
                    addItem(productData);

                    // Feedback animation
                    btn.classList.add('added');
                    const orig = btn.innerHTML;
                    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg><span>¡Agregado!</span>`;
                    setTimeout(() => { btn.classList.remove('added'); btn.innerHTML = orig; }, 1500);
                }
            });
        });
    }

    // ==================== Update All UI ====================

    function updateAllUI() {
        updateBadge();
        const drawer = document.getElementById('cartDrawer');
        if (drawer?.classList.contains('open')) renderDrawer();
        if (typeof window._updateCheckoutSummary === 'function') window._updateCheckoutSummary();
    }

    // ==================== Checkout Page ====================

    function initCheckout() {
        if (!document.getElementById('checkoutPage')) return;

        window._updateCheckoutSummary = renderCheckoutSummary;
        renderCheckoutSummary();
        initStripeCheckout();
    }

    function renderCheckoutSummary() {
        const list = document.getElementById('checkoutItems');
        const totalEl = document.getElementById('checkoutTotal');
        const countEl = document.getElementById('checkoutCount');
        const empty = document.getElementById('checkoutEmpty');
        const form = document.getElementById('checkoutFormSection');
        if (!list) return;

        if (cartItems.length === 0) {
            if (empty) empty.style.display = 'flex';
            if (form) form.style.display = 'none';
            list.innerHTML = '';
            if (totalEl) totalEl.textContent = '$0';
            if (countEl) countEl.textContent = '0';
            return;
        }

        if (empty) empty.style.display = 'none';
        if (form) form.style.display = 'grid';

        list.innerHTML = cartItems.map(item => `
            <div class="checkout-item">
                <span class="checkout-item-icon">${item.icon}</span>
                <div class="checkout-item-info">
                    <span class="checkout-item-name">${item.name}</span>
                    <span class="checkout-item-qty">x${item.quantity} — ${fmt(item.price)} c/u</span>
                </div>
                <span class="checkout-item-price">${fmt(item.price * item.quantity)}</span>
            </div>`).join('');

        if (totalEl) totalEl.textContent = fmt(getTotal());
        if (countEl) countEl.textContent = getCount();
    }

    function initStripeCheckout() {
        const form = document.getElementById('paymentForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate required fields
            let valid = true;
            form.querySelectorAll('[required]').forEach(inp => {
                if (!inp.value.trim()) { inp.classList.add('input-error'); valid = false; }
                else inp.classList.remove('input-error');
            });
            if (!valid) { showToast('⚠️ Completá todos los campos'); return; }

            const btn = document.getElementById('payBtn');
            if (!btn) return;

            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span><span>Redirigiendo a Stripe...</span>';
            btn.classList.add('btn-loading');

            try {
                const res = await fetch('/api/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: cartItems }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || `Error del servidor (${res.status})`);
                }

                if (!data.url) {
                    throw new Error('No se recibió URL de pago');
                }

                window.location.href = data.url;
            } catch (err) {
                console.error('Stripe error:', err);
                showToast(`❌ ${err.message || 'Error al conectar con Stripe. Intentá de nuevo.'}`);
                btn.disabled = false;
                btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg><span>Pagar con Stripe</span>';
                btn.classList.remove('btn-loading');
            }
        });
    }

    // ==================== Init ====================

    function init() {
        injectCartButton();
        injectCartDrawer();
        injectToastContainer();
        wireAddButtons();
        updateBadge();
        initCheckout();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    // Public API
    window.CreativosCraftCart = { addItem, removeItem, updateQuantity, getTotal, getCount, clearCart, openDrawer, closeDrawer, getItems: () => [...cartItems] };
})();

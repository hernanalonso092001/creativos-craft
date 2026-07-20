/* =============================================
   Creativos Craft — Express Server + Stripe
   ============================================= */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS, images) from project root
app.use(express.static('.'));

// ==================== Stripe Checkout ====================

app.post('/create-checkout-session', async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'No se recibieron productos.' });
        }

        const line_items = items.map(item => ({
            price_data: {
                currency: 'uyu',
                product_data: {
                    name: item.name,
                    description: `Producto Creativos Craft — ${item.icon || '📦'}`,
                },
                unit_amount: Math.round(item.price * 100), // Stripe usa centésimos
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            success_url: `${process.env.DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.DOMAIN}/cancel.html`,
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error('❌ Error creando sesión de Stripe:', err.message);
        res.status(500).json({ error: 'Error interno al crear la sesión de pago.' });
    }
});

// ==================== Start Server ====================

app.listen(PORT, () => {
    console.log(`\n✦ Creativos Craft Server`);
    console.log(`  → http://localhost:${PORT}`);
    console.log(`  → Stripe mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? '🧪 TEST' : '🔴 LIVE'}\n`);
});

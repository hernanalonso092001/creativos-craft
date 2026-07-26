/* =============================================
   Creativos Craft — Vercel Serverless Function
   Stripe Checkout Session
   ============================================= */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Solo aceptar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    // Verificar que Stripe está configurado
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('❌ STRIPE_SECRET_KEY no está configurada');
        return res.status(500).json({ error: 'Error de configuración del servidor.' });
    }

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

        const domain = process.env.DOMAIN || `https://${req.headers.host}`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            success_url: `${domain}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domain}/cancel.html`,
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error('❌ Error creando sesión de Stripe:', err.message);
        res.status(500).json({ error: 'Error interno al crear la sesión de pago.' });
    }
};

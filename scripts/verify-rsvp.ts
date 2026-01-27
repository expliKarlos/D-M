/**
 * RSVP Verification Script
 * This script can be run locally to test the /api/rsvp endpoint.
 */
async function verifyRSVP() {
    const payload = {
        name: 'Invitado de Prueba',
        attending: true,
        dietary_restrictions: 'Vegano, sin gluten',
        comments: '¡Estamos muy emocionados por asistir!',
        language: 'es',
        // Optional attachment example (base64)
        attachment: {
            filename: 'saludo.txt',
            content: Buffer.from('Hola María y Digvijay, ¡nos vemos pronto!').toString('base64')
        }
    };

    console.log('--- Probando RSVP API ---');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch('http://localhost:3000/api/rsvp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Éxito:', data);
        } else {
            console.log('❌ Error:', response.status, data);
        }
    } catch (error) {
        console.error('💥 Error de conexión:', error.message);
        console.log('Nota: Asegúrate de que el servidor local (npm run dev) esté funcionando.');
    }
}

verifyRSVP();

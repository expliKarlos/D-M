/**
 * Seed script to populate initial timeline events in Firestore
 * Run with: node --loader ts-node/esm scripts/seed-timeline.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (getApps().length === 0) {
    const serviceAccountBase64 = process.env.SERVICE_ACCOUNT_BASE64;
    if (!serviceAccountBase64) {
        throw new Error('SERVICE_ACCOUNT_BASE64 environment variable is required');
    }

    const serviceAccount = JSON.parse(
        Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
    );

    initializeApp({
        credential: cert(serviceAccount),
    });
}

const db = getFirestore();

// Initial timeline events (matching current static data)
const initialEvents = [
    {
        country: 'Valladolid',
        title: 'Ceremonia',
        date: '12 de Junio, 2026',
        time: '18:00',
        description: 'Ceremonia oficial de nuestra unión en el histórico Monasterio de Valbuena, rodeados de viñedos y la belleza de Castilla.',
        location: 'Monasterio Santa María de Valbuena',
        coordinates: { lat: 41.6176, lng: -4.7492 },
        image: '/info/ciudad01.png', // Will need to be uploaded to Supabase
        fullDate: new Date('2026-06-12T18:00:00'),
        order: 0,
    },
    {
        country: 'Valladolid',
        title: 'Cena de Celebración',
        date: '12 de Junio, 2026',
        time: '20:00',
        description: 'Cena de gala en el emblemático Hotel Castilla Termal, con vistas a los viñedos de la Ribera del Duero.',
        location: 'Hotel Castilla Termal',
        coordinates: { lat: 41.6176, lng: -4.7492 },
        image: '/info/ciudad02.png',
        fullDate: new Date('2026-06-12T20:00:00'),
        order: 1,
    },
    {
        country: 'Valladolid',
        title: 'Fiesta',
        date: '13 de Junio, 2026',
        time: '20:00',
        description: 'Gran fiesta de celebración con música, baile y diversión hasta el amanecer en El Otero.',
        location: 'El Otero',
        coordinates: { lat: 41.6528, lng: -4.7239 },
        image: '/info/ciudad03.png',
        fullDate: new Date('2026-06-13T20:00:00'),
        order: 2,
    },
    {
        country: 'India',
        title: 'Ceremonia Hindu',
        date: '20 de Septiembre, 2026',
        time: '12:00',
        description: 'Ceremonia tradicional hindú con todos los rituales sagrados que unen a nuestras familias para siempre.',
        location: 'Templo Tradicional, India',
        coordinates: { lat: 28.6127, lng: 77.2773 },
        image: '/info/info01.png',
        fullDate: new Date('2026-09-20T12:00:00'),
        order: 3,
    },
    {
        country: 'India',
        title: 'Comida de Celebración',
        date: '20 de Septiembre, 2026',
        time: '14:00',
        description: 'Gran banquete tradicional indio con platos auténticos y celebración familiar.',
        location: 'Salón de Banquetes',
        coordinates: { lat: 28.5494, lng: 77.2001 },
        image: '/info/info02.png',
        fullDate: new Date('2026-09-20T14:00:00'),
        order: 4,
    },
    {
        country: 'India',
        title: 'Ceremonia Final',
        date: '21 de Septiembre, 2026',
        time: '12:00',
        description: 'Ceremonia final y bendiciones para nuestra nueva vida juntos, rodeados de familia y amigos.',
        location: 'Jardines del Palacio',
        coordinates: { lat: 28.5494, lng: 77.2001 },
        image: '/info/info03.png',
        fullDate: new Date('2026-09-21T12:00:00'),
        order: 5,
    },
];

async function seedTimelineEvents() {
    try {
        console.log('🌱 Starting timeline events seeding...');

        const timelineRef = db.collection('timeline_events');

        // Check if events already exist
        const existingEvents = await timelineRef.get();
        if (!existingEvents.empty) {
            console.log(`⚠️  Found ${existingEvents.size} existing events.`);
            console.log('   Delete them first or skip seeding.');
            return;
        }

        // Add each event
        for (const event of initialEvents) {
            const now = Timestamp.now();
            const firestoreEvent = {
                ...event,
                fullDate: Timestamp.fromDate(event.fullDate),
                createdAt: now,
                updatedAt: now,
            };

            const docRef = await timelineRef.add(firestoreEvent);
            console.log(`✅ Created event: ${event.title} (ID: ${docRef.id})`);
        }

        console.log('\n🎉 Timeline events seeded successfully!');
        console.log(`   Total events: ${initialEvents.length}`);
        console.log('\n⚠️  Note: Images are currently using /info/* paths.');
        console.log('   You should upload them to Supabase Storage and update the URLs.');

    } catch (error) {
        console.error('❌ Error seeding timeline events:', error);
        throw error;
    }
}

// Run the seed function
seedTimelineEvents()
    .then(() => {
        console.log('\n✨ Seeding complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Seeding failed:', error);
        process.exit(1);
    });

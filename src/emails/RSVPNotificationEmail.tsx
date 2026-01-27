import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Img,
} from '@react-email/components';
import * as React from 'react';

interface RSVPNotificationEmailProps {
    guestName: string;
    attending: boolean;
    dietaryRestrictions?: string;
    comments?: string;
    language?: string;
}

export const RSVPNotificationEmail = ({
    guestName = 'Invitado',
    attending = true,
    dietaryRestrictions = 'Ninguna',
    comments = 'Sin comentarios adicionales',
    language = 'es',
}: RSVPNotificationEmailProps) => {
    const statusColor = attending ? '#10b981' : '#ef4444';
    const statusText = attending
        ? (language === 'hi' ? 'आ रहे हैं' : (language === 'en' ? 'Attending' : 'Asistirá'))
        : (language === 'hi' ? 'नहीं आ रहे हैं' : (language === 'en' ? 'Not Attending' : 'No asistirá'));

    return (
        <Html>
            <Head />
            <Preview>RSVP: {guestName} - {statusText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={logoText}>M & D</Text>
                        <Heading style={h1}>Nueva Confirmación de Asistencia</Heading>
                    </Section>

                    <Section style={content}>
                        <Text style={paragraph}>Hola María y दिग्विजय,</Text>
                        <Text style={paragraph}>
                            Han recibido una nueva respuesta al RSVP de la boda:
                        </Text>

                        <Section style={card}>
                            <Text style={label}>Invitado:</Text>
                            <Text style={value}>{guestName}</Text>

                            <Hr style={hr} />

                            <Text style={label}>Estado:</Text>
                            <Text style={{ ...value, color: statusColor, fontWeight: 'bold' }}>
                                {statusText}
                            </Text>

                            <Hr style={hr} />

                            <Text style={label}>Dieta / Alergias:</Text>
                            <Text style={value}>{dietaryRestrictions || 'Ninguna'}</Text>

                            <Hr style={hr} />

                            <Text style={label}>Comentarios:</Text>
                            <Text style={value}>{comments || 'Ninguno'}</Text>
                        </Section>

                        <Text style={footer}>
                            Este correo es una notificación automática del Wedding App de María & Digvijay (2026).
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default RSVPNotificationEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
};

const header = {
    padding: '32px',
    textAlign: 'center' as const,
};

const logoText = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#f43f5e', // Rose color matching wedding theme
    letterSpacing: '4px',
    margin: '0 0 16px',
};

const h1 = {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '30px 0',
    color: '#1f2937',
};

const content = {
    padding: '0 32px',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#4b5563',
};

const card = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '24px',
    margin: '24px 0',
    border: '1px solid #e5e7eb',
};

const label = {
    fontSize: '12px',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '0 0 4px',
};

const value = {
    fontSize: '16px',
    color: '#1f2937',
    margin: '0 0 16px',
};

const hr = {
    borderColor: '#e5e7eb',
    margin: '12px 0',
};

const footer = {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center' as const,
    marginTop: '32px',
};

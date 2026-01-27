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
    Font,
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
    dietaryRestrictions = '',
    comments = '',
    language = 'es',
}: RSVPNotificationEmailProps) => {
    const statusColor = attending ? '#10b981' : '#ef4444';
    const statusEmoji = attending ? '✓' : '✗';
    const statusText = attending
        ? (language === 'hi' ? 'आ रहे हैं' : (language === 'en' ? 'Attending' : 'Asistirá'))
        : (language === 'hi' ? 'नहीं आ रहे हैं' : (language === 'en' ? 'Not Attending' : 'No asistirá'));

    const languageLabel = language === 'es' ? 'Español' : language === 'en' ? 'English' : 'हिन्दी';

    return (
        <Html>
            <Head>
                <Font
                    fontFamily="Cinzel"
                    fallbackFontFamily="serif"
                    webFont={{
                        url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap',
                        format: 'woff2',
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
                <Font
                    fontFamily="Inter"
                    fallbackFontFamily="sans-serif"
                    webFont={{
                        url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap',
                        format: 'woff2',
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            <Preview>[RSVP] {guestName} ha confirmado ({languageLabel})</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header with Monogram */}
                    <Section style={header}>
                        <Text style={monogram}>M & D</Text>
                        <Heading style={h1}>Nueva Confirmación</Heading>
                        <Text style={subtitle}>Wedding RSVP</Text>
                    </Section>

                    {/* Content Card */}
                    <Section style={card}>
                        {/* Guest Name */}
                        <Section style={infoRow}>
                            <Text style={iconText}>👤</Text>
                            <Section style={infoContent}>
                                <Text style={label}>Invitado</Text>
                                <Text style={value}>{guestName}</Text>
                            </Section>
                        </Section>

                        <Hr style={divider} />

                        {/* Status */}
                        <Section style={infoRow}>
                            <Text style={iconText}>{statusEmoji}</Text>
                            <Section style={infoContent}>
                                <Text style={label}>Estado</Text>
                                <Text style={{ ...value, color: statusColor, fontWeight: '600' }}>
                                    {statusText}
                                </Text>
                            </Section>
                        </Section>

                        <Hr style={divider} />

                        {/* Language */}
                        <Section style={infoRow}>
                            <Text style={iconText}>🌐</Text>
                            <Section style={infoContent}>
                                <Text style={label}>Idioma</Text>
                                <Text style={value}>{languageLabel}</Text>
                            </Section>
                        </Section>

                        {dietaryRestrictions && (
                            <>
                                <Hr style={divider} />
                                <Section style={infoRow}>
                                    <Text style={iconText}>🍽️</Text>
                                    <Section style={infoContent}>
                                        <Text style={label}>Restricciones Alimentarias</Text>
                                        <Text style={value}>{dietaryRestrictions}</Text>
                                    </Section>
                                </Section>
                            </>
                        )}

                        {comments && (
                            <>
                                <Hr style={divider} />
                                <Section style={messageSection}>
                                    <Text style={label}>💌 Mensaje</Text>
                                    <Text style={commentText}>&ldquo;{comments}&rdquo;</Text>
                                </Section>
                            </>
                        )}
                    </Section>

                    {/* Footer */}
                    <Text style={footer}>
                        María & Digvijay · 2026
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default RSVPNotificationEmail;

// ===== STYLES =====

const main = {
    backgroundColor: '#F9F9F9',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px 0',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '0',
    maxWidth: '600px',
    borderRadius: '16px',
    overflow: 'hidden' as const,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
};

const header = {
    padding: '48px 32px 32px',
    textAlign: 'center' as const,
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #f0f0f0',
};

const monogram = {
    fontFamily: 'Cinzel, serif',
    fontSize: '32px',
    fontWeight: '700',
    color: '#333333',
    letterSpacing: '6px',
    margin: '0 0 12px',
    lineHeight: '1',
};

const h1 = {
    fontFamily: 'Cinzel, serif',
    fontSize: '20px',
    fontWeight: '400',
    color: '#333333',
    margin: '0 0 4px',
    letterSpacing: '1px',
};

const subtitle = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    color: '#999999',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    margin: '0',
};

const card = {
    padding: '32px',
    backgroundColor: '#ffffff',
};

const infoRow = {
    display: 'flex' as const,
    alignItems: 'flex-start' as const,
    marginBottom: '8px',
};

const iconText = {
    fontSize: '20px',
    marginRight: '16px',
    lineHeight: '1',
    minWidth: '24px',
    marginTop: '2px',
};

const infoContent = {
    flex: '1',
};

const label = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '11px',
    color: '#999999',
    textTransform: 'uppercase' as const,
    letterSpacing: '1.5px',
    margin: '0 0 4px',
    fontWeight: '600',
};

const value = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '16px',
    color: '#333333',
    margin: '0',
    lineHeight: '1.5',
};

const divider = {
    borderColor: '#f0f0f0',
    margin: '20px 0',
};

const messageSection = {
    marginTop: '8px',
};

const commentText = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '15px',
    color: '#555555',
    fontStyle: 'italic',
    lineHeight: '1.6',
    margin: '12px 0 0',
    padding: '16px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    borderLeft: '3px solid #e0e0e0',
};

const footer = {
    fontFamily: 'Cinzel, serif',
    fontSize: '11px',
    color: '#CCCCCC',
    textAlign: 'center' as const,
    padding: '24px 32px',
    letterSpacing: '2px',
};

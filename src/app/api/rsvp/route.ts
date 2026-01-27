import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import RSVPNotificationEmail from '@/emails/RSVPNotificationEmail';
import { createAdminClient } from '@/lib/utils/supabase/admin';

// Use fallback for build time, will fail at runtime if not configured
const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder_key_for_build');

const supabase = createAdminClient();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            guestId, // Optional: if we want to update an existing record
            name,
            attending,
            dietary_restrictions,
            comments,
            country_code,
            phone,
            attachment, // Optional: { filename: string, content: string (base64) }
            language = 'es'
        } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // 1. Save/Update Guest Data in Supabase
        // We assume there's a 'guests' table
        const { data: upsertData, error: upsertError } = await supabase
            .from('guests')
            .upsert({
                id: guestId || undefined,
                name: name,
                attending: attending,
                dietary_restrictions: dietary_restrictions,
                comments: comments,
                country_code: country_code,
                phone: phone,
                updated_at: new Date().toISOString()
            }, { onConflict: 'name' }) // Simplification for demo
            .select();

        if (upsertError) {
            console.error('Supabase Error:', upsertError);
            return NextResponse.json({ error: 'Failed to update guest data' }, { status: 500 });
        }

        // 2. Prepare Email Options
        const languageLabel = language === 'es' ? 'Español' : language === 'en' ? 'English' : 'हिन्दी';
        const emailOptions: any = {
            from: 'Wedding App <boda@maria-digvijay.com>',
            to: 'boda@maria-digvijay.com',
            subject: `[RSVP] ${name} ha confirmado (${languageLabel})`,
            react: RSVPNotificationEmail({
                guestName: name,
                attending: attending,
                dietaryRestrictions: dietary_restrictions,
                comments: comments,
                countryCode: country_code,
                phone: phone,
                language: language
            }),
        };

        // 3. Handle Optional Attachment
        if (attachment && attachment.content && attachment.filename) {
            emailOptions.attachments = [
                {
                    filename: attachment.filename,
                    content: attachment.content, // Should be base64 string
                }
            ];
        }

        // 4. Send Notification via Resend
        const { data: emailData, error: emailError } = await resend.emails.send(emailOptions);

        if (emailError) {
            console.error('Resend Error:', emailError);
            // We still return 200 if the DB was updated, but mention the email failed?
            // Or 500 if both are critical. Usually email is for notification.
            return NextResponse.json({
                success: true,
                message: 'RSVP saved, but email notification failed',
                error: emailError
            }, { status: 207 });
        }

        return NextResponse.json({
            success: true,
            guest: upsertData[0],
            email: emailData
        });

    } catch (error: any) {
        console.error('RSVP API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

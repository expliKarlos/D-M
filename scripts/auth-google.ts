import { google } from 'googleapis';
import readline from 'readline';
import http from 'http';
import url from 'url';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer.trim());
        });
    });
};

async function getRefreshToken() {
    console.log('\n🔐 Google Drive OAuth2 Setup Helper (Web Flow)');
    console.log('----------------------------------------------');
    console.log('To fix the "redirect_uri_mismatch" error, we will use a local server.\n');

    console.log('⚠️  IMPORTANT PRE-REQUISITE:');
    console.log('1. Go to Google Cloud Console > APIs & Credentials > Your Client ID');
    console.log('2. Add this EXACT URL to "Authorized redirect URIs":');
    console.log('   👉 http://localhost:3001/oauth2callback');
    console.log('3. Save changes.\n');

    const clientId = await question('Enter your OAuth2 Client ID: ');
    const clientSecret = await question('Enter your OAuth2 Client Secret: ');

    const redirectUri = 'http://localhost:3001/oauth2callback';

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
    );

    // Generate the url that will be used for authorization
    const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/drive.file'],
        prompt: 'consent'
    });

    console.log('\n⏳ Starting local server to capture authentication...');

    const server = http.createServer(async (req, res) => {
        try {
            if (req.url!.indexOf('/oauth2callback') > -1) {
                const qs = new url.URL(req.url!, 'http://localhost:3001').searchParams;
                const code = qs.get('code');

                res.end('Authentication successful! You can close this window and check your terminal.');
                server.close();

                if (code) {
                    console.log('\n✅ Code received! Exchanging for tokens...');
                    const { tokens } = await oauth2Client.getToken(code);

                    console.log('\n-------------------------------------------------------');
                    console.log('✅ SUCCESS! Here are your credentials for Vercel / .env.local:');
                    console.log('-------------------------------------------------------');
                    console.log(`GOOGLE_CLIENT_ID=${clientId}`);
                    console.log(`GOOGLE_CLIENT_SECRET=${clientSecret}`);
                    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
                    console.log('-------------------------------------------------------\n');

                    if (!tokens.refresh_token) {
                        console.warn('⚠️  Warning: No refresh_token returned. Apps usually only return it the FIRST time you authorize.');
                        console.warn('   Go to https://myaccount.google.com/permissions, remove access for this app, and try again.');
                    }
                    process.exit(0);
                }
            }
        } catch (e: any) {
            console.error('Callback setup failed:', e.message);
            res.end('Authentication failed');
        }
    }).listen(3001, () => {
        console.log(`\n👉 Open this URL in your browser:\n\n${authorizeUrl}\n`);
    });
}

getRefreshToken();

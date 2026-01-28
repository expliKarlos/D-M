import { google } from 'googleapis';
import readline from 'readline';

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
    console.log('\n🔐 Google Drive OAuth2 Setup Helper');
    console.log('-----------------------------------');
    console.log('To upload files to a Personal Google Drive, we need to use OAuth2 instead of a Service Account.');
    console.log('You will need a "Verification Status: Testing" project or a published app in Google Cloud Console.\n');

    const clientId = await question('Enter your OAuth2 Client ID: ');
    const clientSecret = await question('Enter your OAuth2 Client Secret: ');

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'urn:ietf:wg:oauth:2.0:oob' // For manual copy-paste of code
    );

    // Generate the url that will be used for authorization
    const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Critical for getting refresh_token
        scope: [
            'https://www.googleapis.com/auth/drive.file', // Create and manage specific files
        ],
        prompt: 'consent' // Force new Refresh Token
    });

    console.log('\n👉 Open this URL in your browser:');
    console.log(authorizeUrl);
    console.log('\nAuthorize the app (you might see "App not verified" -> Click "Advanced" -> "Go to ... (unsafe)")');

    const code = await question('\nPaste the code from the browser here: ');

    try {
        const { tokens } = await oauth2Client.getToken(code);

        console.log('\n✅ SUCCESS! Here are your credentials for .env.local / Vercel:\n');
        console.log(`GOOGLE_CLIENT_ID=${clientId}`);
        console.log(`GOOGLE_CLIENT_SECRET=${clientSecret}`);
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);

        if (!tokens.refresh_token) {
            console.warn('\n⚠️  Warning: No refresh_token returned. Did you already authorize this app?');
            console.warn('Try revoking access at https://myaccount.google.com/permissions and run this script again.');
        }

    } catch (error: any) {
        console.error('\n❌ Error retrieving access token:', error.message);
    } finally {
        rl.close();
    }
}

getRefreshToken();

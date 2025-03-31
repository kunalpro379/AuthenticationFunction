import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI as string;

const oauth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);

interface GoogleUserInfo {
    email: string;
    name: string;
    picture: string;
    verified_email: boolean;
}

export const getGoogleAuthURL = () => {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
    });
};

export const getGoogleOauthToken = async (code: string) => {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};

export const getGoogleUser = async (access_token: string): Promise<GoogleUserInfo> => {
    const { data } = await axios.get<GoogleUserInfo>(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    );
    return data;
};
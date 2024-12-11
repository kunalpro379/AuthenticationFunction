import https from 'https';
import crypto from 'crypto';

const region = process.env.REGION || 'ap-south-1';
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const jwksUri = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

export const getJWKS = () => {
  return new Promise((resolve, reject) => {
    https.get(jwksUri, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

const base64UrlDecode = (str) => {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const buffer = Buffer.from(base64, 'base64');
    return JSON.parse(buffer.toString('utf-8'));
  } catch (error) {
    throw new Error(`Failed to decode base64 URL: ${error.message}`);
  }
};

export const validateToken = async (event) => {
  try {
    const authHeader = event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized. Missing or invalid token.' }),
      };
    }

    const token = authHeader.split(" ")[1];
    const tokenParts = token.split('.');
    const decodedHeader = base64UrlDecode(tokenParts[0]);

    const jwks = await getJWKS();
    const key = jwks.keys.find(k => k.kid === decodedHeader.kid);

    if (!key) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid key' }),
      };
    }

    const decodedPayload = base64UrlDecode(tokenParts[1]);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Token decoded successfully', payload: decodedPayload }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid token format', details: error.message }),
    };
  }
};
import { verifyUser } from './utils/cognitoUtils.mjs';

export const handler = async (event) => {
  console.log('Received event : ', JSON.stringify(event, null, 2));

  let body = event.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON format in request body' }),
      };
    }
  }

  const { username, code } = body;

  if (!username || !code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  try {
    const verifyResult = await verifyUser(username, code);
    if (verifyResult.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: verifyResult.error }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User verified successfully.' }),
    };
  } catch (error) {
    console.error('Error during verification process:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

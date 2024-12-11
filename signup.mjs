import { storeUser } from './utils/dynamoUtils.mjs';  
import { signUp } from './utils/cognitoUtils.mjs';  

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

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

  const { username, password, email, phoneNumber, gender } = body;

  if (!username || !password || !email || !phoneNumber || !gender) {  
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }


  const userId = generateUUID();

  try {
    const signUpResult = await signUp(username, password, email, phoneNumber, gender);  
    if (signUpResult.error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: signUpResult.error }),
      };
    }

    const storeResult = await storeUser(userId, username, email, phoneNumber);
    if (storeResult.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: storeResult.error }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Sign-up successful. Please check your email for verification.' }),
    };
  } catch (error) {
    console.error('Error during sign-up process:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

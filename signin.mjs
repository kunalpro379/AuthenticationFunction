
import { signIn } from './utils/cognitoUtils.mjs';

export const handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const { username, password } = event.body; 

  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields: username or password' }),
    };
  }

  try {
    const signInResult = await signIn(username, password);

    if (signInResult.error) {
      return {
        statusCode: 401, // Unauthorized
        body: JSON.stringify({ error: signInResult.error }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Sign-in successful!',
        token: signInResult.token,
      }),
    };
  } catch (error) {
    console.error('Error during sign-in process:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
    };
  }
};
// import { signIn } from './utils/cognitoUtils.mjs';

// export const handler = async (event) => {
//   console.log('Received event:', JSON.stringify(event, null, 2));

//   const { username, password } = event.body; // Extract body data for username and password

//   // Validate required fields
//   if (!username || !password) {
//     return {
//       statusCode: 400,
//       body: JSON.stringify({ error: 'Missing required fields' }),
//     };
//   }

//   try {
//     // Sign in the user using Cognito
//     const signInResult = await signIn(username, password);
//     if (signInResult.error) {
//       return {
//         statusCode: 500,
//         body: JSON.stringify({ error: signInResult.error }),
//       };
//     }

//     return {
//       statusCode: 200,
//       body: JSON.stringify({
//         message: 'Sign-in successful!',
//         token: signInResult.token,
//       }),
//     };
//   } catch (error) {
//     console.error('Error during sign-in process:', error.message);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: error.message }),
//     };
//   }
// };
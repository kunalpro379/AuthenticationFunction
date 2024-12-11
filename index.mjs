import { handler as signUpHandler } from './signup.mjs';
import { handler as signInHandler } from './signin.mjs';
import { handler as verifyHandler } from './verification.mjs';
import { validateToken } from './JWTvalidation.mjs';

// Export one handler function as the default
export const handler = async (event, context) => {
  // Example: You can use the event to decide which handler to invoke
  const { path } = event;

  if (path === '/signup') {
    return signUpHandler(event, context);
  } else if (path === '/signin') {
    return signInHandler(event, context);
  } else if (path === '/verify') {
    return verifyHandler(event, context);
  } else if (path === '/validate') {
    return validateToken(event);
  }
  
  else {
    return {
      statusCode: 400,
      body: 'Invalid path',
    };
  }
};

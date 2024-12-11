import { CognitoIdentityProviderClient, SignUpCommand, AdminGetUserCommand, AdminConfirmSignUpCommand, AdminInitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';  

const cognito = new CognitoIdentityProviderClient({ region: 'ap-south-1' });

export const USER_TABLE = process.env.USER_TABLE;
export const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;  
const generateSecretHash = (username) => {
  const message = username + CLIENT_ID;
  const hmac = crypto.createHmac('SHA256', CLIENT_SECRET);
  hmac.update(message);
  return hmac.digest('base64');
};

export async function signUp(username, password, email, phoneNumber, gender) {  
  try {
  
    try {
      await cognito.send(new AdminGetUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: username,
      }));
      return { error: 'User already exists' };
    } catch (err) {
      if (err.name !== 'UserNotFoundException') {
        throw err;
      }
    }

    const secretHash = generateSecretHash(username);

    await cognito.send(new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: username,
      Password: password,
      SecretHash: secretHash, 
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'phone_number', Value: phoneNumber },
        { Name: 'gender', Value: gender }  
      ]
    }));

    return { success: true };
  } catch (error) {
    console.error('Error during sign-up process:', error.message);
    return { error: error.message };
  }
}

export async function verifyUser(username, code) {
  try {
    await cognito.send(new AdminConfirmSignUpCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: username,
      ConfirmationCode: code
    }));

    return { success: true };
  } catch (error) {
    console.error('Error during verification process:', error.message);
    return { error: error.message };
  }
}
export async function signIn(username, password) {
  try {
    const secretHash = generateSecretHash(username); 

    const authResult = await cognito.send(new AdminInitiateAuthCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      ClientId: CLIENT_ID,
      AuthFlow: 'ADMIN_NO_SRP_AUTH', // Correct AuthFlow value
      
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash, 
      },
    }));

    return { success: true, token: authResult.AuthenticationResult.IdToken };
    console.log( authResult.AuthenticationResult.IdToken);
  } catch (error) {
    console.error('Error during sign-in process:', error.message);
    return { error: error.message };
  }
}

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const dynamodb = new DynamoDBClient({ region: 'ap-south-1' });
export const USER_TABLE = process.env.USER_TABLE;
export async function storeUser(userId, username, email, phoneNumber, gender = "") {  // Added gender parameter
  const dynamoItem = {
    UserId: { S: userId }, // Primary Key
    username: { S: username }, // Sort Key
    Email: { S: email },
    PhoneNumber: { S: phoneNumber },
    Gender: { S: gender },  // Added gender attribute
    ProfilePicUrl: { S: "" }, // Default empty
    Bio: { S: "" }, // Default empty
    IsEmailVerified: { BOOL: false },
    IsPhoneVerified: { BOOL: false },
    Followers: { L: [] }, // Empty array
    Following: { L: [] }, // Empty array
    CreatedAt: { S: new Date().toISOString() }, // Timestamp
    UpdatedAt: { S: new Date().toISOString() } // Timestamp
  };

  console.log('DynamoDB Item:', JSON.stringify(dynamoItem, null, 2));

  try {
    await dynamodb.send(new PutItemCommand({
      TableName: USER_TABLE,
      Item: dynamoItem,
    }));

    return { success: true };
  } catch (error) {
    console.error('Error storing user in DynamoDB:', error.message);
    return { error: error.message };
  }
}

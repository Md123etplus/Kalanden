import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from './appwrite';
import { ID, Query } from 'appwrite';

// Authenticate a user
export async function authenticate(email: string, password: string) {
  try {
    // Create a session with the provided email and password
    const session = await account.createSession(email, password);

    // Fetch user details from the account
    const user = await account.get();

    // Validate user existence in the database
    const userDetails = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('email', email)]
    );

    if (userDetails.documents.length > 0) {
      const userRole = userDetails.documents[0].role;
      return { ...user, role: userRole };
    }

    console.warn('No matching user found in the database.');
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Check if a user is an instructor
export async function isInstructor(userId: string): Promise<boolean> {
  try {
    // Validate userId length and content
    if (!/^[a-zA-Z0-9_.-]{1,36}$/.test(userId)) {
      throw new Error(`Invalid userId: ${userId}`);
    }

    const userDetails = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('$id', userId)]
    );

    if (userDetails.documents.length > 0) {
      const userRole = userDetails.documents[0].role;
      return userRole === 'instructor' || userRole === 'admin';
    }

    return false;
  } catch (error) {
    console.error('Error checking instructor status:', error);
    throw new Error(`Failed to check instructor status: ${error}`);
  }
}

// Create a new user
export async function createUser(
  name: string,
  email: string,
  role: string,
  phoneNumber: string,
  profileImageId?: string,
  bio?: string
) {
  try {
    const user = await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      ID.unique(), // Ensure unique user ID
      {
        name,
        email,
        role,
        phoneNumber,
        profileImageId,
        bio,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${error}`);
  }
}

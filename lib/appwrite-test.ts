import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from './appwrite';
import { Query } from 'appwrite';

async function createSession() {
  try {
    const session = await account.createSession('moussadembel009@gmail.com', 'Moussadembele');
    console.log('Session created successfully:', session);
    return true;
  } catch (error) {
    console.error('Error creating session:', error);
    return false;
  }
}

export async function testAppwriteConnection(forceFailure = false) {
  try {
    if (forceFailure) {
      throw new Error("Simulated connection failure: Forced failure for testing");
    }

    // Ensure user is authenticated
    const sessionCreated = await createSession();
    if (!sessionCreated) {
      return {
        success: false,
        message: "Failed to create session. Please check the credentials and try again.",
      };
    }

    // Test account connection
    const accountDetails = await account.get();
    console.log('Account connection successful:', accountDetails);

    // Test database connection
    const users = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.limit(1)]
    );

    if (users.documents.length > 0) {
      console.log('Database connection successful. User data:', users.documents[0]);
      return {
        success: true,
        message: "Connection to Appwrite successful and user data fetched",
        data: users.documents[0]
      };
    } else {
      console.log('Database connection successful, but no user data found.');
      return {
        success: true,
        message: "Connection to Appwrite successful, but no user data found"
      };
    }
  } catch (error) {
    console.error('Appwrite connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: JSON.stringify(error, Object.getOwnPropertyNames(error))
    };
  }
}

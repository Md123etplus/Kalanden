import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from './appwrite'
import { Query } from 'appwrite'

type User = {
  $id: string;
  email: string;
  role: string;
  // ... other user properties
};

export async function authenticate(email: string, password: string) {
  try {
    const session = await account.createSession(email, password)
    const user = await account.get()
    const userDetails = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('email', email)]
    )

    if (userDetails.documents.length > 0) {
      const userRole = userDetails.documents[0].role
      return { ...user, role: userRole }
    }

    return null
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export async function isInstructor(userId: string): Promise<boolean> {
  try {
    const userDetails = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('$id', userId)]
    )

    if (userDetails.documents.length > 0) {
      const userRole = userDetails.documents[0].role
      return userRole === 'instructor' || userRole === 'admin'
    }

    return false
  } catch (error) {
    console.error('Error checking instructor status:', error)
    // Instead of returning false, we'll throw the error to be handled by the caller
    throw new Error(`Failed to check instructor status: ${error}`)
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await account.get();
    if (!session) {
      throw new Error('No active session found');
    }

    const user = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id
    );

    if (!user) {
      throw new Error('User document not found');
    }

    return user as unknown as User;
  } catch (error) {
    console.error('Error getting current user:', error);
    if (error instanceof Error) {
      if (error.message === 'No active session found') {
        throw new Error('User not authenticated');
      } else if (error.message === 'User document not found') {
        throw new Error('User data not found in the database');
      }
    }
    throw new Error('Failed to get current user');
  }
}


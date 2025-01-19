import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('675356e6003e296a7aff');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = '67535704001f95997f0a';
export const COURSES_COLLECTION_ID = '67535a1400119fabdadf';
export const USERS_COLLECTION_ID = '67535dff002b518df608';
export const CONNECTION_REQUESTS_COLLECTION_ID = '67642e9e003c5438c308'; // Add this line
export const MESSAGES_COLLECTION_ID = '675361270036034d4cbf';
export const ENROLLMENTS_COLLECTION_ID = '676747910024c53feade';
export const BUCKET_ID = '6753658f001ce9532ca7';
export const TRANSACTIONS_COLLECTION_ID = '676a11870008917be203';
export const INSTRUCTOR_RATINGS_COLLECTION_ID='678659190000f59e2e7a';
export const IMAGE_ID = '678d07b30014d955dcca';

export { ID } from 'appwrite';

export type UserRole = 'student' | 'instructor' | 'admin' | 'parent';

export interface User {
  $id: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  profileImageId?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await account.get();
    const user = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      session.$id
    );
    return user as unknown as User;
  } catch (error) {
    if ((error as any)?.message?.includes('missing scope (account)')) {
      console.warn('Guest user accessing without authentication.');
      return null;
    }
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getImageUrl(bucketId: string, imageId: string): Promise<string> {
  try {
    const url = storage.getFileView(bucketId, imageId);
    return url.toString();
  } catch (error) {
    console.error('Error fetching image:', error);
    return '/placeholder.svg?height=300&width=400'; // Fallback to placeholder
  }
}


export async function getFilePreview(bucketId: string, fileId: string): Promise<string> {
  try {
    const result = await storage.getFilePreview(bucketId, fileId);
    return result;
  } catch (error) {
    console.error('Error getting file preview:', error);
    throw error;
  }
}

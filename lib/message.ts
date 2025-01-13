import { databases, DATABASE_ID, MESSAGES_COLLECTION_ID } from './appwrite';
import { ID, Query } from 'appwrite';

export interface Message {
    $id: string;
    courseId: string;
    userId: string;
    content: string;
    createdAt: string;
}

export async function createMessage(messageData: Omit<Message, '$id' | 'createdAt'>): Promise<Message> {
    const message = await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        {
            ...messageData,
            createdAt: new Date().toISOString(),
        }
    );
    return message as unknown as Message;
}

export async function getMessagesByCourseId(courseId: string): Promise<Message[]> {
    const messages = await databases.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [Query.equal('courseId', courseId)]
    );
    return messages.documents as unknown as Message[];
}

export async function deleteMessage(messageId: string): Promise<void> {
    await databases.deleteDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        messageId
    );
}


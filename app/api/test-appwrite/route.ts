import { NextResponse } from 'next/server'
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite'
import { Query } from 'appwrite'

export async function GET(request: Request) {
  try {
    const users = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.limit(1)]
    );

    if (users.documents.length > 0) {
      console.log('Successfully fetched user data:', users.documents[0]);
      return NextResponse.json({ 
        success: true, 
        message: "Connection to Appwrite successful and user data fetched",
        data: users.documents[0]
      });
    } else {
      console.log('No user data found. Please add test data to Appwrite.');
      return NextResponse.json({ 
        success: true, 
        message: "Connection to Appwrite successful, but no user data found" 
      });
    }
  } catch (error) {
    console.error('Appwrite connection failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: JSON.stringify(error, Object.getOwnPropertyNames(error))
    }, { status: 500 });
  }
}


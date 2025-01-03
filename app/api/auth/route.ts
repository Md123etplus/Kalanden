import { NextResponse } from 'next/server'
import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite'
import { ID } from 'appwrite'

export async function POST(request: Request) {
  try {
    const { action, email, password, name, role, phoneNumber } = await request.json()

    switch (action) {
      case 'signup':
        console.log('Attempting to create account:', { email, name, role, phoneNumber })
        let accountResponse;
        try {
          accountResponse = await account.create(ID.unique(), email, password, name)
        } catch (error) {
          console.error('Error creating Appwrite account:', error)
          return NextResponse.json({ error: 'Failed to create Appwrite account', details: error }, { status: 500 })
        }
        console.log('Account created:', accountResponse)

        const userData = {
          name,
          email,
          role,
          phoneNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        console.log('Creating user document:', userData)
        let userDocument;
        try {
          userDocument = await databases.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            ID.unique(),
            userData
          )
        } catch (error) {
          console.error('Error creating user document:', error)
          return NextResponse.json({ error: 'Failed to create user document', details: error }, { status: 500 })
        }
        console.log('User document created:', userDocument)

        return NextResponse.json({ user: accountResponse, userDetails: userDocument }, { status: 201 })

      case 'login':
        console.log('Attempting to log in:', email)
        let session;
        try {
          session = await account.createEmailPasswordSession(email, password)
        } catch (error) {
          console.error('Error creating email session:', error)
          return NextResponse.json({ error: 'Failed to create email session', details: error }, { status: 500 })
        }
        console.log('Session created:', session)
        return NextResponse.json({ session }, { status: 200 })

      case 'logout':
        try {
          await account.deleteSession('current')
        } catch (error) {
          console.error('Error deleting session:', error)
          return NextResponse.json({ error: 'Failed to delete session', details: error }, { status: 500 })
        }
        return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json({ error: 'Authentication failed', details: error }, { status: 500 })
  }
}


import { NextResponse } from 'next/server'
import { createMessage, getMessagesByCourseId, deleteMessage } from '@/lib/message'

export async function POST(request: Request) {
  try {
    const messageData = await request.json()
    const message = await createMessage(messageData)
    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('courseId')

  if (!courseId) {
    return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
  }

  try {
    const messages = await getMessagesByCourseId(courseId)
    return NextResponse.json(messages, { status: 200 })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const messageId = searchParams.get('id')

  if (!messageId) {
    return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
  }

  try {
    await deleteMessage(messageId)
    return NextResponse.json({ message: 'Message deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}


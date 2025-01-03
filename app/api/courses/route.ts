import { NextResponse } from 'next/server'
import { databases, storage, DATABASE_ID, COURSES_COLLECTION_ID } from '@/lib/appwrite'
import { ID } from 'appwrite'
import { deleteCourse, getCourseById, updateCourse } from '@/lib/course'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const courseData = JSON.parse(formData.get('courseData') as string)
    const imageFile = formData.get('image') as File | null
    const pdfFile = formData.get('pdf') as File | null
    const videoFile = formData.get('video') as File | null

    console.log('Received course data:', courseData)

    let imageFileId, pdfFileId, videoFileId

    if (imageFile) {
      console.log('Uploading image file')
      const imageUpload = await storage.createFile('6753658f001ce9532ca7', ID.unique(), imageFile)
      imageFileId = imageUpload.$id
      console.log('Image file uploaded:', imageFileId)
    }

    if (pdfFile) {
      console.log('Uploading PDF file')
      const pdfUpload = await storage.createFile('6753658f001ce9532ca7', ID.unique(), pdfFile)
      pdfFileId = pdfUpload.$id
      console.log('PDF file uploaded:', pdfFileId)
    }

    if (videoFile) {
      console.log('Uploading video file')
      const videoUpload = await storage.createFile('6753658f001ce9532ca7', ID.unique(), videoFile)
      videoFileId = videoUpload.$id
      console.log('Video file uploaded:', videoFileId)
    }

    const courseDocument = {
      ...courseData,
      imageFileId,
      pdfFileId,
      videoFileId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log('Creating course document:', courseDocument)
    const course = await databases.createDocument(
      DATABASE_ID,
      COURSES_COLLECTION_ID,
      ID.unique(),
      courseDocument
    )
    console.log('Course document created:', course)

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    console.error('Detailed error:', JSON.stringify(error));

    return NextResponse.json({ error: 'Failed to create course', details: error }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('id')

  if (courseId) {
    try {
      const course = await getCourseById(courseId)
      if (course) {
        return NextResponse.json(course, { status: 200 })
      } else {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }
    } catch (error) {
      console.error('Error fetching course:', error)
      return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
    }
  } else {
    try {
      const courses = await databases.listDocuments('67535704001f95997f0a', '67535a1400119fabdadf')
      return NextResponse.json(courses, { status: 200 })
    } catch (error) {
      console.error('Error fetching courses:', error)
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updates } = await request.json()
    const updatedCourse = await updateCourse(id, updates)
    return NextResponse.json(updatedCourse, { status: 200 })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('id')

  if (!courseId) {
    return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
  }

  try {
    await deleteCourse(courseId)
    return NextResponse.json({ message: 'Course deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}


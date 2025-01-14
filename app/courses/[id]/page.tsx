import { use } from 'react'
import { databases, DATABASE_ID, COURSES_COLLECTION_ID } from '@/lib/appwrite'
import { CourseView } from './CourseView'
import { Models } from 'appwrite'

interface Course extends Models.Document {
  title: string;
  description: string;
  level: string;
  subject: string;
  price: number;
  sections?: {
    title: string;
    content: string;
  }[];
  image?: string;
  resume?: string;
  imageFileId?: string;
  enrolledStudents: number;
  createdBy: string;
}

interface CoursePageProps {
  params: { id: string }
}

export default async function CoursePage({ params }: { params: { id: string } }) {
  const { id } = params

  async function getCourse(): Promise<Course> {
    try {
      const course = await databases.getDocument<Course>(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        id
      )
      return course
    } catch (error) {
      console.error('Error fetching course:', error)
      throw new Error('Failed to fetch course data.')
    }
  }

  const coursePromise = getCourse()
  const course = await coursePromise

  return <CourseView initialCourse={course} courseId={id} />
}


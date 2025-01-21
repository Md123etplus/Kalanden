import { databases, DATABASE_ID, COURSES_COLLECTION_ID } from '@/lib/appwrite';
import { CourseView } from './CourseView';
import { Models } from 'appwrite';

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

// Adjusted CoursePageProps to expect a Promise for params
interface CoursePageProps {
  params: Promise<{ id: string }>; // Ensure params is a Promise
}
interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params; // Await the Promise to resolve 'params'

  async function getCourse(): Promise<Course> {
    // Fetch course data
    const course = await databases.getDocument<Course>(
      DATABASE_ID,
      COURSES_COLLECTION_ID,
      id
    );
    return course;
  }

  const course = await getCourse();

  return <CourseView initialCourse={course} courseId={id} />;
}

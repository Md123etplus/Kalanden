// "use client"
import { databases, DATABASE_ID, COURSES_COLLECTION_ID } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { CourseList } from './CourseList'

export interface Course {
  $id: string;
  title: string;
  description: string;
  level: string;
  subject: string;
  price: number;
  content?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  duration?: number;
  hasQuizzes?: boolean;
  enrolledStudents?: number;
  image?: string;
}

const placeholderCourses = [
  { $id: '1', title: 'Mathématiques', description: 'Cours de base en algèbre et géométrie', level: '7ième Année', duration: 30, hasQuizzes: true, subject: 'Mathématiques', enrolledStudents: 150, image: '/placeholder.svg?height=150&width=250', price: 0 },
  { $id: '2', title: 'Physique', description: 'Introduction à la mécanique et à l\'électricité', level: '10ième Année', duration: 45, hasQuizzes: true, subject: 'Sciences', enrolledStudents: 120, image: '/placeholder.svg?height=150&width=250', price: 5000 },
  { $id: '3', title: 'Chimie', description: 'Principes fondamentaux de la chimie organique et inorganique', level: '11ième Année', duration: 40, hasQuizzes: true, subject: 'Sciences', enrolledStudents: 100, image: '/placeholder.svg?height=150&width=250', price: 5000 },
  { $id: '4', title: 'Biologie', description: 'Étude des organismes vivants et de leurs interactions', level: '9ième Année', duration: 35, hasQuizzes: false, subject: 'Sciences', enrolledStudents: 130, image: '/placeholder.svg?height=150&width=250', price: 0 },
  { $id: '5', title: 'Géologie', description: 'Exploration de la structure et de l\'histoire de la Terre', level: 'Terminale', duration: 50, hasQuizzes: true, subject: 'Sciences', enrolledStudents: 80, image: '/placeholder.svg?height=150&width=250', price: 6000 },
  { $id: '6', title: 'Anglais', description: 'Amélioration des compétences en lecture, écriture et conversation', level: '8ième Année', duration: 25, hasQuizzes: false, subject: 'Langues', enrolledStudents: 110, image: '/placeholder.svg?height=150&width=250', price: 0 },
]

export default async function CoursesPage() {
  let courses: Course[] = [];

  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COURSES_COLLECTION_ID,
      [Query.limit(100)]
    );
    courses = response.documents as unknown as Course[];
  } catch (error) {
    console.error('Error fetching courses:', error);
  }

  const allCourses = [...courses, ...placeholderCourses];

  return <CourseList initialCourses={allCourses} />;
}


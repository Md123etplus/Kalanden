import { databases, DATABASE_ID, COURSES_COLLECTION_ID } from "@/lib/appwrite"
import { Query } from "appwrite"
import { Suspense } from "react"
import { CourseList } from "./CourseList"

export interface Course {
  $id: string
  title: string
  description: string
  level: string
  subject: string
  price: number
  content?: string
  imageFileId?: string
  pdfFileId?: string
  videoFileId?: string
  createdBy?: string
  createdAt?: string
  updatedAt?: string
  duration?: number
  hasQuizzes: boolean
  enrolledStudents?: number
  image?: string
  hasVideo?: boolean
  hasPDF?: boolean
}

const placeholderCourses = [
  {
    $id: "1",
    title: "Mathématiques",
    description: "Cours de base en algèbre et géométrie",
    level: "7ième Année",
    duration: 30,
    hasQuizzes: true,
    subject: "Mathématiques",
    enrolledStudents: 150,
    image: "/placeholder.svg?height=150&width=250",
    price: 0,
    hasVideo: false,
    hasPDF: false,
  },
  {
    $id: "2",
    title: "Physique",
    description: "Introduction à la mécanique et à l'électricité",
    level: "10ième Année",
    duration: 45,
    hasQuizzes: true,
    subject: "Sciences",
    enrolledStudents: 120,
    image: "/placeholder.svg?height=150&width=250",
    price: 5000,
    hasVideo: false,
    hasPDF: false,
  },
  {
    $id: "3",
    title: "Chimie",
    description: "Principes fondamentaux de la chimie organique et inorganique",
    level: "11ième Année",
    duration: 40,
    hasQuizzes: true,
    subject: "Sciences",
    enrolledStudents: 100,
    image: "/placeholder.svg?height=150&width=250",
    price: 5000,
    hasVideo: false,
    hasPDF: false,
  },
  {
    $id: "4",
    title: "Biologie",
    description: "Étude des organismes vivants et de leurs interactions",
    level: "9ième Année",
    duration: 35,
    hasQuizzes: false,
    subject: "Sciences",
    enrolledStudents: 130,
    image: "/placeholder.svg?height=150&width=250",
    price: 0,
    hasVideo: false,
    hasPDF: false,
  },
  {
    $id: "5",
    title: "Géologie",
    description: "Exploration de la structure et de l'histoire de la Terre",
    level: "Terminale",
    duration: 50,
    hasQuizzes: true,
    subject: "Sciences",
    enrolledStudents: 80,
    image: "/placeholder.svg?height=150&width=250",
    price: 6000,
    hasVideo: false,
    hasPDF: false,
  },
  {
    $id: "6",
    title: "Anglais",
    description: "Amélioration des compétences en lecture, écriture et conversation",
    level: "8ième Année",
    duration: 25,
    hasQuizzes: false,
    subject: "Langues",
    enrolledStudents: 110,
    image: "/placeholder.svg?height=150&width=250",
    price: 0,
    hasVideo: false,
    hasPDF: false,
  },
]

export default async function CoursesPage() {
  let courses: Course[] = []

  try {
    const response = await databases.listDocuments(DATABASE_ID, COURSES_COLLECTION_ID, [Query.limit(100)])
    courses = response.documents as unknown as Course[]
  } catch (error) {
    console.error("Error fetching courses:", error)
  }

  const allCourses = [...courses, ...placeholderCourses]

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CourseList initialCourses={allCourses} />
    </Suspense>
  )
}


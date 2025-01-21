"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Star, Book, Users, Mail, Phone, MapPin } from "lucide-react"
import {
  databases,
  storage,
  DATABASE_ID,
  USERS_COLLECTION_ID,
  COURSES_COLLECTION_ID,
  INSTRUCTOR_RATINGS_COLLECTION_ID,
} from "@/lib/appwrite"
import { Query } from "appwrite"

interface Instructor {
  $id: string
  name: string
  email: string
  phoneNumber: string
  location: string
  profileImageId?: string
  bio?: string
  expertise: string[]
  yearsOfExperience: number
}

interface Course {
  $id: string
  title: string
  description: string
  imageFileId?: string
  enrolledStudents: number
}

export default function InstructorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params) // Unwrap the params Promise using React.use()
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [ratings, setRatings] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const instructorData = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, id)
        setInstructor(instructorData as unknown as Instructor)

        const coursesData = await databases.listDocuments(DATABASE_ID, COURSES_COLLECTION_ID, [
          Query.equal("createdBy", id),
        ])
        setCourses(coursesData.documents as unknown as Course[])

        const ratingsData = await databases.listDocuments(DATABASE_ID, INSTRUCTOR_RATINGS_COLLECTION_ID, [
          Query.equal("instructorId", id),
        ])
        setRatings(ratingsData.total)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching instructor data:", error)
        setLoading(false)
      }
    }

    fetchInstructorData()
  }, [id]) // Update dependency array to use unwrapped id

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>
  }

  if (!instructor) {
    return <div className="flex justify-center items-center min-h-screen">Instructor not found</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="flex flex-col md:flex-row items-center md:items-start gap-8 pt-6">
            <Avatar className="w-32 h-32">
              <AvatarImage
                src={instructor.profileImageId ? `/api/images/${instructor.profileImageId}` : undefined}
                alt={instructor.name}
              />
              <AvatarFallback>
                {instructor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{instructor.name}</h1>
              <p className="text-muted-foreground mb-4">
                {instructor.expertise && Array.isArray(instructor.expertise)
                  ? instructor.expertise.join(", ")
                  : "No expertise listed"}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {instructor.expertise && Array.isArray(instructor.expertise) ? (
                  instructor.expertise.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary">No expertise listed</Badge>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>{ratings} évaluations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  <span>{courses.length} cours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{courses.reduce((acc, course) => acc + course.enrolledStudents, 0)} étudiants</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="about" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">À propos</TabsTrigger>
            <TabsTrigger value="courses">Cours</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>À propos de {instructor.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{instructor.bio}</p>
                <p className="font-semibold">Expérience: {instructor.yearsOfExperience} ans</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="courses">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.$id} className="flex flex-col">
                  <Image
                    src={course.imageFileId ? `/api/images/${course.imageFileId}` : "/placeholder.svg"}
                    alt={course.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <CardContent className="flex-grow p-4">
                    <h3 className="font-semibold mb-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                    <p className="text-sm">
                      <Users className="inline w-4 h-4 mr-2" />
                      {course.enrolledStudents} étudiants
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Coordonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  <span>{instructor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span>{instructor.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{instructor.location}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center">
          <Button onClick={() => router.push("/courses")}>Voir tous les cours</Button>
        </div>
      </main>
    </div>
  )
}


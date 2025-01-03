import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { databases, DATABASE_ID, ENROLLMENTS_COLLECTION_ID, COURSES_COLLECTION_ID, getCurrentUser } from '@/lib/appwrite'
import { Query } from 'appwrite'

interface EnrolledCourse {
  $id: string;
  title: string;
  progress: number;
  nextLesson: string;
}

export function StudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [hasConnectionRequests, setHasConnectionRequests] = useState(false)

  useEffect(() => {
    fetchEnrolledCourses()
    checkConnectionRequests()
  }, [])

  const fetchEnrolledCourses = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) return

      const enrollments = await databases.listDocuments(
        DATABASE_ID,
        ENROLLMENTS_COLLECTION_ID,
        [Query.equal('userId', currentUser.$id)]
      )

      const coursesPromises = enrollments.documents.map(async (enrollment) => {
        const course = await databases.getDocument(
          DATABASE_ID,
          COURSES_COLLECTION_ID,
          enrollment.courseId
        )
        return {
          $id: course.$id,
          title: course.title,
          progress: enrollment.progress || 0,
          nextLesson: course.nextLesson || 'Not available'
        }
      })

      const courses = await Promise.all(coursesPromises)
      setEnrolledCourses(courses)
    } catch (error) {
      console.error('Error fetching enrolled courses:', error)
    }
  }

  const checkConnectionRequests = async () => {
    // Implement logic to check for pending connection requests
    // This is a placeholder. Replace with actual API call.
    setHasConnectionRequests(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de bord étudiant</h1>
        <Link href="/dashboard/student/connection-requests">
          <Button variant={hasConnectionRequests ? "default" : "outline"}>
            <Bell className="mr-2 h-4 w-4" />
            Demandes de connexion
            {hasConnectionRequests && (
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                !
              </span>
            )}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mes cours</CardTitle>
          <CardDescription>Suivez vos progrès dans les cours auxquels vous êtes inscrit</CardDescription>
        </CardHeader>
        <CardContent>
          {enrolledCourses.length === 0 ? (
            <p>Vous n'êtes inscrit à aucun cours pour le moment.</p>
          ) : (
            enrolledCourses.map((course) => (
              <div key={course.$id} className="mb-4 p-4 border rounded">
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p>Progression: {course.progress}%</p>
                <Progress value={course.progress} className="mt-2" />
                <p className="mt-2">Prochaine leçon: {course.nextLesson}</p>
                <div className="mt-2 space-x-2">
                  <Link href={`/courses/${course.$id}`}>
                    <Button>Continuer le cours</Button>
                  </Link>
                  <Link href={`/courses/${course.$id}`}>
                    <Button variant="outline">Voir le contenu</Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Explorer de nouveaux cours</CardTitle>
          <CardDescription>Découvrez de nouveaux cours pour enrichir vos connaissances</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/courses">
            <Button>Parcourir les cours disponibles</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}


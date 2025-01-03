'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { Share2, Maximize2, Minimize2 } from 'lucide-react'
import { databases, storage, DATABASE_ID, COURSES_COLLECTION_ID, ENROLLMENTS_COLLECTION_ID, getCurrentUser } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { ErrorDisplay } from '@/components/ui/error'
import { useToast } from '@/components/use-toast'

interface Section {
  title: string;
  content: string;
}

interface Course {
  $id: string;
  title: string;
  description: string;
  level: string;
  subject: string;
  price: number;
  sections?: Section[];
  image?: string;
  resume?: string;
  imageFileId?: string;
  enrolledStudents: number;
  createdBy: string;
}

export default function CourseContent({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [courseImageUrl, setCourseImageUrl] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true)
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          throw new globalThis.Error('User not authenticated')
        }

        const enrollment = await databases.listDocuments(
          DATABASE_ID,
          ENROLLMENTS_COLLECTION_ID,
          [
            Query.equal('userId', currentUser.$id),
            Query.equal('courseId', params.id)
          ]
        )

        if (enrollment.documents.length === 0) {
          throw new globalThis.Error('User not enrolled in this course')
        }

        const courseData = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION_ID, params.id)
        setCourse(courseData as unknown as Course)
        fetchCourseImage(courseData.imageFileId)
      } catch (error) {
        console.error('Error fetching course:', error)
        setError('Failed to load course. Please try again.')
        toast({
          title: "Erreur",
          description: "Impossible de charger le contenu du cours. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [params.id, toast])

  const fetchCourseImage = async (imageFileId?: string) => {
    if (imageFileId) {
      try {
        const imageUrl = storage.getFileView('YOUR_BUCKET_ID', imageFileId)
        setCourseImageUrl(imageUrl.toString())
      } catch (error) {
        console.error('Error fetching course image:', error)
      }
    }
  }

  const nextSection = () => {
    if (currentSectionIndex < (course?.sections?.length || 0) - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    }
  }

  const prevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  if (isLoading) {
    return <div className="text-center p-8">Chargement du cours...</div>
  }

  if (error) {
    return <ErrorDisplay title="Erreur" message={error} />
  }

  if (!course) {
    return <ErrorDisplay title="Erreur" message="Cours non trouvé" />
  }

  return (
    <div className={`min-h-screen bg-background text-foreground ${isFullScreen ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
      {!isFullScreen && <Header />}
      <main className={`container mx-auto px-4 py-8 ${isFullScreen ? 'h-full flex flex-col' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={toggleFullScreen}>
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className={`space-y-4 ${isFullScreen ? 'flex-grow overflow-auto' : ''}`}>
          <div className="course-image-container mb-4">
            <Image 
              src={courseImageUrl || course.image || '/placeholder.svg?height=400&width=600'} 
              alt={course.title} 
              width={600} 
              height={400} 
              className="w-full h-full object-cover rounded-lg" 
            />
          </div>
          <div className="flex justify-between items-center mb-4">
            <Button onClick={prevSection} disabled={currentSectionIndex === 0}>Section précédente</Button>
            <span>{currentSectionIndex + 1} / {(course.sections?.length || 0)}</span>
            <Button onClick={nextSection} disabled={currentSectionIndex === (course.sections?.length || 0) - 1}>Section suivante</Button>
          </div>
          {course.sections && course.sections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{course.sections[currentSectionIndex].title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div dangerouslySetInnerHTML={{ __html: course.sections[currentSectionIndex].content }} />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}


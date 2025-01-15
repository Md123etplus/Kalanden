"use client"
import { use } from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { Maximize2, Minimize2, Download, ThumbsUp } from 'lucide-react'
import { databases, storage, DATABASE_ID, COURSES_COLLECTION_ID, ENROLLMENTS_COLLECTION_ID, USERS_COLLECTION_ID, getCurrentUser } from '@/lib/appwrite'
import { Query, ID } from 'appwrite'
import { ErrorDisplay } from '@/components/ui/error'
import { useToast } from '@/components/use-toast'
import { Document, Page, pdfjs } from 'react-pdf'
import { FiMaximize, FiDownload } from 'react-icons/fi'

import dynamic from 'next/dynamic'

import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
// import 'react-pdf/dist/esm/Page/TextLayer.css'
import { Quiz } from '@/components/Quiz'
import { InstructorRating } from '@/components/InstructorRating'

interface Course {
  $id: string;
  title: string;
  description: string;
  level: string;
  subject: string;
  price: number;
  content: string;
  imageFileId?: string;
  pdfFileId?: string;
  videoFileId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  duration: number;
  hasQuizzes: boolean;
  enrolledStudents: number;
  quizzes?: any[];
}

interface Instructor {
  $id: string;
  name: string;
  profileImageId?: string;
  bio?: string;
}

const INSTRUCTOR_RATINGS_COLLECTION_ID = '678659190000f59e2e7a';

export default function CourseContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params)
  const [course, setCourse] = useState<Course | null>(null)
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [instructorRatings, setInstructorRatings] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [courseImageUrl, setCourseImageUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { pdfjs } = require('react-pdf')
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.worker.min.js`
    }

    const fetchCourse = async () => {
      setIsLoading(true)
      try {
        const currentUser = await getCurrentUser();
        console.log("Current User:", currentUser);
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        const enrollment = await databases.listDocuments(
          DATABASE_ID,
          ENROLLMENTS_COLLECTION_ID,
          [
            Query.equal('userId', currentUser.$id),
            Query.equal('courseId', courseId)
          ]
        );
        console.log("Enrollment Data:", enrollment);
        if (enrollment.documents.length === 0) {
          throw new Error('User not enrolled in this course');
        }

        console.log("COURSES_COLLECTION_ID:", COURSES_COLLECTION_ID);
        const courseData = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION_ID, courseId);
        console.log("Course Data:", courseData);
        setCourse(courseData as unknown as Course);

        if (courseData.imageFileId) {
          console.log("Image File ID:", courseData.imageFileId);
          const imageUrl = storage.getFileView('6753658f001ce9532ca7', courseData.imageFileId);
          setCourseImageUrl(imageUrl.toString());
        }

        if (courseData.pdfFileId) {
          console.log("PDF File ID:", courseData.pdfFileId);
          const pdfUrl = await storage.getFileView('6753658f001ce9532ca7', courseData.pdfFileId);
          setPdfUrl(pdfUrl);
        }

        // Fetch instructor data
        const instructorData = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, courseData.createdBy);
        if (instructorData) {
          setInstructor({
            $id: instructorData.$id,
            name: instructorData.name,
            profileImageId: instructorData.profileImageId,
            bio: instructorData.bio
          });
        } else {
          console.error("Instructor data not found.");
          setInstructor(null); // Optional: Handle case when instructor data is missing
        }

      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Failed to load course. Please try again.');
        toast({
          title: "Erreur",
          description: "Impossible de charger le contenu du cours. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, toast]);

  useEffect(() => {
    // Fetch instructor ratings once instructor data is available
    const fetchInstructorRatings = async () => {
      if (instructor) {
        try {
          const ratingsResponse = await databases.listDocuments(
            DATABASE_ID,
            INSTRUCTOR_RATINGS_COLLECTION_ID,
            [Query.equal('instructorId', instructor.$id)]
          );
          console.log("Instructor Ratings:", ratingsResponse);
          setInstructorRatings(ratingsResponse.documents.length);
        } catch (error) {
          console.error("Error fetching instructor ratings:", error);
        }
      }
    };

    fetchInstructorRatings();
  }, [instructor]); // This effect depends on `instructor`
  

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const handleDownloadPdf = async () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${course?.title || 'course'}_document.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      toast({
        title: "Erreur",
        description: "Le document PDF n'est pas disponible pour le téléchargement.",
        variant: "destructive",
      })
    }
  }
  const handleFullscreen = async () => {
    const pdfContainer = document.getElementById('pdf-container');
  if (pdfContainer) {
    // If the browser supports fullscreen API
    if (pdfContainer.requestFullscreen) {
      pdfContainer.requestFullscreen();
    } else if (pdfContainer.requestFullscreen) { // Firefox
      pdfContainer.requestFullscreen();
    } else if (pdfContainer.requestFullscreen) { // Chrome, Safari, Opera
      pdfContainer.requestFullscreen();
    } else if (pdfContainer.requestFullscreen) { // IE/Edge
      pdfContainer.requestFullscreen();
    }
  }
  }
  
  

  const handleRateInstructor = async () => {
    if (!instructor) return;

    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) throw new Error('User not authenticated')

      // Check if the user has already rated this instructor
      const existingRating = await databases.listDocuments(
        DATABASE_ID,
        INSTRUCTOR_RATINGS_COLLECTION_ID,
        [
          Query.equal('instructorId', instructor.$id),
          Query.equal('userId', currentUser.$id)
        ]
      )

      if (existingRating.documents.length > 0) {
        toast({
          title: "Déjà évalué",
          description: "Vous avez déjà évalué cet instructeur.",
        })
        console.log("Already evaluated")
        return
      }

      // Create a new rating
      await databases.createDocument(
        DATABASE_ID,
        INSTRUCTOR_RATINGS_COLLECTION_ID,
        ID.unique(),
        {
          instructorId: instructor.$id,
          userId: currentUser.$id,
          createdAt: new Date().toISOString()
        }
      )

      setInstructorRatings(prevRatings => prevRatings + 1)

      toast({
        title: "Merci !",
        description: "Votre évaluation a été enregistrée.",
      })
      console.log("Done!!")

    } catch (error) {
      console.error('Error rating instructor:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre évaluation. Veuillez réessayer.",
        variant: "destructive",
      })
    }
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
              src={courseImageUrl || '/placeholder.svg?height=400&width=600'} 
              alt={course.title} 
              width={600} 
              height={400} 
              className="w-full h-full object-cover rounded-lg" 
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Contenu du cours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: course.content }} />
            </CardContent>
          </Card>

          {pdfUrl && (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle>Document du cours</CardTitle>
    </CardHeader>
    <CardContent>
    <div className="flex justify-between mb-4 w-full">
  <Button variant="outline" onClick={handleFullscreen} className="flex items-center">
    <FiMaximize className="mr-2 h-4 w-4" />
    Plein Écran
  </Button>

  <Button variant="outline" onClick={handleDownloadPdf} className="flex items-center">
    <Download className="mr-2 h-4 w-4" />
    Télécharger le PDF
  </Button>
</div>


      {/* Instead of using react-pdf, use your custom PDFViewer component */}
      <div className="w-full h-[80vh]" id="pdf-container">
        <iframe
          src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
          className="w-full h-full border-none"
        />
      </div>

      {numPages && (
        <div className="mt-4 flex justify-between items-center">
          <Button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            Page précédente
          </Button>
          <span>Page {currentPage} sur {numPages}</span>
          <Button
            onClick={() => handlePageChange(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
          >
            Page suivante
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
)}



          {course.videoFileId && (
            <Card>
              <CardHeader>
                <CardTitle>Vidéo du cours</CardTitle>
              </CardHeader>
              <CardContent>
                <video 
                  controls 
                  className="w-full rounded-lg"
                  src={storage.getFileView('6753658f001ce9532ca7', course.videoFileId).toString()}
                >
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              </CardContent>
            </Card>
          )}

          {course.hasQuizzes && course.quizzes && (
            <Card>
              <CardHeader>
                <CardTitle>Quiz du cours</CardTitle>
              </CardHeader>
              <CardContent>
                <Quiz quizzes={course.quizzes || []} />
              </CardContent>
            </Card>
          )}

          {instructor && (
            <Card>
              <CardHeader>
                <CardTitle>Évaluez l'instructeur</CardTitle>
              </CardHeader>
              <CardContent>
                <InstructorRating instructor={instructor} ratings={instructorRatings} onRate={handleRateInstructor} />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}


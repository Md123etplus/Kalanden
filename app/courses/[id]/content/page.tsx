"use client"
import { use } from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { Share2, Maximize2, Minimize2, Download } from 'lucide-react'
import { databases, storage, DATABASE_ID, COURSES_COLLECTION_ID, ENROLLMENTS_COLLECTION_ID, getCurrentUser } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { ErrorDisplay } from '@/components/ui/error'
import { useToast } from '@/components/use-toast'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

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
}

export default function CourseContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params)
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [courseImageUrl, setCourseImageUrl] = useState<string | null>(null)
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true)
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          throw new Error('User not authenticated')
        }

        const enrollment = await databases.listDocuments(
          DATABASE_ID,
          ENROLLMENTS_COLLECTION_ID,
          [
            Query.equal('userId', currentUser.$id),
            Query.equal('courseId', courseId)
          ]
        )

        if (enrollment.documents.length === 0) {
          throw new Error('User not enrolled in this course')
        }

        const courseData = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION_ID, courseId)
        setCourse(courseData as unknown as Course)
        
        if (courseData.imageFileId) {
          const imageUrl = storage.getFileView('6753658f001ce9532ca7', courseData.imageFileId)
          setCourseImageUrl(imageUrl.toString())
        }
        if (courseData.pdfFileId) {
          const pdfUrl = await storage.getFileView('6753658f001ce9532ca7', courseData.pdfFileId)
          setPdfUrl(pdfUrl)
        }
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
  }, [courseId, toast])

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const togglePdfViewer = () => {
    setShowPdfViewer(!showPdfViewer)
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

          {course.pdfFileId && pdfUrl && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Document du cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Button onClick={togglePdfViewer}>
                    {showPdfViewer ? 'Masquer le document' : 'Afficher le document'}
                  </Button>
                  <Button variant="outline" onClick={handleDownloadPdf}>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le PDF
                  </Button>
                </div>
                {showPdfViewer && (
                  <div className="mt-4">
                    <Document
                      file={pdfUrl}
                      onLoadSuccess={handleDocumentLoadSuccess}
                      className="max-w-full"
                    >
                      <Page pageNumber={currentPage} />
                    </Document>
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
        </div>
      </main>
    </div>
  )
}


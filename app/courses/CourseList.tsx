'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import Image from 'next/image'
import { Download, Wifi, WifiOff } from 'lucide-react'
import { Course } from './page'
import { databases, DATABASE_ID, COURSES_COLLECTION_ID } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { storage } from '@/lib/appwrite'

const levels = ['7ième Année', '8ième Année', '9ième Année', '10ième Année', '11ième Année', 'Terminale']
const subjects = ['Mathématiques', 'Sciences', 'Langues']

const getImageUrl = async (fileId: string) => {
  try {
    const fileUrl = storage.getFileView('6753658f001ce9532ca7', fileId);
    return fileUrl.toString(); // Convert to string to ensure it's a valid URL
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

export function CourseList({ initialCourses }: { initialCourses: Course[] }) {
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [maxDuration, setMaxDuration] = useState<number>(50)
  const [quizzesOnly, setQuizzesOnly] = useState<boolean>(false)
  const [showFreeOnly, setShowFreeOnly] = useState<boolean>(false)
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [isOnline, setIsOnline] = useState(true)
  const [courses, setCourses] = useState<Course[]>(initialCourses)

  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchQuery(search)
    }
    setIsOnline(navigator.onLine)
    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => setIsOnline(false))

    return () => {
      window.removeEventListener('online', () => setIsOnline(true))
      window.removeEventListener('offline', () => setIsOnline(false))
    }
  }, [searchParams])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let queries = [Query.limit(100)]
        
        if (selectedLevel !== 'all') {
          queries.push(Query.equal('level', selectedLevel))
        }
        if (selectedSubject !== 'all') {
          queries.push(Query.equal('subject', selectedSubject))
        }
        if (quizzesOnly) {
          queries.push(Query.equal('hasQuizzes', true))
        }
        if (showFreeOnly) {
          queries.push(Query.equal('price', 0))
        }
        
        const response = await databases.listDocuments(
          DATABASE_ID,
          COURSES_COLLECTION_ID,
          queries
        )
        
        const coursesWithImages = await Promise.all(response.documents.map(async (course) => {
          let imageUrl = null;
          if (course.imageFileId) {
            imageUrl = await getImageUrl(course.imageFileId);
          }
          return { ...course, image: imageUrl };
        }));
        
        setCourses(coursesWithImages as unknown as Course[]);
      } catch (error) {
        console.error('Error fetching courses:', error)
      }
    }

    fetchCourses()
  }, [searchQuery, selectedLevel, selectedSubject, quizzesOnly, showFreeOnly])

  const filteredCourses = courses.filter(course => 
    course.duration !== undefined && course.duration <= maxDuration
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Cours disponibles</h1>

        <div className="mb-4 flex items-center justify-end">
          {isOnline ? (
            <div className="flex items-center text-green-500">
              <Wifi className="mr-2" />
              <span>En ligne</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-500">
              <WifiOff className="mr-2" />
              <span>Hors ligne</span>
            </div>
          )}
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              {levels.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par matière" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les matières</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-col">
            <Label htmlFor="duration-filter" className="mb-2">Durée maximale: {maxDuration} minutes</Label>
            <Slider
              id="duration-filter"
              min={10}
              max={60}
              step={5}
              value={[maxDuration]}
              onValueChange={(value) => setMaxDuration(value[0])}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="quizzes-filter"
              checked={quizzesOnly}
              onCheckedChange={setQuizzesOnly}
            />
            <Label htmlFor="quizzes-filter">Cours avec quiz uniquement</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="free-filter"
              checked={showFreeOnly}
              onCheckedChange={setShowFreeOnly}
            />
            <Label htmlFor="free-filter">Cours gratuits uniquement</Label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: Course) => (
            <Card key={course.$id}>
              <CardHeader>
                <div className="course-image-container">
                  <Image 
                    src={course.image || '/placeholder.svg?height=200&width=300'} 
                    alt={course.title} 
                    width={300} 
                    height={200} 
                    className="w-full h-full object-cover rounded-t-lg" 
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
                <div className="mt-4">
                  <p>Niveau: {course.level}</p>
                  <p>Durée: {course.duration || 'N/A'} minutes</p>
                  <p>Matière: {course.subject}</p>
                  <p>{course.hasQuizzes ? 'Inclut des quiz' : 'Pas de quiz'}</p>
                  <p className="font-bold">{course.price === 0 ? 'Gratuit' : `Prix: ${course.price} FCFA`}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Link href={`/courses/${course.$id}`} className="w-full">
                  <Button className="w-full">{course.price === 0 ? 'Commencer' : 'Voir le cours'}</Button>
                </Link>
                <Button variant="outline" size="icon" className="ml-2" title="Télécharger pour un accès hors ligne">
                  <Download className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}


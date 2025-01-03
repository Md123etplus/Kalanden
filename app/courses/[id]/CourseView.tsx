'use client'

import { useState, useEffect, useReducer } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/use-toast'
import { ErrorDisplay } from '@/components/ui/error'
import Link from 'next/link'
import Image from 'next/image'
import { Share2, Maximize2, Minimize2 } from 'lucide-react'
import { Models } from 'appwrite'
import { databases, storage, DATABASE_ID, COURSES_COLLECTION_ID, ENROLLMENTS_COLLECTION_ID, TRANSACTIONS_COLLECTION_ID, getCurrentUser } from '@/lib/appwrite'
import { ID, Query } from 'appwrite'
import { useRouter } from 'next/navigation'

enum Country {
  Mali = "Mali",
  BurkinaFaso = "Burkina Faso",
  Niger = "Niger"
}

interface Section {
  title: string;
  content: string;
}

interface Course extends Models.Document {
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

interface CourseViewProps {
  initialCourse: Course;
  courseId: string;
}

type CourseState = {
  course: Course | null
  isLoading: boolean
  error: string | null
  hasPaid: boolean
  paymentMethod: string
  showPaymentPopup: boolean
  phoneNumber: string
  country: Country | ''
  isFullScreen: boolean
  currentSectionIndex: number
  isAuthenticated: boolean;
}

type CourseAction =
  | { type: 'SET_COURSE'; payload: Course }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_HAS_PAID'; payload: boolean }
  | { type: 'SET_PAYMENT_METHOD'; payload: string }
  | { type: 'SET_SHOW_PAYMENT_POPUP'; payload: boolean }
  | { type: 'SET_PHONE_NUMBER'; payload: string }
  | { type: 'SET_COUNTRY'; payload: Country | '' }
  | { type: 'SET_FULL_SCREEN'; payload: boolean }
  | { type: 'SET_CURRENT_SECTION_INDEX'; payload: number }
  | { type: 'SET_IS_AUTHENTICATED'; payload: boolean };

function courseReducer(state: CourseState, action: CourseAction): CourseState {
  switch (action.type) {
    case 'SET_COURSE':
      return { ...state, course: action.payload, isLoading: false, error: null }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'SET_HAS_PAID':
      return { ...state, hasPaid: action.payload }
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload }
    case 'SET_SHOW_PAYMENT_POPUP':
      return { ...state, showPaymentPopup: action.payload }
    case 'SET_PHONE_NUMBER':
      return { ...state, phoneNumber: action.payload }
    case 'SET_COUNTRY':
      return { ...state, country: action.payload }
    case 'SET_FULL_SCREEN':
      return { ...state, isFullScreen: action.payload }
    case 'SET_CURRENT_SECTION_INDEX':
      return { ...state, currentSectionIndex: action.payload }
    case 'SET_IS_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    default:
      return state
  }
}

export function CourseView({ initialCourse, courseId }: CourseViewProps) {
  const router = useRouter()
  const parseSections = (course: Course): Course => {
    if (typeof course.sections === 'string') {
      try {
        course.sections = JSON.parse(course.sections);
      } catch (error) {
        console.error('Error parsing sections:', error);
        course.sections = [];
      }
    }
    return course;
  };

  const [state, dispatch] = useReducer(courseReducer, {
    course: null,
    isLoading: true,
    error: null,
    hasPaid: false,
    paymentMethod: '',
    showPaymentPopup: false,
    phoneNumber: '',
    country: '',
    isFullScreen: false,
    currentSectionIndex: 0,
    isAuthenticated: false,
  })

  const [courseImageUrl, setCourseImageUrl] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCourse()
    checkAuthentication();
  }, [courseId])

  const checkAuthentication = async () => {
    try {
      const user = await getCurrentUser();
      dispatch({ type: 'SET_IS_AUTHENTICATED', payload: !!user });
      if (user) {
        checkEnrollment(user.$id);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      dispatch({ type: 'SET_IS_AUTHENTICATED', payload: false });
    }
  };

  const checkEnrollment = async (userId: string) => {
    try {
      const enrollment = await databases.listDocuments(
        DATABASE_ID,
        ENROLLMENTS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('courseId', courseId)
        ]
      )

      dispatch({ type: 'SET_HAS_PAID', payload: enrollment.documents.length > 0 })
    } catch (error) {
      console.error('Error checking enrollment:', error)
    }
  }

  const fetchCourse = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      let fetchedCourse = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION_ID, courseId) as unknown as Course
      fetchedCourse = parseSections(fetchedCourse)
      dispatch({ type: 'SET_COURSE', payload: fetchedCourse })
      fetchCourseImage(fetchedCourse.imageFileId)
    } catch (error) {
      console.error('Error fetching course:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load course. Please try again.' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const fetchCourseImage = async (imageFileId?: string) => {
    if (imageFileId) {
      try {
        const imageUrl = storage.getFileView('6753658f001ce9532ca7', imageFileId)
        setCourseImageUrl(imageUrl.toString())
      } catch (error) {
        console.error('Error fetching course image:', error)
        // We don't set an error state here as the image is not critical
      }
    }
  }

  const handleEnrollment = async () => {
    if (!state.isAuthenticated) {
      router.push('/login')
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) throw new Error('User not found')
      if (!state.course) throw new Error('Course not found')

      const existingEnrollment = await databases.listDocuments(
        DATABASE_ID,
        ENROLLMENTS_COLLECTION_ID,
        [
          Query.equal('userId', currentUser.$id),
          Query.equal('courseId', courseId)
        ]
      )

      if (existingEnrollment.documents.length === 0) {
        await databases.createDocument(
          DATABASE_ID,
          ENROLLMENTS_COLLECTION_ID,
          ID.unique(),
          {
            userId: currentUser.$id,
            courseId: courseId,
            enrollmentDate: new Date().toISOString(),
          }
        )

        if (state.course.price > 0) {
          const instructorRevenue = state.course.price * 0.7
          const platformCommission = state.course.price * 0.3

          await databases.createDocument(
            DATABASE_ID,
            TRANSACTIONS_COLLECTION_ID,
            ID.unique(),
            {
              courseId: courseId,
              userId: currentUser.$id,
              instructorId: state.course.createdBy,
              amount: state.course.price,
              instructorRevenue: instructorRevenue,
              platformCommission: platformCommission,
              status: 'completed',
              paymentMethod: state.paymentMethod,
              createdAt: new Date().toISOString(),
            }
          )
        }

        await databases.updateDocument(
          DATABASE_ID,
          COURSES_COLLECTION_ID,
          courseId,
          {
            enrolledStudents: (state.course.enrolledStudents || 0) + 1
          }
        )

        dispatch({ type: 'SET_HAS_PAID', payload: true })
        toast({
          title: "Inscription réussie",
          description: "Vous êtes maintenant inscrit à ce cours.",
        })
        router.push(`/courses/${courseId}/content`)
      } else {
        dispatch({ type: 'SET_HAS_PAID', payload: true })
        toast({
          title: "Déjà inscrit",
          description: "Vous êtes déjà inscrit à ce cours.",
        })
      }
    } catch (error) {
      console.error('Error during enrollment:', error)
      dispatch({ type: 'SET_ERROR', payload: "Une erreur s'est produite lors de l'inscription. Veuillez réessayer." })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handlePayment = () => {
    if (!state.isAuthenticated) {
      router.push('/login')
      return
    }

    if (state.paymentMethod) {
      dispatch({ type: 'SET_SHOW_PAYMENT_POPUP', payload: true })
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une méthode de paiement.",
        variant: "destructive",
      })
    }
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (state.phoneNumber && state.country) {
      dispatch({ type: 'SET_SHOW_PAYMENT_POPUP', payload: false })
      toast({
        title: "Paiement en cours de vérification",
        description: "Nous vérifions votre paiement. Vous aurez accès au cours sous peu.",
      })
      setTimeout(() => {
        handleEnrollment()
      }, 2000)
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: state.course?.title,
      text: state.course?.description,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast({
          title: "Partagé avec succès",
          description: "Le cours a été partagé.",
        })
      } catch (err) {
        console.error('Error sharing:', err)
        toast({
          title: "Erreur",
          description: "Impossible de partager le cours. Veuillez réessayer.",
          variant: "destructive",
        })
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Lien copié",
        description: "Le lien du cours a été copié dans le presse-papiers.",
      })
    }
  }

  const toggleFullScreen = () => {
    dispatch({ type: 'SET_FULL_SCREEN', payload: !state.isFullScreen })
  }

  if (state.isLoading) {
    return <div className="text-center p-8">Chargement du cours...</div>
  }

  if (state.error) {
    return <ErrorDisplay title="Erreur" message={state.error} />
  }

  if (!state.course) {
    return <ErrorDisplay title="Erreur" message="Cours non trouvé" />
  }

  return (
    <div className={`min-h-screen bg-background text-foreground ${state.isFullScreen ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
      {!state.isFullScreen && <Header />}
      <main className={`container mx-auto px-4 py-8 ${state.isFullScreen ? 'h-full flex flex-col' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{state.course.title}</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={toggleFullScreen}>
              {state.isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <div className="course-image-container mb-4">
              <Image 
                src={courseImageUrl || state.course.image || '/placeholder.svg?height=400&width=600'} 
                alt={state.course.title} 
                width={600} 
                height={400} 
                className="w-full h-full object-cover rounded-lg" 
              />
            </div>
            <p className="text-xl mb-4">{state.course.description}</p>
            <p className="mb-4">Niveau: {state.course.level}</p>
            <p className="mb-4 font-bold">{state.course.price === 0 ? 'Gratuit' : `Prix: ${state.course.price} FCFA`}</p>
            <div className="prose dark:prose-invert mb-8">
              <h2>Résumé du cours</h2>
              <p>{state.course.resume || state.course.description}</p>
            </div>
          </div>
          <div className="md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Accéder au cours</CardTitle>
                <CardDescription>
                  {state.course.price === 0 
                    ? "Ce cours est gratuit. Commencez dès maintenant !" 
                    : "Choisissez votre méthode de paiement pour accéder au cours complet."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {state.isAuthenticated ? (
                  state.hasPaid ? (
                    <Button 
                      className="w-full" 
                      onClick={() => router.push(`/courses/${courseId}/content`)}
                    >
                      Accéder au contenu du cours
                    </Button>
                  ) : (
                    state.course.price === 0 ? (
                      <Button 
                        className="w-full" 
                        onClick={handleEnrollment} 
                        disabled={state.isLoading}
                      >
                        {state.isLoading ? 'Chargement...' : 'S\'inscrire gratuitement'}
                      </Button>
                    ) : (
                      <>
                        <RadioGroup value={state.paymentMethod} onValueChange={(value) => dispatch({ type: 'SET_PAYMENT_METHOD', payload: value })}>
                          <div className="flex items-center space-x-2 mb-2">
                            <RadioGroupItem value="orange-money" id="orange-money" />
                            <Label htmlFor="orange-money">Orange Money</Label>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <RadioGroupItem value="mobicash" id="mobicash" />
                            <Label htmlFor="mobicash">Mobicash</Label>
                          </div>
                          <div className="flex items-center space-x-2 mb-4">
                            <RadioGroupItem value="sama-money" id="sama-money" />
                            <Label htmlFor="sama-money">SamaMoney</Label>
                          </div>
                        </RadioGroup>
                        <Button className="w-full" onClick={handlePayment} disabled={state.isLoading}>
                          {state.isLoading ? 'Chargement...' : 'Payer et accéder au cours'}
                        </Button>
                      </>
                    )
                  )
                ) : (
                  <Button className="w-full" onClick={() => router.push('/login')}>
                    Se connecter pour s'inscrire
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      {state.showPaymentPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Informations de paiement</CardTitle>
              <CardDescription>Veuillez entrer les détails de votre paiement</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Select value={state.country} onValueChange={(value) => dispatch({ type: 'SET_COUNTRY', payload: value as Country })}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Sélectionnez votre pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Country).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone-number">Numéro de téléphone</Label>
                  <Input 
                    id="phone-number" 
                    value={state.phoneNumber} 
                    onChange={(e) => dispatch({ type: 'SET_PHONE_NUMBER', payload: e.target.value })}
                    placeholder="Ex: 70123456"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Prix</Label>
                  <Input 
                    id="price" 
                    value={`${state.course.price} FCFA`} 
                    disabled
                    className="bg-gray-100 dark:bg-gray-800"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => dispatch({ type: 'SET_SHOW_PAYMENT_POPUP', payload: false })}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={state.isLoading}>
                    {state.isLoading ? 'Chargement...' : 'Confirmer le paiement'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}


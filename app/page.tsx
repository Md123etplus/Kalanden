import React, { Suspense } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { EducationalIllustration, SmallAfricanStudentsSvg } from '@/components/illustrations'
import PopularInstructorsSection from '@/components/PopularInstructorsSection'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { databases, DATABASE_ID, COURSES_COLLECTION_ID, USERS_COLLECTION_ID, INSTRUCTOR_RATINGS_COLLECTION_ID } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { getFilePreview, BUCKET_ID, IMAGE_ID } from '@/lib/appwrite'
import LoadingAnimation from '@/components/LoadingAnimation'
import ErrorMessage from '@/components/ErrorMessage'
import OfflineMessage from '@/components/OfflineMessage'

interface Course {
  $id: string;
  title: string;
  description: string;
  level: string;
  image?: string;
  price: number;
  enrolledStudents?: number;
  imageFileId?: string;
}

interface Instructor {
  $id: string;
  name: string;
  location: string;
  profileImageId?: string;
  likes: number;
  coursesCreated: number;
}

// Appwrite file IDs for the section images
const STUDENT_IMAGE_ID = '677dc861000e70ec2a15'
const INSTRUCTOR_IMAGE_ID = '67674c1200010784cf7a'
const PARENT_IMAGE_ID = '6771faf700129f3f59ff'
const HERO_IMAGE_ID = IMAGE_ID

const fetchData = async () => {
  let popularCourses: Course[] = []
  let studentImageUrl = '/placeholder.svg?height=150&width=200'
  let instructorImageUrl = '/placeholder.svg?height=150&width=200'
  let parentImageUrl = '/placeholder.svg?height=150&width=200'
  let heroImageUrl = '/placeholder.svg?height=300&width=400'

  try {
    // Fetch section images
    const [heroImage, studentImage, instructorImage, parentImage] = await Promise.all([
      getFilePreview(BUCKET_ID, HERO_IMAGE_ID),
      getFilePreview(BUCKET_ID, STUDENT_IMAGE_ID),
      getFilePreview(BUCKET_ID, INSTRUCTOR_IMAGE_ID),
      getFilePreview(BUCKET_ID, PARENT_IMAGE_ID)
    ]);

    heroImageUrl = heroImage || heroImageUrl;
    studentImageUrl = studentImage || studentImageUrl;
    instructorImageUrl = instructorImage || instructorImageUrl;
    parentImageUrl = parentImage || parentImageUrl;

    // Fetch popular courses
    const response = await databases.listDocuments(
      DATABASE_ID,
      COURSES_COLLECTION_ID,
      [
        Query.orderDesc('enrolledStudents'),
        Query.limit(3)
      ]
    )
    popularCourses = response.documents as unknown as Course[]

    // Fetch image URLs for courses
    popularCourses = await Promise.all(popularCourses.map(async (course) => {
      if (course.imageFileId) {
        try {
          const courseImageUrl = await getFilePreview(BUCKET_ID, course.imageFileId);
          return { ...course, image: courseImageUrl };
        } catch (error) {
          console.error(`Error fetching image for course ${course.$id}:`, error);
          return course;
        }
      }
      return course;
    }));

    return { popularCourses, heroImageUrl, studentImageUrl, instructorImageUrl, parentImageUrl };
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error;
  }
}

const HomeContent = async () => {
  const { popularCourses, heroImageUrl, studentImageUrl, instructorImageUrl, parentImageUrl } = await fetchData();

  return (
    <>
      {/* Hero section */}
      <section className="flex flex-col md:flex-row items-center justify-center mb-16 px-4 md:px-12">
        <div className="md:w-1/2 mb-9 md:mb-0 md:order-2 flex justify-center">
          <Image 
            src={heroImageUrl || "/placeholder.svg"} 
            alt="Élèves maliens" 
            width={400} 
            height={300} 
            className="rounded-lg object-cover"
          />
        </div>
        <div className="md:w-1/2 md:order-1 md:pr-8 flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-4xl font-bold mb-4">Bienvenue sur Kalandén</h1>
          <p className="text-xl mb-8">
            La plateforme éducative en ligne qui révolutionne l'apprentissage au Mali.
            Accédez à des ressources pédagogiques de qualité, où que vous soyez, quand vous le souhaitez, en toute simplicité.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/courses">
              <Button size="lg" className="w-full sm:w-auto">Commencer à apprendre</Button>
            </Link>
            <Link href="/subscription">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">Donner des cours</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* User types section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 py-8">
        <div className="bg-primary/10 p-8 rounded-lg flex flex-col h-full">
          <div className="w-full h-40 mb-4 rounded-lg overflow-hidden">
            <Image 
              src={studentImageUrl || "/placeholder.svg"}
              alt="Étudiants" 
              width={200} 
              height={150} 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Pour les étudiants</h2>
          <p className="mb-4 flex-grow">Accédez à une variété de cours et de ressources pour améliorer votre éducation.</p>
          <div className="mt-auto">
            <Link href="/courses">
              <Button className="w-full">Explorer les cours</Button>
            </Link>
          </div>
        </div>
        <div className="bg-secondary/10 p-8 rounded-lg flex flex-col h-full">
          <div className="w-full h-40 mb-4 rounded-lg overflow-hidden">
            <Image 
              src={instructorImageUrl || "/placeholder.svg"}
              alt="Instructeurs" 
              width={200} 
              height={150} 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Pour les instructeurs</h2>
          <p className="mb-4 flex-grow">Partagez vos connaissances, enseignez aux étudiants maliens et gagnez un revenu supplémentaire.</p>
          <div className="mt-auto">
            <Link href="/subscription">
              <Button variant="secondary" className="w-full">Devenir instructeur</Button>
            </Link>
          </div>
        </div>
        <div className="bg-accent/10 p-8 rounded-lg flex flex-col h-full">
          <div className="w-full h-40 mb-4 rounded-lg overflow-hidden">
            <Image 
              src={parentImageUrl || "/placeholder.svg"}
              alt="Parents" 
              width={200} 
              height={150} 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Pour les parents</h2>
          <p className="mb-4 flex-grow">Suivez les performances de vos enfants et participez activement à leur éducation.</p>
          <div className="mt-auto">
            <Link href="/dashboard/parent">
              <Button variant="outline" className="w-full">Tableau de bord parent</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular courses section */}
      <section className="mb-16 py-8">
        <h2 className="text-3xl font-bold mb-8 text-center">Cours populaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularCourses.map((course) => (
            <Card key={course.$id}>
              <CardHeader>
                <Image 
                  src={course.image || '/placeholder.svg?height=100&width=200'} 
                  alt={course.title} 
                  width={200} 
                  height={100} 
                  className="w-full h-40 object-cover rounded-t-lg" 
                />
              </CardHeader>
              <CardContent>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
                <p className="mt-2">Niveau: {course.level}</p>
                <p className="mt-2 font-bold">{course.price === 0 ? 'Gratuit' : `Prix: ${course.price} FCFA`}</p>
                <p className="mt-2">Étudiants inscrits: {course.enrolledStudents || 0}</p>
                <Link href={`/courses/${course.$id}`} className="mt-4 inline-block">
                  <Button>{course.price === 0 ? 'Commencer' : 'Voir le cours'}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Popular instructors section */}
      <PopularInstructorsSection />

      {/* Mission section */}
      <section className="flex flex-col md:flex-row items-center justify-between mb-16 py-8 px-8 bg-accent/10 rounded-lg">
        <div className="md:w-1/3 flex justify-center mb-8 md:mb-0 md:order-2">
          <SmallAfricanStudentsSvg />
        </div>
        <div className="md:w-1/2 md:order-1">
          <h2 className="text-3xl font-bold mb-4">Notre mission</h2>
          <p className="text-xl mb-8">Offrir une éducation de qualité à tous les Maliens, où qu'ils soient et quelles que soient les conditions.</p>
        </div>
      </section>

      {/* Why choose Kalandén section */}
      <section className="bg-primary/5 p-8 rounded-lg mb-16">
        <h2 className="text-2xl font-bold mb-4 text-center">Pourquoi choisir Kalandén ?</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Accès flexible à l'éducation</AccordionTrigger>
            <AccordionContent>
              Apprenez à votre rythme, où que vous soyez, même pendant les périodes de chaleur extrême.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Contenu de qualité</AccordionTrigger>
            <AccordionContent>
              Des cours conçus par des experts et alignés sur le programme scolaire malien.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Suivi personnalisé</AccordionTrigger>
            <AccordionContent>
              Bénéficiez d'un suivi individuel de vos progrès et de recommandations personnalisées.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Communauté d'apprentissage</AccordionTrigger>
            <AccordionContent>
              Rejoignez une communauté dynamique d'apprenants et d'enseignants passionnés.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>Opportunités pour les enseignants</AccordionTrigger>
            <AccordionContent>
              Partagez votre expertise, enseignez aux étudiants maliens et gagnez un revenu supplémentaire.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingAnimation />}>
          <HomeContent />
        </Suspense>
      </main>
      <footer className="bg-secondary text-secondary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">À propos de Kalandén</h3>
              <p>Plateforme éducative en ligne dédiée à l'amélioration de l'accès à l'éducation au Mali.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li><Link href="/courses" className="hover:underline">Cours</Link></li>
                <li><Link href="/subscription" className="hover:underline">Devenir instructeur</Link></li>
                <li><Link href="/about" className="hover:underline">À propos</Link></li>
                <li><Link href="/contact" className="hover:underline">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Nous contacter</h3>
              <a href="mailto:kalanden.education@gmail.com">Email: kalanden.education@gmail.com</a>
              <hr></hr>
              <a href="tel:+223 77 59 75 87"> Téléphone: +223 77 59 75 87</a>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; 2023 Kalandén. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


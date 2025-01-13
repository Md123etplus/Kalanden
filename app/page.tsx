"use client"
import React from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { EducationalIllustration, SmallAfricanStudentsSvg } from '@/components/illustrations'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { databases, DATABASE_ID, COURSES_COLLECTION_ID } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { getFilePreview,BUCKET_ID, IMAGE_ID } from '@/lib/appwrite'

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

// Appwrite file IDs for the section images
const STUDENT_IMAGE_ID = '677dc861000e70ec2a15'
const INSTRUCTOR_IMAGE_ID = '67674c1200010784cf7a'
const PARENT_IMAGE_ID = '6771faf700129f3f59ff'
const HERO_IMAGE_ID = IMAGE_ID

export default async function Home() {
  let popularCourses: Course[] = []
  let studentImageUrl = '/placeholder.svg?height=150&width=200'
  let instructorImageUrl = '/placeholder.svg?height=150&width=200'
  let parentImageUrl = '/placeholder.svg?height=150&width=200'
  let heroImageUrl = '/placeholder.svg?height=300&width=400'
  const isNightMode = false; // Define the isNightMode variable

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
  } catch (error) {
    console.error('Error fetching data:', error)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="flex flex-col md:flex-row items-center justify-center mb-16 py-8 px-4 md:px-12">
          <div className="md:w-1/2 mb-8 md:mb-0 md:order-2 flex justify-center">
            <Image 
              src={heroImageUrl} 
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

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 py-8">
          <div className="bg-primary/10 p-8 rounded-lg flex flex-col h-full">
            <div className="w-full h-40 mb-4 rounded-lg overflow-hidden">
              <Image 
                src={studentImageUrl}
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
                src={instructorImageUrl}
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
                src={parentImageUrl}
                alt="Parents" 
                width={200} 
                height={150} 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Pour les parents</h2>
            <p className="mb-4 flex-grow">Suivez les performances de vos enfants et participez activement à leur éducation.</p>
            <div className="mt-auto">
              <Link href="/parent-dashboard">
                <Button variant="outline" className="w-full">Tableau de bord parent</Button>
              </Link>
            </div>
          </div>
        </section>

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
        
        <section className={`mb-16 py-8 ${isNightMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
          <h2 className="text-3xl font-bold mb-8 text-center">Enseignants populaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: 1,
                name: 'Dr. Fatoumata Diarra',
                location: 'Bamako, Mali',
                stars: 4.8,
                courses: 12,
                image: parentImageUrl,
              },
              {
                id: 2,
                name: 'M. Adama Traoré',
                location: 'Sikasso, Mali',
                stars: 4.5,
                courses: 8,
                image: parentImageUrl,
              },
              {
                id: 3,
                name: 'Mme Aïssata Konaté',
                location: 'Kayes, Mali',
                stars: 4.7,
                courses: 10,
                image: parentImageUrl,
              },
            ].map((teacher) => (
              <div key={teacher.id} className={`bg-${isNightMode ? 'gray-800' : 'white'} rounded-lg shadow-lg p-4 flex flex-col items-center`}>
                <Image
                  src={teacher.image}
                  alt={teacher.name}
                  width={100}
                  height={100}
                  className="w-24 h-24 object-cover rounded-full mb-4"
                />
                <h3 className="text-xl font-bold mb-2">{teacher.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{teacher.location}</p>
                <p className="text-yellow-500 mb-2">{'★'.repeat(Math.round(teacher.stars))}{'☆'.repeat(5 - Math.round(teacher.stars))}</p>
                <p className="text-sm text-gray-600 mb-4">Cours créés: {teacher.courses}</p>
                <div className="flex space-x-4">
                  <Button variant="default" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                    Voir Profil
                  </Button>
                  <Button variant="secondary" className="bg-green-500 text-white px-4 py-2 rounded-lg">
                    Prendre Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-right mt-4">
            <Button variant="secondary" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
              Voir plus d'enseignants
            </Button>
          </div>
        </section>
        <section className="flex flex-col md:flex-row items-center justify-between mb-16 py-8 px-8 bg-accent/10 rounded-lg">
          <div className="md:w-1/3 flex justify-center mb-8 md:mb-0 md:order-2">
            <SmallAfricanStudentsSvg />
          </div>
          <div className="md:w-1/2 md:order-1">
            <h2 className="text-3xl font-bold mb-4">Notre mission</h2>
            <p className="text-xl mb-8">Offrir une éducation de qualité à tous les Maliens, où qu'ils soient et quelles que soient les conditions.</p>
          </div>
        </section>



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
              <p>Téléphone: +223 XX XX XX XX</p>
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


"use client"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { databases, DATABASE_ID, COURSES_COLLECTION_ID, TRANSACTIONS_COLLECTION_ID } from '@/lib/appwrite'
import { Query } from 'appwrite'
import { useToast } from '@/components/use-toast'
import { getCurrentUser } from '@/lib/appwrite'
import { InstructorWithdrawal } from '@/components/InstructorWithdrawal'
import { Course } from '@/lib/course'

interface RevenueStats {
  totalRevenue: number;
  instructorRevenue: number;
  platformCommission: number;
}

export function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    totalRevenue: 0,
    instructorRevenue: 0,
    platformCommission: 0
  })
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const user = await getCurrentUser()
      // console.log("uuser from getCurrentUser of InstructorDash component lib/appwrite", user)
      if (!user) {
        throw new Error('Current user not found')
      }
      setCurrentUser(user)

      // Fetch all courses by the instructor
      const response = await databases.listDocuments(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        [
          Query.equal('createdBy', user.$id),
          Query.limit(100)
        ]
      )
      const instructorCourses = response.documents as unknown as Course[]
      setCourses(instructorCourses)

      // Fetch transactions for all courses by this instructor
      const transactions = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        [
          Query.equal('instructorId', user.$id),
          Query.equal('status', 'completed')
        ]
      )

      // Calculate revenue from transactions
      const totalRevenue = transactions.documents.reduce((sum, transaction) => sum + transaction.amount, 0)
      const instructorRevenue = transactions.documents.reduce((sum, transaction) => sum + transaction.instructorRevenue, 0)
      const platformCommission = transactions.documents.reduce((sum, transaction) => sum + transaction.platformCommission, 0)

      setRevenueStats({
        totalRevenue,
        instructorRevenue,
        platformCommission
      })

    } catch (error) {
      console.error('Error fetching courses and transactions:', error)
      if (error instanceof Error) {
        if (error.message === 'Current user not found') {
          toast({
            title: "Erreur d'authentification",
            description: "Impossible de trouver l'utilisateur actuel. Veuillez vous reconnecter.",
            variant: "destructive",
          })
        } else if (error.message.includes('Document with the requested ID could not be found')) {
          toast({
            title: "Erreur de données",
            description: "Certaines données n'ont pas pu être récupérées. Veuillez réessayer ou contacter le support.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Erreur",
            description: "Une erreur s'est produite lors du chargement des cours et des revenus. Veuillez réessayer.",
            variant: "destructive",
          })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleModifyCourse = (courseId: string) => {
    window.location.href = `/courses/edit/${courseId}`
  }

  const handleViewStatistics = (courseId: string) => {
    window.location.href = `/courses/statistics/${courseId}`
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenu Total</CardTitle>
                <CardDescription>Tous les cours combinés</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{formatCurrency(revenueStats.totalRevenue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Votre Revenu</CardTitle>
                <CardDescription>70% des ventes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-600">{formatCurrency(revenueStats.instructorRevenue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Commission Plateforme</CardTitle>
                <CardDescription>30% des ventes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-muted-foreground">{formatCurrency(revenueStats.platformCommission)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mes cours</CardTitle>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <p>Aucun cours trouvé. Commencez par créer votre premier cours !</p>
              ) : (
                courses.map((course) => (
                  <div key={course.$id} className="mb-4 p-4 border rounded">
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <p>Étudiants inscrits: {course.enrolledStudents || 0}</p>
                    <p>Prix: {formatCurrency(course.price)}</p>
                    <p>Note moyenne: {course.averageRating ? `${course.averageRating.toFixed(1)}/5` : 'N/A'}</p>
                    <div className="mt-2 space-x-2">
                      <Button variant="outline" onClick={() => handleModifyCourse(course.$id)}>Modifier</Button>
                      <Button variant="outline" onClick={() => handleViewStatistics(course.$id)}>Voir les statistiques</Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Créer un nouveau cours</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/courses/create">
                <Button>Créer un nouveau cours</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Retrait des gains</CardTitle>
              <CardDescription>Retirez vos gains accumulés</CardDescription>
            </CardHeader>
            <CardContent>
              <InstructorWithdrawal instructorId={currentUser.$id} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}


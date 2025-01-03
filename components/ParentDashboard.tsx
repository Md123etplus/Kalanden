"use client"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/use-toast'
import { databases, DATABASE_ID, USERS_COLLECTION_ID, CONNECTION_REQUESTS_COLLECTION_ID, getCurrentUser } from '@/lib/appwrite'
import { Query, ID } from 'appwrite'

interface ChildStats {
  id: string;
  name: string;
  grade: string;
  performance: string;
  coursesEnrolled: number;
  averageScore: number;
}

export function ParentDashboard() {
  const [childEmail, setChildEmail] = useState('')
  const [children, setChildren] = useState<ChildStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    setIsLoading(true)
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== 'parent') {
        throw new Error('User is not authorized as a parent')
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('parentId', currentUser.$id)]
      )
      setChildren(response.documents.map(doc => ({
        id: doc.$id,
        name: doc.name,
        grade: doc.grade || 'Non spécifié',
        performance: doc.performance || 'Non évalué',
        coursesEnrolled: doc.coursesEnrolled || 0,
        averageScore: doc.averageScore || 0
      })))
    } catch (error) {
      console.error('Error fetching children:', error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les informations des enfants. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== 'parent') {
        throw new Error('User is not authorized as a parent')
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('email', childEmail), Query.equal('role', 'student')]
      )
      if (response.documents.length > 0) {
        const childUser = response.documents[0]
        await databases.createDocument(
          DATABASE_ID,
          CONNECTION_REQUESTS_COLLECTION_ID,
          ID.unique(),
          {
            parentId: currentUser.$id,
            childId: childUser.$id,
            status: 'pending'
          }
        )
        toast({
          title: "Demande envoyée",
          description: `Une demande de connexion a été envoyée à ${childEmail}.`,
        })
      } else {
        toast({
          title: "Erreur",
          description: "Aucun compte étudiant trouvé avec cet email.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error adding child:', error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout de l'enfant. Veuillez vérifier vos autorisations et réessayer.",
        variant: "destructive",
      })
    }
    setChildEmail('')
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un enfant</CardTitle>
          <CardDescription>Associez le compte de votre enfant à votre compte parent</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddChild} className="space-y-4">
            <div>
              <Label htmlFor="childEmail">Email de l'enfant</Label>
              <Input
                id="childEmail"
                type="email"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                placeholder="email.de.lenfant@example.com"
                required
              />
            </div>
            <Button type="submit">Ajouter l'enfant</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mes enfants</CardTitle>
          <CardDescription>Suivez les progrès de vos enfants</CardDescription>
        </CardHeader>
        <CardContent>
          {children.length === 0 ? (
            <p>Aucun enfant associé à votre compte pour le moment.</p>
          ) : (
            children.map((child) => (
              <div key={child.id} className="mb-4 p-4 border rounded">
                <h3 className="text-lg font-semibold">{child.name}</h3>
                <p>Classe: {child.grade}</p>
                <p>Performance: {child.performance}</p>
                <p>Cours inscrits: {child.coursesEnrolled}</p>
                <p>Score moyen: {child.averageScore.toFixed(2)}%</p>
                <Button className="mt-2">Voir les détails</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}


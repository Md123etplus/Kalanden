'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/use-toast'
import { databases, DATABASE_ID, USERS_COLLECTION_ID, CONNECTION_REQUESTS_COLLECTION_ID, getCurrentUser } from '@/lib/appwrite'
import { Query } from 'appwrite'

interface ConnectionRequest {
  $id: string;
  parentId: string;
  parentName: string;
  status: string;
}

export default function ConnectionRequestsPage() {
  const [requests, setRequests] = useState<ConnectionRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchConnectionRequests()
  }, [])

  const fetchConnectionRequests = async () => {
    setIsLoading(true)
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== 'student') {
        throw new Error('User is not authorized as a student')
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        CONNECTION_REQUESTS_COLLECTION_ID,
        [
          Query.equal('childId', currentUser.$id),
          Query.equal('status', 'pending')
        ]
      )

      const requestsWithParentNames = await Promise.all(
        response.documents.map(async (doc) => {
          const parentUser = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            doc.parentId
          )
          return {
            $id: doc.$id,
            parentId: doc.parentId,
            parentName: parentUser.name,
            status: doc.status
          }
        })
      )

      setRequests(requestsWithParentNames)
    } catch (error) {
      console.error('Error fetching connection requests:', error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les demandes de connexion. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId: string, parentId: string) => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) throw new Error('User not found')

      // Update the connection request status
      await databases.updateDocument(
        DATABASE_ID,
        CONNECTION_REQUESTS_COLLECTION_ID,
        requestId,
        { status: 'accepted' }
      )

      // Update the student's parentId
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        currentUser.$id,
        { parentId: parentId }
      )

      toast({
        title: "Demande acceptée",
        description: "La connexion avec le parent a été établie avec succès.",
      })

      // Refresh the list of requests
      fetchConnectionRequests()
    } catch (error) {
      console.error('Error accepting request:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la demande. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Demandes de connexion</h1>
        {requests.length === 0 ? (
          <p>Aucune demande de connexion en attente.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.$id}>
                <CardHeader>
                  <CardTitle>Demande de {request.parentName}</CardTitle>
                  <CardDescription>Statut : {request.status}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleAcceptRequest(request.$id, request.parentId)}>
                    Accepter la demande
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


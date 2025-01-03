"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { databases, DATABASE_ID } from '@/lib/appwrite'
import { Query } from 'appwrite'

const COMPETITIONS_EVENTS_COLLECTION_ID = 'YOUR_COMPETITIONS_EVENTS_COLLECTION_ID'

interface CompetitionEvent {
  $id: string
  title: string
  description: string
  date: string
  type: 'competition' | 'event'
  location: string
}

export default function CompetitionsEventsPage() {
  const [competitionsEvents, setCompetitionsEvents] = useState<CompetitionEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCompetitionsEvents()
  }, [])

  const fetchCompetitionsEvents = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COMPETITIONS_EVENTS_COLLECTION_ID,
        [Query.orderDesc('date')]
      )
      setCompetitionsEvents(response.documents as unknown as CompetitionEvent[])
    } catch (error) {
      console.error('Error fetching competitions and events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return <div>Chargement des compétitions et événements...</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Compétitions et Événements</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitionsEvents.map((item) => (
            <Card key={item.$id}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{formatDate(item.date)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{item.description}</p>
                <p className="mt-2">Lieu : {item.location}</p>
              </CardContent>
              <CardFooter>
                <Button>
                  {item.type === 'competition' ? "S'inscrire à la compétition" : "Participer à l'événement"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}


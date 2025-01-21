"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"
import {
  databases,
  DATABASE_ID,
  USERS_COLLECTION_ID,
  COURSES_COLLECTION_ID,
  INSTRUCTOR_RATINGS_COLLECTION_ID,
} from "@/lib/appwrite"
import { Query } from "appwrite"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Instructor {
  $id: string
  name: string
  location: string
  profileImageId?: string
  bio?: string
  coursesCreated: number
  likes: number
  email: string
  phoneNumber: string
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
          Query.equal("role", "instructor"),
          Query.limit(100),
        ])
        const fetchedInstructors = response.documents as unknown as Instructor[]

        const instructorsWithDetails = await Promise.all(
          fetchedInstructors.map(async (instructor) => {
            const coursesCreated = await fetchCoursesCountForInstructor(instructor.$id)
            const likes = await fetchLikesForInstructor(instructor.$id)
            return { ...instructor, coursesCreated, likes }
          }),
        )

        const sortedInstructors = instructorsWithDetails.sort((a, b) => b.likes - a.likes)
        setInstructors(sortedInstructors)
        setFilteredInstructors(sortedInstructors)

        // Extract unique locations
        const uniqueLocations = Array.from(new Set(instructorsWithDetails.map((instructor) => instructor.location)))
        setLocations(uniqueLocations)
      } catch (error) {
        console.error("Error fetching instructors:", error)
      }
    }

    fetchInstructors()
  }, [])

  const fetchCoursesCountForInstructor = async (instructorId: string) => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COURSES_COLLECTION_ID, [
        Query.equal("createdBy", instructorId),
      ])
      return response.documents.length
    } catch (error) {
      console.error("Error fetching courses:", error)
      return 0
    }
  }

  const fetchLikesForInstructor = async (instructorId: string) => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, INSTRUCTOR_RATINGS_COLLECTION_ID, [
        Query.equal("instructorId", instructorId),
      ])
      return response.documents.length
    } catch (error) {
      console.error("Error fetching likes:", error)
      return 0
    }
  }

  useEffect(() => {
    const filtered = instructors
      .filter(
        (instructor) =>
          (selectedLocation === "all" || instructor.location === selectedLocation) &&
          (instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            instructor.bio?.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      .sort((a, b) => b.likes - a.likes)
    setFilteredInstructors(filtered)
  }, [selectedLocation, searchQuery, instructors])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Nos Instructeurs</h1>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <Label htmlFor="location-filter">Filtrer par localisation</Label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger id="location-filter">
                <SelectValue placeholder="Choisir une localisation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les localisations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-2/3">
            <Label htmlFor="search">Rechercher un instructeur</Label>
            <Input
              id="search"
              type="search"
              placeholder="Rechercher par nom ou bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((instructor) => (
            <Card key={instructor.$id}>
              <CardHeader>
                <Image
                  src={
                    instructor.profileImageId
                      ? `/api/images/${instructor.profileImageId}`
                      : "/placeholder.svg?height=100&width=100"
                  }
                  alt={instructor.name}
                  width={100}
                  height={100}
                  className="rounded-full mx-auto"
                />
              </CardHeader>
              <CardContent className="text-center">
                <h2 className="text-xl font-bold mb-2">{instructor.name}</h2>
                <p className="text-sm text-gray-600 mb-2">{instructor.location}</p>
                <p className="text-sm mb-4">{instructor.bio}</p>
                <p className="font-semibold mb-2">Cours créés: {instructor.coursesCreated}</p>
                <p className="font-semibold mb-4">J'aime: {instructor.likes}</p>
                <Link href={`/instructors/${instructor.$id}`}>
                  <Button className="w-full mb-2">Voir le profil</Button>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" onClick={() => setSelectedInstructor(instructor)}>
                      Prendre Contact
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contacter {selectedInstructor?.name}</DialogTitle>
                      <DialogDescription>Voici les informations de contact de l'instructeur.</DialogDescription>
                    </DialogHeader>
                    {selectedInstructor && (
                      <div className="mt-4">
                        <p>
                          <strong>Email:</strong> {selectedInstructor.email}
                        </p>
                        <p>
                          <strong>Téléphone:</strong> {selectedInstructor.phoneNumber}
                        </p>
                        <p>
                          <strong>Localisation:</strong> {selectedInstructor.location}
                        </p>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}


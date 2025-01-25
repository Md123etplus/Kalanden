import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

interface CourseCardProps {
  course: {
    $id: string
    title: string
    description: string
    level: string
    price: number
    image?: string
    enrolledStudents?: number
  }
}

const MAX_DESCRIPTION_LENGTH = 100 // Adjust this value as needed

export function CourseCard({ course }: CourseCardProps) {
  const truncatedDescription =
    course.description.length > MAX_DESCRIPTION_LENGTH
      ? `${course.description.substring(0, MAX_DESCRIPTION_LENGTH)}...`
      : course.description

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <Image
            src={course.image || "/placeholder.svg?height=200&width=300"}
            alt={course.title}
            layout="fill"
            objectFit="cover"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-4">
        <CardTitle className="mb-2 line-clamp-2">{course.title}</CardTitle>
        <p className="text-sm text-muted-foreground mb-2 flex-grow line-clamp-3">{truncatedDescription}</p>
        <div className="mt-auto">
          <p className="text-sm mb-1">Niveau: {course.level}</p>
          <p className="font-bold mb-2">{course.price === 0 ? "Gratuit" : `Prix: ${course.price} FCFA`}</p>
          <p className="text-sm mb-4">Étudiants inscrits: {course.enrolledStudents || 0}</p>
          <Link href={`/courses/${course.$id}`} className="w-full">
            <Button className="w-full">{course.price === 0 ? "Commencer" : "Voir le cours"}</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}


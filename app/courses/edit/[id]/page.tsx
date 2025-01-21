"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseContentEditor } from "@/components/CourseContentEditor"
import { databases, storage, DATABASE_ID, COURSES_COLLECTION_ID } from "@/lib/appwrite"
import { ID } from "appwrite"
import { Upload, Plus, Trash2, FileText, Video, ImageIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"

const STORAGE_BUCKET_ID = "6771fdfe00118108ba19" // Replace with your actual bucket ID

export interface PageProps {
  params: Promise<{
    id: string
  }>
}

const EditCoursePage = ({ params }: PageProps) => {
  const { id } = use(params)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "",
    subject: "",
    price: 0,
    content: "",
    duration: 0,
    hasQuizzes: false,
  })
  const [courseImage, setCourseImage] = useState<File | null>(null)
  const [coursePDF, setCoursePDF] = useState<File | null>(null)
  const [courseVideo, setCourseVideo] = useState<File | null>(null)
  const [courseImagePreview, setCourseImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!id) {
          throw new Error("Course ID is missing")
        }

        const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION_ID, id)
        setFormData({
          title: course.title,
          description: course.description,
          level: course.level,
          subject: course.subject,
          price: course.price,
          content: course.content,
          duration: course.duration,
          hasQuizzes: course.hasQuizzes || false,
        })
        if (course.imageFileId) {
          const imageUrl = await storage.getFileView(STORAGE_BUCKET_ID, course.imageFileId)
          setCourseImagePreview(imageUrl)
        }
      } catch (error) {
        console.error("Error fetching course:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger le cours. Veuillez réessayer.",
          variant: "destructive",
        })
      }
    }
    fetchCourse()
  }, [id, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }))
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    allowedTypes: string[],
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (allowedTypes.includes(file.type)) {
        setFile(file)
        if (setFile === setCourseImage) {
          setCourseImagePreview(URL.createObjectURL(file))
        }
      } else {
        toast({
          title: "Type de fichier non autorisé",
          description: `Veuillez sélectionner un fichier de type ${allowedTypes.join(", ")}.`,
          variant: "destructive",
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let imageFileId = null
      let pdfFileId = null
      let videoFileId = null

      if (courseImage) {
        const uploadedImage = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), courseImage)
        imageFileId = uploadedImage.$id
      }

      if (coursePDF) {
        const uploadedPDF = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), coursePDF)
        pdfFileId = uploadedPDF.$id
      }

      if (courseVideo) {
        const uploadedVideo = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), courseVideo)
        videoFileId = uploadedVideo.$id
      }

      await databases.updateDocument(DATABASE_ID, COURSES_COLLECTION_ID, id, {
        title: formData.title,
        description: formData.description,
        level: formData.level,
        subject: formData.subject,
        price: Math.round(Number(formData.price)),
        content: formData.content,
        duration: Math.round(Number(formData.duration)),
        hasQuizzes: formData.hasQuizzes,
        ...(imageFileId && { imageFileId }),
        ...(pdfFileId && { pdfFileId }),
        ...(videoFileId && { videoFileId }),
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Cours mis à jour",
        description: "Votre cours a été mis à jour avec succès.",
      })
      router.push("/dashboard/instructor")
    } catch (error) {
      console.error("Error updating course:", error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du cours. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
}

export default EditCoursePage


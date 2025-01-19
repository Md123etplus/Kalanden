"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CourseContentEditor } from '@/components/CourseContentEditor'
import { databases, storage, account, DATABASE_ID, COURSES_COLLECTION_ID } from '@/lib/appwrite'
import { ID } from 'appwrite'
import { Upload, Plus, Trash2, FileText, Video, ImageIcon } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface QuizQuestion {
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
}

const STORAGE_BUCKET_ID = '6753658f001ce9532ca7'; // Replace with your actual bucket ID

export default function CreateCoursePage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '',
    subject: '',
    price: 0,
    content: '',
    duration: 0,
    hasQuizzes: false,
  })
  const [courseImage, setCourseImage] = useState<File | null>(null)
  const [coursePDF, setCoursePDF] = useState<File | null>(null)
  const [courseVideo, setCourseVideo] = useState<File | null>(null)
  const [courseImagePreview, setCourseImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>, allowedTypes: string[]) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (allowedTypes.includes(file.type)) {
        setFile(file);
        if (setFile === setCourseImage) {
          setCourseImagePreview(URL.createObjectURL(file));
        }
      } else {
        toast({
          title: "Type de fichier non autorisé",
          description: `Veuillez sélectionner un fichier de type ${allowedTypes.join(', ')}.`,
          variant: "destructive",
        });
      }
    }
  }

  const handleAddQuizQuestion = () => {
    setQuizQuestions([...quizQuestions, { text: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] }]);
  };

  const handleQuizQuestionChange = (index: number, field: 'text' | 'options', value: string | { text: string; isCorrect: boolean }[]) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[index][field] = value as never;
    setQuizQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentUser = await account.get();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      let imageFileId = null;
      let pdfFileId = null;
      let videoFileId = null;

      if (courseImage) {
        const uploadedImage = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), courseImage);
        imageFileId = uploadedImage.$id;
      }

      if (coursePDF) {
        const uploadedPDF = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), coursePDF);
        pdfFileId = uploadedPDF.$id;
      }

      if (courseVideo) {
        const uploadedVideo = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), courseVideo);
        videoFileId = uploadedVideo.$id;
      }

      await databases.createDocument(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        ID.unique(),
        {
          title: formData.title,
          description: formData.description,
          level: formData.level,
          subject: formData.subject,
          price: Math.round(Number(formData.price)),
          content: formData.content,
          duration: Math.round(Number(formData.duration)),
          imageFileId,
          pdfFileId,
          videoFileId,
          createdBy: currentUser.$id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          hasQuizzes: formData.hasQuizzes,
          enrolledStudents: 0,
          quizzes: formData.hasQuizzes ? JSON.stringify(quizQuestions) : null,
        }
      );

      toast({
        title: "Cours créé",
        description: "Votre cours a été créé avec succès.",
      });
      router.push('/dashboard/instructor');
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du cours. Veuillez réessayer.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const preventScroll = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const form = target.closest('form');
    if (form) {
      const scrollPosition = form.scrollTop;
      requestAnimationFrame(() => {
        form.scrollTop = scrollPosition;
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Créer un nouveau cours</h1>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }} 
          className="space-y-6 max-w-3xl mx-auto" 
          onChange={preventScroll}
        >
          <Card>
            <CardHeader>
              <CardTitle>Image principale du cours</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-full max-w-md aspect-video bg-muted flex items-center justify-center rounded-lg overflow-hidden">
                {courseImagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={courseImagePreview || "/placeholder.svg"}
                      alt="Aperçu du cours"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setCourseImage(null);
                        setCourseImagePreview(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Aucune image sélectionnée</p>
                  </div>
                )}
              </div>
              <Label htmlFor="courseImage" className="mt-4 cursor-pointer">
                <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  <span>{courseImage ? 'Changer l\'image' : 'Ajouter une image'}</span>
                </div>
                <Input
                  id="courseImage"
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="sr-only"
                  onChange={(e) => handleFileChange(e, setCourseImage, ['image/jpeg', 'image/png', 'image/gif'])}
                />
              </Label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PDF du cours</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="coursePDF" className="cursor-pointer">
                <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{coursePDF ? 'Changer le PDF' : 'Ajouter un PDF'}</span>
                </div>
                <Input
                  id="coursePDF"
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(e) => handleFileChange(e, setCoursePDF, ['application/pdf'])}
                />
              </Label>
              {coursePDF && (
                <div className="mt-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  <p className="text-sm text-gray-500">{coursePDF.name}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => setCoursePDF(null)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vidéo du cours</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="courseVideo" className="cursor-pointer">
                <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Video className="mr-2 h-4 w-4" />
                  <span>{courseVideo ? 'Changer la vidéo' : 'Ajouter une vidéo'}</span>
                </div>
                <Input
                  id="courseVideo"
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  onChange={(e) => handleFileChange(e, setCourseVideo, ['video/mp4', 'video/webm', 'video/ogg'])}
                />
              </Label>
              {courseVideo && (
                <div className="mt-2 flex items-center">
                  <Video className="h-4 w-4 mr-2 text-green-500" />
                  <p className="text-sm text-gray-500">{courseVideo.name}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => setCourseVideo(null)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre du cours</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Niveau</Label>
                  <Select value={formData.level} onValueChange={(value) => handleSelectChange('level', value)}>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Sélectionnez le niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7ième Année">7ième Année</SelectItem>
                      <SelectItem value="8ième Année">8ième Année</SelectItem>
                      <SelectItem value="9ième Année">9ième Année</SelectItem>
                      <SelectItem value="10ième Année">10ième Année</SelectItem>
                      <SelectItem value="11ième Année">11ième Année</SelectItem>
                      <SelectItem value="Terminale">Terminale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Matière</Label>
                  <Select value={formData.subject} onValueChange={(value) => handleSelectChange('subject', value)}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Sélectionnez la matière" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                      <SelectItem value="Physique">Physique</SelectItem>
                      <SelectItem value="Chimie">Chimie</SelectItem>
                      <SelectItem value="Biologie">Biologie</SelectItem>
                      <SelectItem value="Histoire">Histoire</SelectItem>
                      <SelectItem value="Géographie">Géographie</SelectItem>
                      <SelectItem value="Français">Français</SelectItem>
                      <SelectItem value="Anglais">Anglais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="price">Prix (en FCFA)</Label>
                <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="duration">Durée (en minutes)</Label>
                <Input id="duration" name="duration" type="number" value={formData.duration} onChange={handleChange} required />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasQuizzes"
                  checked={formData.hasQuizzes}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasQuizzes: checked }))}
                />
                <Label htmlFor="hasQuizzes">Inclure des quiz</Label>
              </div>
              {formData.hasQuizzes && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Questions du quiz</h3>
                  {quizQuestions.map((question, questionIndex) => (
                    <div key={questionIndex} className="space-y-2 border p-4 rounded">
                      <Input
                        placeholder={`Question ${questionIndex + 1}`}
                        value={question.text}
                        onChange={(e) => handleQuizQuestionChange(questionIndex, 'text', e.target.value)}
                      />
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <Input
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option.text}
                            onChange={(e) => {
                              const newOptions = [...question.options];
                              newOptions[optionIndex].text = e.target.value;
                              handleQuizQuestionChange(questionIndex, 'options', newOptions);
                            }}
                          />
                          <Switch
                            checked={option.isCorrect}
                            onCheckedChange={(checked) => {
                              const newOptions = [...question.options];
                              newOptions[optionIndex].isCorrect = checked;
                              handleQuizQuestionChange(questionIndex, 'options', newOptions);
                            }}
                          />
                          <Label>Correct</Label>
                        </div>
                      ))}
                    </div>
                  ))}
                  <Button type="button" onClick={handleAddQuizQuestion}>Ajouter une question</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contenu du cours</CardTitle>
            </CardHeader>
            <CardContent>
              <CourseContentEditor onChange={handleContentChange} initialContent={formData.content} />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Création en cours...' : 'Créer le cours'}
          </Button>
        </form>
      </main>
    </div>
  )
}


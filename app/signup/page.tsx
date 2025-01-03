"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { account, databases, ID, DATABASE_ID, USERS_COLLECTION_ID, MESSAGES_COLLECTION_ID } from '@/lib/appwrite'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phoneNumber: '',
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prevState => ({ ...prevState, [name]: value }))
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }))
    }
  }

  const handleRoleChange = (value: string) => {
    setFormData(prevState => ({ ...prevState, role: value }))
    if (errors.role) {
      setErrors(prevErrors => ({ ...prevErrors, role: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    if (!formData.name.trim()) newErrors.name = "Le nom est requis"
    if (!formData.email.trim()) newErrors.email = "L'email est requis"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email n'est pas valide"
    if (!formData.password) newErrors.password = "Le mot de passe est requis"
    else if (formData.password.length < 6) newErrors.password = "Le mot de passe doit contenir au moins 6 caractères"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    if (!formData.role) newErrors.role = "Le rôle est requis"
    if (!formData.phoneNumber) newErrors.phoneNumber = "Le numéro de téléphone est requis"
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Create user account
      const user = await account.create(
        ID.unique(),
        formData.email,
        formData.password,
        formData.name
      );

      // Create user document in database
      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id,
        {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          phoneNumber: formData.phoneNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );

      // Create welcome message for the user
      const welcomeMessage = `Bienvenue sur Kalandén, ${formData.name} ! Votre compte a été créé avec succès. ${
        formData.role === 'instructor' 
          ? "Vous pouvez maintenant commencer à télécharger vos cours sur la plateforme." 
          : "Vous pouvez maintenant commencer à explorer nos cours."
      }`;

      await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          message: welcomeMessage,
          read: false,
          createdAt: new Date().toISOString(),
        }
      );

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion.",
      });
      router.push('/login');
    } catch (error) {
      console.error('Error during account creation:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite lors de la création du compte. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Inscription</h1>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
          <div>
            <Label htmlFor="role">Rôle</Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Étudiant</SelectItem>
                <SelectItem value="instructor">Instructeur</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>
          <div>
            <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
          </Button>
        </form>
      </main>
    </div>
  )
}


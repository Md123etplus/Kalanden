"use client"

import { useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/use-toast'

export default function SubscriptionPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    experience: '',
  })
const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prevState => ({ ...prevState, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    console.log(formData)
    toast({
      title: "Demande envoyée",
      description: "Nous examinerons votre demande et vous contacterons bientôt.",
    })
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      experience: '',
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Devenir instructeur</h1>
        <p className="text-xl mb-8">Partagez vos connaissances et enseignez sur Kalandén</p>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="subject">Matière à enseigner</Label>
            <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="experience">Expérience d'enseignement</Label>
            <Textarea id="experience" name="experience" value={formData.experience} onChange={handleChange} required />
          </div>
          <Button type="submit">Soumettre la demande</Button>
        </form>
      </main>
    </div>
  )
}


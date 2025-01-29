'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ParentDashboard } from '@/components/ParentDashboard'
import { Header } from '@/components/header'

export default function ParentDashboardPage() {
  const [username, setUsername] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const session = document.cookie.includes('session=')
    const userCookie = document.cookie.split(';').find(c => c.trim().startsWith('user='))

    if (!session || !userCookie) {
      router.push('/login')
    } else {
      const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]))

      if (userData.role !== 'parent') {
        router.push('/dashboard')
      } else {
        setUsername(userData.name) // Assuming "name" holds the parent's username
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Bienvenue, {username || 'Parent'} !</h1>
        <h1 className="text-3xl font-bold mb-4">Tableau de bord Parent</h1>
        <ParentDashboard />
      </main>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StudentDashboard } from '@/components/StudentDashboard'
import { Header } from '@/components/header'

export default function StudentDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const session = document.cookie.includes('session=')
    const userCookie = document.cookie.split(';').find(c => c.trim().startsWith('user='))
    if (!session || !userCookie) {
      router.push('/login')
    } else {
      const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]))
      if (userData.role !== 'student') {
        router.push('/dashboard')
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Tableau de bord étudiant</h1>
        <StudentDashboard />
      </main>
    </div>
  )
}


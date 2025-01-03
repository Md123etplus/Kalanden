'use client'

import React, { useState, useEffect, use } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { databases, DATABASE_ID, COURSES_COLLECTION_ID, ENROLLMENTS_COLLECTION_ID } from '@/lib/appwrite'
import { Query } from 'appwrite'

interface CourseStats {
  title: string;
  enrolledStudents: number;
  averageProgress: number;
  completionRate: number;
  totalRevenue: number;
  instructorRevenue: number;
  platformCommission: number;
}

export default function CourseStatisticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params)
  const [courseStats, setCourseStats] = useState<CourseStats>({
    title: '',
    enrolledStudents: 0,
    averageProgress: 0,
    completionRate: 0,
    totalRevenue: 0,
    instructorRevenue: 0,
    platformCommission: 0
  })

  useEffect(() => {
    const fetchCourseStatistics = async () => {
      try {
        // Fetch course details
        const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION_ID, courseId)

        // Fetch enrollments for this course
        const enrollments = await databases.listDocuments(
          DATABASE_ID,
          ENROLLMENTS_COLLECTION_ID,
          [Query.equal('courseId', courseId)]
        )

        const totalEnrollments = enrollments.documents.length
        const totalProgress = enrollments.documents.reduce((sum, enrollment) => sum + (enrollment.progress || 0), 0)
        const completedEnrollments = enrollments.documents.filter(enrollment => enrollment.progress === 100).length

        // Calculate revenue
        const totalRevenue = totalEnrollments * course.price
        const instructorRevenue = totalRevenue * 0.7 // 70% for instructor
        const platformCommission = totalRevenue * 0.3 // 30% platform fee

        setCourseStats({
          title: course.title,
          enrolledStudents: totalEnrollments,
          averageProgress: totalEnrollments > 0 ? totalProgress / totalEnrollments : 0,
          completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
          totalRevenue,
          instructorRevenue,
          platformCommission
        })
      } catch (error) {
        console.error('Error fetching course statistics:', error)
      }
    }

    fetchCourseStatistics()
  }, [courseId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Statistiques du cours: {courseStats.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Étudiants inscrits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{courseStats.enrolledStudents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Progression moyenne</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{courseStats.averageProgress.toFixed(2)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Taux de complétion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{courseStats.completionRate.toFixed(2)}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenu Total</CardTitle>
              <CardDescription>Pour ce cours</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{formatCurrency(courseStats.totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Votre Revenu</CardTitle>
              <CardDescription>70% des ventes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">{formatCurrency(courseStats.instructorRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Commission Plateforme</CardTitle>
              <CardDescription>30% des ventes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-muted-foreground">{formatCurrency(courseStats.platformCommission)}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


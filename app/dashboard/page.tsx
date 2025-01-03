"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { ParentDashboard } from '@/components/ParentDashboard'
import { InstructorDashboard } from '@/components/InstructorDashboard'
import { StudentDashboard } from '@/components/StudentDashboard'
import { useToast } from '@/components/use-toast'
import { account } from '@/lib/appwrite'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await account.get();
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser({ ...currentUser, ...parsedUser });
        } else {
          throw new Error("User data not found in local storage");
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous connecter pour accéder à cette page.",
          variant: "destructive",
        });
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, toast]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return null;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'parent':
        return <ParentDashboard />;
      case 'instructor':
        return <InstructorDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return <div>Rôle non reconnu. Veuillez contacter l'administrateur.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Tableau de bord de {user.name}</h1>
        {renderDashboard()}
      </main>
    </div>
  );
}


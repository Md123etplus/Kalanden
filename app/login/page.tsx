"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { account, databases, DATABASE_ID, USERS_COLLECTION_ID, User } from '@/lib/appwrite';
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/use-toast'
import { Models } from 'appwrite';
import { Query } from 'appwrite';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await account.getSession('current');
        if (session) {
          router.push('/dashboard');
        }
      } catch (error) {
        // No active session, continue with login page
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
    
      const userDetails = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('email', email)]
      );

      if (userDetails.documents.length > 0) {
        const userData = userDetails.documents[0] as unknown as User;
        const fullUserData = { ...user, ...userData };
        document.cookie = `session=${user.$id}; path=/; max-age=86400; secure; samesite=strict`;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(fullUserData))}; path=/; max-age=86400; secure; samesite=strict`;
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Kalandén!",
        });
      
        // Redirect based on user role
        switch (userData.role) {
          case 'student':
            router.push('/dashboard/student');
            break;
          case 'instructor':
            router.push('/dashboard/instructor');
            break;
          case 'parent':
            router.push('/dashboard/parent');
            break;
          default:
            router.push('/dashboard');
        }
      } else {
        throw new Error("User details not found in the database");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Une erreur s'est produite lors de la connexion.",
        variant: "destructive",
      });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Erreur de connexion",
        description: "Veuillez saisir votre email et votre mot de passe.",
        variant: "destructive",
      });
      return;
    }
    login(email, password);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Connexion</h1>
        <form onSubmit={handleLogin} className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit">
            Connexion
          </Button>
        </form>
        <p className="mt-4">
          Vous n'avez pas encore de compte ?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Inscrivez-vous ici
          </Link>
        </p>
      </main>
    </div>
  );
}


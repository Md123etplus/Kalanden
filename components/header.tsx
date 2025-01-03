'use client'
import { useState, useEffect } from 'react'
import { Menu, X, Search } from 'lucide-react'
import { Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useRouter } from 'next/navigation'
import { account } from '@/lib/appwrite'
import { useToast } from '@/components/use-toast'

export function Header() {
  const { theme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkSession = () => {
      const session = document.cookie.includes('session=')
      const userCookie = document.cookie.split(';').find(c => c.trim().startsWith('user='))
      setIsLoggedIn(session);
      if (session && userCookie) {
        const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]))
        setUserRole(userData.role);
      }
    };

    checkSession();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/courses?search=${encodeURIComponent(searchQuery)}`)
  }

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      setIsLoggedIn(false);
      setUserRole(null);
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  const handleTeachCourses = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (userRole === 'instructor') {
      router.push('/courses/create');
    } else {
      router.push('/subscription');
    }
  };

  const handleDashboardClick = () => {
    const userCookie = document.cookie.split(';').find(c => c.trim().startsWith('user='))
    if (userCookie) {
      const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]))
      switch (userData.role) {
        case 'student':
          router.push('/dashboard/student')
          break
        case 'instructor':
          router.push('/dashboard/instructor')
          break
        case 'parent':
          router.push('/dashboard/parent')
          break
        default:
          router.push('/dashboard')
      }
    } else {
      router.push('/login')
    }
  }

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex justify-between w-full md:w-auto">
            <Link href="/" className="text-2xl font-bold text-primary">Kalandén</Link>
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          <form onSubmit={handleSearch} className="flex w-full md:w-auto mt-4 md:mt-0">
            <Input
              type="search"
              placeholder="Rechercher des cours..."
              className="w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="ml-2">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-auto mt-4 md:mt-0`}>
            <ul className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center">
              <li><Link href="/courses" className="text-foreground hover:text-primary">Cours</Link></li>
              <li><a href="/subscription" onClick={handleTeachCourses} className="text-foreground hover:text-primary">Donner des cours</a></li>
              {isLoggedIn ? (
                <>
                  <li><Button onClick={handleDashboardClick}>Tableau de bord</Button></li>
                  <li><Button onClick={handleLogout}>Déconnexion</Button></li>
                </>
              ) : (
                <>
                  <li><Link href="/login" className="text-foreground hover:text-primary">Connexion</Link></li>
                  <li><Link href="/signup" className="text-foreground hover:text-primary">Inscription</Link></li>
                </>
              )}
              <li>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle theme"
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}


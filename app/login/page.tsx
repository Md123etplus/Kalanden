"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { account, databases, DATABASE_ID, USERS_COLLECTION_ID, type User, generateShortId } from "@/lib/appwrite"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/use-toast"
import { Models } from "appwrite"
import { Query } from "appwrite"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loginError, setLoginError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await account.getSession("current")
        if (session) {
          router.push("/dashboard")
        }
      } catch (error) {
        // No active session, continue with login page
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [router])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!email.trim()) newErrors.email = "L'email est requis"
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "L'email n'est pas valide"
    if (!password) newErrors.password = "Le mot de passe est requis"
    else if (password.length < 6) newErrors.password = "Le mot de passe doit contenir au moins 6 caractères"
    return newErrors
  }

  const login = async (email: string, password: string) => {
    try {
      setLoginError(null) // Clear any previous error
      await account.createEmailPasswordSession(email, password)
      const user = await account.get() // Get Appwrite user details
  
      // Generate the same short ID used during signup
      const shortId = generateShortId(user.$id)
      console.log("Short ID from login:", shortId)
  
      // Fetch user document using shortId
      const userData = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, shortId)
  
      document.cookie = `session=${user.$id}; path=/; max-age=86400; secure; samesite=strict`
      document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400; secure; samesite=strict`
  
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Kalandén!",
      })
  
      // Redirect based on user role
      console.log("User Data" , userData)
      switch (userData.role) {
        case "student":
          router.push("/dashboard/student")
          break
        case "instructor":
          router.push("/dashboard/instructor")
          break
        case "parent":
          router.push("/dashboard/parent")
          break
        default:
          router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("Identifiants invalides. Veuillez vérifier l'email et le mot de passe.")
      setIsSubmitting(false)
    }
  }
  
  

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setIsSubmitting(true)
    await login(email, password)
    setIsSubmitting(false)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {loginError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{loginError}</span>
          </div>
        )}
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
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Connexion en cours..." : "Connexion"}
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
  )
}


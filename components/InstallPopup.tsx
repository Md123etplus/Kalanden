"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "./ui/button"

export function InstallPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300 && !isDismissed) {
        setIsVisible(true)
      }
    }

    const timer = setTimeout(() => {
      window.addEventListener("scroll", handleScroll)
    }, 5000)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isDismissed])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setDeferredPrompt(null)
      }
    } else {
      // Fallback for devices that don't support the install prompt
      alert("Pour installer l'application, ajoutez cette page à votre écran d'accueil.")
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-background border rounded-lg shadow-lg max-w-sm">
      <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleDismiss}>
        <X className="h-4 w-4" />
      </Button>
      <h3 className="text-lg font-semibold mb-2">Installez Kalandén</h3>
      <p className="mb-4">Profitez de notre application pour une meilleure expérience !</p>
      <Button onClick={handleInstall} className="w-full">
        Installer l'application
      </Button>
    </div>
  )
}


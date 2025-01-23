"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "./ui/button"

export function InstallPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
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
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setIsInstallable(false)
    }
    setDeferredPrompt(null)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-background border rounded-lg shadow-lg max-w-sm">
      <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleDismiss}>
        <X className="h-4 w-4" />
      </Button>
      <h3 className="text-lg font-semibold mb-2">Installez Kalandén</h3>
      <p className="mb-4">Profitez de notre application pour une meilleure expérience !</p>
      {isInstallable && (
        <Button onClick={handleInstall} className="w-full">
          Installer l'application
        </Button>
      )}
    </div>
  )
}


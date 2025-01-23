"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"

const isDesktop = () => {
  return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function InstallPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstructions, setShowInstructions] = useState(false)

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
    } else if (isDesktop()) {
      alert(
        "Pour installer l'application sur votre ordinateur, utilisez le bouton d'installation dans la barre d'adresse de votre navigateur.",
      )
    } else {
      setShowInstructions(true)
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

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comment installer Kalandén</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isDesktop() ? (
              <p>
                Pour installer l'application sur votre ordinateur, utilisez le bouton d'installation dans la barre
                d'adresse de votre navigateur.
              </p>
            ) : (
              <>
                <h4 className="font-semibold mb-2">Sur Android :</h4>
                <ol className="list-decimal list-inside mb-4">
                  <li>Appuyez sur les trois points en haut à droite de votre navigateur</li>
                  <li>Sélectionnez "Ajouter à l'écran d'accueil"</li>
                  <li>Confirmez l'ajout</li>
                </ol>
                <h4 className="font-semibold mb-2">Sur iOS :</h4>
                <ol className="list-decimal list-inside">
                  <li>Appuyez sur l'icône de partage en bas de votre navigateur</li>
                  <li>Faites défiler et sélectionnez "Sur l'écran d'accueil"</li>
                  <li>Appuyez sur "Ajouter" en haut à droite</li>
                </ol>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


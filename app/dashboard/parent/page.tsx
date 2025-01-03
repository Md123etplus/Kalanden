import { ParentDashboard } from '@/components/ParentDashboard'
import { Header } from '@/components/header'

export default function ParentDashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Tableau de bord parent</h1>
        <ParentDashboard />
      </main>
    </div>
  )
}


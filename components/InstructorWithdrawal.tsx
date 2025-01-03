import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/components/use-toast'
import { databases, DATABASE_ID, TRANSACTIONS_COLLECTION_ID } from '@/lib/appwrite'
import { Query } from 'appwrite'

interface InstructorWithdrawalProps {
  instructorId: string
}

export function InstructorWithdrawal({ instructorId }: InstructorWithdrawalProps) {
  const [paymentMethod, setPaymentMethod] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const { toast } = useToast()

  const handleWithdrawal = async () => {
    if (!paymentMethod || !phoneNumber) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une méthode de paiement et entrer un numéro de téléphone.",
        variant: "destructive",
      })
      return
    }

    setIsWithdrawing(true)

    try {
      // Fetch all completed transactions for this instructor
      const transactions = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        [
          Query.equal('instructorId', instructorId),
          Query.equal('status', 'completed'),
          Query.equal('withdrawn', false) // Add this field to your transactions to track withdrawals
        ]
      )

      // Calculate total amount to withdraw
      const totalAmount = transactions.documents.reduce((sum, transaction) => sum + transaction.instructorRevenue, 0)

      if (totalAmount <= 0) {
        toast({
          title: "Aucun montant à retirer",
          description: "Vous n'avez pas de fonds disponibles pour le retrait.",
          variant: "destructive",
        })
        setIsWithdrawing(false)
        return
      }

      // Create a withdrawal transaction
      await databases.createDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        'unique()',
        {
          instructorId,
          amount: totalAmount,
          paymentMethod,
          phoneNumber,
          status: 'pending',
          type: 'withdrawal',
          createdAt: new Date().toISOString(),
        }
      )

      // Mark all fetched transactions as withdrawn
      await Promise.all(transactions.documents.map(transaction =>
        databases.updateDocument(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          transaction.$id,
          { withdrawn: true }
        )
      ))

      toast({
        title: "Demande de retrait envoyée",
        description: `Votre demande de retrait de ${totalAmount} FCFA a été envoyée avec succès.`,
      })
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du traitement de votre demande de retrait. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Retirer vos gains</h2>
      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="orange-money" id="orange-money" />
          <Label htmlFor="orange-money">Orange Money</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="mobicash" id="mobicash" />
          <Label htmlFor="mobicash">Mobicash</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sama-money" id="sama-money" />
          <Label htmlFor="sama-money">SamaMoney</Label>
        </div>
      </RadioGroup>
      <div>
        <Label htmlFor="phone-number">Numéro de téléphone</Label>
        <Input
          id="phone-number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Ex: 70123456"
        />
      </div>
      <Button onClick={handleWithdrawal} disabled={isWithdrawing}>
        {isWithdrawing ? 'Traitement en cours...' : 'Retirer mes gains'}
      </Button>
    </div>
  )
}


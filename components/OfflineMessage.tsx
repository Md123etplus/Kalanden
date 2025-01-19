import React from 'react';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OfflineMessage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50">
      <WifiOff className="w-16 h-16 text-yellow-500 mb-4" />
      <h2 className="text-2xl font-bold text-yellow-700 mb-2">Vous êtes hors ligne</h2>
      <p className="text-yellow-600 mb-4">Vérifiez votre connexion internet et réessayez.</p>
      <Button onClick={() => window.location.reload()} className="bg-yellow-500 hover:bg-yellow-600 text-white">
        Réessayer
      </Button>
    </div>
  );
};

export default OfflineMessage;


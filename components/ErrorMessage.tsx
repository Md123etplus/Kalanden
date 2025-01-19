import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-red-700 mb-2">Oups! Une erreur s'est produite</h2>
      <p className="text-red-600 mb-4">{message}</p>
      <Button onClick={() => window.location.reload()} className="bg-red-500 hover:bg-red-600 text-white">
        Réessayer
      </Button>
    </div>
  );
};

export default ErrorMessage;


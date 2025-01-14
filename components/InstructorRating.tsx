import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';
import Image from 'next/image';

interface Instructor {
  $id: string;
  name: string;
  profileImageId?: string;
  bio?: string;
}

interface InstructorRatingProps {
  instructor: Instructor;
  ratings: number;
  onRate: () => void;
}

export function InstructorRating({ instructor, ratings, onRate }: InstructorRatingProps) {
  return (
    <div className="flex flex-col items-start space-y-4">
      <div className="flex items-center space-x-4">
        {instructor.profileImageId && (
          <Image
            src={`/api/images/${instructor.profileImageId}`}
            alt={instructor.name}
            width={64}
            height={64}
            className="rounded-full"
          />
        )}
        <div>
          <h3 className="text-lg font-semibold">{instructor.name}</h3>
          {instructor.bio && <p className="text-sm text-gray-600">{instructor.bio}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <p className="text-sm text-gray-600">Évaluations : {ratings}</p>
        <Button onClick={onRate} variant="outline" className="flex items-center">
          <ThumbsUp className="mr-2 h-4 w-4" />
          Évaluer cet instructeur
        </Button>
      </div>
    </div>
  );
}


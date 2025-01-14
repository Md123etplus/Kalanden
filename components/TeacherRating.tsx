import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';

interface Teacher {
  $id: string;
  name: string;
  likes: number;
}

interface TeacherRatingProps {
  teacher: Teacher;
  onLike: () => void;
}

export function TeacherRating({ teacher, onLike }: TeacherRatingProps) {
  return (
    <div className="flex items-center space-x-4">
      <p className="text-lg font-semibold">{teacher.name}</p>
      <Button onClick={onLike} variant="outline" className="flex items-center">
        <ThumbsUp className="mr-2 h-4 w-4" />
        J'aime ({teacher.likes})
      </Button>
    </div>
  );
}


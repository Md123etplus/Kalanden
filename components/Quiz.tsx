import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  text: string;
  options: QuizOption[];
}

interface QuizProps {
  quizzes: QuizQuestion[] | undefined;
}

export function Quiz({ quizzes }: QuizProps) {
  if (!quizzes || quizzes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pas de quiz disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aucun quiz n'est disponible pour ce cours.</p>
        </CardContent>
      </Card>
    );
  }

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = quizzes[currentQuestionIndex];

  // Check if current question exists and has options
  if (!currentQuestion || !currentQuestion.options) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erreur de question</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cette question n'a pas d'options valides.</p>
        </CardContent>
      </Card>
    );
  }

  const handleAnswerChange = (index: number) => {
    setSelectedAnswers((prevSelectedAnswers) => {
      if (prevSelectedAnswers.includes(index)) {
        return prevSelectedAnswers.filter((answer) => answer !== index);
      } else {
        return [...prevSelectedAnswers, index];
      }
    });
  };

  const handleSubmit = () => {
    if (selectedAnswers.length === 0) return;

    setIsSubmitted(true);

    // Check if selected answers are correct
    const correctAnswers = currentQuestion.options
      .filter((option) => option.isCorrect)
      .map((option) => currentQuestion.options.indexOf(option));

    const isCorrect = selectedAnswers.every((selected) =>
      correctAnswers.includes(selected)
    );

    if (isCorrect && selectedAnswers.length === correctAnswers.length) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedAnswers([]);
    setIsSubmitted(false);
  };

  if (currentQuestionIndex >= quizzes.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz terminé</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Votre score : {score} / {quizzes.length}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{currentQuestion.text}</p>
        <div>
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`option-${index}`}
                checked={selectedAnswers.includes(index)}
                onChange={() => handleAnswerChange(index)}
              />
              <Label htmlFor={`option-${index}`}>{option.text}</Label>
            </div>
          ))}
        </div>

        {!isSubmitted ? (
          <Button onClick={handleSubmit} className="mt-4">Soumettre</Button>
        ) : (
          <div className="mt-4">
            <p className={selectedAnswers.every((answer) =>
              currentQuestion.options[answer]?.isCorrect) ? "text-green-500" : "text-red-500"}>
              {selectedAnswers.every((answer) =>
                currentQuestion.options[answer]?.isCorrect) ? "Correct !" : "Incorrect."}
            </p>
            <p>La bonne réponse est : {currentQuestion.options.filter(option => option.isCorrect).map(option => option.text).join(", ")}</p>
            {currentQuestionIndex < quizzes.length - 1 && (
              <Button onClick={handleNext} className="mt-2">Question suivante</Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

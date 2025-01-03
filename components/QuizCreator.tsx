import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash } from 'lucide-react'

interface Question {
  text: string
  options: { text: string; isCorrect: boolean }[]
}

interface QuizCreatorProps {
  questions: Question[]
  onChange: (questions: Question[]) => void
}

export function QuizCreator({ questions, onChange }: QuizCreatorProps) {
  const addQuestion = () => {
    onChange([...questions, { text: '', options: [{ text: '', isCorrect: false }] }])
  }

  const updateQuestion = (index: number, text: string) => {
    const newQuestions = [...questions]
    newQuestions[index].text = text
    onChange(newQuestions)
  }

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options.push({ text: '', isCorrect: false })
    onChange(newQuestions)
  }

  const updateOption = (questionIndex: number, optionIndex: number, text: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex].text = text
    onChange(newQuestions)
  }

  const toggleCorrectOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex].isCorrect = !newQuestions[questionIndex].options[optionIndex].isCorrect
    onChange(newQuestions)
  }

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index)
    onChange(newQuestions)
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex)
    onChange(newQuestions)
  }

  return (
    <div className="space-y-4">
      {questions.map((question, questionIndex) => (
        <div key={questionIndex} className="border rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`question-${questionIndex}`}>Question {questionIndex + 1}</Label>
            <Button variant="ghost" size="sm" onClick={() => removeQuestion(questionIndex)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          <Input
            id={`question-${questionIndex}`}
            value={question.text}
            onChange={(e) => updateQuestion(questionIndex, e.target.value)}
            placeholder="Enter your question"
          />
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center space-x-2">
              <Checkbox
                id={`question-${questionIndex}-option-${optionIndex}`}
                checked={option.isCorrect}
                onCheckedChange={() => toggleCorrectOption(questionIndex, optionIndex)}
              />
              <Input
                value={option.text}
                onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                placeholder="Enter option"
                className="flex-grow"
              />
              <Button variant="ghost" size="sm" onClick={() => removeOption(questionIndex, optionIndex)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addOption(questionIndex)}>
            <Plus className="h-4 w-4 mr-2" /> Add Option
          </Button>
        </div>
      ))}
      <Button onClick={addQuestion}>
        <Plus className="h-4 w-4 mr-2" /> Add Question
      </Button>
    </div>
  )
}


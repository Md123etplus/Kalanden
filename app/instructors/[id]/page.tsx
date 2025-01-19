"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import Link from 'next/link'
import { databases, DATABASE_ID, USERS_COLLECTION_ID, COURSES_COLLECTION_ID, INSTRUCTOR_RATINGS_COLLECTION_ID } from '@/lib/appwrite'
import { Query } from 'appwrite'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Instructor {
  $id: string;
  name: string;
  location: string;
  profileImageId?: string;
  bio?: string;
  coursesCreated: number;
  likes: number;
  email: string;
  phoneNumber: string;
}
const InstructorPage = () => {
  return (
    <div>
      <h1>Hello</h1>
    </div>
  )
}

export default InstructorPage
"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { databases, DATABASE_ID, INSTRUCTOR_RATINGS_COLLECTION_ID, USERS_COLLECTION_ID, COURSES_COLLECTION_ID } from '@/lib/appwrite'
import { Query } from 'appwrite'

interface Instructor {
  $id: string;
  name: string;
  location: string;
  profileImageId?: string;
  likes: number;
  coursesCreated: number;
}

const PopularInstructorsSection = () => {
  const [popularInstructors, setPopularInstructors] = useState<Instructor[]>([]);

  // Function to fetch likes for an instructor
  const fetchLikesForInstructor = async (instructorId: string) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        INSTRUCTOR_RATINGS_COLLECTION_ID,
        [Query.equal('instructorId', instructorId)]
      );
      return response.documents.length; // This will give the number of likes for the instructor
    } catch (error) {
      console.error("Error fetching likes:", error);
      return 0;
    }
  };

  // Function to fetch the number of courses created by an instructor
  const fetchCoursesCountForInstructor = async (instructorId: string) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        [Query.equal('createdBy', instructorId)] // Using 'createdBy' to match the instructor's userId
      );
      return response.documents.length; // This will give the number of courses created by the instructor
    } catch (error) {
      console.error("Error fetching courses:", error);
      return 0;
    }
  };

  // Fetch popular instructors and their likes and course counts
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const instructorsResponse = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [Query.equal('role', 'instructor')]);
        const instructorsWithDetails = await Promise.all(
          instructorsResponse.documents.map(async (instructor: any) => {
            const likes = await fetchLikesForInstructor(instructor.$id);
            const coursesCreated = await fetchCoursesCountForInstructor(instructor.$id);
            return {
              $id: instructor.$id,
              name: instructor.name,
              location: instructor.location,
              profileImageId: instructor.profileImageId,
              likes,
              coursesCreated,
            };
          })
        );

        // Sort by likes in descending order and slice the top 3
        const topInstructors = instructorsWithDetails
          .sort((a, b) => b.likes - a.likes)
          .slice(0, 3);

        setPopularInstructors(topInstructors);
      } catch (error) {
        console.error("Error fetching instructors:", error);
      }
    };

    fetchInstructors();
  }, []);

  return (
    <section className="mb-16 py-8">
      <h2 className="text-3xl font-bold mb-8 text-center">Enseignants populaires</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {popularInstructors.map((instructor) => (
          <div key={instructor.$id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center">
            <Image
              src={instructor.profileImageId ? `/api/images/${instructor.profileImageId}` : '/placeholder.svg?height=100&width=100'}
              alt={instructor.name}
              width={100}
              height={100}
              className="w-24 h-24 object-cover rounded-full mb-4"
            />
            <h3 className="text-xl font-bold mb-2">{instructor.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{instructor.location}</p>
            <p className="text-sm text-gray-600 mb-4">Cours créés: {instructor.coursesCreated}</p>
            <p className="text-lg font-semibold mb-4">
              <span className="text-yellow-500">★</span> {instructor.likes} J'aime
            </p>
            <div className="flex space-x-4">
              <Button variant="link" asChild>
                <Link href={`/instructors/${instructor.$id}`}>Voir le profil</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* Button to view more instructors */}
      <div className="text-center mt-8">
        <Button variant="outline">
          <Link href="/instructors">Voir plus d'enseignants</Link>
        </Button>
      </div>
    </section>
  );
}

export default PopularInstructorsSection;

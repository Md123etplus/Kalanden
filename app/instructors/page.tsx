'use client'
import { useEffect, useState } from 'react';
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';

export interface User {
  $id: string;
  name: string;
  email: string;
  location: string;
  role: string;
  profileImage?: string;
  specialization?: string[];
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<User[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<User[]>([]);
  const [locationFilter, setLocationFilter] = useState<string>('');

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.equal('role', 'instructor'), Query.limit(100)] // Filter users by 'role' as 'instructor'
        );
        setInstructors(response.documents as unknown as User[]);
      } catch (error) {
        console.error('Error fetching instructors:', error);
      }
    };

    fetchInstructors();
  }, []);

  useEffect(() => {
    setFilteredInstructors(
      locationFilter
        ? instructors.filter(instructor =>
            instructor.location.toLowerCase().includes(locationFilter.toLowerCase())
          )
        : instructors
    );
  }, [locationFilter, instructors]);

  return (
    <div className="instructors-page">
      <h1>Instructors</h1>
      <div className="filter-container">
        <label htmlFor="location-filter">Filter by Location:</label>
        <input
          type="text"
          id="location-filter"
          value={locationFilter}
          onChange={e => setLocationFilter(e.target.value)}
          placeholder="Enter a location"
          className="filter-input"
        />
      </div>
      <div className="instructors-list">
        {filteredInstructors.length > 0 ? (
          filteredInstructors.map(instructor => (
            <div key={instructor.$id} className="instructor-card">
              <img
                src={instructor.profileImage || '/placeholder.svg'}
                alt={`${instructor.name}'s profile`}
                className="profile-image"
              />
              <h3>{instructor.name}</h3>
              <p><strong>Email:</strong> {instructor.email}</p>
              <p><strong>Location:</strong> {instructor.location}</p>
              {instructor.specialization && (
                <p>
                  <strong>Specialization:</strong> {instructor.specialization.join(', ')}
                </p>
              )}
            </div>
          ))
        ) : (
          <p>No instructors found for the selected location.</p>
        )}
      </div>
    </div>
  );
}

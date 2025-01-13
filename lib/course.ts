import { databases, DATABASE_ID, COURSES_COLLECTION_ID } from './appwrite';
import { ID } from 'appwrite';

export interface Course {
    enrolledStudents: number;
    averageRating: any;
    $id: string;
    title: string;
    description: string;
    level: string;
    subject: string;
    price: number;
    content: string;
    imageFileId?: string;
    pdfFileId?: string;
    videoFileId?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export async function createCourse(courseData: Omit<Course, '$id' | 'createdAt' | 'updatedAt'>): Promise<Course> {
    const course = await databases.createDocument(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        ID.unique(),
        {
            ...courseData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    );
    return course as unknown as Course;
}

export async function getCourseById(courseId: string): Promise<Course | null> {
    try {
        const course = await databases.getDocument(
            DATABASE_ID,
            COURSES_COLLECTION_ID,
            courseId
        );
        return course as unknown as Course;
    } catch (error) {
        console.error('Error fetching course:', error);
        return null;
    }
}

export async function updateCourse(courseId: string, updates: Partial<Course>): Promise<Course> {
    const updatedCourse = await databases.updateDocument(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        courseId,
        {
            ...updates,
            updatedAt: new Date().toISOString(),
        }
    );
    return updatedCourse as unknown as Course;
}

export async function deleteCourse(courseId: string): Promise<void> {
    await databases.deleteDocument(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        courseId
    );
}


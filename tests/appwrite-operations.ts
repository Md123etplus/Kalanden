import { createUser } from '../lib/user';
import { createCourse } from '../lib/course';
import { createMessage } from '../lib/message';

async function testAppwriteOperations() {
    try {
        // Create a user
        const user = await createUser(
            'John Doe',
            'john@example.com',
            'student',
            '+22370123456',
            undefined,
            'A passionate learner'
        );
        console.log('User created:', user);

        // Create a course
        const course = await createCourse({
            title: 'Introduction to Mathematics',
            description: 'A comprehensive course on basic mathematics',
            level: '7ième Année',
            subject: 'Mathématiques',
            price: 0,
            content: 'This course covers basic arithmetic, algebra, and geometry...',
            createdBy: user.$id
        });
        console.log('Course created:', course);

        // Create a message
        const message = await createMessage({
            courseId: course.$id,
            userId: user.$id,
            content: 'Hello, I have a question about the first lesson.'
        });
        console.log('Message created:', message);

    } catch (error) {
        console.error('Error during Appwrite operations:', error);
    }
}

testAppwriteOperations();


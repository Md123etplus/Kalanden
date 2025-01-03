import { useState, useEffect } from 'react';
import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CourseDiscussion({ courseId }: { courseId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await databases.listDocuments(
        'YOUR_DATABASE_ID',
        'YOUR_MESSAGES_COLLECTION_ID',
        [
          databases.equal('courseId', courseId)
        ]
      );
      setMessages(response.documents);
    };

    fetchMessages();
  }, [courseId]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const message = {
        courseId,
        content: newMessage,
        userId: 'CURRENT_USER_ID', // Replace with actual user ID
        createdAt: new Date().toISOString(),
      };

      await databases.createDocument(
        'YOUR_DATABASE_ID',
        'YOUR_MESSAGES_COLLECTION_ID',
        ID.unique(),
        message
      );

      setNewMessage('');
      // Optionally, you can fetch messages again or add the new message to the state
    }
  };

  return (
    <div>
      <h2>Discussion</h2>
      <div className="space-y-4 mb-4">
        {messages.map((message) => (
          <div key={message.$id} className="bg-gray-100 p-2 rounded">
            <p>{message.content}</p>
            <small>{new Date(message.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  );
}


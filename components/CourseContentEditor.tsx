"use client"

import { useState, useEffect } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bold, Italic, List, ListOrdered, ImageIcon, Video } from 'lucide-react'

interface CourseContentEditorProps {
  onChange: (content: string) => void
  initialContent?: string
}

export function CourseContentEditor({ onChange, initialContent = '' }: CourseContentEditorProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Youtube.configure({
        controls: false,
      })
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent)
    }
  }, [editor, initialContent])

  const addImage = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
    }
  }

  const addVideo = () => {
    if (videoUrl && editor) {
      editor.chain().focus().setYoutubeVideo({ src: videoUrl }).run()
      setVideoUrl('')
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="URL de l'image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-40 md:w-60"
          />
          <Button variant="outline" size="icon" onClick={addImage}>
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="URL de la vidéo YouTube"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-40 md:w-60"
          />
          <Button variant="outline" size="icon" onClick={addVideo}>
            <Video className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <EditorContent editor={editor} className="prose dark:prose-invert max-w-none" />
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
      </BubbleMenu>
    </div>
  )
}


"use client"

import { useState, useEffect } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { Button } from '@/components/ui/button'
import { Level } from '@tiptap/extension-heading'
import { Input } from '@/components/ui/input'
import { Bold, Italic, List, ListOrdered, ImageIcon, Video} from 'lucide-react'
import React from 'react'

import { Heading1, Heading2, Heading3, Heading4 } from 'lucide-react'; // Ensure these are React components or icons

const HeadingIcons = {
  1: Heading1,
  2: Heading2,
  3: Heading3,
  4: Heading4,
};

interface CourseContentEditorProps {
  onChange: (content: string) => void
  initialContent?: string
}

export function CourseContentEditor({ onChange, initialContent = '' }: CourseContentEditorProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        heading: {
          levels: [1, 2, 3, 4]
        }
      }),
      Image,
      Youtube.configure({
        controls: false,
      })
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
      },
      handleDOMEvents: {
        keydown: (view, event) => {
          // Let all key events pass through normally
          return false
        }
      }
    },
  })

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent)
    }
  }, [editor, initialContent])

  const addImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
    }
  }

  const addVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    if (videoUrl && editor) {
      editor.chain().focus().setYoutubeVideo({ src: videoUrl }).run()
      setVideoUrl('')
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-lg">
      <div className="mb-4 flex flex-wrap gap-2 p-2 border-b">
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={editor.isActive('heading', { level: 4 }) ? 'bg-muted' : ''}
          >
            <Heading4 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${editor.isActive('bulletList') ? 'bg-muted' : ''} border border-input`}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${editor.isActive('orderedList') ? 'bg-muted' : ''} border border-input`}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="URL de l'image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-40 md:w-60"
          />
          <Button type="button" variant="outline" size="icon" onClick={addImage}>
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
          <Button type="button" variant="outline" size="icon" onClick={addVideo}>
            <Video className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <EditorContent editor={editor} className="prose dark:prose-invert max-w-none" />
      <style jsx global>{`
        .ProseMirror h1 {
          font-size: 2.25rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }
        .ProseMirror h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 0.875rem;
        }
        .ProseMirror h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        .ProseMirror h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.625rem;
        }
        .ProseMirror p {
          margin-bottom: 1rem;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .ProseMirror li {
          margin-bottom: 0.5rem;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
        }
      `}</style>
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="flex items-center gap-1 bg-background border rounded-md shadow-sm p-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          {([1, 2, 3, 4] as Level[]).map((level) => {
            const Icon = HeadingIcons[level as keyof typeof HeadingIcons];
            return (
              <Button
                key={level}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                className={editor.isActive('heading', { level }) ? 'bg-muted' : ''}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}

        </div>
      </BubbleMenu>
    </div>
  )
}


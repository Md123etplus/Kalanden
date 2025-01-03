import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Button } from '@/components/ui/button'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  toolbarIcons: Array<{ icon: React.ReactNode; action: string }>
}

export function RichTextEditor({ content, onChange, toolbarIcons }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
        break
      case 'bullet_list':
        editor.chain().focus().toggleBulletList().run()
        break
      case 'ordered_list':
        editor.chain().focus().toggleOrderedList().run()
        break
      default:
        break
    }
  }

  return (
    <div className="border rounded-md p-2">
      <div className="flex gap-2 mb-2">
        {toolbarIcons.map((icon, index) => (
          <Button
            key={index}
            size="sm"
            variant="outline"
            onClick={() => handleToolbarAction(icon.action)}
            className={editor.isActive(icon.action) ? 'bg-muted' : ''}
          >
            {icon.icon}
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} className="prose dark:prose-invert max-w-none" />
    </div>
  )
}


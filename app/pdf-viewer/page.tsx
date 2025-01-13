'use client'

import { useSearchParams } from 'next/navigation'

export default function PDFViewer() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url')

  if (!url) {
    return <div>No PDF URL provided</div>
  }

  return (
    <div className="w-full h-screen">
      <iframe
        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`}
        className="w-full h-full border-none"
      />
    </div>
  )
}


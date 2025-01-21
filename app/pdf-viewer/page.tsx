'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function PDFViewerContent() {
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

export default function PDFViewer() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <PDFViewerContent />
    </Suspense>
  )
}

// src/pages/GenerateQRPage.jsx
//
// Generates a QR code that opens the Add Member page directly. Scanning it
// (on a phone or tablet at the front desk) jumps straight past Dashboard →
// Members → + , saving a few taps for busy walk-in registration.
//
// NOTE ON SCOPE: this QR still opens the normal, already-authenticated Add
// Member page — whoever scans it needs to already be signed in as you (the
// gym owner) on that device. A QR that lets a stranger self-register
// without logging in at all is a different, bigger feature: it needs a
// public (unauthenticated) write path added to Firestore, which is a real
// security decision rather than something to add quietly. Ask if you want
// to go that route and we'll design it properly.

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download, Printer } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'

export default function GenerateQRPage() {
  const canvasRef = useRef(null)
  const [dataUrl, setDataUrl] = useState(null)
  const targetUrl = `${window.location.origin}/members/new`

  useEffect(() => {
    QRCode.toCanvas(canvasRef.current, targetUrl, { width: 260, margin: 2 }, () => {})
    QRCode.toDataURL(targetUrl, { width: 800, margin: 2 }).then(setDataUrl)
  }, [targetUrl])

  function handleDownload() {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'add-member-qr.png'
    a.click()
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div>
      <TopBar title="Generate QR Code" showBack />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4">
          <canvas ref={canvasRef} />
          <p className="text-xs text-gray-400 text-center break-all">{targetUrl}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 bg-accent text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5"
          >
            <Download size={16} /> Download
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5"
          >
            <Printer size={16} /> Print
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Scanning this on a phone or tablet that's already signed in to your account jumps straight to the Add
          Member form. Print it and stick it at the front desk for quick walk-in registration.
        </p>
      </div>
    </div>
  )
}

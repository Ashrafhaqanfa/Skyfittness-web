// src/services/receipts.js
//
// Ports Services/ReceiptService.swift — generates a one-page PDF receipt for
// a single payment, right after it's recorded. Separate from reports.js,
// which generates multi-payment balance sheets (monthly/daily) rather than
// a per-transaction receipt.

import jsPDF from 'jspdf'

export function generateReceiptPDF(gymName, member, payment, dueBefore, dueAfter) {
  // Roughly a large receipt/half-letter size, same proportions as the iOS version.
  const pageWidth = 105 // mm — jsPDF defaults to mm; using a narrow receipt-style page
  const pageHeight = 140
  const doc = new jsPDF({ unit: 'mm', format: [pageWidth, pageHeight] })

  const receiptNumber = String(payment.id || crypto.randomUUID()).slice(0, 8).toUpperCase()
  let y = 12

  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text(gymName, 8, y)
  y += 7

  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(100)
  doc.text('Payment Receipt', 8, y)
  y += 6

  doc.setDrawColor(200)
  doc.line(8, y, pageWidth - 8, y)
  y += 6

  function row(label, value) {
    doc.setTextColor(100)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    doc.text(label, 8, y)
    doc.setTextColor(0)
    doc.setFont(undefined, 'bold')
    const valueWidth = doc.getTextWidth(value)
    doc.text(value, pageWidth - 8 - valueWidth, y)
    y += 6
  }

  row('Receipt No.', receiptNumber)
  row('Date', payment.paymentDate.toLocaleString())
  row('Member', member.name)
  row('Phone', `${member.dialCode || ''} ${member.phone || ''}`.trim())
  y += 2

  doc.line(8, y, pageWidth - 8, y)
  y += 6

  row('Payment Mode', (payment.mode || '').charAt(0).toUpperCase() + (payment.mode || '').slice(1))
  row('Due Before', `Rs. ${dueBefore.toFixed(2)}`)
  row('Amount Paid', `Rs. ${payment.amount.toFixed(2)}`)
  row('Due After', `Rs. ${dueAfter.toFixed(2)}`)
  y += 6

  doc.setFontSize(15)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(0, 150, 0)
  const amountText = `Rs. ${payment.amount.toFixed(2)} Received`
  const amountWidth = doc.getTextWidth(amountText)
  doc.text(amountText, (pageWidth - amountWidth) / 2, y)

  doc.setFontSize(8)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(150)
  doc.text('Thank you for your payment. This is a system-generated receipt.', 8, pageHeight - 10)

  const filename = `Receipt-${receiptNumber}.pdf`
  doc.save(filename)
  return filename
}

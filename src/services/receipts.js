// src/services/receipts.js
//
// Ports Services/ReceiptService.swift — redesigned to match the
// "SKYFITNESS_INVxx" reference invoice: two-column header (member info left,
// business info right), light lavender background, itemized program row,
// then Subtotal / Final Amount / Paid Amount / Due Amount (highlighted).

import jsPDF from 'jspdf'
import { derivePlanLabel } from './members.js'

// Edit these to your real business details — shown on every receipt.
const BUSINESS = {
  name: 'SKYFITNESS',
  address: 'Lalapet Guntur,',
  email: 'shaikkhaja98765432l@gmail.com',
  phone: '8074132373',
}

const BG_COLOR = [243, 232, 245]      // light lavender page background
const DUE_HIGHLIGHT = [186, 216, 236] // light blue highlight behind Due Amount

export function generateReceiptPDF(member, payment, dueBefore, dueAfter, invoiceNumber, planLabel) {
  const label = planLabel || derivePlanLabel(member)
  const invoice = invoiceNumber || `INV${String(payment.id || '').slice(0, 6).toUpperCase()}`
  const pageWidth = 210 // A4-ish width in mm, portrait
  const pageHeight = 297
  const doc = new jsPDF({ unit: 'mm', format: [pageWidth, pageHeight] })

  doc.setFillColor(...BG_COLOR)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  const marginX = 14
  let y = 20

  doc.setDrawColor(90, 90, 90)
  doc.setLineWidth(0.3)
  doc.line(marginX, y, pageWidth - marginX, y)
  y += 10

  doc.setFontSize(13)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(20, 20, 20)
  const title = `INVOICE : ${invoice}`
  const titleWidth = doc.getTextWidth(title)
  doc.text(title, (pageWidth - titleWidth) / 2, y)
  y += 12

  // Two-column header: member (left) / business (right)
  const leftX = marginX
  const rightX = pageWidth / 2 + 10
  let leftY = y
  let rightY = y

  doc.setFontSize(9.5)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(30, 30, 30)

  leftY = labelValueLine(doc, leftX, leftY, 'Name:', member.name)
  leftY = labelValueLine(doc, leftX, leftY, 'Address:', member.address || '—')
  leftY = labelValueLine(doc, leftX, leftY, 'Email:', member.email || '')
  leftY = labelValueLine(doc, leftX, leftY, 'Phone:', `${member.dialCode || ''} ${member.phone || ''}`.trim())
  leftY = labelValueLine(doc, leftX, leftY, 'Member ID:', member.memberCode || member.id?.slice(0, 6) || '—')

  doc.setFont(undefined, 'bold')
  doc.text(BUSINESS.name, rightX, rightY)
  rightY += 6
  doc.setFont(undefined, 'normal')
  rightY = labelValueLine(doc, rightX, rightY, 'Address:', BUSINESS.address)
  rightY = labelValueLine(doc, rightX, rightY, 'Email:', BUSINESS.email)
  rightY = labelValueLine(doc, rightX, rightY, 'Phone:', BUSINESS.phone)

  y = Math.max(leftY, rightY) + 8

  // Table header
  const cols = [marginX, marginX + 42, marginX + 84, marginX + 118, marginX + 154]
  const headers = ['INVOICE DATE', 'PROGRAM', 'START DATE', 'EXPIRY DATE', 'AMOUNT']
  doc.setFontSize(9)
  doc.setFont(undefined, 'bold')
  headers.forEach((h, i) => doc.text(h, cols[i], y))
  y += 6

  doc.setFont(undefined, 'normal')
  const row = [
    payment.paymentDate.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
    label,
    member.joinDate ? formatDMY(member.joinDate) : '—',
    member.expiryDate ? formatDMY(member.expiryDate) : '—',
    String(Math.round(dueBefore + payment.amount)),
  ]
  row.forEach((v, i) => doc.text(v, cols[i], y))
  y += 10

  // Totals block, right-aligned under the AMOUNT column
  const totalsLabelX = cols[3]
  const totalsValueX = cols[4]
  const subtotal = dueBefore + payment.amount

  y = totalsLine(doc, totalsLabelX, totalsValueX, y, 'Subtotal', subtotal, false)
  y = totalsLine(doc, totalsLabelX, totalsValueX, y, 'Final Amount', subtotal, false)
  y = totalsLine(doc, totalsLabelX, totalsValueX, y, 'Paid Amount', payment.amount, false)
  y = totalsLine(doc, totalsLabelX, totalsValueX, y, 'Due Amount', dueAfter, true)

  const filename = `${BUSINESS.name}_${invoice}.pdf`
  doc.save(filename)
  return filename
}

function labelValueLine(doc, x, y, label, value) {
  doc.text(`${label} ${value}`, x, y)
  return y + 5
}

function totalsLine(doc, labelX, valueX, y, label, value, highlight) {
  const text = `${Math.round(value)}`
  if (highlight) {
    doc.setFillColor(...DUE_HIGHLIGHT)
    doc.rect(labelX - 2, y - 4.5, 60, 6.5, 'F')
  }
  doc.text(label, labelX, y)
  const valueWidth = doc.getTextWidth(text)
  doc.text(text, valueX + 14 - valueWidth, y)
  return y + 7
}

function formatDMY(date) {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${d}-${m}-${date.getFullYear()}`
}

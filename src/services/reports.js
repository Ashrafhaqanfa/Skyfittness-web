// src/services/reports.js
//
// Ports Services/ReportService.swift — generates a branded balance-sheet PDF
// using jsPDF (the browser equivalent of PDFKit), for a month or a single day.
// On web, "download" just means triggering the browser's normal file-save,
// which is exactly what you want for "Add to Home Screen" style usage.

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function render(gymName, members, payments, periodTitle, totalsLabel, emptyMessage, filename) {
  const docPdf = new jsPDF()
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalDue = members.reduce((sum, m) => sum + (m.dueAmount || 0), 0)

  docPdf.setFontSize(18)
  docPdf.text(`${gymName} — Balance Sheet`, 14, 20)
  docPdf.setFontSize(11)
  docPdf.setTextColor(90)
  docPdf.text(periodTitle, 14, 28)

  docPdf.setFontSize(11)
  docPdf.setTextColor(0)
  docPdf.text(`${totalsLabel}: Rs. ${totalCollected.toFixed(2)}`, 14, 40)
  docPdf.setTextColor(200, 0, 0)
  docPdf.text(`Total Outstanding Due (all members): Rs. ${totalDue.toFixed(2)}`, 14, 47)
  docPdf.setTextColor(0)

  const rows = payments.map((p) => {
    const member = members.find((m) => m.id === p.memberId)
    return [
      member ? member.name : 'Unknown',
      p.paymentDate.toLocaleDateString(),
      (p.mode || '').charAt(0).toUpperCase() + (p.mode || '').slice(1),
      `Rs. ${p.amount.toFixed(2)}`,
    ]
  })

  if (rows.length === 0) {
    docPdf.setTextColor(130)
    docPdf.text(emptyMessage, 14, 58)
  } else {
    autoTable(docPdf, {
      head: [['Member', 'Date', 'Mode', 'Amount']],
      body: rows,
      startY: 55,
      headStyles: { fillColor: [25, 118, 210] },
    })
  }

  docPdf.save(filename)
}

export function generateBalanceSheetPDF(gymName, members, payments, month, year) {
  const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' })
  const filtered = payments.filter(
    (p) => p.paymentDate.getMonth() + 1 === month && p.paymentDate.getFullYear() === year
  )
  render(
    gymName,
    members,
    filtered,
    `${monthName} ${year}`,
    'Total Collected This Month',
    'No payments recorded for this month.',
    `BalanceSheet-${monthName}-${year}.pdf`
  )
}

export function generateDailyBalanceSheetPDF(gymName, members, payments, date) {
  const filtered = payments.filter((p) => isSameDay(p.paymentDate, date))
  const dayString = date.toLocaleDateString()
  const fileDateString = date.toISOString().slice(0, 10)
  render(
    gymName,
    members,
    filtered,
    dayString,
    `Total Collected on ${dayString}`,
    'No payments recorded for this day.',
    `BalanceSheet-${fileDateString}.pdf`
  )
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

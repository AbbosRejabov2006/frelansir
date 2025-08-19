import type { Sale } from "../types"
import { formatDateTimeUzbek } from "./dateUtils"

export const exportToWord = (sales: Sale[], filters: any) => {
  const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0)
  const filterText = getFilterText(filters)

  const wordHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Savdo hisoboti</title>
      <meta charset="UTF-8">
      <style>
        @page {
          size: A4;
          margin: 2cm;
        }
        
        body {
          font-family: 'Times New Roman', serif;
          margin: 0;
          padding: 0;
          color: #000;
          line-height: 1.6;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #FCA311;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .company-logo {
          font-size: 36px;
          font-weight: bold;
          color: #FCA311;
          margin-bottom: 10px;
        }
        
        .company-subtitle {
          font-size: 18px;
          color: #666;
          margin-bottom: 15px;
        }
        
        .report-title {
          font-size: 24px;
          font-weight: bold;
          margin: 20px 0;
          text-transform: uppercase;
        }
        
        .report-date {
          font-size: 14px;
          color: #666;
        }
        
        .filter-section {
          background-color: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .filter-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #495057;
        }
        
        .summary-section {
          display: flex;
          justify-content: space-around;
          margin: 30px 0;
          background: linear-gradient(135deg, #FCA311 0%, #FFD60A 100%);
          color: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(252, 163, 17, 0.3);
        }
        
        .summary-item {
          text-align: center;
          flex: 1;
        }
        
        .summary-value {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 5px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .summary-label {
          font-size: 14px;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .table-container {
          margin: 30px 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        
        th {
          background: linear-gradient(135deg, #495057 0%, #6c757d 100%);
          color: white;
          padding: 15px 10px;
          text-align: left;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        td {
          padding: 12px 10px;
          border-bottom: 1px solid #e9ecef;
        }
        
        tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        tr:hover {
          background-color: #e3f2fd;
        }
        
        .payment-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .payment-naqd { 
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
        }
        
        .payment-karta { 
          background: linear-gradient(135deg, #007bff 0%, #6610f2 100%);
          color: white;
        }
        
        .payment-qarz { 
          background: linear-gradient(135deg, #fd7e14 0%, #ffc107 100%);
          color: white;
        }
        
        .receipt-number {
          font-family: 'Courier New', monospace;
          font-weight: bold;
          color: #495057;
        }
        
        .amount {
          font-weight: bold;
          color: #28a745;
          text-align: right;
        }
        
        .footer {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 2px solid #e9ecef;
          text-align: center;
        }
        
        .footer-logo {
          font-size: 20px;
          font-weight: bold;
          color: #FCA311;
          margin-bottom: 10px;
        }
        
        .footer-text {
          color: #6c757d;
          font-size: 12px;
          line-height: 1.4;
        }
        
        .signature-section {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
        }
        
        .signature-box {
          text-align: center;
          width: 200px;
        }
        
        .signature-line {
          border-bottom: 2px solid #000;
          margin-bottom: 10px;
          height: 40px;
        }
        
        .signature-label {
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-logo">🏗️ BuildPOS</div>
        <div class="company-subtitle">Qurilish mollari do'koni</div>
        <div class="report-title">Savdo hisoboti</div>
        <div class="report-date">Yaratilgan: ${formatDateTimeUzbek(new Date())}</div>
      </div>

      <div class="filter-section">
        <div class="filter-title">📋 Hisobot parametrlari:</div>
        <p><strong>Filtr:</strong> ${filterText}</p>
        <p><strong>Hisobot muddati:</strong> ${new Date().toLocaleDateString("uz-UZ")}</p>
      </div>

      <div class="summary-section">
        <div class="summary-item">
          <div class="summary-value">${sales.length}</div>
          <div class="summary-label">Jami savdolar</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${totalAmount.toLocaleString()}</div>
          <div class="summary-label">Jami summa (so'm)</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${sales.reduce((sum, sale) => sum + sale.items.length, 0)}</div>
          <div class="summary-label">Jami mahsulotlar</div>
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 15%;">Chek raqami</th>
              <th style="width: 20%;">Sana va vaqt</th>
              <th style="width: 15%;">Kassir</th>
              <th style="width: 15%;">To'lov turi</th>
              <th style="width: 10%;">Mahsulotlar</th>
              <th style="width: 15%;">Summa (so'm)</th>
              <th style="width: 10%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${sales
              .map(
                (sale) => `
              <tr>
                <td class="receipt-number">#${sale.receiptNumber}</td>
                <td>${formatDateTimeUzbek(new Date(sale.date))}</td>
                <td>${sale.cashierName}</td>
                <td>
                  <span class="payment-badge payment-${sale.paymentType}">
                    ${getPaymentTypeText(sale.paymentType)}
                  </span>
                </td>
                <td style="text-align: center;">${sale.items.length} ta</td>
                <td class="amount">${sale.total.toLocaleString()}</td>
                <td style="text-align: center;">
                  ${sale.paymentType === "qarz" ? "⏳ Qarzda" : "✅ To'langan"}
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>

      ${
        sales.length > 0
          ? `
        <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <h3 style="margin-bottom: 15px; color: #495057;">📊 Qo'shimcha statistika:</h3>
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
            <div style="margin-bottom: 10px;">
              <strong>Naqd to'lovlar:</strong> ${sales.filter((s) => s.paymentType === "naqd").length} ta
            </div>
            <div style="margin-bottom: 10px;">
              <strong>Karta to'lovlari:</strong> ${sales.filter((s) => s.paymentType === "karta").length} ta
            </div>
            <div style="margin-bottom: 10px;">
              <strong>Qarzga berilgan:</strong> ${sales.filter((s) => s.paymentType === "qarz").length} ta
            </div>
            <div style="margin-bottom: 10px;">
              <strong>O'rtacha chek:</strong> ${Math.round(totalAmount / sales.length).toLocaleString()} so'm
            </div>
          </div>
        </div>
      `
          : ""
      }

      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">Hisobotni tayyorlovchi</div>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">Rahbar imzosi</div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-logo">BuildPOS</div>
        <div class="footer-text">
          Qurilish mollari do'koni uchun professional POS tizimi<br>
          📍 Manzil: Toshkent shahar, Chilonzor tumani<br>
          📞 Telefon: +998 71 123-45-67<br>
          🌐 Web: www.buildpos.uz
        </div>
      </div>
    </body>
    </html>
  `

  // Create and download the Word document
  const blob = new Blob([wordHTML], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  })

  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `savdo_hisoboti_${new Date().toISOString().split("T")[0]}.doc`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportToPDF = (sales: Sale[], filters: any) => {
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0)
  const filterText = getFilterText(filters)

  const pdfHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Savdo hisoboti</title>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #FCA311;
        }
        .report-title {
          font-size: 20px;
          margin-bottom: 10px;
        }
        .filter-info {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-value {
          font-size: 24px;
          font-weight: bold;
          color: #FCA311;
        }
        .summary-label {
          font-size: 14px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #FCA311;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .payment-type {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .payment-naqd { background-color: #d4edda; color: #155724; }
        .payment-karta { background-color: #cce7ff; color: #004085; }
        .payment-qarz { background-color: #fff3cd; color: #856404; }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">🏗️ BuildPOS</div>
        <div class="report-title">Savdo hisoboti</div>
        <div>Yaratilgan: ${formatDateTimeUzbek(new Date())}</div>
      </div>

      <div class="filter-info">
        <h3>Filtr ma'lumotlari:</h3>
        <p>${filterText}</p>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="summary-value">${sales.length}</div>
          <div class="summary-label">Jami savdolar</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${totalAmount.toLocaleString()}</div>
          <div class="summary-label">Jami summa (so'm)</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${sales.reduce((sum, sale) => sum + sale.items.length, 0)}</div>
          <div class="summary-label">Jami mahsulotlar</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Chek raqami</th>
            <th>Sana</th>
            <th>Kassir</th>
            <th>To'lov turi</th>
            <th>Mahsulotlar</th>
            <th>Summa</th>
          </tr>
        </thead>
        <tbody>
          ${sales
            .map(
              (sale) => `
            <tr>
              <td>#${sale.receiptNumber}</td>
              <td>${formatDateTimeUzbek(new Date(sale.date))}</td>
              <td>${sale.cashierName}</td>
              <td>
                <span class="payment-type payment-${sale.paymentType}">
                  ${getPaymentTypeText(sale.paymentType)}
                </span>
              </td>
              <td>${sale.items.length} ta</td>
              <td>${sale.total.toLocaleString()} so'm</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="footer">
        <p>BuildPOS tizimi tomonidan yaratilgan</p>
        <p>Qurilish mollari do'koni uchun POS tizimi</p>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(pdfHTML)
  printWindow.document.close()
  printWindow.focus()

  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

export const exportToExcel = (sales: Sale[], filters: any) => {
  const csvContent = generateCSV(sales)
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `savdo_hisoboti_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const generateCSV = (sales: Sale[]): string => {
  const headers = ["Chek raqami", "Sana", "Kassir", "To'lov turi", "Mahsulotlar soni", "Summa"]
  const rows = sales.map((sale) => [
    `${sale.receiptNumber}`,
    formatDateTimeUzbek(new Date(sale.date)),
    sale.cashierName,
    getPaymentTypeText(sale.paymentType),
    sale.items.length.toString(),
    sale.total.toString(),
  ])

  return [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
}

const getPaymentTypeText = (paymentType: string): string => {
  switch (paymentType) {
    case "naqd":
      return "Naqd pul"
    case "karta":
      return "Bank kartasi"
    case "qarz":
      return "Qarzga"
    default:
      return paymentType
  }
}

const getFilterText = (filters: any): string => {
  const parts = []

  if (filters.dateFrom) {
    parts.push(`Boshlanish: ${new Date(filters.dateFrom).toLocaleDateString("uz-UZ")}`)
  }

  if (filters.dateTo) {
    parts.push(`Tugash: ${new Date(filters.dateTo).toLocaleDateString("uz-UZ")}`)
  }

  if (filters.cashier) {
    parts.push(`Kassir: ${filters.cashier}`)
  }

  if (filters.paymentType) {
    parts.push(`To'lov turi: ${getPaymentTypeText(filters.paymentType)}`)
  }

  return parts.length > 0 ? parts.join(", ") : "Barcha savdolar"
}

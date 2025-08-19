import type { Sale } from "../types"

export const printReceipt = (sale: Sale): void => {
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  const getPaymentTypeText = (paymentType: string): string => {
    switch (paymentType) {
      case "naqd":
        return "Naqd"
      case "karta":
        return "Karta"
      case "qarz":
        return "Qarzga"
      default:
        return paymentType
    }
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("uz-UZ")
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
  }

  // Calculate totals with discount
  const originalTotal = sale.total
  const discountAmount = sale.discount || 0
  const finalTotal = sale.finalTotal || sale.total

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Chek #${sale.receiptNumber}</title>
      <meta charset="UTF-8">
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
        
        body {
          font-family: 'Courier New', monospace;
          padding: 10px;
          max-width: 300px;
          margin: 0 auto;
          line-height: 1.3;
          font-size: 12px;
          color: #000;
        }
        
        .header {
          text-align: center;
          margin-bottom: 15px;
        }
        
        .company-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .company-subtitle {
          font-size: 11px;
          margin-bottom: 10px;
        }
        
        .receipt-info {
          margin-bottom: 10px;
          font-size: 11px;
        }
        
        .receipt-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        
        .separator {
          border-top: 1px dashed #000;
          margin: 8px 0;
        }
        
        .items-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 11px;
        }
        
        .item {
          margin-bottom: 3px;
          font-size: 11px;
        }
        
        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .item-name {
          flex: 1;
          margin-right: 10px;
        }
        
        .item-qty {
          min-width: 60px;
          text-align: center;
        }
        
        .item-price {
          min-width: 80px;
          text-align: right;
        }
        
        .total-section {
          margin-top: 10px;
          font-size: 11px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        
        .total-main {
          font-weight: bold;
          font-size: 13px;
        }
        
        .discount-row {
          color: #d00;
          font-weight: bold;
        }
        
        .footer {
          text-align: center;
          margin-top: 15px;
          font-size: 10px;
        }
        
        .contact-info {
          margin-bottom: 8px;
        }
        
        .thank-you {
          font-weight: bold;
          margin-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">🏗️ BUILD POS</div>
        <div class="company-subtitle">Qurilish mollari do'koni</div>
      </div>
      
      <div class="receipt-info">
        <div class="receipt-info-row">
          <span>Chek:</span>
          <span>#${sale.receiptNumber}</span>
        </div>
        <div class="receipt-info-row">
          <span>Sana:</span>
          <span>${formatDate(new Date(sale.date))}</span>
        </div>
        <div class="receipt-info-row">
          <span>Vaqt:</span>
          <span>${formatTime(new Date(sale.date))}</span>
        </div>
        <div class="receipt-info-row">
          <span>Kassir:</span>
          <span>${sale.cashierName}</span>
        </div>
      </div>
      
      <div class="separator"></div>
      
      <div class="items-header">
        <span>Mahsulot</span>
        <span>Miqdor</span>
        <span>Summa</span>
      </div>
      
      <div class="separator"></div>
      
      ${sale.items
        .map(
          (item) => `
        <div class="item">
          <div class="item-row">
            <span class="item-name">${item.productName}</span>
            <span class="item-qty">${item.quantity} ${item.unit}</span>
            <span class="item-price">${item.total.toLocaleString()} so'm</span>
          </div>
        </div>
      `,
        )
        .join("")}
      
      <div class="separator"></div>
      
      <div class="total-section">
        ${
          discountAmount > 0
            ? `
          <div class="total-row">
            <span>Umumiy:</span>
            <span>${originalTotal.toLocaleString()} so'm</span>
          </div>
          <div class="total-row discount-row">
            <span>Chegirma:</span>
            <span>-${discountAmount.toLocaleString()} so'm</span>
          </div>
        `
            : ""
        }
        <div class="total-row total-main">
          <span>JAMI:</span>
          <span>${finalTotal.toLocaleString()} so'm</span>
        </div>
        <div class="total-row">
          <span>To'lov:</span>
          <span>${getPaymentTypeText(sale.paymentType)}</span>
        </div>
        ${
          sale.paymentType === "qarz"
            ? `
          <div class="total-row">
            <span>To'landi:</span>
            <span>${(sale.paidAmount || 0).toLocaleString()} so'm</span>
          </div>
          <div class="total-row">
            <span>Qoldiq:</span>
            <span>${(finalTotal - (sale.paidAmount || 0)).toLocaleString()} so'm</span>
          </div>
        `
            : `
          <div class="total-row">
            <span>To'landi:</span>
            <span>${finalTotal.toLocaleString()} so'm</span>
          </div>
          <div class="total-row">
            <span>Qoldiq:</span>
            <span>0 so'm</span>
          </div>
        `
        }
      </div>
      
      <div class="separator"></div>
      
      <div class="footer">
        <div class="contact-info">
          Manzil: Oqqo'rg'on, Mirzo Ulug'bek ko'chasi<br>
          Telefon: +998 99 475 44 44
        </div>
        
        <div class="thank-you">
          Keyingi xaridingizda sizni kutamiz!
        </div>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(receiptHTML)
  printWindow.document.close()
  printWindow.focus()

  // Wait for content to load before printing
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

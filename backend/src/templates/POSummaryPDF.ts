interface POSummaryRow {
  po_no: string;
  supplier: string;
  order_date: string;
  expected_date: string;
  total_items: number;
  received_percent: number;
  status: "Open" | "Partial" | "Received";
}

export function generatePOSummaryHTML(
  data: POSummaryRow[],
  filters: Record<string, string | undefined>
) {
  const { from, to, status } = filters;

  return `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #333; padding: 4px; text-align: left; }
          th { background: #eee; }
          .filters { margin-bottom: 12px; }
          .filters div { margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <h2 style="text-align:center">Purchase Order Summary</h2>
        
        <div class="filters">
          <div><strong>Dari:</strong> ${from || "-"}</div>
          <div><strong>Sampai:</strong> ${to || "-"}</div>
          <div><strong>Status:</strong> ${status || "Semua"}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>PO No</th>
              <th>Supplier</th>
              <th>Tanggal Order</th>
              <th>Estimasi</th>
              <th>Total Item</th>
              <th>Progress (%)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${
              data.length > 0
                ? data
                    .map(
                      (r, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${r.po_no}</td>
                  <td>${r.supplier}</td>
                  <td>${new Date(r.order_date).toLocaleDateString("id-ID")}</td>
                  <td>${new Date(r.expected_date).toLocaleDateString(
                    "id-ID"
                  )}</td>
                  <td style="text-align: right;">${r.total_items}</td>
                  <td style="text-align: right;">${
                    r.received_percent ?? 0
                  }%</td>
                  <td>${r.status}</td>
                </tr>
              `
                    )
                    .join("")
                : `<tr><td colspan="8" style="text-align:center;">Tidak ada data</td></tr>`
            }
          </tbody>
        </table>
      </body>
    </html>
  `;
}

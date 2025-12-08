export function generateStockLocationHTML(
  data: {
    location: string;
    total_item_types: number;
    total_qty: number;
    last_update?: string | null;
  }[],
  filters: Record<string, string | undefined>
): string {
  const { location_name } = filters;

  return `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; font-size: 12px; padding: 20px; }
          h2 { text-align: center; margin-bottom: 16px; }
          .filters { margin-bottom: 12px; }
          .filters div { margin-bottom: 4px; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }
          th, td {
            border: 1px solid #333;
            padding: 6px;
            text-align: left;
          }
          th {
            background-color: #eee;
          }
          .text-right {
            text-align: right;
          }
        </style>
      </head>
      <body>
        <h2>Laporan Inventory per Lokasi</h2>

        <div class="filters">
          <div><strong>Lokasi:</strong> ${location_name || "-"}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Location</th>
              <th>Item Type Count</th>
              <th>Total Qty</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map((row, idx) => {
                const lastUpdate = row.last_update
                  ? new Date(row.last_update).toLocaleString("id-ID")
                  : "-";
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${row.location}</td>
                    <td class="text-right">${row.total_item_types}</td>
                    <td class="text-right">${row.total_qty}</td>
                    <td>${lastUpdate}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

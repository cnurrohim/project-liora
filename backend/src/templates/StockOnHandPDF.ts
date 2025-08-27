export function generateStockOnHandHTML(
  data: any[],
  filters: Record<string, string | undefined>
) {
  const { search, location_name } = filters;

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
        <h2 style="text-align:center">Stock On Hand Report</h2>
        <div class="filters">
          <div><strong>SKU:</strong> ${search || "-"}</div>
          <div><strong>Lokasi:</strong> ${location_name || "-"}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Kode Barang</th>
              <th>Nama Barang</th>
              <th>Lokasi</th>
              <th>Qty Saat Ini</th>
              <th>Terakhir Bergerak</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (r, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${r.item_code}</td>
                <td>${r.item_name}</td>
                <td>${r.location}</td>
                <td style="text-align: right;"><strong>${
                  r.current_qty
                }</strong></td>
                <td>${
                  r.last_movement
                    ? new Date(r.last_movement).toLocaleString("id-ID")
                    : "-"
                }</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

export function generateStockMovementHTML(
  data: any[],
  filters: Record<string, string | undefined>
) {
  const { search, movement_type, date_from, date_to } = filters;

  // bantu translate movement_type ke label jika perlu
  const movementTypeLabel =
    {
      inbound: "Inbound",
      outbound: "Outbound",
      adjustment: "Adjustment",
    }[movement_type || ""] || "-";

  return `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #333; padding: 4px; text-align: left; }
          th { background: #eee; }
          .inbound { background: #059669; color: white; padding: 2px 4px; border-radius: 4px;}
          .outbound { background: #dc2626; color: white; padding: 2px 4px; border-radius: 4px;}
          .adjustment { background: #4b5563; color: white; padding: 2px 4px; border-radius: 4px;}
          .filters { margin-bottom: 12px; }
          .filters div { margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <h2 style="text-align:center">Stock Movement Report</h2>
        <div class="filters">
          <div><strong>SKU:</strong> ${search || "-"}</div>
          <div><strong>Tipe Pergerakan:</strong> ${movementTypeLabel}</div>
          <div><strong>Dari Tanggal:</strong> ${date_from || "-"}</div>
          <div><strong>Sampai Tanggal:</strong> ${date_to || "-"}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tanggal</th>
              <th>SKU</th>
              <th>Nama</th>
              <th>Tipe</th>
              <th>Arah</th>
              <th>Qty</th>
              <th>Saldo Setelah</th>
              <th>Lokasi Asal</th>
              <th>Lokasi Tujuan</th>
              <th>Ref Type</th>
              <th>Catatan</th>
              <th>Dibuat Oleh</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (r, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${new Date(r.created_at).toLocaleString("id-ID")}</td>
                <td>${r.item_sku}</td>
                <td>${r.item_name}</td>
                <td>${r.movement_type}</td>
                <td>${r.adjustment_direction || "-"}</td>
                <td>${r.qty}</td>
                <td>${r.balance_after}</td>
                <td>${r.source_location_name || "-"}</td>
                <td>${r.target_location_name || "-"}</td>
                <td>${r.reference_type || "-"}</td>
                <td>${r.note || "-"}</td>
                <td>${r.created_by || "-"}</td>
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

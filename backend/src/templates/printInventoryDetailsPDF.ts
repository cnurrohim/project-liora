export function generateInventoryDetailsHTML(
  data: {
    id: string;
    sku: string;
    name: string;
    min_stock: number;
    locations?: Record<string, number>;
  }[],
  locations: {
    id: string;
    code: string;
    name: string;
    type: string;
    description: string | null;
  }[]
): string {
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
        <h2>Inventory Report per Location</h2>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>SKU</th>
              <th>Inventory Item</th>
              ${locations
                .map((loc) => `<th>${loc.code} - ${loc.name}</th>`)
                .join("")}

              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map((row, idx) => {
                const qtyItemAlllocations = row.locations || {};
                const total = Object.values(qtyItemAlllocations).reduce(
                  (sum, v) => sum + (v ?? 0),
                  0
                );

                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${row.sku}</td>
                    <td>${row.name}</td>
                    ${locations
                      .map((loc) => {
                        const qty = row.locations?.[loc.id] ?? 0;
                        return `<td class="text-right">${qty}</td>`;
                      })
                      .join("")}
                    <td class="text-right">${total}</td>
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

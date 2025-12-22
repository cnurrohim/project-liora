export function generateStockHistoryHTML(
  data: {
    item_code: string;
    item_name: string;
    period: string;
    total_in: number;
    total_out: number;
    adjustment_in: number;
    adjustment_out: number;
    closing_balance: number;
  }[],
  filters: {
    period?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): string {
  const { period, dateFrom, dateTo } = filters;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID");
  };

  const formatPeriod = (p?: string) => {
    if (p === "day") return "daily";
    if (p === "week") return "Weekly";
    return "Monthly";
  };

  return `
    <html>
      <head>
        <style>
          body {
            font-family: sans-serif;
            font-size: 12px;
            padding: 20px;
          }

          h2 {
            text-align: center;
            margin-bottom: 10px;
          }

          .filters {
            margin-bottom: 16px;
          }

          .filters div {
            margin-bottom: 4px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
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

          .text-green {
            color: green;
          }

          .text-red {
            color: red;
          }
        </style>
      </head>
      <body>
        <h2>Inventory History Inbound/Outbound</h2>

        <div class="filters">
          <div><strong>Period:</strong> ${formatPeriod(period)}</div>
          <div><strong>From:</strong> ${formatDate(dateFrom)}</div>
          <div><strong>To:</strong> ${formatDate(dateTo)}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Period</th>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Inbound</th>
              <th>Outbound</th>
              <th>Adj, In</th>
              <th>Adj, Out</th>
              <th>Balance After</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map((row, idx) => {
                const periodDate = new Date(row.period).toLocaleDateString(
                  "id-ID"
                );
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${periodDate}</td>
                    <td>${row.item_code}</td>
                    <td>${row.item_name}</td>
                    <td class="text-green text-right">${row.total_in}</td>
                    <td class="text-red text-right">${row.total_out}</td>
                    <td class="text-red text-right">${row.adjustment_in}</td>
                    <td class="text-red text-right">${row.adjustment_out}</td>
                    <td class="text-right">${row.closing_balance}</td>
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

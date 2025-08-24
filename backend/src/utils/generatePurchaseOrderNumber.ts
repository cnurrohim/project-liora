export function formatOrderNumber(seq: number, now = new Date()) {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `PO/${yyyy}/${mm}/${seq.toString().padStart(4, "0")}`;
}

/** Tabel Counter + Row Lock */
/**
Kelebihan:
Bisa reset per hari/bulan otomatis.
Nomor urut selalu konsisten per periode.

Kekurangan:
Harus pakai transaction + FOR UPDATE (lebih rumit daripada sequence).

CREATE TABLE inventory.po_counters (
  date_key DATE PRIMARY KEY,
  last_number INT NOT NULL DEFAULT 0
);

 * @param client 
 * @param now 
 * @returns 
 */
export async function getNextOrderNumber(client: any, now = new Date()) {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateKey = `${yyyy}-${mm}-${dd}`;

  // Lock row berdasarkan tanggal
  const { rows } = await client.query(
    `SELECT last_number FROM inventory.po_counters
     WHERE date_key = $1
     FOR UPDATE`,
    [dateKey]
  );

  let seq = 1;
  if (rows.length === 0) {
    await client.query(
      `INSERT INTO inventory.po_counters(date_key, last_number)
       VALUES ($1, 1)`,
      [dateKey]
    );
  } else {
    seq = rows[0].last_number + 1;
    await client.query(
      `UPDATE inventory.po_counters
       SET last_number = $2
       WHERE date_key = $1`,
      [dateKey, seq]
    );
  }

  return `PO/${yyyy}/${mm}/${dd}/${seq.toString().padStart(4, "0")}`;
}

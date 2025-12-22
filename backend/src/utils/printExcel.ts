export function sendExcel(c: any, buffer: Buffer, filename: string) {
  c.header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  c.header("Content-Disposition", `attachment; filename=${filename}.xlsx`);
  return c.body(buffer);
}

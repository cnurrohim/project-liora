import puppeteer from "puppeteer";

export async function renderPDF(html: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const buffer = await page.pdf({ format: "A4", printBackground: true });

  await browser.close();
  return buffer;
}

export function sendPDF(c: any, buffer: Buffer, filename: string) {
  c.header("Content-Type", "application/pdf");
  c.header("Content-Disposition", `attachment; filename=${filename}.pdf`);
  return c.body(buffer);
}

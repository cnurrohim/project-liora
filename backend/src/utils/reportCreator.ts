import { sendExcel } from "./printExcel.js";
import { renderPDF, sendPDF } from "./printPdf.js";

export function createPDF({
  getFilters,
  getData,
  buildHTML,
  filename,
}: {
  getFilters: (c: any) => any;
  getData: (filters: any) => Promise<any>;
  buildHTML: (data: any, filters: any) => string;
  filename: string;
}) {
  return async (c: any) => {
    const filters = getFilters(c);
    const data = await getData(filters);
    const html = buildHTML(data, filters);

    const pdf = Buffer.from(await renderPDF(html));
    return sendPDF(c, pdf, filename);
  };
}

export function createExcel({
  getFilters,
  getData,
  buildExcel,
  filename,
}: {
  getFilters: (c: any) => any;
  getData: (filters: any) => Promise<any>;
  buildExcel: (data: any, filters: any) => Promise<Buffer>;
  filename: string;
}) {
  return async (c: any) => {
    const filters = getFilters(c);
    const data = await getData(filters);

    const excel = await buildExcel(data, filters); // now valid
    return sendExcel(c, excel, filename);
  };
}

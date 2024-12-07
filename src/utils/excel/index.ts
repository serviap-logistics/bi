import ExcelJS from 'exceljs';
export type excel_column = { header: string; key: string; width: number };
export type excel_cell = string | number;
export type excel_page = {
  name: string;
  columns?: excel_column[];
  rows: excel_cell[];
};
export const generateExcel = async (
  pages: excel_page[],
  settings?: { mergeCells?: [number, number, number, number][] },
) => {
  const workbook = new ExcelJS.Workbook();
  for (const page of pages) {
    const worksheet = workbook.addWorksheet(page.name);
    worksheet.columns = page.columns ?? [];
    worksheet.addRows(page.rows);
    if (settings?.mergeCells && settings?.mergeCells?.length > 0) {
      console.log('Merging cells...');
      console.log(settings?.mergeCells);
    }
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
};

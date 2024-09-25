export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const getDateByTimestamp = (timestamp: string) => {
  return timestamp.substring(0, 10);
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const groupListBy = (property: string, list: any[]) => {
  return list.reduce((new_list, item) => {
    if (!new_list[item[property]]) {
      new_list[item[property]] = [];
    }
    new_list[item[property]].push(item);
    return new_list;
  }, {});
};

export const getDatesBeetween = (start: string, end: string) => {
  const dates: string[] = [];
  const pivot_date = new Date(getDateByTimestamp(start));
  const end_date = new Date(getDateByTimestamp(end));

  while (pivot_date <= end_date) {
    dates.push(getDateByTimestamp(pivot_date.toISOString()));
    pivot_date.setDate(pivot_date.getDate() + 1);
  }
  return dates;
};

export const getPercentageUsed = (budget: number, real: number): number => {
  // Si el real es 0, exista o no presupuesto, el uso es de 0.
  if (real === 0) return 0;
  // Si el presupuesto NO es 0 y el real NO es 0, el calculo de porcentaje es normal.
  if (budget !== 0) return (real * 100) / budget;
  // SI existe real y NO hay presupuesto, se entiende que el 100% del presupuesto seria 1.
  return real * 100;
};

export const cloneObject = (object) => JSON.parse(JSON.stringify(object));

export const isObjectArray = (arr) => {
  return (
    Array.isArray(arr) &&
    arr.every(
      (item) =>
        typeof item === 'object' && !Array.isArray(item) && item !== null,
    )
  );
};

import { v4 } from 'uuid';
export const generateUUID = () => v4();

export const getToastColor = (
  value: number,
): 'success' | 'warning' | 'info' | 'error' | 'secondary' | 'none' => {
  return value === 0
    ? 'none'
    : value <= 50
      ? 'success'
      : value <= 70
        ? 'info'
        : value <= 95
          ? 'warning'
          : 'error';
};
export const generateColorStatus = (value: number) => {
  return value === 0
    ? ''
    : value <= 50
      ? 'bg-green-300'
      : value <= 70
        ? 'bg-blue-300'
        : value <= 95
          ? 'bg-amber-300'
          : 'bg-red-300';
};

import ExcelJS from 'exceljs';
export type excel_column = { header: string; key: string; width: number };
export type excel_row = string | number;
export type excel_page = {
  name: string;
  columns?: excel_column[];
  rows: excel_row[];
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
    if (settings?.mergeCells) {
      console.log(settings.mergeCells);
    }
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
};

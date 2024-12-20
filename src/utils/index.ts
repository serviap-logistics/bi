export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const getDateByTimestamp = (timestamp: string) => {
  return timestamp.substring(0, 10);
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

export type Indicator = {
  value: number;
  status: 'used' | 'exceeded' | 'NO BUDGET!' | undefined;
  color: 'success' | 'info' | 'warning' | 'error' | 'none';
};
export const getPercentageUsed = (budget: number, real: number): Indicator => {
  // Si el real es 0, exista o no presupuesto, el uso es de 0.
  if (real === 0) return { value: 0, status: 'used', color: 'none' };
  // Si el presupuesto NO es 0 y el real NO es 0, el calculo de porcentaje es normal.
  if (budget !== 0) {
    const percentaje = (real * 100) / budget;
    return percentaje <= 100 && percentaje >= 0
      ? {
          value: percentaje,
          status: 'used',
          color:
            percentaje <= 50
              ? 'success'
              : percentaje <= 70
                ? 'info'
                : percentaje <= 90
                  ? 'warning'
                  : 'error',
        } // Si el uso va entre 0-100
      : { value: percentaje - 100, status: 'exceeded', color: 'error' };
  }
  // SI existe real y NO hay presupuesto, se entiende que el 100% del presupuesto seria 1.
  return { value: real * 100, status: 'NO BUDGET!', color: 'error' };
};

export const cloneObject = (object) => JSON.parse(JSON.stringify(object));

export const isPlainObject = (value: any): boolean => {
  // 1. Verifica que sea tipo objeto (Un diccionario o un Array)
  // 2. Verifica que su valor no sea nulo
  // 3. Verifica que NO es un Array
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isObjectArray = (arr) => {
  return (
    Array.isArray(arr) &&
    arr.every(
      (item) =>
        typeof item === 'object' && !Array.isArray(item) && item !== null,
    )
  );
};

import React from 'react';
export const isReactComponent = (obj) => {
  return React.isValidElement(obj);
};

import { v4 } from 'uuid';
export const generateUUID = () => v4();

export const getToastColor = (
  value: number,
): 'success' | 'warning' | 'info' | 'error' | 'none' => {
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

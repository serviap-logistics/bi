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

export const getPercentage = (budget, real): number =>
  budget !== 0 ? (real * 100) / budget : real;

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

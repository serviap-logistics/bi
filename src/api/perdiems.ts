import { getTimesByDay } from './times_by_day';

export type perdiem = {
  date: string;
  perdiem_per_project: number;
  perdiem_cost: number;
  day_projects: string;
  employee_role: string;
};

export default async function getPerdiems(
  project_id: string,
): Promise<perdiem[]> {
  const perdiems = await getTimesByDay({
    view: 'BI',
    fields: [
      'date',
      'perdiem_per_project',
      'perdiem_cost',
      'day_projects',
      'employee_role',
    ],
    formula: project_id
      ? encodeURI(`IF(NOT(perdiem_cost)=0,FIND('${project_id}', day_projects))`)
      : undefined,
    offset: undefined,
  });
  return perdiems;
}

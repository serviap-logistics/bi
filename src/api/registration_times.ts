import { groupListBy } from '../utils';
import { getTravelTimes } from './travel_times';
import { getWaitingTimes } from './waiting_times';
import { getWorkedTimes } from './worked_times';

export type registration_time = {
  id: string;
  createdTime: string;
  category: 'WORKED' | 'TRAVEL' | 'WAITING';

  project_id: string;
  project_code: string;
  project_name: string;
  project_status: string;
  project_start_date: string;
  project_end_date: string;
  site_id: string;
  site_name: string;
  site_address: string;
  employee_id: string;
  employee_role: string;
  week: string;
  start_date: string;
  end_date: string;
  // Regular
  regular_hour_cost: number;
  regular_hours: number | undefined;
  regular_cost: number | undefined;
  // Overtime
  overtime_hour_cost: number;
  overtime_hours: number | undefined;
  overtime_cost: number | undefined;
  // Total
  total_hours: number;
  subtotal: number | undefined;
  // Week
  week_hours: number | undefined;
};

const updateOvertimes = (times: registration_time[]) => {
  const by_week = groupListBy('week', times);
  Object.values(by_week).map((records: any) => {
    const by_employee = groupListBy('employee_id', records);
    Object.values(by_employee).map((week_times: any) => {
      week_times.reduce((week_hours, record) => {
        // Por defecto, se indica que se realizaron 0 horas de cada tipo hasta que se indique lo contrario.
        record.regular_hours = 0;
        record.overtime_hours = 0;
        if (week_hours === 0 || week_hours + record.total_hours <= 40) {
          // Es el primer registro de la semana, todas las horas son regulares.
          // O
          // La suma de las horas no pasa las 40 horas, siguen siendo horas regulares.
          record.regular_hours = record.total_hours;
        } else {
          // La suma de las horas si pasa las 40 horas, se busca la diferencia de horas para que
          // se cumplan 40 regulares y el resto pasan a ser overtime.
          if (week_hours < 40) {
            // Si antes de la suma con las horas del dia, aun no se cumplen las 40 horas, se busca la diferencia.
            const difference = 40 - week_hours;
            record.regular_hours = difference;
            record.overtime_hours = record.total_hours - difference;
          } else {
            // Ya se cumplieron las 40 horas desde dias anteriores.
            record.overtime_hours = record.total_hours;
          }
        }
        record.overtime_cost =
          record.overtime_hour_cost * record.overtime_hours;
        record.regular_cost = record.regular_hour_cost * record.regular_hours;
        record.subtotal = record.regular_cost + record.overtime_cost;
        record.week_hours = week_hours + record.total_hours;
        return (week_hours += record.total_hours);
      }, 0);
    });
  });
  return times;
};

export async function getRegistrationTimes(settings: {
  worked: boolean;
  travel: boolean;
  waiting: boolean;
  project_id?: string;
}): Promise<registration_time[]> {
  const { worked, travel, waiting, project_id } = settings;
  const times_found: registration_time[] = [];

  if (travel) {
    const travel_times = await getTravelTimes({
      view: 'BI',
      formula: project_id ? encodeURI(`project_id='${project_id}'`) : undefined,
      fields: [
        'project_id',
        'project_name',
        'project_status',
        'project_start_date',
        'project_end_date',
        'employee_id',
        'employee_role',
        'week',
        'day',
        'start_date',
        'end_date',
        'regular_hour_cost',
        'overtime_hour_cost',
        'total_hours',
        'site_id',
        'site_name',
        'site_address',
      ],
    });
    updateOvertimes(travel_times);
    times_found.push(...travel_times);
  }
  if (worked) {
    const worked_times = await getWorkedTimes({
      view: 'BI',
      formula: project_id ? encodeURI(`project_id='${project_id}'`) : undefined,
      fields: [
        'project_id',
        'project_name',
        'project_status',
        'project_start_date',
        'project_end_date',
        'employee_id',
        'employee_role',
        'week',
        'day',
        'start_date',
        'end_date',
        'regular_hour_cost',
        'overtime_hour_cost',
        'total_hours',
        'site_id',
        'site_name',
        'site_address',
      ],
    });
    updateOvertimes(worked_times);
    times_found.push(...worked_times);
  }
  if (waiting) {
    const waiting_times = await getWaitingTimes({
      view: 'BI',
      formula: project_id ? encodeURI(`project_id='${project_id}'`) : undefined,
      fields: [
        'project_id',
        'project_name',
        'project_status',
        'project_start_date',
        'project_end_date',
        'employee_id',
        'employee_role',
        'week',
        'day',
        'start_date',
        'end_date',
        'regular_hour_cost',
        'total_hours',
        'subtotal',
        'site_id',
        'site_name',
        'site_address',
      ],
    });
    times_found.push(...waiting_times);
  }
  return times_found;
}

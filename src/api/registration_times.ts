import { registration_time_type } from '../types/registration_time.type';
import { groupListBy } from '../utils';
import { getTravelTimes } from './travel_times';
import { getWaitingTimes } from './waiting_times';
import { getWorkedTimes } from './worked_times';

const updateOvertimes = (times: registration_time_type[]) => {
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
  project_id: string;
}): Promise<registration_time_type[]> {
  const { worked, travel, waiting, project_id } = settings;
  const times_found: registration_time_type[] = [];

  if (travel) {
    const travel_times = await getTravelTimes({
      view: 'BI',
      formula: project_id ? encodeURI(`project_id='${project_id}'`) : undefined,
      fields: [
        'project_id',
        'employee_id',
        'employee_role',
        'week',
        'start_date',
        'end_date',
        'regular_hour_cost',
        'overtime_hour_cost',
        'total_hours',
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
        'employee_id',
        'employee_role',
        'week',
        'start_date',
        'end_date',
        'regular_hour_cost',
        'overtime_hour_cost',
        'total_hours',
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
        'employee_id',
        'employee_role',
        'week',
        'start_date',
        'end_date',
        'regular_hour_cost',
        'total_hours',
        'subtotal',
      ],
    });
    times_found.push(...waiting_times);
  }
  return times_found;
}

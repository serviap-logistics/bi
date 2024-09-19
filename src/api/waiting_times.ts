import { ENVIROMENT } from '../settings/enviroment';
import { airtable_request_type } from '../types/airtable_request.type';
import { registration_time_type } from '../types/registration_time.type';
import airtableRequest from './utils/run_airtable_request';
const { AIRTABLE_HOST, USA_OPERATIONS_BASE, USA_WAITING_TIMES_TABLE } =
  ENVIROMENT;

export type waiting_time = {
  category: 'WAITING';
  id: string;
  createdTime: string;
  project_id: string;
  employee_id: string;
  employee_role: string;

  start_date: string;
  end_date: string;
  week: string;
  week_hours: number;

  regular_hour_cost: number;
  regular_hours: number;
  regular_cost: number;

  overtime_hour_cost: number;
  overtime_hours: number;
  overtime_cost: number;

  total_cost: number;
  total_hours: number;
  subtotal: number;
};

export async function getWaitingTimes(
  settings: airtable_request_type,
): Promise<registration_time_type[]> {
  const records = await airtableRequest(
    `${AIRTABLE_HOST}/${USA_OPERATIONS_BASE}/${USA_WAITING_TIMES_TABLE}`,
    settings,
  );
  return records.map(
    (record): waiting_time => ({
      ...record,
      category: 'WAITING',
      regular_hour_cost: record.regular_hour_cost[0],
    }),
  );
}

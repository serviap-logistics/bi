import { ENVIROMENT } from '../settings/enviroment';
import { registration_time } from './registration_times';
import airtableRequest, {
  airtable_request,
} from './utils/run_airtable_request';

const { AIRTABLE_HOST, USA_OPERATIONS_BASE, USA_WAITING_TIMES_TABLE } =
  ENVIROMENT;

export type waiting_time = {
  category: 'WAITING';
  id: string;
  createdTime: string;
  project_id: string;
  project_code: string;
  project_name: string;
  project_status: string;
  project_start_date: string;
  project_end_date: string;
  site_name: string;
  site_address: string;

  employee_id: string;
  employee_role: string;

  day: string;
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

  perdiem: boolean;
};

export async function getWaitingTimes(
  settings: airtable_request,
): Promise<registration_time[]> {
  const records = await airtableRequest(
    `${AIRTABLE_HOST}/${USA_OPERATIONS_BASE}/${USA_WAITING_TIMES_TABLE}`,
    settings,
  );
  return records.map(
    (record): waiting_time => ({
      ...record,
      category: 'WAITING',
      regular_hour_cost: record.regular_hour_cost,
    }),
  );
}

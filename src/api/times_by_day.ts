import { ENVIROMENT } from '../settings/enviroment';
import { airtable_request_type } from '../types/airtable_request.type';
import airtableRequest from './utils/run_airtable_request';
const { AIRTABLE_HOST, USA_OPERATIONS_BASE, USA_TIMES_BY_DAY_TABLE } =
  ENVIROMENT;

export type times_by_day = {
  id: string;
  createdTime: string;
  date: string;
  // Projects
  worked_projects: string;
  travel_projects: string;
  // Perdiem
  perdiem_per_project: number;
  perdiem_cost: number;
};

export async function getTimesByDay(
  settings: airtable_request_type,
): Promise<times_by_day[]> {
  const records = await airtableRequest(
    `${AIRTABLE_HOST}/${USA_OPERATIONS_BASE}/${USA_TIMES_BY_DAY_TABLE}`,
    settings,
  );
  return records;
}

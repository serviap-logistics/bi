import { ENVIROMENT } from '../../../settings/enviroment';
import airtableRequest, {
  airtable_request,
} from '../../../utils/run_airtable_request';
import { registration_time } from './registration_times';

const { AIRTABLE_HOST, USA_OPERATIONS_BASE, USA_TRAVEL_TIMES_TABLE } =
  ENVIROMENT;

export async function getTravelTimes(
  settings: airtable_request,
): Promise<registration_time[]> {
  const records = await airtableRequest(
    `${AIRTABLE_HOST}/${USA_OPERATIONS_BASE}/${USA_TRAVEL_TIMES_TABLE}`,
    settings,
  );
  return records.map(
    (record): registration_time => ({
      ...record,
      category: 'TRAVEL',
      regular_hour_cost: record.regular_hour_cost,
    }),
  );
}

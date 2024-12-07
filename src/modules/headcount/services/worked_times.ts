import { ENVIROMENT } from '../../../settings/enviroment';
import { registration_time } from './registration_times';
import airtableRequest, {
  airtable_request,
} from '../../../utils/run_airtable_request';

const { AIRTABLE_HOST, USA_OPERATIONS_BASE, USA_WORKED_TIMES_TABLE } =
  ENVIROMENT;

export async function getWorkedTimes(
  settings: airtable_request,
): Promise<registration_time[]> {
  const records = await airtableRequest(
    `${AIRTABLE_HOST}/${USA_OPERATIONS_BASE}/${USA_WORKED_TIMES_TABLE}`,
    settings,
  );
  return records.map(
    (record): registration_time => ({
      ...record,
      category: 'WORKED',
      regular_hour_cost: record.regular_hour_cost,
    }),
  );
}

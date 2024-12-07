import { ENVIROMENT } from '../../../settings/enviroment';
import { airtable_request } from '../../../utils/run_airtable_request';
import airtableRequest from '../../../utils/run_airtable_request';
const { AIRTABLE_HOST, USA_PURCHASES_BASE, USA_PURCHASES_TABLE } = ENVIROMENT;

export type purchase = {
  id: string;
  cost_analysis_id: string;
  project_id: string;
  project_code: string;
  project_name: string;
  project_status: string;
  status_request: string;
  Category: string;
  total_cost: number;
};

export async function getPurchases(
  settings: airtable_request,
): Promise<purchase[]> {
  return await airtableRequest(
    `${AIRTABLE_HOST}/${USA_PURCHASES_BASE}/${USA_PURCHASES_TABLE}`,
    settings,
  );
}

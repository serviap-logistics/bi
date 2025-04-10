import { ENVIROMENT } from '../../../settings/enviroment';
import { airtable_request } from '../../../utils/run_airtable_request';
import airtableRequest from '../../../utils/run_airtable_request';

const {
  AIRTABLE_HOST,
  USA_PURCHASES_BASE,
  USA_PURCHASES_TABLE,
  MEX_PURCHASES_BASE,
  MEX_PURCHASES_TABLE,
  BRL_PURCHASES_BASE,
  BRL_PURCHASES_TABLE,
} = ENVIROMENT;

const countryParameters = {
  USA: {
    base: USA_PURCHASES_BASE,
    table: USA_PURCHASES_TABLE,
  },
  MEX: {
    base: MEX_PURCHASES_BASE,
    table: MEX_PURCHASES_TABLE,
  },
  BRL: {
    base: BRL_PURCHASES_BASE,
    table: BRL_PURCHASES_TABLE,
  },
};

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
  country: string,
  parameters: airtable_request,
): Promise<purchase[]> {
  const { base, table } = countryParameters[country];
  return await airtableRequest(`${AIRTABLE_HOST}/${base}/${table}`, parameters);
}

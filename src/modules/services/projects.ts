import { ENVIROMENT } from '../../settings/enviroment';
import { airtable_request } from '../../utils/run_airtable_request';
import airtableRequest from '../../utils/run_airtable_request';

const {
  AIRTABLE_HOST,
  USA_OPERATIONS_BASE,
  USA_PROJECTS_TABLE,
  MEX_OPERATIONS_BASE,
  MEX_PROJECTS_TABLE,
  BRL_OPERATIONS_BASE,
  BRL_PROJECTS_TABLE,
} = ENVIROMENT;

const countryParameters = {
  USA: {
    base: USA_OPERATIONS_BASE,
    table: USA_PROJECTS_TABLE,
  },
  MEX: {
    base: MEX_OPERATIONS_BASE,
    table: MEX_PROJECTS_TABLE,
  },
  BRL: {
    base: BRL_OPERATIONS_BASE,
    table: BRL_PROJECTS_TABLE,
  },
};

export type project = {
  id: string;
  project_id: string;
  project_code: string;
  project_name: string;
  Status: string;
  start_date: string;
  end_date: string;
  hour_registration_start_date: string;
  hour_registration_end_date: string;
  customer_name: string;
  cost_analysis_id: string;
  createdTime: string;
};

export async function getProjects(
  country: string,
  settings: airtable_request,
): Promise<project[]> {
  const { base, table } = countryParameters[country];
  return await airtableRequest(`${AIRTABLE_HOST}/${base}/${table}`, settings);
}

import { ENVIROMENT } from '../../settings/enviroment';
import { airtable_request } from '../../utils/run_airtable_request';
import airtableRequest from '../../utils/run_airtable_request';

const { AIRTABLE_HOST, USA_OPERATIONS_BASE, USA_PROJECTS_TABLE } = ENVIROMENT;

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
  settings: airtable_request,
): Promise<project[]> {
  return await airtableRequest(
    `${AIRTABLE_HOST}/${USA_OPERATIONS_BASE}/${USA_PROJECTS_TABLE}`,
    settings,
  );
}

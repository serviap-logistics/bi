import { ENVIROMENT } from '../settings/enviroment';
import { airtable_request_type } from '../types/airtable_request.type';
import { project_type } from '../types/project.type';
import airtableRequest from './utils/run_airtable_request';

const { AIRTABLE_HOST, USA_SALES_BASE, USA_SITES_TABLE } = ENVIROMENT;

export async function getSites(
  settings: airtable_request_type,
): Promise<project_type[]> {
  return await airtableRequest(
    `${AIRTABLE_HOST}/${USA_SALES_BASE}/${USA_SITES_TABLE}`,
    settings,
  );
}

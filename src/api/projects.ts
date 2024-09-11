import { ENVIROMENT } from '../settings/enviroment';
import { airtable_request_type } from '../types/airtable_request.type';
import { project_type } from '../types/project.type';
import airtableRequest from './utils/run_airtable_request';

const { AIRTABLE_HOST, USA_OPERATIONS_BASE, USA_PROJECTS_TABLE } = ENVIROMENT;

export async function getProjects(
  settings: airtable_request_type,
): Promise<project_type[]> {
  return await airtableRequest(
    `${AIRTABLE_HOST}/${USA_OPERATIONS_BASE}/${USA_PROJECTS_TABLE}`,
    settings,
  );
}

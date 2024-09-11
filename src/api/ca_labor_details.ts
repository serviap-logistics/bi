import { ENVIROMENT } from '../settings/enviroment';
import { airtable_request_type } from '../types/airtable_request.type';
import { ca_labor_detail_type } from '../types/ca_labor_detail.type';
import airtableRequest from './utils/run_airtable_request';

const { AIRTABLE_HOST, USA_SALES_BASE, USA_CA_LABOR_DETAILS_TABLE } =
  ENVIROMENT;

export async function getCALaborDetails(
  settings: airtable_request_type,
): Promise<ca_labor_detail_type[]> {
  return await airtableRequest(
    `${AIRTABLE_HOST}/${USA_SALES_BASE}/${USA_CA_LABOR_DETAILS_TABLE}`,
    settings,
  );
}

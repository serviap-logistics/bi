import { ENVIROMENT } from '../settings/enviroment';
import { airtable_request_type } from '../types/airtable_request.type';
import { purchase_type } from '../types/purchase.type';
import airtableRequest from './utils/run_airtable_request';
const { AIRTABLE_HOST, USA_PURCHASES_BASE, USA_PURCHASES_TABLE } = ENVIROMENT;

export async function getPurchases(
  settings: airtable_request_type,
): Promise<purchase_type[]> {
  return await airtableRequest(
    `${AIRTABLE_HOST}/${USA_PURCHASES_BASE}/${USA_PURCHASES_TABLE}`,
    settings,
  );
}

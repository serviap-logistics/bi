import { ENVIROMENT } from '../settings/enviroment';
import airtableRequest, {
  airtable_request,
} from './utils/run_airtable_request';

const { AIRTABLE_HOST, USA_SALES_BASE, USA_SITES_TABLE } = ENVIROMENT;

export type site = {
  site_id: string;
  site_code: string;
  customer_id: string;
  site_address: string;
};

export async function getSites(settings: airtable_request): Promise<site[]> {
  return await airtableRequest(
    `${AIRTABLE_HOST}/${USA_SALES_BASE}/${USA_SITES_TABLE}`,
    settings,
  );
}

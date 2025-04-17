import { ENVIROMENT } from '../../../../settings/enviroment';
import airtableRequest, {
  airtable_request,
} from '../../../../utils/run_airtable_request';

const {
  AIRTABLE_HOST,
  USA_SALES_BASE,
  USA_SITES_TABLE,
  MEX_SALES_BASE,
  MEX_SITES_TABLE,
  BRL_SALES_BASE,
  BRL_SITES_TABLE,
} = ENVIROMENT;

export type site = {
  site_id: string;
  site_code: string;
  customer_id: string;
  site_address: string;
};

const countryParameters = {
  USA: {
    base: USA_SALES_BASE,
    table: USA_SITES_TABLE,
  },
  MEX: {
    base: MEX_SALES_BASE,
    table: MEX_SITES_TABLE,
  },
  BRL: {
    base: BRL_SALES_BASE,
    table: BRL_SITES_TABLE,
  },
};

export async function getSites(
  country,
  settings: airtable_request,
): Promise<site[]> {
  const { base, table } = countryParameters[country];
  return await airtableRequest(`${AIRTABLE_HOST}/${base}/${table}`, settings);
}

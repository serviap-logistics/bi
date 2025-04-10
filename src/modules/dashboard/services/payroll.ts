import { ENVIROMENT } from '../../../settings/enviroment';
import airtableRequest, {
  airtable_request,
} from '../../../utils/run_airtable_request';

const {
  AIRTABLE_HOST,
  USA_PEOPLE_BASE,
  USA_PAYROLL_TABLE,
  MEX_PEOPLE_BASE,
  MEX_PAYROLL_TABLE,
  BRL_PEOPLE_BASE,
  BRL_PAYROLL_TABLE,
} = ENVIROMENT;

const countryParameters = {
  USA: {
    base: USA_PEOPLE_BASE,
    table: USA_PAYROLL_TABLE,
  },
  MEX: {
    base: MEX_PEOPLE_BASE,
    table: MEX_PAYROLL_TABLE,
  },
  BRL: {
    base: BRL_PEOPLE_BASE,
    table: BRL_PAYROLL_TABLE,
  },
};

export type payroll = {
  id: string;
  project_id: string;
  total_payroll: number;
};

export async function getProjects(
  country: string,
  settings: airtable_request,
): Promise<payroll[]> {
  const { base, table } = countryParameters[country];
  return await airtableRequest(`${AIRTABLE_HOST}/${base}/${table}`, settings);
}

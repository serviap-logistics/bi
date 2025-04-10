import { ENVIROMENT } from '../../settings/enviroment';
import { airtable_request } from '../../utils/run_airtable_request';
import airtableRequest from '../../utils/run_airtable_request';

const {
  AIRTABLE_HOST,
  USA_SALES_BASE,
  USA_COST_ANALYSIS_TABLE,
  MEX_SALES_BASE,
  MEX_COST_ANALYSIS_TABLE,
  BRL_SALES_BASE,
  BRL_COST_ANALYSIS_TABLE,
} = ENVIROMENT;

const countryParameters = {
  USA: {
    base: USA_SALES_BASE,
    table: USA_COST_ANALYSIS_TABLE,
  },
  MEX: {
    base: MEX_SALES_BASE,
    table: MEX_COST_ANALYSIS_TABLE,
  },
  BRL: {
    base: BRL_SALES_BASE,
    table: BRL_COST_ANALYSIS_TABLE,
  },
};

export type cost_analysis = {
  id: string;
  createdTime: string;

  cost_analysis_id: string;
  Status?: string;
  project_name?: string;
  ca_start_date?: string;
  start_date?: string;
  end_date?: string;
  total_cost: number;
  // Labor
  total_labor_perdiem_count?: number;
  total_labor_perdiem_cost?: number;
  total_labor_hours?: number;
  total_labor_cost?: number;
  total_labor_staffing_cost?: number;

  // Expenses
  total_purchases_cost?: number;
  total_material_cost?: number;
  total_equipment_cost?: number;
  total_subcontractor_cost?: number;
  total_lodge_cost?: number;
  total_miscelanea_cost?: number;
};

export async function getCostAnalysis(
  country: string,
  settings: airtable_request,
): Promise<cost_analysis[]> {
  const { base, table } = countryParameters[country];
  const response = await airtableRequest(
    `${AIRTABLE_HOST}/${base}/${table}`,
    settings,
  );
  return response;
}

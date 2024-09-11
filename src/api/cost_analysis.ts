import { ENVIROMENT } from '../settings/enviroment';
import { airtable_request_type } from '../types/airtable_request.type';
import { cost_analysis_type } from '../types/cost_analysis.type';
import airtableRequest from './utils/run_airtable_request';

const { AIRTABLE_HOST, USA_SALES_BASE, USA_COST_ANALYSIS_TABLE } = ENVIROMENT;

export async function getCostAnalysis(
  settings: airtable_request_type,
): Promise<cost_analysis_type[]> {
  const response = await airtableRequest(
    `${AIRTABLE_HOST}/${USA_SALES_BASE}/${USA_COST_ANALYSIS_TABLE}`,
    settings,
  );
  return response;
}

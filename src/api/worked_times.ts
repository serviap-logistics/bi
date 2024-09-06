import { ENVIROMENT } from "../settings/enviroment"
import { airtable_request_type } from "../types/airtable_request.type"
import { registration_time_type } from "../types/registration_time.type"
import airtableRequest from "./utils/run_airtable_request"
const {AIRTABLE_HOST, USA_OPERATIONS_BASE, USA_WORKED_TIMES_TABLE} = ENVIROMENT

export async function getWorkedTimes(settings: airtable_request_type) : Promise<registration_time_type[]> {
  const records = await airtableRequest(`${AIRTABLE_HOST}/${USA_OPERATIONS_BASE}/${USA_WORKED_TIMES_TABLE}`, settings)
  return records.map((record) => ({...record, category: 'WORKED'}))
}

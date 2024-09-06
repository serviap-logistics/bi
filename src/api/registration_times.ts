import { registration_time_type } from "../types/registration_time.type"
import { getTravelTimes } from "./travel_times"
import { getWaitingTimes } from "./waiting_times"
import { getWorkedTimes } from "./worked_times"

export async function getRegistrationTimes(settings: {worked: boolean, travel: boolean, waiting: boolean, project_id: string}) : Promise<registration_time_type[]> {
  const {worked, travel, waiting, project_id} = settings
  let times_found : registration_time_type[] = []

  if(travel) {
    const travel_times = await getTravelTimes({
      view: 'BI',
      formula: project_id ? encodeURI(`project_id='${project_id}'`) : undefined,
      fields: [
        'project_id', 'employee_id', 'employee_role', 'start_date', 'end_date',
        'regular_hour_cost', 'overtime_hour_cost',
        'regular_hours', 'overtime_hours', 'total_hours',
        'regular_cost', 'overtime_cost', 'total_cost'
      ],
    })
    times_found.push(...travel_times)
  }
  if (worked) {
    const worked_times = await getWorkedTimes({
      view: 'BI',
      formula: project_id ? encodeURI(`project_id='${project_id}'`) : undefined,
      fields: [
        'project_id', 'employee_id', 'employee_role', 'start_date', 'end_date',
        'regular_hour_cost', 'overtime_hour_cost',
        'regular_hours', 'overtime_hours', 'total_hours',
        'regular_cost', 'overtime_cost', 'total_cost'
      ],
    })
    times_found.push(...worked_times)
  }
  if(waiting) {
    const waiting_times = await getWaitingTimes({
      view: 'BI',
      formula: project_id ? encodeURI(`project_id='${project_id}'`) : undefined,
      fields: [
        'project_id', 'employee_id', 'employee_role', 'start_date', 'end_date',
        'regular_hour_cost', 'overtime_hour_cost',
        'regular_hours', 'overtime_hours', 'total_hours',
        'regular_cost', 'overtime_cost', 'total_cost'
      ],
    })
    times_found.push(...waiting_times)
  }
  return times_found
}

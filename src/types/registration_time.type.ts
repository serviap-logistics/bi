export type registration_time_type = {
  id: string,
  createdTime: string,
  category: 'WORKED' | 'TRAVEL' | 'WAITING',

  project_id: string,
  employee_id: string,
  employee_role: string,
  start_date: string,
  end_date: string,
  regular_hour_cost: number,
  overtime_hour_cost: number,
  regular_hours: number,
  overtime_hours: number,
  total_hours: number,
  regular_cost: number,
  overtime_cost: number,
  total_cost: number,
}
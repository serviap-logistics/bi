export type registration_time_type = {
  id: string;
  createdTime: string;
  category: 'WORKED' | 'TRAVEL' | 'WAITING';

  project_id: string;
  project_name: string;
  project_start_date: string;
  project_end_date: string;
  site_name: string;
  site_address: string;
  employee_id: string;
  employee_role: string;
  week: string;
  start_date: string;
  end_date: string;
  // Regular
  regular_hour_cost: number;
  regular_hours: number | undefined;
  regular_cost: number | undefined;
  // Overtime
  overtime_hour_cost: number;
  overtime_hours: number | undefined;
  overtime_cost: number | undefined;
  // Total
  total_hours: number;
  subtotal: number | undefined;
  // Week
  week_hours: number | undefined;
  // Perdiem
  perdiem: boolean;
};

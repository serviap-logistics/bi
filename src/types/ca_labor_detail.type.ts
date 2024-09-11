export type ca_labor_detail_type = {
  id: string;
  createdTime: string;

  cost_analysis_id: string;
  date: string;
  employee_role: string;
  people_quantity: number;

  // Worked
  worked_hours: number;
  worked_hour_cost: number;
  subtotal_worked_hours: number;
  // Worked Overtime
  worked_overtime_hours: number;
  worked_overtime_hour_cost: number;
  subtotal_worked_overtime: number;
  // Travel
  travel_hours: number;
  travel_hour_cost: number;
  subtotal_travel_hours: number;
  // Travel Overtime
  travel_overtime_hours: number;
  travel_overtime_hour_cost: number;
  subtotal_travel_overtime: number;
  // Waiting
  waiting_hours: number;
  waiting_hour_cost: number;
  subtotal_waiting_cost: number;

  perdiem_count: number;
  total_perdiem: number;
  total_cost: number;
  total_hours: number;
};

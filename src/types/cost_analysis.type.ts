export type cost_analysis_type = {
  id: string;
  createdTime: string;

  cost_analysis_id: string;
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

  total_material_cost?: number;
  total_equipment_cost?: number;
  total_subcontractor_cost?: number;
  total_lodge_cost?: number;
  total_miscelanea_cost?: number;
};

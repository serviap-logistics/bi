import { ENVIROMENT } from '../../../../settings/enviroment';
import airtableRequest, {
  airtable_request,
} from '../../../../utils/run_airtable_request';

const { AIRTABLE_HOST, USA_OPERATIONS_BASE, USA_TIMES_BY_DAY_TABLE } =
  ENVIROMENT;

export type times_by_day = {
  id: string;
  createdTime: string;
  date: string;
  employee_role: string;
  // Projects
  day_projects: string;
  // Perdiem
  perdiem_per_project: number;
  perdiem_cost: number;
};

/**
 * Función encargada de consultar la tabla "Hours Details", la cual tiene totales POR DÍA de los registros de hora.
 * @param settings Configuración inicial de la petición, se indica la vista a buscar, los campos y la fórmula.
 * @returns Lista de registros encontrados, utilizando la estructura "times_by_day"
 */
export async function getTimesByDay(
  settings: airtable_request,
): Promise<times_by_day[]> {
  const records = await airtableRequest(
    `${AIRTABLE_HOST}/${USA_OPERATIONS_BASE}/${USA_TIMES_BY_DAY_TABLE}`,
    settings,
  );
  return records;
}

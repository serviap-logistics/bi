import { useContext, useEffect, useState } from 'react';
import {
  getRegistrationTimes,
  registration_time,
} from '../../headcount/services/registration_times';
import {
  cloneObject,
  getPercentageUsed,
  groupListBy,
  USDollar,
} from '../../../utils';
import { ReportTypeContext } from '../components/allProjects';
import {
  getPurchases as getAirtablePurchases,
  purchase,
} from '../../purchases/services/purchases';
import { cost_analysis, getCostAnalysis } from '../../services/cost_analysis';
import { getProjects } from '../../services/projects';
import getPerdiems from '../../headcount/services/perdiems';
import Toast from '../../../utils/components/toast';
import { excel_column } from '../../../utils/excel';
import Table from '../../../utils/components/table';
import Alert from '../../../utils/components/notifications/alert';
import { CountryContext } from '../../../App';

function CustomCellData(props: {
  project_code: string;
  project_name: string;
  start_date: string;
  end_date: string;
  status: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-slate-800">{props.project_code}</span>
      <span className="text-xs text-slate-500 text-wrap">
        {props.project_name}
      </span>
      <span className="text-xs text-slate-700 text-wrap font-semibold">
        {props.status ?? <p className="text-red-400">Status not specified</p>}
      </span>
      {props.start_date && (
        <span className="text-xs text-slate-500">
          Start: {props.start_date}
        </span>
      )}
      {props.end_date && (
        <span className="text-xs text-slate-500">
          Completion: {props.end_date}
        </span>
      )}
    </div>
  );
}

export default function AllProjectsTableByAmounts(props: {
  excelRowsCallback: any;
  excelColumnsCallback: any;
  projects: object;
}) {
  const { excelRowsCallback, excelColumnsCallback } = props;
  const reportType = useContext(ReportTypeContext);
  const country = useContext(CountryContext);

  const [budgets, setBudgets] = useState<object>({});
  const [reals, setReals] = useState<object>({});
  const [rows, setRows] = useState<any[]>([]);
  const [indicators, setIndicators] = useState<object>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [projectsAvailable, setProjectsAvailable] = useState<object>({});

  const updateProjectsAvailable = async () => {
    const result = {};
    const projectsFound = await getProjects(country, {
      view: 'BI',
      fields: [
        'project_id',
        'project_name',
        'cost_analysis_id',
        'Status',
        'start_date',
        'end_date',
      ],
    });

    // Se obtienen almacenan los proyectos que si TIENEN UN analisis de costos
    // además de guardarlos en el catálogo 'result'.
    const usedAnalysis = projectsFound
      .filter((project) => project.cost_analysis_id != undefined)
      .map((project) => {
        result[project.project_id] = {
          name: project?.project_name,
          status: project?.Status,
          start_date: project?.start_date,
          end_date: project?.end_date,
          type: 'project',
        };
        return project.cost_analysis_id;
      });

    const analysisFound = await getCostAnalysis(country, {
      view: 'BI',
      fields: [
        'cost_analysis_id',
        'project_name',
        'Status',
        'start_date',
        'end_date',
      ],
    });

    // Se obtienen todos los analisis de costos que NO esten asignados a un projecto.
    analysisFound
      .filter((analysis) => !usedAnalysis.includes(analysis.cost_analysis_id))
      .map((analysis) => {
        result[analysis.cost_analysis_id] = {
          name: analysis.project_name,
          status: analysis.Status,
          start_date: analysis.start_date,
          end_date: analysis.end_date,
          type: 'cost_analysis',
        };
      });

    setProjectsAvailable(result);
  };

  const getPurchases = async (): Promise<purchase[]> => {
    const purchases_found: purchase[] = await getAirtablePurchases(country, {
      view: 'BI',
      fields: [
        'cost_analysis_id',
        'project_id',
        'project_code',
        'project_name',
        'project_status',
        'project_start_date',
        'project_end_date',
        'status_request',
        'Category',
        'total_cost',
      ],
    });
    return purchases_found;
  };

  const updateBudget = async () => {
    const budget_costs: cost_analysis[] = await getCostAnalysis(country, {
      view: 'BI',
      fields: [
        'cost_analysis_id',
        'cost_analysis_code',
        'total_cost',
        'project_name',
        'start_date',
        'end_date',
      ],
    });
    const budget_formatted = budget_costs.map(
      ({
        cost_analysis_id,
        total_cost,
        project_name,
        start_date,
        end_date,
      }) => ({
        cost_analysis_id: cost_analysis_id,
        total_cost: total_cost,
        project_name: project_name,
        start_date: start_date,
        end_date: end_date,
      }),
    );
    const grouped_by_CA = groupListBy('cost_analysis_id', budget_formatted);
    const reduced_CA = cloneObject(grouped_by_CA);
    Object.entries(reduced_CA).map(
      ([cost_analysis_id, CAs_found]: [string, any]) => {
        reduced_CA[cost_analysis_id] = CAs_found.reduce(
          (total, cost_analysis) => cost_analysis.total_cost + total,
          0,
        );
      },
    );
    setBudgets(reduced_CA);
  };

  const updateReal = async () => {
    // Calculando costos de compras POR proyecto.
    const purchases = await getPurchases();
    const purchases_grouped_by_project = groupListBy('project_id', purchases);
    const reduced_purchases = cloneObject(purchases_grouped_by_project);
    Object.entries(reduced_purchases).map(
      ([project, purchases]: [string, any]) => {
        reduced_purchases[project] = purchases.reduce(
          (total, purchase) => purchase.total_cost + total,
          0,
        );
      },
    );

    // Calculando costos de horas POR proyecto.
    const real_times: registration_time[] = await getRegistrationTimes({
      worked: true,
      travel: true,
      waiting: true,
    });
    const times_formatted = real_times.map(
      (time_registered: registration_time) => {
        return {
          project_id: time_registered.project_id,
          project_start_date: time_registered.project_start_date,
          project_end_date: time_registered.project_end_date,
          subtotal: time_registered.subtotal,
        };
      },
    );
    const times_grouped_by_project = groupListBy('project_id', times_formatted);
    const reduced_hours = cloneObject(times_grouped_by_project);
    Object.entries(reduced_hours).map(
      ([project, times_found]: [string, any]) => {
        reduced_hours[project] = times_found.reduce(
          (total, time_record) => time_record.subtotal + total,
          0,
        );
      },
    );
    // Calculando gastos de perdiem POR proyecto.
    const perdiems = await getPerdiems();
    const perdiems_by_project = {};
    perdiems.map((perdiem) => {
      perdiem.day_projects.map((project_id) => {
        if (!perdiems_by_project[project_id])
          perdiems_by_project[project_id] = perdiem.perdiem_cost;
        else perdiems_by_project[project_id] += perdiem.perdiem_cost;
      });
    });

    // Mezclando resultados entre costos por compras + costos por horas.
    // Por defecto, el objeto final tendra al menos los datos de compras
    // y se iran agregando elementos al objeto si existen registros de horas.
    const merged_totals = cloneObject(reduced_purchases);
    Object.entries(reduced_hours).map(([project, total]) => {
      // Si no existe el proyecto en el objeto con compras, se agrega con el valor
      // inicial igua al costo de horas de ese proyecto.
      // Si ya existe, solo se suma el costo de horas al costo de compras.
      if (!merged_totals[project]) merged_totals[project] = total;
      else merged_totals[project] += total;
    });
    // Se agregan los costos de perdiems
    Object.entries(perdiems_by_project).map(([project, total]) => {
      // Si hasta el momento el proyecto no existe en el diccionario de resultados,
      // se agrega.
      // Si ya existe, solo se suma el costo de perdiem al resultado obtenido
      // anteriormente (horas + compras)
      if (!merged_totals[project]) merged_totals[project] = total;
      else merged_totals[project] += total;
    });
    setReals(merged_totals);
  };

  /**
   * Esta funcion se encarga de mezclar los resultados obtenidos en budgets, con los obtenidos en reales.
   * Se obtiene como resultado, un nuevo objeto con varias propiedades.
   * {project_id: {budget: number, real: number, difference: number, percentage_used: number}}
   */
  const mergeResults = () => {
    const results = {};
    // Se agregan los resultados de budgets.
    Object.entries(budgets).map(([project, budget_total]) => {
      results[project] = {
        budget: budget_total,
        // El resto de valores se colocan por defecto en 0, seran calculados mas adelante cuando
        // se mezclen los valores reales.
        real: 0,
        difference: 0,
        percentage: 0,
      };
    });
    // Se agregan los resultados de totales reales.
    Object.entries(reals).map(([project, real_total]) => {
      if (!results[project])
        results[project] = {
          budget: 0,
          real: real_total,
          difference: 0,
          percentage: 0,
        };
      else results[project] = { ...results[project], real: real_total };
    });
    // Se calculan las diferencias y los porcentajes.
    Object.entries(results).map(([project, values]: [string, any]) => {
      results[project].difference = values.budget - values.real;
      results[project].percentage = getPercentageUsed(
        values.budget,
        values.real,
      );
    });
    setIndicators(results);
  };

  const formatAsTable = (projectsAvailable) => {
    // Se genera un arreglo que representa los renglones en la tabla.
    // Cada renglon tiene los totales POR DIA.
    const rows = Object.entries(indicators).map(([project_id, values]) => {
      return [
        // Celda 1: Datos del proyecto.
        <CustomCellData
          project_code={
            project_id ??
            (country === 'USA'
              ? 'Project without code!'
              : 'Proyecto sin código')
          }
          project_name={
            projectsAvailable[project_id]?.name ??
            `Unnamed ${projectsAvailable[project_id]?.type.replace('_', ' ')}`
          }
          start_date={projectsAvailable[project_id]?.start_date}
          end_date={projectsAvailable[project_id]?.end_date}
          status={projectsAvailable[project_id]?.status}
        />,
        // Celda 2: Presupuesto (dependiendo del tipo de reporte)
        USDollar.format(values.budget) +
          (country === 'USA' ? ' USD' : country === 'MEX' ? 'MXN' : 'BRL'),
        // Celda 3: Real (dependiendo del tipo de reporte)
        USDollar.format(values.real) +
          (country === 'USA' ? ' USD' : country === 'MEX' ? 'MXN' : 'BRL'),
        // Celda 4: Diferencia (dependiendo del tipo de reporte)
        USDollar.format(values.difference) +
          (country === 'USA' ? ' USD' : country === 'MEX' ? 'MXN' : 'BRL'),
        // Celda 5: % Usado (dependiendo del tipo de reporte)
        <Toast
          text={
            values.percentage.status !== 'NO BUDGET!'
              ? values.percentage.value.toFixed(2) +
                '% ' +
                values.percentage.status
              : 'NO BUDGET!'
          }
          text_size="text-sm"
          color={values.percentage.color}
        />,
      ];
    });
    setRows(rows);
    setLoading(false);
    const columns: excel_column[] = [
      {
        header: country === 'USA' ? 'Project ID' : 'ID de Proyecto',
        key: 'PROJECT_ID',
        width: 25,
      },
      {
        header: country === 'USA' ? 'Project Name' : 'Nombre de proyecto',
        key: 'PROJECT_NAME',
        width: 40,
      },
      {
        header: country === 'USA' ? 'Proyect Status' : 'Estatus del proyecto',
        key: 'PROJECT_STATUS',
        width: 20,
      },
      {
        header: country === 'USA' ? 'Start Date' : 'Fecha de inicio',
        key: 'START_DATE',
        width: 20,
      },
      {
        header: country === 'USA' ? 'End Date' : 'Fecha de término',
        key: 'END_DATE',
        width: 20,
      },
      {
        header: country === 'USA' ? 'Budget' : 'Presupuesto',
        key: 'BUDGET',
        width: 18,
      },
      { header: 'Real', key: 'REAL', width: 18 },
      {
        header: country === 'USA' ? 'Difference' : 'Diferencia',
        key: 'DIFF',
        width: 18,
      },
      {
        header: country === 'USA' ? 'Budget Status' : 'Estatus del presupuesto',
        key: 'USED',
        width: 13,
      },
    ];
    excelColumnsCallback(columns);
    const table_rows = rows.map((row) => [
      (row[0] as JSX.Element).props.project_code,
      (row[0] as JSX.Element).props.project_name,
      (row[0] as JSX.Element).props.status,
      (row[0] as JSX.Element).props.start_date,
      (row[0] as JSX.Element).props.end_date,
      ...row.slice(1, 4),
      (row[4] as JSX.Element).props.text,
    ]);
    excelRowsCallback(table_rows);
  };

  useEffect(() => {
    if (Object.keys(indicators).length > 0) {
      formatAsTable(projectsAvailable);
    }
  }, [indicators, reportType, projectsAvailable]);

  useEffect(() => {
    if (Object.keys(budgets).length > 0 || Object.keys(reals).length > 0) {
      mergeResults();
    }
  }, [budgets, reals]);

  useEffect(() => {
    updateProjectsAvailable();
    updateBudget();
    updateReal();
  }, []);

  return (
    <div className="max-w-full relative">
      {loading && (
        <div className="py-4">
          <Alert
            status="warning"
            label="Loading"
            details={
              country === 'USA'
                ? 'Generating, this could take a few seconds.'
                : 'Generando, esto podría tardar algunos segundos.'
            }
          />
        </div>
      )}
      {!loading && (
        <Table
          columns={
            country === 'USA'
              ? ['Project', 'Budget', 'Real', 'Difference', 'Status']
              : ['Proyecto', 'Presupuesto', 'Real', 'Diferencia', 'Estatus']
          }
          rows={rows}
          styles={{
            vertical_lines: true,
            dynamic_headers: false,
            row_height: 'xs',
            rows: {
              remark_label: true,
              static_label: false,
            },
            static_headers: true,
            max_height: 'max-h-[27rem]',
          }}
        />
      )}
    </div>
  );
}

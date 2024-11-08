import { useContext, useEffect, useState } from 'react';
import Table from '../utils/table';
import { getRegistrationTimes } from '../../api/registration_times';
import { cost_analysis_type } from '../../types/cost_analysis.type';
import { registration_time_type } from '../../types/registration_time.type';
import {
  cloneObject,
  excel_column,
  getPercentageUsed,
  groupListBy,
  USDollar,
} from '../../utils';
import Toast from '../utils/toast';
import Alert from '../utils/alert';
import { ReportTypeContext } from './allProjects';
import { purchase_type } from '../../types/purchase.type';
import { getPurchases as getAirtablePurchases } from '../../api/purchases';
import { getCostAnalysis } from '../../api/cost_analysis';

function CustomCellData(props: {
  project_id: string;
  project_name: string;
  start_date: string;
  end_date: string;
}) {
  return (
    <div className="flex flex-col">
      <span>{props.project_id}</span>
      <span className="text-xs text-slate-400 text-wrap">
        {props.project_name}
      </span>
      <span className="text-xs text-slate-400">Start: {props.start_date}</span>
      <span className="text-xs text-slate-400">
        Completion: {props.end_date}
      </span>
    </div>
  );
}

export default function AllProjectsTableByWeek(props: {
  excelRowsCallback: any;
  excelColumnsCallback: any;
}) {
  const { excelRowsCallback, excelColumnsCallback } = props;
  const reportType = useContext(ReportTypeContext);

  const [budgets, setBudgets] = useState<object>({});
  const [reals, setReals] = useState<object>({});
  const [rows, setRows] = useState<any[]>([]);
  const [indicators, setIndicators] = useState<object>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [projectsAvailable] = useState<object>({});
  const [costAnalysisAvailable, setCostAnalysisAvailable] = useState<object>(
    {},
  );

  const getPurchases = async (): Promise<purchase_type[]> => {
    const purchases_found: purchase_type[] = await getAirtablePurchases({
      view: 'BI',
      fields: [
        'cost_analysis_id',
        'project_id',
        'project_name',
        'week',
        'site_name',
        'site_address',
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
    const budget_costs: cost_analysis_type[] = await getCostAnalysis({
      view: 'BI',
      fields: [
        'cost_analysis_id',
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
    const reduced_names_CA = cloneObject(grouped_by_CA);
    Object.entries(reduced_CA).map(
      ([cost_analysis_id, CAs_found]: [string, any]) => {
        reduced_CA[cost_analysis_id] = CAs_found.reduce(
          (total, cost_analysis) => cost_analysis.total_cost + total,
          0,
        );
        // En teoria, todos los analisis de costos cuentan con un nombre aparte del ID de cotizacion
        // por lo tanto, siempre habra al menos un dato.
        reduced_names_CA[cost_analysis_id] = {
          name: [
            ...new Set(
              CAs_found.map((cost_analysis) => cost_analysis.project_name),
            ),
          ][0],
          start_date: [
            ...new Set(
              CAs_found.map((cost_analysis) => cost_analysis.start_date),
            ),
          ][0],
          end_date: [
            ...new Set(
              CAs_found.map((cost_analysis) => cost_analysis.end_date),
            ),
          ][0],
          status: 'On Quotation',
        };
      },
    );
    setCostAnalysisAvailable(reduced_names_CA);
    setBudgets(reduced_CA);
  };

  const updateReal = async () => {
    // Calculando costos de compras POR proyecto.
    const purchases = await getPurchases();
    const purchases_grouped_by_project = groupListBy('project_id', purchases);
    const purchases_by_site = {};
    Object.entries(purchases_grouped_by_project).map(
      ([project, purchases]: [string, any]) => {
        purchases_by_site[project] = {};
        const purchases_grouped = groupListBy('site_name', purchases);
        Object.entries(purchases_grouped).map(
          ([site, site_purchases]: [string, any]) => {
            purchases_by_site[project][site] = {};
            const purchases_by_week = groupListBy('week', site_purchases);
            Object.entries(purchases_by_week).map(
              ([week, week_purchases]: [string, any]) => {
                purchases_by_site[project][site][week] = week_purchases.reduce(
                  (total, purchase) => total + purchase.total_cost,
                  0,
                );
              },
            );
          },
        );
      },
    );
    console.log('Purchases: ', purchases_by_site);

    // Calculando costos de horas POR proyecto.
    const real_times: registration_time_type[] = await getRegistrationTimes({
      worked: true,
      travel: true,
      waiting: true,
    });
    const times_formatted = real_times.map(
      (time_registered: registration_time_type) => {
        return {
          project_id: time_registered.project_id,
          site_name: time_registered.site_name,
          week: time_registered.week,
          subtotal: time_registered.subtotal,
        };
      },
    );
    const times_grouped_by_project = groupListBy('project_id', times_formatted);
    const hours_by_site = {};
    Object.entries(times_grouped_by_project).map(
      ([project, times_found]: [string, any]) => {
        hours_by_site[project] = {};
        const times_grouped = groupListBy('site_name', times_found);
        Object.entries(times_grouped).map(
          ([site, site_times]: [string, any]) => {
            hours_by_site[project][site] = {};
            const times_by_week = groupListBy('week', site_times);
            Object.entries(times_by_week).map(
              ([week, week_times]: [string, any]) => {
                hours_by_site[project][site][week] = week_times.reduce(
                  (total, time_record) => time_record.subtotal + total,
                  0,
                );
              },
            );
          },
        );
      },
    );
    console.log('Times: ', hours_by_site);

    // Mezclando resultados entre costos por compras + costos por horas.
    // Por defecto, el objeto final tendra al menos los datos de compras
    // y se iran agregando elementos al objeto si existen registros de horas.
    const merged_totals = cloneObject(purchases_by_site);
    Object.entries(hours_by_site).map(([project, sites]: [string, any]) => {
      Object.entries(sites).map(([site, weeks]: [string, any]) => {
        Object.entries(weeks).map(([week, total]: [string, any]) => {
          if (!merged_totals[project]) merged_totals[project] = {};
          if (!merged_totals[project][site]) merged_totals[project][site] = {};
          // Si no existe el proyecto en el objeto con compras, se agrega con el valor
          // inicial igua al costo de horas de ese proyecto.
          // Si ya existe, solo se suma el costo de horas al costo de compras.
          if (!merged_totals[project][site][week])
            merged_totals[project][site][week] = total;
          else merged_totals[project][site][week] += total;
        });
      });
    });
    console.log('Merged: ', merged_totals);
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

  const formatAsTable = () => {
    const project_names = { ...costAnalysisAvailable, ...projectsAvailable };
    // Se genera un arreglo que representa los renglones en la tabla.
    // Cada renglon tiene los totales POR DIA.
    const rows = Object.entries(indicators).map(([project_id, values]) => {
      // Celda 1: Fecha
      const project = project_id;
      // Celda 2: Presupuesto (dependiendo del tipo de reporte)
      const budget = USDollar.format(values.budget) + ' USD';
      // Celda 3: Real (dependiendo del tipo de reporte)
      const real = USDollar.format(values.real) + ' USD';
      // Celda 4: Diferencia (dependiendo del tipo de reporte)
      const difference = USDollar.format(values.difference) + ' USD';
      // Celda 5: % Usado (dependiendo del tipo de reporte)
      const percentage_used = values.percentage.toFixed(2);
      return [
        <CustomCellData
          project_id={project}
          project_name={project_names[project].name}
          start_date={project_names[project].start_date}
          end_date={project_names[project].end_date}
        />,
        budget,
        real,
        difference,
        <Toast
          text={percentage_used + '%'}
          text_size="text-sm"
          color={
            percentage_used <= 50
              ? 'success'
              : percentage_used <= 70
                ? 'info'
                : percentage_used <= 90
                  ? 'warning'
                  : 'error'
          }
        />,
      ];
    });
    // console.log('Rows: ', rows);
    setRows(rows);
    setLoading(false);
    const columns: excel_column[] = [
      { header: 'Project ID', key: 'PROJECT_ID', width: 25 },
      { header: 'Project Name', key: 'PROJECT_NAME', width: 40 },
      { header: 'Budget', key: 'BUDGET', width: 18 },
      { header: 'Real', key: 'REAL', width: 18 },
      { header: 'Difference', key: 'DIFF', width: 18 },
      { header: '% Used', key: 'USED', width: 13 },
    ];
    excelColumnsCallback(columns);
    const table_rows = rows.map((row) => [
      (row[0] as JSX.Element).props.project_id,
      (row[0] as JSX.Element).props.project_name,
      ...row.slice(1, 4),
      (row[4] as JSX.Element).props.text,
    ]);
    excelRowsCallback(table_rows);
  };

  useEffect(() => {
    if (Object.keys(indicators).length > 0) {
      formatAsTable();
    }
  }, [indicators, reportType]);

  useEffect(() => {
    if (Object.keys(budgets).length > 0 || Object.keys(reals).length > 0) {
      mergeResults();
    }
  }, [budgets, reals]);

  useEffect(() => {
    if (Object.keys(costAnalysisAvailable).length > 0) {
      console.log('New CAs! ', costAnalysisAvailable);
      console.log('Count:', Object.keys(costAnalysisAvailable).length);
    }
  }, [costAnalysisAvailable]);

  useEffect(() => {
    if (Object.keys(projectsAvailable).length > 0) {
      console.log('New projects! ', projectsAvailable);
      console.log('Count:', Object.keys(projectsAvailable).length);
    }
  }, [projectsAvailable]);

  useEffect(() => {
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
            details="We are generating table, this could take a few seconds."
          />
        </div>
      )}
      {!loading && (
        <Table
          columns={['Project', 'Budget', 'Real', 'Difference', '% Used']}
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

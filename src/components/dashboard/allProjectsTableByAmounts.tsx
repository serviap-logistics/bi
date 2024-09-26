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

export default function AllProjectsTableByAmounts(props: {
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

  const getPurchases = async (): Promise<purchase_type[]> => {
    const purchases_found: purchase_type[] = await getAirtablePurchases({
      view: 'BI',
      fields: [
        'cost_analysis_id',
        'project_id',
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
      fields: ['cost_analysis_id', 'total_cost'],
    });
    const budget_formatted = budget_costs.map(
      ({ cost_analysis_id, total_cost }) => ({
        cost_analysis_id: cost_analysis_id,
        total_cost: total_cost,
      }),
    );
    const grouped_by_CA = groupListBy('cost_analysis_id', budget_formatted);
    const reduced_CA = cloneObject(grouped_by_CA);
    Object.entries(reduced_CA).map(
      ([cost_analysis_id, CAs_found]: [string, any]) =>
        (reduced_CA[cost_analysis_id] = CAs_found.reduce(
          (total, cost_analysis) => cost_analysis.total_cost + total,
          0,
        )),
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
    const real_times: registration_time_type[] = await getRegistrationTimes({
      worked: true,
      travel: true,
      waiting: true,
    });
    const times_formatted = real_times.map(
      (time_registered: registration_time_type) => {
        return {
          project_id: time_registered.project_id,
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
        project,
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
    setRows(rows);
    setLoading(false);
    const columns: excel_column[] = [
      { header: 'Project', key: 'PROJECT', width: 25 },
      { header: 'Budget', key: 'BUDGET', width: 18 },
      { header: 'Real', key: 'REAL', width: 18 },
      { header: 'Difference', key: 'DIFF', width: 18 },
      { header: '% Used', key: 'USED', width: 13 },
    ];
    excelColumnsCallback(columns);
    const table_rows = rows.map((row) => [
      ...row.slice(0, 4),
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

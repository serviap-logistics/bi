import { useContext, useEffect, useState } from 'react';
import Table from '../utils/table';
import { getRegistrationTimes } from '../../api/registration_times';
import { cost_analysis_type } from '../../types/cost_analysis.type';
import { CostAnalysisContext, ProjectContext } from '.';
import { ReportTypeContext } from './reportByType';
import { registration_time_type } from '../../types/registration_time.type';
import {
  excel_column,
  getDateByTimestamp,
  getDatesBeetween,
  getPercentageUsed,
  groupListBy,
  USDollar,
} from '../../utils';
import { getCALaborDetails } from '../../api/ca_labor_details';
import { ca_labor_detail_type } from '../../types/ca_labor_detail.type';
import Toast from '../utils/toast';
import Alert from '../utils/alert';

type report_data = {
  date: string;
  total_cost: number;
  total_hours: number;
  total_people: number;
  records?: any[];
};
type day_result_type = {
  date: string;
  budget_total_cost: number;
  budget_total_hours: number;
  budget_total_people: number;
  real_total_cost: number;
  real_total_hours: number;
  real_total_people: number;
  difference_cost: number;
  difference_hours: number;
  difference_people: number;
  percentage_cost: any;
  percentage_hours: any;
  percentage_people: any;
  records?: report_data[];
};

export default function HeadcountTableByDate(props: {
  excelRowsCallback: any;
  excelColumnsCallback: any;
}) {
  const { excelRowsCallback, excelColumnsCallback } = props;
  const project = useContext(ProjectContext);
  const costAnalysis = useContext(CostAnalysisContext);
  const reportType = useContext(ReportTypeContext);

  const [budgets, setBudgets] = useState<report_data[]>([]);
  const [reals, setReals] = useState<report_data[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  const [indicators, setIndicators] = useState<day_result_type[]>([]);

  const updateBudget = async (costAnalysis: cost_analysis_type) => {
    const budget_times: ca_labor_detail_type[] = await getCALaborDetails({
      view: 'BI',
      fields: [
        'cost_analysis_id',
        'people_quantity',
        'total_hours',
        'total_cost',
        'date',
      ],
      formula: encodeURI(`cost_analysis_id='${costAnalysis.cost_analysis_id}'`),
    });
    const times_formatted = budget_times.map(
      ({ total_cost, total_hours, people_quantity, date }) => ({
        date: getDateByTimestamp(date),
        hours: total_hours,
        cost: total_cost,
        people: people_quantity,
      }),
    );
    const grouped_by_date = groupListBy('date', times_formatted);
    const totals_by_date = Object.entries(grouped_by_date).map(
      ([date, records]: [string, any]) => ({
        date: date,
        total_hours: records.reduce((total, record) => total + record.hours, 0),
        total_cost: records.reduce((total, record) => total + record.cost, 0),
        total_people: records.reduce(
          (total, record) => total + record.people,
          0,
        ),
      }),
    );
    setBudgets(totals_by_date);
  };

  const updateRealByDate = async (project_id) => {
    const real_times: registration_time_type[] = await getRegistrationTimes({
      worked: true,
      travel: true,
      waiting: true,
      project_id: project_id,
    });
    const times_formatted = real_times.map(
      (time_registered: registration_time_type) => {
        return {
          date: getDateByTimestamp(time_registered.start_date),
          category: time_registered.category,
          week: time_registered.week,
          employee: time_registered.employee_id,
          // Regular time = NO Overtime
          regular_hour_cost: time_registered.regular_hour_cost,
          regular_hours: time_registered.regular_hours,
          // Overtime
          overtime_hour_cost: time_registered.overtime_hour_cost,
          overtime_hours: time_registered.overtime_hours,
          overtime_cost: time_registered.overtime_cost,
          // Total Time
          hours: time_registered.total_hours,
          subtotal: time_registered.subtotal,
          week_hours: time_registered.week_hours,
        };
      },
    );
    const grouped_by_date = groupListBy('date', times_formatted);
    let totals_by_date = Object.entries(grouped_by_date).map(
      ([date, records]: [string, any]): report_data => ({
        date: date,
        total_hours: records.reduce((total, record) => total + record.hours, 0),
        total_cost: records.reduce(
          (total, record) => total + record.subtotal,
          0,
        ),
        total_people: [...new Set(records.map((record) => record.employee))]
          .length,
      }),
    );
    totals_by_date = totals_by_date.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    setReals(totals_by_date);
  };

  const mergeResults = () => {
    // El reporte por defecto comienza en al inicio del registro de horas reales,
    // si no existe, se utiliza la fecha de inicio del analisis de costos.
    // si no existe, se utiliza la fecha de inicio del proyecto.
    const start_date =
      project?.hour_registration_start_date ??
      costAnalysis?.start_date ??
      project?.start_date;
    // Por defecto termina al final del analisis de costos o en al final del registro de horas reales,
    // la fecha mas reciente.
    const project_end_date =
      // Se calcula la fecha mas "grande" entre las horas reales, el end_date del proyecto.
      new Date(project?.hour_registration_end_date ?? '').getTime() >
      new Date(project?.end_date ?? '').getTime()
        ? project?.hour_registration_end_date
        : project?.end_date;
    // Se calcula la fecha mas "grande" entre el end_date del proyecto o el end_date del CA.
    const end_date =
      // Se calcula la fecha mas "grande" entre las horas reales, el end_date del proyecto o el end_date del analisis de costos.
      new Date(project_end_date ?? '').getTime() >
      new Date(costAnalysis?.end_date ?? '').getTime()
        ? project_end_date
        : (costAnalysis?.end_date ?? project_end_date);
    if (start_date && end_date) {
      const dates_beetween = getDatesBeetween(start_date, end_date);
      const results: day_result_type[] = [];
      for (const pivot_date of dates_beetween) {
        const day_results: day_result_type = {
          date: pivot_date,
          budget_total_cost: 0,
          budget_total_hours: 0,
          budget_total_people: 0,
          real_total_cost: 0,
          real_total_hours: 0,
          real_total_people: 0,
          difference_cost: 0,
          difference_hours: 0,
          difference_people: 0,
          percentage_cost: 0,
          percentage_hours: 0,
          percentage_people: 0,
        };
        const budget_totals = budgets.find(
          (budget) => budget.date === pivot_date,
        );
        if (budget_totals) {
          day_results.budget_total_hours = budget_totals.total_hours;
          day_results.budget_total_cost = budget_totals.total_cost;
          day_results.budget_total_people = budget_totals.total_people;
        }
        const real_totals = reals.find((real) => real.date === pivot_date);
        if (real_totals) {
          day_results.real_total_hours = real_totals.total_hours;
          day_results.real_total_cost = real_totals.total_cost;
          day_results.real_total_people = real_totals.total_people;
        }
        day_results.difference_hours =
          day_results.budget_total_hours - day_results.real_total_hours;
        day_results.difference_cost =
          day_results.budget_total_cost - day_results.real_total_cost;
        day_results.difference_people =
          day_results.budget_total_people - day_results.real_total_people;
        day_results.percentage_hours = getPercentageUsed(
          day_results.budget_total_hours,
          day_results.real_total_hours,
        );
        day_results.percentage_cost = getPercentageUsed(
          day_results.budget_total_cost,
          day_results.real_total_cost,
        );
        day_results.percentage_people = getPercentageUsed(
          day_results.budget_total_people,
          day_results.real_total_people,
        );

        results.push(day_results);
      }
      setIndicators(results);
    }
  };

  const formatAsTable = () => {
    // Se genera un arreglo que representa los renglones en la tabla.
    // Cada renglon tiene los totales POR DIA.
    const rows = indicators.map((result) => {
      // Celda 1: Fecha
      const date = result.date;
      // Celda 2: Presupuesto (dependiendo del tipo de reporte)
      const budget =
        reportType === 'HOURS'
          ? result.budget_total_hours
          : reportType === 'COST'
            ? USDollar.format(result.budget_total_cost)
            : result.budget_total_people;
      // Celda 3: Real (dependiendo del tipo de reporte)
      const real =
        reportType === 'HOURS'
          ? result.real_total_hours.toFixed(2)
          : reportType === 'COST'
            ? USDollar.format(result.real_total_cost)
            : result.real_total_people;
      // Celda 4: Diferencia (dependiendo del tipo de reporte)
      const difference =
        reportType === 'HOURS'
          ? result.difference_hours.toFixed(2)
          : reportType === 'COST'
            ? USDollar.format(result.difference_cost)
            : result.difference_people;
      // Celda 5: % Usado (dependiendo del tipo de reporte)
      const percentage_used =
        reportType === 'HOURS'
          ? result.percentage_hours.toFixed(2)
          : reportType === 'COST'
            ? result.percentage_cost.toFixed(2)
            : result.percentage_people.toFixed(2);
      return [
        date,
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
    // Se calcula el total de todas las columnas (Totales verticalmente)
    let summary_budget = 0;
    if (reportType === 'HOURS' || reportType === 'COST') {
      summary_budget = indicators.reduce(
        (total, result) =>
          total +
          (reportType === 'HOURS'
            ? result.budget_total_hours
            : result.budget_total_cost),
        0,
      );
    } else {
      summary_budget = Math.max(
        ...indicators.map((day) => day.budget_total_people),
      );
    }
    let summary_real = 0;
    if (reportType === 'HOURS' || reportType === 'COST') {
      summary_real = indicators.reduce(
        (total, result) =>
          total +
          (reportType === 'HOURS'
            ? result.real_total_hours
            : result.real_total_cost),
        0,
      );
    } else {
      summary_real = Math.max(
        ...indicators.map((day) => day.real_total_people),
      );
    }
    let summary_difference = 0;
    if (reportType === 'HOURS' || reportType === 'COST') {
      summary_difference = indicators.reduce(
        (total, result) =>
          total +
          (reportType === 'HOURS'
            ? result.difference_hours
            : result.difference_cost),
        0,
      );
    } else {
      summary_difference = summary_budget - summary_real;
    }
    const summary_percentage = getPercentageUsed(summary_budget, summary_real);
    // Se genera una columna extra al final con los TOTALES de todos los dias.
    rows.push([
      'TOTALS',
      reportType === 'COST'
        ? USDollar.format(summary_budget)
        : summary_budget.toFixed(2),
      reportType === 'COST'
        ? USDollar.format(summary_real)
        : summary_real.toFixed(2),
      reportType === 'COST'
        ? USDollar.format(summary_difference)
        : summary_difference.toFixed(2),
      <Toast
        text={summary_percentage.toFixed(2) + '%'}
        text_size="text-sm"
        color={
          summary_percentage <= 50
            ? 'success'
            : summary_percentage <= 70
              ? 'info'
              : summary_percentage <= 90
                ? 'warning'
                : 'error'
        }
      />,
    ]);
    setRows(rows);
    const columns: excel_column[] = [
      { header: 'Date', key: 'DATE', width: 20 },
      { header: 'Budget', key: 'DATE', width: 10 },
      { header: 'Real', key: 'DATE', width: 10 },
      { header: 'Difference', key: 'DATE', width: 10 },
      { header: '% Used', key: 'DATE', width: 20 },
    ];
    excelColumnsCallback(columns);
    const table_rows = rows.map((row) => [
      ...row.slice(0, 4),
      (row[4] as JSX.Element).props.text,
    ]);
    excelRowsCallback(table_rows);
  };

  useEffect(() => {
    if (indicators.length > 0) {
      formatAsTable();
    }
  }, [indicators, reportType]);

  useEffect(() => {
    if (budgets.length > 0 || reals.length > 0) {
      mergeResults();
    }
  }, [budgets, reals]);

  useEffect(() => {
    if (costAnalysis?.cost_analysis_id) updateBudget(costAnalysis);
  }, [costAnalysis]);

  useEffect(() => {
    if (project?.project_id) updateRealByDate(project.project_id);
  }, [project]);

  return (
    <div className="mx-auto max-w-full relative">
      {(!project?.start_date || !project.end_date) && (
        <Alert
          status="error"
          label="No se cumplen los requisitos mínimos para mostrar este reporte."
          details="El proyecto no cuenta con fechas de comienzo o fin."
        />
      )}
      {project?.start_date && project.end_date && (
        <Table
          columns={['Date', 'Budget', 'Real', 'Difference', '% Used']}
          rows={rows}
          styles={{
            vertical_lines: true,
            max_width: '50vw',
            row_height: 'xs',
            rows: { remark_label: true, static_label: false },
            static_headers: true,
            static_bottom: true,
            max_height: 'max-h-[27rem]',
          }}
        />
      )}
    </div>
  );
}

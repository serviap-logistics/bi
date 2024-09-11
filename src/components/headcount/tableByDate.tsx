import { useContext, useEffect, useState } from 'react';
import Table from '../utils/table';
import { getRegistrationTimes } from '../../api/registration_times';
import { cost_analysis_type } from '../../types/cost_analysis.type';
import { CostAnalysisContext, ProjectContext } from '.';
import { ReportTypeContext } from './reportByType';
import { registration_time_type } from '../../types/registration_time.type';
import {
  getDateByTimestamp,
  getDatesBeetween,
  getPercentage,
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
  records?: any[];
};
type day_result_type = {
  date: string;
  budget_total_cost: number;
  budget_total_hours: number;
  real_total_cost: number;
  real_total_hours: number;
  difference_cost: number;
  difference_hours: number;
  percentage_cost: any;
  percentage_hours: any;
  records?: report_data[];
};

export default function HeadcountTableByDate() {
  const project = useContext(ProjectContext);
  const costAnalysis = useContext(CostAnalysisContext);
  const reportType = useContext(ReportTypeContext);

  const [budgets, setBudgets] = useState<report_data[]>([]);
  const [reals, setReals] = useState<report_data[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [showTable, setShowTable] = useState(false);

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
      ({ total_cost, total_hours, date }) => ({
        cost: total_cost,
        hours: total_hours,
        date: getDateByTimestamp(date),
      }),
    );
    const grouped_by_date = groupListBy('date', times_formatted);
    const totals_by_date = Object.entries(grouped_by_date).map(
      ([date, records]: [string, any]) => ({
        date: date,
        total_cost: records.reduce((total, record) => total + record.cost, 0),
        total_hours: records.reduce((total, record) => total + record.hours, 0),
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
      ({ total_cost, total_hours, start_date, category }) => ({
        cost: total_cost,
        hours: total_hours,
        date: getDateByTimestamp(start_date),
        category: category,
      }),
    );
    const grouped_by_date = groupListBy('date', times_formatted);
    let totals_by_date = Object.entries(grouped_by_date).map(
      ([date, records]: [string, any]) => ({
        date: date,
        total_cost: records.reduce((total, record) => total + record.cost, 0),
        total_hours: records.reduce((total, record) => total + record.hours, 0),
      }),
    );
    totals_by_date = totals_by_date.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    setReals(totals_by_date);
  };

  const mergeResults = () => {
    console.log('Triying mergin with: ');
    console.table([
      ['Budget', budgets],
      ['Real', reals],
    ]);
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
      let count = 0;
      const worked_records: any[] = [];
      for (const pivot_date of dates_beetween) {
        const day_results: day_result_type = {
          date: pivot_date,
          budget_total_cost: 0,
          budget_total_hours: 0,
          real_total_cost: 0,
          real_total_hours: 0,
          difference_cost: 0,
          difference_hours: 0,
          percentage_cost: 0,
          percentage_hours: 0,
          records: [],
        };
        const budget_totals = budgets.find(
          (budget) => budget.date === pivot_date,
        );
        if (budget_totals) {
          day_results.budget_total_cost = budget_totals.total_cost;
          day_results.budget_total_hours = budget_totals.total_hours;
        }
        const real_totals = reals.find((real) => real.date === pivot_date);
        if (real_totals) {
          count++;
          worked_records.push(real_totals);
          day_results.real_total_cost = real_totals.total_cost;
          day_results.real_total_hours = real_totals.total_hours;
        }
        day_results.difference_cost =
          day_results.budget_total_cost - day_results.real_total_cost;
        day_results.difference_hours =
          day_results.budget_total_hours - day_results.real_total_hours;
        day_results.percentage_cost = getPercentage(
          day_results.budget_total_cost,
          day_results.real_total_cost,
        );
        day_results.percentage_hours = getPercentage(
          day_results.budget_total_hours,
          day_results.real_total_hours,
        );

        day_results.records = [];
        results.push(day_results);
      }
      setIndicators(results);
    }
  };

  const formatAsTable = () => {
    const rows = indicators.map((result) =>
      reportType === 'HOURS'
        ? [
            result.date,
            result.budget_total_hours,
            result.real_total_hours.toFixed(2),
            result.difference_hours.toFixed(2),
            <Toast
              text={result.percentage_hours.toFixed(2) + '%'}
              text_size="text-sm"
              color={
                result.percentage_hours <= 50
                  ? 'success'
                  : result.percentage_hours <= 70
                    ? 'info'
                    : result.percentage_hours <= 90
                      ? 'warning'
                      : 'error'
              }
            />,
          ]
        : [
            result.date,
            USDollar.format(result.budget_total_cost),
            USDollar.format(result.real_total_cost),
            USDollar.format(result.difference_cost),
            <Toast
              text={result.percentage_cost.toFixed(2) + '%'}
              text_size="text-sm"
              color={
                result.percentage_cost <= 50
                  ? 'success'
                  : result.percentage_cost <= 70
                    ? 'info'
                    : result.percentage_cost <= 90
                      ? 'warning'
                      : 'error'
              }
            />,
          ],
    );
    const summary_row = {
      budget:
        reportType === 'HOURS'
          ? indicators.reduce(
              (total, result) => total + result.budget_total_hours,
              0,
            )
          : USDollar.format(
              indicators.reduce(
                (total, result) => total + result.budget_total_cost,
                0,
              ),
            ),
      real:
        reportType === 'HOURS'
          ? indicators
              .reduce((total, result) => total + result.real_total_hours, 0)
              .toFixed(2)
          : USDollar.format(
              indicators.reduce(
                (total, result) => total + result.real_total_cost,
                0,
              ),
            ),
      difference:
        reportType === 'HOURS'
          ? indicators
              .reduce((total, result) => total + result.difference_hours, 0)
              .toFixed(2)
          : USDollar.format(
              indicators.reduce(
                (total, result) => total + result.difference_cost,
                0,
              ),
            ),
      percentage:
        reportType === 'HOURS'
          ? getPercentage(
              indicators.reduce(
                (total, result) => total + result.budget_total_hours,
                0,
              ),
              indicators.reduce(
                (total, result) => total + result.real_total_hours,
                0,
              ),
            )
          : getPercentage(
              indicators.reduce(
                (total, result) => total + result.budget_total_cost,
                0,
              ),
              indicators.reduce(
                (total, result) => total + result.real_total_cost,
                0,
              ),
            ),
    };
    rows.push([
      'TOTALS',
      summary_row.budget,
      summary_row.real,
      summary_row.difference,
      <Toast
        text={summary_row.percentage.toFixed(2) + '%'}
        text_size="text-sm"
        color={
          summary_row.percentage <= 50
            ? 'success'
            : summary_row.percentage <= 70
              ? 'info'
              : summary_row.percentage <= 90
                ? 'warning'
                : 'error'
        }
      />,
    ]);
    setRows(rows);
    setShowTable(true);
  };

  useEffect(() => {
    if (indicators.length > 0) {
      formatAsTable();
    }
  }, [indicators, reportType]);

  useEffect(() => {
    if (budgets.length > 0 && reals.length > 0) {
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
      {showTable && rows && (
        <Table
          columns={['Date', 'Budget', 'Real', 'Difference', '% Used']}
          rows={rows}
          styles={{
            vertical_lines: true,
            full_width: true,
            row_height: 'xs',
            rows: { remark_label: true },
            static_headers: true,
            static_bottom: true,
            max_height: 'max-h-[27rem]',
          }}
        />
      )}
      {(!project?.start_date || !project.end_date) && (
        <Alert
          status="error"
          label="No se cumplen los requisitos mínimos para mostrar este reporte."
          details="El proyecto no cuenta con fechas de comienzo o fin."
        />
      )}
    </div>
  );
}

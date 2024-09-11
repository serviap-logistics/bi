import { useContext, useEffect, useState } from 'react';
import Table, { table_group, table_row } from '../utils/table';
import { getRegistrationTimes } from '../../api/registration_times';
import { CostAnalysisContext, ProjectContext } from '.';
// import { ReportTypeContext } from "./reportByType";
import { registration_time_type } from '../../types/registration_time.type';
import {
  cloneObject,
  getDateByTimestamp,
  getDatesBeetween,
  groupListBy,
} from '../../utils';
import { getCALaborDetails } from '../../api/ca_labor_details';
import { ca_labor_detail_type } from '../../types/ca_labor_detail.type';
import Alert from '../utils/alert';

type group_data = {
  Worked: object;
  'Worked Overtime': object;
  Travel: object;
  'Travel Overtime': object;
};

const empty_results: group_data = {
  Worked: {},
  'Worked Overtime': {},
  Travel: {},
  'Travel Overtime': {},
};

type cell_data = {
  hour_cost: number;
  hours: number;
  people_quantity: number;
  subtotal: number;
  date?: string;
};

const empty_cell_data: cell_data = {
  hour_cost: 0,
  hours: 0,
  people_quantity: 0,
  subtotal: 0,
};

type result_data = {
  Worked?: table_row[];
  'Worked Overtime'?: table_row[];
  Travel?: table_row[];
  'Travel Overtime'?: table_row[];
};

export default function HeadcountTableByRole() {
  const project = useContext(ProjectContext);
  const costAnalysis = useContext(CostAnalysisContext);
  // const reportType = useContext(ReportTypeContext)
  const [rows, setRows] = useState<table_group[]>();
  const [columns, setColumns] = useState<string[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [reportDates, setReportDates] = useState<{
    start_date: string | undefined;
    end_date: string | undefined;
    dates_beetween: string[] | undefined;
  }>();

  const [budgets, setBudgets] = useState<group_data>({
    Worked: {},
    'Worked Overtime': {},
    Travel: {},
    'Travel Overtime': {},
  });
  const [reals, setReals] = useState<group_data>({
    Worked: {},
    'Worked Overtime': {},
    Travel: {},
    'Travel Overtime': {},
  });
  const [results, setResults] = useState<result_data>({
    Worked: [],
    'Worked Overtime': [],
    Travel: [],
    'Travel Overtime': [],
  });

  const updateReportDates = () => {
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
      setReportDates({
        start_date: start_date,
        end_date: end_date,
        dates_beetween: getDatesBeetween(start_date, end_date),
      });
    }
  };

  const updateBudget = async () => {
    if (
      !costAnalysis?.cost_analysis_id ||
      !reportDates?.start_date ||
      !reportDates?.end_date
    ) {
      setBudgets(empty_results);
    } else {
      const budget_times: ca_labor_detail_type[] = await getCALaborDetails({
        view: 'BI',
        fields: [
          'cost_analysis_id',
          'date',
          'people_quantity',
          'employee_role',
          'worked_hours',
          'travel_hours',
          'worked_hour_cost',
          'travel_hour_cost',
          'subtotal_worked_hours',
          'subtotal_travel_hours',
          'worked_overtime_hours',
          'travel_overtime_hours',
          'worked_overtime_hour_cost',
          'travel_overtime_hour_cost',
          'subtotal_worked_overtime',
          'subtotal_travel_overtime',
        ],
        formula: encodeURI(
          `cost_analysis_id='${costAnalysis.cost_analysis_id}'`,
        ),
      });
      const times_formatted = budget_times.map((record) => ({
        ...record,
        date: getDateByTimestamp(record.date),
      }));
      const grouped_by_role = groupListBy('employee_role', times_formatted);
      const worked_by_role = {};
      Object.entries(grouped_by_role).map(([role, records]: [string, any]) => {
        worked_by_role[role] = {};
        records.map(
          (record) =>
            (worked_by_role[role][record.date] = {
              date: record.date,
              people_quantity: record.people_quantity,
              hour_cost: record.worked_hour_cost,
              hours: record.worked_hours,
              subtotal: record.subtotal_worked_hours,
            }),
        );
      });
      const worked_overtime_by_role = {};
      Object.entries(grouped_by_role).map(([role, records]: [string, any]) => {
        worked_overtime_by_role[role] = {};
        records.map(
          (record) =>
            (worked_overtime_by_role[role][record.date] = {
              date: record.date,
              people_quantity: record.people_quantity,
              hour_cost: record.worked_overtime_hour_cost,
              hours: record.worked_overtime_hours,
              subtotal: record.subtotal_worked_overtime,
            }),
        );
      });
      const travel_by_role = {};
      Object.entries(grouped_by_role).map(([role, records]: [string, any]) => {
        travel_by_role[role] = {};
        records.map(
          (record) =>
            (travel_by_role[role][record.date] = {
              date: record.date,
              people_quantity: record.people_quantity,
              hour_cost: record.travel_hour_cost,
              hours: record.travel_hours,
              subtotal: record.subtotal_travel_hours,
            }),
        );
      });
      const travel_overtime_by_role = {};
      Object.entries(grouped_by_role).map(([role, records]: [string, any]) => {
        travel_overtime_by_role[role] = {};
        records.map(
          (record) =>
            (travel_overtime_by_role[role][record.date] = {
              date: record.date,
              people_quantity: record.people_quantity,
              hour_cost: record.travel_overtime_hour_cost,
              hours: record.travel_overtime_hours,
              subtotal: record.subtotal_travel_overtime,
            }),
        );
      });
      setBudgets({
        Worked: worked_by_role,
        'Worked Overtime': worked_overtime_by_role,
        Travel: travel_by_role,
        'Travel Overtime': travel_overtime_by_role,
      });
    }
  };

  const updateRealByDate = async () => {
    if (!project?.project_id) {
      setReals(empty_results);
      return;
    } else {
      const real_times: registration_time_type[] = await getRegistrationTimes({
        worked: true,
        travel: true,
        waiting: true,
        project_id: project.project_id,
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
          total_hours: records.reduce(
            (total, record) => total + record.hours,
            0,
          ),
        }),
      );
      totals_by_date = totals_by_date.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      console.log(totals_by_date);
      // setReals(totals_by_date)
      setReals({
        Worked: {},
        'Worked Overtime': {},
        Travel: {},
        'Travel Overtime': {},
      });
    }
  };

  const mergeResults = () => {
    if (
      reportDates?.start_date &&
      reportDates.end_date &&
      reportDates.dates_beetween
    ) {
      // Para este momento, budgets deberia existir con al menos un role y con todo en 0.
      const roles_available = Object.values(budgets).map((roles) =>
        Object.keys(roles),
      )[0];
      const groups_available = Object.keys(results);
      if (roles_available.length === 0) {
        console.log('Nothing to show...');
      } else {
        const budget_results = cloneObject(budgets);
        for (const group of groups_available) {
          for (const role of roles_available) {
            // Budgets
            if (budgets[group] && budgets[group][role]) {
              const dates: string[] = Object.keys(budgets[group][role]);
              const dates_to_create = reportDates.dates_beetween.filter(
                (date) => !dates.includes(date),
              );
              dates_to_create.map((date) => {
                budget_results[group][role][date] = {
                  date: date,
                  ...empty_cell_data,
                };
              });
            }
          }
        }
        const budget_formatted_results: result_data = {};
        Object.entries(budget_results).map(
          ([group, data_by_role]: [string, any]) =>
            (budget_formatted_results[group] = [
              Object.entries(data_by_role).map(([role, data]: [string, any]) =>
                [
                  role,
                  Object.values(data)
                    .sort(
                      (a: any, b: any) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime(),
                    )
                    .map((cell: any) => cell.hours),
                ].flat(),
              ),
            ]),
        );
        setResults(budget_formatted_results);
      }
    }
  };

  const formatAsTable = (results: result_data) => {
    if (!reportDates?.dates_beetween) return;
    console.log('Trying formatting with... ', results);
    const columns = ['Role', reportDates?.dates_beetween].flat();
    setColumns(columns);
    setRows(
      Object.entries(results).map(([group, rows]) => ({
        name: group,
        rows: rows,
      })),
    );
    setShowTable(true);
  };

  useEffect(() => {
    const resultsCheck: boolean = Object.values(results)
      .flatMap((element) => element.length > 0)
      .includes(true);
    if (resultsCheck) formatAsTable(results);
  }, [results]);

  useEffect(() => {
    const budgetsCheck: boolean = Object.values(budgets)
      .flatMap((element) => Object.keys(element).length > 0)
      .includes(true);
    if (budgetsCheck) {
      mergeResults();
    }
  }, [budgets]);

  useEffect(() => {
    const realsCheck: boolean = true;
    if (realsCheck) {
      mergeResults();
    }
  }, [reals]);

  useEffect(() => {
    if (reportDates?.start_date != '' && reportDates?.end_date != '') {
      updateBudget();
      updateRealByDate();
    }
  }, [reportDates]);

  useEffect(() => {
    updateReportDates();
  }, [costAnalysis, project]);

  return (
    <div className="mx-auto max-w-full relative">
      {showTable && columns && rows && (
        <Table
          columns={columns}
          rows={rows}
          styles={{
            vertical_lines: true,
            full_width: true,
            row_height: 'xs',
            rows: { remark_label: true },
            static_headers: false,
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

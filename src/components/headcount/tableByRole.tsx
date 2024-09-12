import { useContext, useEffect, useState } from 'react';
import Table, { group as table_group, row as table_row } from '../utils/table';
import { getRegistrationTimes } from '../../api/registration_times';
import { CostAnalysisContext, ProjectContext } from '.';
// import { ReportTypeContext } from "./reportByType";
import { registration_time_type } from '../../types/registration_time.type';
import {
  cloneObject,
  generateColorStatus,
  getDateByTimestamp,
  getDatesBeetween,
  getPercentageUsed,
  groupListBy,
  USDollar,
} from '../../utils';
import { getCALaborDetails } from '../../api/ca_labor_details';
import { ca_labor_detail_type } from '../../types/ca_labor_detail.type';
import Alert from '../utils/alert';
import { ReportTypeContext } from './reportByType';

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
  const reportType = useContext(ReportTypeContext);
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
  const [formattedBudgets, setFormattedBudgets] = useState<result_data>();
  const [reals, setReals] = useState<group_data>({
    Worked: {},
    'Worked Overtime': {},
    Travel: {},
    'Travel Overtime': {},
  });
  const [formattedReals, setFormattedReals] = useState<result_data>();
  const [displayResults, setDisplayResults] = useState<result_data>({
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

  const updateReal = async () => {
    if (!project?.project_id) {
      setReals(empty_results);
      return;
    } else {
      const real_times: registration_time_type[] = await getRegistrationTimes({
        worked: true,
        travel: true,
        waiting: false,
        project_id: project.project_id,
      });
      const times_formatted = real_times.map(
        (record: registration_time_type) => ({
          date: getDateByTimestamp(record.start_date),
          category: record.category,
          employee_id: record.employee_id,
          employee_role: record.employee_role,
          // Regular
          regular_hour_cost: record.regular_hour_cost,
          regular_hours: record.regular_hours,
          total_regular_cost: record.regular_cost,
          // Overtime
          overtime_hour_cost: record.overtime_hour_cost,
          overtime_hours: record.overtime_hours,
          total_overtime_cost: record.overtime_cost,
        }),
      );
      const worked: any[] = [];
      const worked_overtime: any[] = [];
      const travel: any[] = [];
      const travel_overtime: any[] = [];
      // const waiting: any[] = [];
      times_formatted.map((record: any) => {
        if (record.category === 'WORKED') {
          worked.push({
            date: record.date,
            employee_id: record.employee_id,
            employee_role: record.employee_role,
            hour_cost: record.regular_hour_cost,
            hours: record.regular_hours,
            subtotal: record.total_regular_cost,
          });
          if (record.overtime_hours > 0) {
            worked_overtime.push({
              date: record.date,
              employee_id: record.employee_id,
              employee_role: record.employee_role,
              hour_cost: record.overtime_hour_cost,
              hours: record.overtime_hours,
              subtotal: record.total_overtime_cost,
            });
          }
        }
        if (record.category === 'TRAVEL') {
          travel.push({
            date: record.date,
            employee_id: record.employee_id,
            employee_role: record.employee_role,
            hour_cost: record.regular_hour_cost,
            hours: record.regular_hours,
            subtotal: record.total_regular_cost,
          });
          if (record.overtime_hours > 0) {
            travel_overtime.push({
              date: record.date,
              employee_id: record.employee_id,
              employee_role: record.employee_role,
              hour_cost: record.overtime_hour_cost,
              hours: record.overtime_hours,
              subtotal: record.total_overtime_cost,
            });
          }
        }
      });
      const worked_by_role = worked.reduce((totals_by_role, record) => {
        const role = record.employee_role;
        const date = record.date;
        if (!totals_by_role[role]) {
          totals_by_role[role] = {};
        }
        if (!totals_by_role[role][date]) {
          totals_by_role[role][date] = {
            date: '',
            people: [],
            hours: 0,
            subtotal: 0,
          };
        }

        totals_by_role[role][date] = {
          date: date,
          people: [...totals_by_role[role][date].people, record.employee_id],
          hours: totals_by_role[role][date].hours + record.hours,
          subtotal: totals_by_role[role][date].subtotal + record.subtotal,
        };
        return totals_by_role;
      }, {});
      Object.keys(worked_by_role).map((role) => {
        Object.keys(worked_by_role[role]).map((date) => {
          worked_by_role[role][date] = {
            ...worked_by_role[role][date],
            people_quantity: [
              ...new Set([...worked_by_role[role][date].people]),
            ].length,
          };
        });
      });
      const worked_overtime_by_role = worked_overtime.reduce(
        (totals_by_role, record) => {
          const role = record.employee_role;
          const date = record.date;
          if (!totals_by_role[role]) {
            totals_by_role[role] = {};
          }
          if (!totals_by_role[role][date]) {
            totals_by_role[role][date] = {
              date: '',
              people: [],
              hours: 0,
              subtotal: 0,
            };
          }

          totals_by_role[role][date] = {
            date: date,
            people: [...totals_by_role[role][date].people, record.employee_id],
            hours: totals_by_role[role][date].hours + record.hours,
            subtotal: totals_by_role[role][date].subtotal + record.subtotal,
          };
          return totals_by_role;
        },
        {},
      );
      Object.keys(worked_overtime_by_role).map((role) => {
        Object.keys(worked_overtime_by_role[role]).map((date) => {
          worked_overtime_by_role[role][date] = {
            ...worked_overtime_by_role[role][date],
            people_quantity: [
              ...new Set([...worked_overtime_by_role[role][date].people]),
            ].length,
          };
        });
      });
      const travel_by_role = travel.reduce((totals_by_role, record) => {
        const role = record.employee_role;
        const date = record.date;
        if (!totals_by_role[role]) {
          totals_by_role[role] = {};
        }
        if (!totals_by_role[role][date]) {
          totals_by_role[role][date] = {
            date: '',
            people: [],
            hours: 0,
            subtotal: 0,
          };
        }

        totals_by_role[role][date] = {
          date: date,
          people: [...totals_by_role[role][date].people, record.employee_id],
          hours: totals_by_role[role][date].hours + record.hours,
          subtotal: totals_by_role[role][date].subtotal + record.subtotal,
        };
        return totals_by_role;
      }, {});
      Object.keys(travel_by_role).map((role) => {
        Object.keys(travel_by_role[role]).map((date) => {
          travel_by_role[role][date] = {
            ...travel_by_role[role][date],
            people_quantity: [
              ...new Set([...travel_by_role[role][date].people]),
            ].length,
          };
        });
      });
      const travel_overtime_by_role = travel_overtime.reduce(
        (totals_by_role, record) => {
          const role = record.employee_role;
          const date = record.date;
          if (!totals_by_role[role]) {
            totals_by_role[role] = {};
          }
          if (!totals_by_role[role][date]) {
            totals_by_role[role][date] = {
              date: '',
              people: [],
              hours: 0,
              subtotal: 0,
            };
          }

          totals_by_role[role][date] = {
            date: date,
            people: [...totals_by_role[role][date].people, record.employee_id],
            hours: totals_by_role[role][date].hours + record.hours,
            subtotal: totals_by_role[role][date].subtotal + record.subtotal,
          };
          return totals_by_role;
        },
        {},
      );
      Object.keys(travel_overtime_by_role).map((role) => {
        Object.keys(travel_overtime_by_role[role]).map((date) => {
          travel_overtime_by_role[role][date] = {
            ...travel_overtime_by_role[role][date],
            people_quantity: [
              ...new Set([...travel_overtime_by_role[role][date].people]),
            ].length,
          };
        });
      });
      setReals({
        Worked: worked_by_role,
        'Worked Overtime': worked_overtime_by_role,
        Travel: travel_by_role,
        'Travel Overtime': travel_overtime_by_role,
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
      const budget_roles_available = Object.values(budgets).map((roles) =>
        Object.keys(roles),
      )[0];
      const real_roles_available = Object.values(reals).map((roles) =>
        Object.keys(roles),
      )[0];
      const roles_available = [
        ...new Set([...budget_roles_available, ...real_roles_available]),
      ];
      const groups_available = Object.keys(displayResults);
      if (roles_available.length === 0) {
        console.log('Nothing to show...');
      } else {
        const budget_results = cloneObject(budgets);
        const real_results = cloneObject(reals);
        for (const group of groups_available) {
          for (const role of roles_available) {
            // Budgets
            if (!budget_results[group]) budget_results[group] = {};
            if (!budget_results[group][role]) budget_results[group][role] = {};
            if (budget_results[group] && budget_results[group][role]) {
              const dates: string[] = Object.keys(
                budget_results[group][role] ?? {},
              );
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
            // Reals
            if (!real_results[group]) real_results[group] = {};
            if (!real_results[group][role]) real_results[group][role] = {};
            if (real_results[group] && real_results[group][role]) {
              const dates: string[] = Object.keys(real_results[group][role]);
              const dates_to_create = reportDates.dates_beetween.filter(
                (date) => !dates.includes(date),
              );
              dates_to_create.map((date) => {
                real_results[group][role][date] = {
                  date: date,
                  ...empty_cell_data,
                };
              });
            }
          }
        }
        setFormattedBudgets(budget_results);
        setFormattedReals(real_results);
      }
    }
  };

  const formatByReportType = (budgets, reals) => {
    if (!reportDates?.dates_beetween) return;
    const final_results = {
      Worked: [],
      'Worked Overtime': [],
      Travel: [],
      'Travel Overtime': [],
    };
    for (const group of Object.keys(budgets)) {
      for (const role of Object.keys(budgets[group])) {
        const row: table_row = [{ color: '', data: role }];
        reportDates.dates_beetween.map((date) => {
          if (reportType === 'HOURS')
            row.push({
              color: generateColorStatus(
                getPercentageUsed(
                  budgets[group][role][date].hours,
                  reals[group][role][date].hours,
                ),
              ),
              data: [
                budgets[group][role][date].hours.toFixed(2),
                reals[group][role][date].hours.toFixed(2),
              ],
            });
          if (reportType === 'COST')
            row.push({
              color: generateColorStatus(
                getPercentageUsed(
                  budgets[group][role][date].subtotal,
                  reals[group][role][date].subtotal,
                ),
              ),
              data: [
                USDollar.format(budgets[group][role][date].subtotal),
                USDollar.format(reals[group][role][date].subtotal),
              ],
            });
          if (reportType === 'PEOPLE')
            row.push({
              color: generateColorStatus(
                getPercentageUsed(
                  budgets[group][role][date].people_quantity,
                  reals[group][role][date].people_quantity,
                ),
              ),
              data: [
                budgets[group][role][date].people_quantity,
                reals[group][role][date].people_quantity,
              ],
            });
        });
        final_results[group].push(row);
      }
    }
    console.log('FINAL! ', final_results);
    setDisplayResults(final_results);
  };

  const formatAsTable = (results: result_data) => {
    if (!reportDates?.dates_beetween) return;
    const columns = ['Role', reportDates?.dates_beetween].flat();
    setColumns(columns);
    setRows(
      Object.entries(results).map(([group, rows]) => ({
        name: group,
        rows: rows as table_row[],
      })),
    );
    setShowTable(true);
  };

  useEffect(() => {
    const resultsCheck: boolean = Object.values(displayResults)
      .flatMap((element) => element.length > 0)
      .includes(true);
    if (resultsCheck) formatAsTable(displayResults);
  }, [displayResults]);

  useEffect(() => {
    if (formattedBudgets && formattedReals)
      formatByReportType(formattedBudgets, formattedReals);
  }, [formattedBudgets, formattedReals, reportType]);

  useEffect(() => {
    const budgetsCheck: boolean = Object.values(budgets)
      .flatMap((element) => Object.keys(element).length > 0)
      .includes(true);
    if (budgetsCheck) mergeResults();
  }, [budgets]);

  useEffect(() => {
    const realsCheck: boolean = true;
    if (realsCheck) mergeResults();
  }, [reals]);

  useEffect(() => {
    if (reportDates?.start_date != '' && reportDates?.end_date != '') {
      updateBudget();
      updateReal();
    }
  }, [reportDates]);

  useEffect(() => updateReportDates(), [costAnalysis, project]);

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

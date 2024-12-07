import { useEffect, useState } from 'react';
import {
  getRegistrationTimes,
  registration_time,
} from '../../headcount/services/registration_times';
import { groupListBy, USDollar } from '../../../utils';
import {
  getPurchases as getAirtablePurchases,
  purchase,
} from '../../purchases/services/purchases';
import { getSites } from './services/sites';
import { excel_cell, excel_column } from '../../../utils/excel';
import Table, { group } from '../../../utils/components/table';
import PillsMenu, {
  pill_menu_option_type,
} from '../../../utils/components/pillsMenu';
import Alert from '../../../utils/components/notifications/alert';

type display_types_available = 'BY_PROJECT' | 'BY_SITE' | 'BY_STATE';
const DEFAULT_DISPLAY_OPTION = 'BY_PROJECT';

function ProjectData(props: {
  project_code: string;
  project_name: string;
  status: string;
  start_date: string;
  end_date: string;
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
function SiteData(props: { site: string; address: string }) {
  return (
    <div className="flex flex-col">
      <span>{props.site}</span>
      <span className="text-xs text-slate-400 text-wrap">{props.address}</span>
    </div>
  );
}

export default function AllProjectsTableByWeek(props: {
  excelRowsCallback: any;
  excelColumnsCallback: any;
  projects: object;
}) {
  const { excelRowsCallback, excelColumnsCallback } = props;
  const [displayOptions, setDisplayOptions] = useState<pill_menu_option_type[]>(
    [
      { key: 'BY_PROJECT', current: true, name: 'By Project', icon: undefined },
      { key: 'BY_SITE', current: false, name: 'By Site', icon: undefined },
      { key: 'BY_STATE', current: false, name: 'By State', icon: undefined },
    ],
  );
  const [displayOption, setDisplayOption] = useState<string | undefined>(
    DEFAULT_DISPLAY_OPTION,
  );
  const [sitesAvailable, setSitesAvailable] = useState<object>({});

  const updateSitesAvailable = async () => {
    const sitesFound = await getSites({
      view: 'BI',
      fields: ['site_id', 'site_code', 'site_address'],
    });
    const result = {};
    sitesFound.map((site) => {
      result[site.site_id] = {
        site_code: site.site_code,
        site_address: site.site_address,
      };
    });
    setSitesAvailable(result);
  };

  const handleChangeOption = (tab: pill_menu_option_type) => {
    if (displayOption !== tab.key) {
      setDisplayOptions(
        displayOptions.map((option) => ({
          ...option,
          current: option.key === tab.key,
        })),
      );
      setDisplayOption(tab.key as display_types_available);
    }
  };

  const getPurchases = async (): Promise<purchase[]> => {
    const purchases_found: purchase[] = await getAirtablePurchases({
      view: 'BI',
      fields: [
        'project_id',
        'week',
        'site_id',
        'site_state',
        'status_request',
        'total_cost',
      ],
    });
    return purchases_found;
  };

  const [expenses, setExpenses] = useState<object>({});
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const updateExpenses = async () => {
    // Calculando costos de compras POR proyecto.
    // Objetivo: Tener un objeto donde la clave sea el ID del proyecto y su valor sea otro objeto con las siguientes propiedades.
    //           {purchases: [], registration_times: []}
    const purchases = await getPurchases();
    const purchases_by_project = groupListBy('project_id', purchases);
    // Objeto resultante
    const expenses_by_project = {};
    // Se genera la primer parte del objeto: purchases: []
    Object.entries(purchases_by_project).map(
      ([project, purchases]: [string, any]) => {
        expenses_by_project[project] = { purchases: [...purchases] };
      },
    );

    // Calculando costos de horas POR proyecto.
    const rawTimes: registration_time[] = await getRegistrationTimes({
      worked: true,
      travel: true,
      waiting: true,
    });
    const times = rawTimes.map((time_registered: registration_time) => {
      return {
        project_id: time_registered.project_id,
        site_id: time_registered.site_id,
        site_state: time_registered.site_state,
        week: time_registered.week,
        subtotal: time_registered.subtotal,
      };
    });

    const timesByProject = groupListBy('project_id', times);
    Object.entries(timesByProject).map(
      ([project, times_found]: [string, any]) => {
        if (!expenses_by_project[project]) expenses_by_project[project] = {};
        expenses_by_project[project]['times'] = times_found;
      },
    );
    setExpenses(expenses_by_project);
  };

  const formatAsTable = (expenses, displayOption: string) => {
    // Se genera un arreglo que representa los renglones en la tabla.
    // Cada renglon tiene los totales POR SEMANA POR SITIO.
    // Agrupado por PROJECTO / ANALISIS DE COSTOS
    const results_by_week = {};
    let excel_columns: excel_column[] = [];
    let excel_rows: excel_cell[][] = [];
    if (displayOption === 'BY_PROJECT') {
      Object.entries(expenses).map(
        ([project_id, project_data]: [string, any]) => {
          // project_data: {purchases: [], times: []}
          if (!results_by_week[project_id]) results_by_week[project_id] = {};
          if (project_data?.purchases) {
            const purchases_by_week = groupListBy(
              'week',
              project_data.purchases,
            );
            Object.entries(purchases_by_week).map(
              ([week, purchases]: [string, any]) => {
                results_by_week[project_id][week] = purchases.reduce(
                  (total, purchase) => (total += purchase.total_cost),
                  0,
                );
              },
            );
          }
          if (project_data?.times) {
            const times_by_week = groupListBy('week', project_data.times);
            Object.entries(times_by_week).map(
              ([week, times]: [string, any]) => {
                results_by_week[project_id][week] = times.reduce(
                  (total, times) => (total += times.subtotal),
                  0,
                );
              },
            );
          }
        },
      );
      const weeks_available = [
        ...new Set(
          Object.values(results_by_week)
            .map((result: any) => Object.keys(result))
            .flat(),
        ),
      ]
        .filter((week) => week !== 'undefined')
        .sort();
      const rows: string[][] = [];
      Object.entries(results_by_week).map(
        ([project_id, weeks]: [string, any]) => {
          const row: string[] = [];
          // Se agrega al inicio del renglon, el ID de projecto.
          row.push(project_id);
          // Se agrega al total de registros SIN fecha.
          if (weeks['undefined']) row.push(USDollar.format(weeks['undefined']));
          else row.push(USDollar.format(0));
          // Se agrega el resto de semanas
          weeks_available.map((week) => {
            if (!weeks[week]) row.push(USDollar.format(0));
            else row.push(USDollar.format(weeks[week]));
          });
          rows.push(row);
        },
      );
      setColumns(['Project', 'No date', ...weeks_available]);
      setRows(
        rows.map((cells) => [
          <ProjectData
            project_code={cells[0]}
            project_name={props.projects[cells[0]]?.name}
            status={props.projects[cells[0]]?.status}
            start_date={props.projects[cells[0]]?.start_date}
            end_date={props.projects[cells[0]]?.end_date}
          />,
          ...cells.slice(1),
        ]),
      );
      excel_columns = [
        { header: 'Project ID', key: 'PROJECT_ID', width: 23 },
        { header: 'Project Name', key: 'PROJECT_NAME', width: 28 },
        { header: 'Status', key: 'PROJECT_STATUS', width: 20 },
        { header: 'Start Project', key: 'PROJECT_START_DATE', width: 15 },
        { header: 'End Project', key: 'PROJECT_END_DATE', width: 15 },
        { header: 'No Date', key: 'NO_DATE', width: 15 },
        ...weeks_available.map((week) => ({
          header: week,
          key: week.toUpperCase(),
          width: 15,
        })),
      ];
      excel_rows = rows.map((cells) => [
        cells[0],
        props.projects[cells[0]]?.name,
        props.projects[cells[0]]?.status,
        props.projects[cells[0]]?.start_date,
        props.projects[cells[0]]?.end_date,
        ...cells.slice(1),
      ]);
    } else if (displayOption === 'BY_SITE') {
      let weeks_available: string[] = [];
      Object.entries(expenses).map(
        ([project_id, project_data]: [string, any]) => {
          if (!results_by_week[project_id]) results_by_week[project_id] = {};
          if (project_data?.purchases) {
            const purchases_by_site = groupListBy(
              'site_id',
              project_data.purchases,
            );
            Object.entries(purchases_by_site).map(
              ([site_id, purchases]: [string, any]) => {
                if (!results_by_week[project_id][site_id])
                  results_by_week[project_id][site_id] = {};
                const purchases_by_week = groupListBy('week', purchases);
                Object.entries(purchases_by_week).map(
                  ([week, purchases]: [string, any]) => {
                    if (!weeks_available.includes(week))
                      weeks_available.push(week);
                    results_by_week[project_id][site_id][week] =
                      purchases.reduce(
                        (total, purchase) => (total += purchase.total_cost),
                        0,
                      );
                  },
                );
              },
            );
          }
          if (project_data?.times) {
            const times_by_site = groupListBy('site_id', project_data.times);
            Object.entries(times_by_site).map(
              ([site_id, times]: [string, any]) => {
                if (!results_by_week[project_id][site_id])
                  results_by_week[project_id][
                    site_id !== 'undefined' ? site_id : 'No site'
                  ] = {};
                const sites_by_week = groupListBy('week', times);
                Object.entries(sites_by_week).map(
                  ([week, purchases]: [string, any]) => {
                    results_by_week[project_id][site_id][week] =
                      purchases.reduce(
                        (total, purchase) => (total += purchase.subtotal),
                        0,
                      );
                  },
                );
              },
            );
          }
        },
      );
      weeks_available = weeks_available
        .filter((week) => week !== 'undefined')
        .sort();
      excel_columns = [
        { header: 'Site', key: 'PROJECT_ID', width: 25 },
        { header: 'No Date', key: 'NO DATE', width: 15 },
        ...weeks_available.map((week) => ({
          header: week,
          key: week.toUpperCase(),
          width: 15,
        })),
      ];
      const groups: group[] = [];
      Object.entries(results_by_week).map(
        ([project_id, sites]: [string, any]) => {
          // Se agrega al inicio del renglon, el ID de projecto.
          const group_data: group = {
            name: `${project_id} - ${props.projects[project_id]?.name ?? 'Unnamed Project'}`,
            rows: [],
          };
          excel_rows.push([project_id]);
          Object.entries(sites).map(([site, weeks]: [string, any]) => {
            const row: excel_cell[] = [];
            // Se agrega el nombre del sitio.
            row.push(site);
            // Se agrega el total SIN fecha.
            if (weeks['undefined'])
              row.push(USDollar.format(weeks['undefined']));
            else row.push(USDollar.format(0));
            // Se agrega el resto de semanas
            weeks_available.map((week) => {
              if (!weeks[week]) row.push(USDollar.format(0));
              else row.push(USDollar.format(weeks[week]));
            });
            excel_rows.push(row);
            group_data.rows.push(row);
          });
          groups.push(group_data);
        },
      );
      setColumns(['Project', 'No date', ...weeks_available]);
      const formatted_groups = groups.map((group) => ({
        name: group.name,
        rows: group.rows.map((row) => [
          <SiteData
            site={
              sitesAvailable[row[0] as string]?.site_code ?? 'No Site Selected'
            }
            address={sitesAvailable[row[0] as string]?.site_address}
          />,
          ...row.slice(1),
        ]),
      }));
      setRows(formatted_groups);
    } else if (displayOption === 'BY_STATE') {
      let weeks_available: string[] = [];
      Object.entries(expenses).map(
        ([project_id, project_data]: [string, any]) => {
          if (!results_by_week[project_id]) results_by_week[project_id] = {};
          if (project_data?.purchases) {
            const purchases_by_state = groupListBy(
              'site_state',
              project_data.purchases,
            );
            Object.entries(purchases_by_state).map(
              ([site_state, purchases]: [string, any]) => {
                if (
                  !results_by_week[project_id][
                    site_state !== 'undefined' ? site_state : 'No state'
                  ]
                )
                  results_by_week[project_id][site_state] = {};
                const purchases_by_week = groupListBy('week', purchases);
                Object.entries(purchases_by_week).map(
                  ([week, purchases]: [string, any]) => {
                    if (!weeks_available.includes(week))
                      weeks_available.push(week);
                    results_by_week[project_id][site_state][week] =
                      purchases.reduce(
                        (total, purchase) => (total += purchase.total_cost),
                        0,
                      );
                  },
                );
              },
            );
          }
          if (project_data?.times) {
            const times_by_site = groupListBy('site_state', project_data.times);
            Object.entries(times_by_site).map(
              ([site_state, times]: [string, any]) => {
                if (!results_by_week[project_id][site_state])
                  results_by_week[project_id][
                    site_state !== 'undefined' ? site_state : 'No state'
                  ] = {};
                const sites_by_week = groupListBy('week', times);
                Object.entries(sites_by_week).map(
                  ([week, purchases]: [string, any]) => {
                    results_by_week[project_id][site_state][week] =
                      purchases.reduce(
                        (total, purchase) => (total += purchase.subtotal),
                        0,
                      );
                  },
                );
              },
            );
          }
        },
      );
      weeks_available = weeks_available
        .filter((week) => week !== 'undefined')
        .sort();
      excel_columns = [
        { header: 'Site', key: 'PROJECT_ID', width: 25 },
        { header: 'No Date', key: 'NO DATE', width: 15 },
        ...weeks_available.map((week) => ({
          header: week,
          key: week.toUpperCase(),
          width: 15,
        })),
      ];
      const groups: group[] = [];
      Object.entries(results_by_week).map(
        ([project_id, states]: [string, any]) => {
          // Se agrega al inicio del renglon, el ID de projecto.
          const group_data: group = {
            name: `${project_id} - ${props.projects[project_id]?.name ?? 'Unnamed Project'}`,
            rows: [],
          };
          excel_rows.push([project_id]);
          Object.entries(states).map(([state, weeks]: [string, any]) => {
            const row: excel_cell[] = [];
            // Se agrega el nombre del sitio.
            row.push(state);
            // Se agrega el total SIN fecha.
            if (weeks['undefined'])
              row.push(USDollar.format(weeks['undefined']));
            else row.push(USDollar.format(0));
            // Se agrega el resto de semanas
            weeks_available.map((week) => {
              if (!weeks[week]) row.push(USDollar.format(0));
              else row.push(USDollar.format(weeks[week]));
            });
            excel_rows.push(row);
            group_data.rows.push(row);
          });
          groups.push(group_data);
        },
      );
      setColumns(['Project', 'No date', ...weeks_available]);
      setRows(groups);
    }
    excelColumnsCallback(excel_columns);
    excelRowsCallback(excel_rows);
    setLoading(false);
  };

  useEffect(() => {
    if (Object.values(expenses).length !== 0 && displayOption !== undefined)
      formatAsTable(expenses, displayOption);
  }, [expenses, displayOption]);

  useEffect(() => {
    updateSitesAvailable();
    updateExpenses();
  }, []);

  return (
    <div className="max-w-full relative">
      <PillsMenu
        tabs={displayOptions}
        onSelectCallback={handleChangeOption}
        default_key="BY_PROJECT"
      />
      {loading && (
        <div className="py-4">
          <Alert
            status="warning"
            label="Loading"
            details="Generating table, this could take a few seconds."
          />
        </div>
      )}
      {!loading && columns && rows && (
        <Table
          columns={columns}
          rows={rows}
          styles={{
            vertical_lines: true,
            dynamic_headers: true,
            max_width: '97vw',
            row_height: 'xs',
            headers: {
              first_column_size: 'w-52',
              column_size: 'min-w-28',
            },
            rows: {
              remark_label: true,
              static_label: true,
              label_width: 'w-52',
              cell_width: 'min-w-28',
            },
            static_headers: true,
            max_height: 'max-h-[27rem]',
          }}
        />
      )}
    </div>
  );
}

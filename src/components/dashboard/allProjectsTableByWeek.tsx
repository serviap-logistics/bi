import { useEffect, useState } from 'react';
import Table, { group, row } from '../utils/table';
import { getRegistrationTimes } from '../../api/registration_times';
import { registration_time_type } from '../../types/registration_time.type';
import { excel_cell, excel_column, groupListBy, USDollar } from '../../utils';
import Alert from '../utils/alert';
import { purchase_type } from '../../types/purchase.type';
import { getPurchases as getAirtablePurchases } from '../../api/purchases';
import { tabs_menu_option_type } from '../utils/tabsMenu';
// import { getSites } from '../../api/sites';
import PillsMenu from '../utils/pillsMenu';

/*
function CustomCellData(props: {
  site: string;
  address: string;
  start_date: string;
  end_date: string;
}) {
  return (
    <div className="flex flex-col">
      <span>{props.site}</span>
      <span className="text-xs text-slate-400 text-wrap">{props.address}</span>
      <span className="text-xs text-slate-400">Start: {props.start_date}</span>
      <span className="text-xs text-slate-400">
        Completion: {props.end_date}
      </span>
    </div>
  );
}
*/
type display_types_available = 'BY_PROJECT' | 'BY_SITE';
const DEFAULT_DISPLAY_OPTION = 'BY_PROJECT';

export default function AllProjectsTableByWeek(props: {
  excelRowsCallback: any;
  excelColumnsCallback: any;
}) {
  const { excelRowsCallback, excelColumnsCallback } = props;
  const [displayOptions, setDisplayOptions] = useState<tabs_menu_option_type[]>(
    [
      { key: 'BY_PROJECT', current: true, name: 'By Project', icon: undefined },
      { key: 'BY_SITE', current: false, name: 'By Site', icon: undefined },
    ],
  );
  const [displayOption, setDisplayOption] = useState<string | undefined>(
    DEFAULT_DISPLAY_OPTION,
  );

  const handleChangeOption = (tab: tabs_menu_option_type) => {
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

  const getPurchases = async (): Promise<purchase_type[]> => {
    const purchases_found: purchase_type[] = await getAirtablePurchases({
      view: 'BI',
      fields: [
        'project_id',
        'week',
        'site_name',
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
    const rawTimes: registration_time_type[] = await getRegistrationTimes({
      worked: true,
      travel: true,
      waiting: true,
    });
    const times = rawTimes.map((time_registered: registration_time_type) => {
      return {
        project_id: time_registered.project_id,
        site_name: time_registered.site_name,
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
      console.log('Weeks: ', weeks_available);
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
      console.log('Results: ', rows);
      setRows(rows);
      setColumns(['Project', 'No date', ...weeks_available]);
      excel_columns = [
        { header: 'Project ID', key: 'PROJECT_ID', width: 25 },
        { header: 'No Date', key: 'NO DATE', width: 15 },
        ...weeks_available.map((week) => ({
          header: week,
          key: week.toUpperCase(),
          width: 15,
        })),
      ];
      excel_rows = rows;
    } else if (displayOption === 'BY_SITE') {
      let weeks_available: string[] = [];
      // const allSites = async () =>
      //   await getSites({
      //     view: 'BI',
      //     fields: ['site_name', 'site_address', 'customer_name'],
      //   });
      Object.entries(expenses).map(
        ([project_id, project_data]: [string, any]) => {
          // project_data: {purchases: [], times: []}
          if (!results_by_week[project_id]) results_by_week[project_id] = {};
          if (project_data?.purchases) {
            const purchases_by_site = groupListBy(
              'site_name',
              project_data.purchases,
            );
            Object.entries(purchases_by_site).map(
              ([site, purchases]: [string, any]) => {
                if (!results_by_week[project_id][site])
                  results_by_week[project_id][site] = {};
                const purchases_by_week = groupListBy('week', purchases);
                Object.entries(purchases_by_week).map(
                  ([week, purchases]: [string, any]) => {
                    if (!weeks_available.includes(week))
                      weeks_available.push(week);
                    results_by_week[project_id][site][week] = purchases.reduce(
                      (total, purchase) => (total += purchase.total_cost),
                      0,
                    );
                    console.log(results_by_week[project_id][site]);
                  },
                );
              },
            );
          }
          if (project_data?.times) {
            const times_by_site = groupListBy('site_name', project_data.times);
            Object.entries(times_by_site).map(
              ([site, times]: [string, any]) => {
                if (!results_by_week[project_id][site])
                  results_by_week[project_id][
                    site !== 'undefined' ? site : 'No site'
                  ] = {};
                const sites_by_week = groupListBy('week', times);
                Object.entries(sites_by_week).map(
                  ([week, purchases]: [string, any]) => {
                    results_by_week[project_id][site][week] = purchases.reduce(
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
      const groups: group[] = [];
      Object.entries(results_by_week).map(
        ([project_id, sites]: [string, any]) => {
          // Se agrega al inicio del renglon, el ID de projecto.
          const group_data: group = { name: project_id, rows: [] };
          Object.entries(sites).map(([site, weeks]: [string, any]) => {
            const row: row = [];
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
            group_data.rows.push(row);
          });
          groups.push(group_data);
        },
      );
      console.log('Results: ', groups);
      setRows(groups);
      // setColumns(['Project', 'No date', ...weeks_available]);
      // excel_columns = [
      //   { header: 'Project ID', key: 'PROJECT_ID', width: 25 },
      //   { header: 'No Date', key: 'NO DATE', width: 15 },
      //   ...weeks_available.map((week) => ({
      //     header: week,
      //     key: week.toUpperCase(),
      //     width: 15,
      //   })),
      // ];
      // excel_rows = rows;
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

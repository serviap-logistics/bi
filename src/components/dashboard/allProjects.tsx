import { ArrowDownCircleIcon } from '@heroicons/react/24/outline';
import PillsMenu from '../utils/pillsMenu';
import { tabs_menu_option_type } from '../utils/tabsMenu';
import { createContext, useState } from 'react';
import { excel_column, generateExcel } from '../../utils';
import { saveAs } from 'file-saver';
import AllProjectsTableByAmounts from './allProjectsTableByAmounts';
import AllProjectsTableByWeek from './allProjectsTableByWeek';

type report_types_available = 'BY_WEEK' | 'BY_PROJECT';
const DEFAULT_REPORT_TYPE = 'BY_PROJECT';
const INITIAL_REPORT_TYPES = [
  { key: 'BY_PROJECT', current: true, name: 'By Project', icon: undefined },
  // { key: 'BY_WEEK', current: false, name: 'By Week', icon: undefined },
];

export const ReportTypeContext =
  createContext<report_types_available>(DEFAULT_REPORT_TYPE);

export default function DashboardAllProjects() {
  const [reportType, setReportType] =
    useState<report_types_available>(DEFAULT_REPORT_TYPE);
  const [reportTypes, setReportTypes] =
    useState<tabs_menu_option_type[]>(INITIAL_REPORT_TYPES);

  const handleChangeReport = (tab: tabs_menu_option_type) => {
    if (reportType !== tab.key) {
      setReportTypes(
        reportTypes.map((option) => ({
          ...option,
          current: option.key === tab.key,
        })),
      );
      setReportType(tab.key as report_types_available);
    }
  };

  const [excelRows, setExcelRows] = useState([]);
  const [excelColumns, setExcelColumns] = useState<excel_column[]>([]);
  const onChangeRows = (rows) => {
    setExcelRows(rows);
  };
  const onChangeColumns = (columns: excel_column[]) => {
    setExcelColumns(columns);
  };

  const handleExportAsExcel = async () => {
    const settings = { mergeCells: [] };
    const buffer = await generateExcel(
      [
        {
          name: `AMOUNTS (${reportType.replace('_', ' ')})`,
          columns: excelColumns,
          rows: excelRows,
        },
      ],
      settings,
    );
    saveAs(new Blob([buffer as Buffer]), `AMOUNTS (BY PROJECT).xlsx`);
  };

  return (
    <div className="overflow-hidden bg-white sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {/* Titulo de la seccion 'All projects' */}
        <li className="px-4 py-4 sm:px-6 lg:px-10 flex justify-center">
          <div>
            <p className="order-first text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              All projects
            </p>
          </div>
        </li>
        {/* Seccion con botones */}
        <li className="py-2 sm:px-2 lg:px-4 flex flex-col justify-center">
          <div className="sticky top-[7rem] bg-white z-10 py-1 flex justify-between">
            <PillsMenu
              tabs={reportTypes}
              onSelectCallback={handleChangeReport}
              default_key="BY_DAY"
            />
            <button
              type="button"
              className="inline-flex items-center gap-x-2 rounded-md bg-slate-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
              onClick={handleExportAsExcel}
            >
              Export as Excel
              <ArrowDownCircleIcon
                aria-hidden="true"
                className="-mr-0.5 h-5 w-5"
              />
            </button>
          </div>
        </li>
        {/* Seccion con titulo y la tabla de reporte. */}
        <li className="px-2 py-4 flex flex-col justify-center">
          <span className="bg-white px-3 text-base text-center font-semibold leading-6 text-gray-900">
            {'Summary ' +
              reportTypes.find((tab) => tab.current)?.name.toLowerCase()}
          </span>
          {reportType === 'BY_PROJECT' && (
            <AllProjectsTableByAmounts
              excelRowsCallback={onChangeRows}
              excelColumnsCallback={onChangeColumns}
            />
          )}
          {reportType === 'BY_WEEK' && (
            <AllProjectsTableByWeek
              excelRowsCallback={onChangeRows}
              excelColumnsCallback={onChangeColumns}
            />
          )}
        </li>
      </ul>
    </div>
  );
}

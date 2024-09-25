import { createContext, useContext, useState } from 'react';
import TabsMenu, { tabs_menu_option_type } from '../utils/tabsMenu';
import HeadcountProjectDetails from './projectDetail';
import HeadcountTableByDate from './tableByDate';
import Divider from '../utils/divider';
import PillsMenu from '../utils/pillsMenu';
import HeadcountTableByRole from './tableByRole';
import HeadcountSummary from './summary';
import { ArrowDownCircleIcon } from '@heroicons/react/24/outline';
import { excel_column, generateExcel } from '../../utils';
import { saveAs } from 'file-saver';
import { ProjectContext } from '.';

type report_types_available = 'HOURS' | 'COST' | 'PEOPLE';
type summary_types_available = 'BY_DAY' | 'BY_ROLE';

const DEFAULT_REPORT_TYPE = 'HOURS';
const DEFAULT_SUMMARY_TYPE = 'BY_DAY';

export const ReportTypeContext =
  createContext<report_types_available>(DEFAULT_REPORT_TYPE);
export const SummaryTypeContext =
  createContext<summary_types_available>(DEFAULT_SUMMARY_TYPE);

export default function HeadcountReportByType() {
  const project = useContext(ProjectContext);
  const [reportTypes, setReportTypes] = useState<tabs_menu_option_type[]>([
    { key: 'HOURS', current: true, name: 'Hours', icon: undefined },
    { key: 'COST', current: false, name: 'Cost', icon: undefined },
    { key: 'PEOPLE', current: false, name: 'People', icon: undefined },
    // FIXME: Es probable que la seccion de TODO se vea en un Dashboard general.
    // { key: 'ALL', current: false, name: 'All', icon: undefined },
  ]);
  const [summaryTabs, setSummaryTypes] = useState<tabs_menu_option_type[]>([
    { key: 'BY_DAY', current: true, name: 'By Day', icon: undefined },
    { key: 'BY_ROLE', current: false, name: 'By Role', icon: undefined },
  ]);

  const [reportType, setReportType] =
    useState<report_types_available>(DEFAULT_REPORT_TYPE);
  const [summaryType, setSummaryType] =
    useState<summary_types_available>(DEFAULT_SUMMARY_TYPE);

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
  const handleChangeSummary = (tab: tabs_menu_option_type) => {
    if (summaryType !== tab.key) {
      setSummaryTypes(
        summaryTabs.map((option) => ({
          ...option,
          current: option.key === tab.key,
        })),
      );
      setSummaryType(tab.key as summary_types_available);
    }
  };

  const [excelRows, setExcelRows] = useState([]);
  const [excelColumns, setExcelColumns] = useState<excel_column[]>([]);
  const onChangeRows = (rows) => {
    console.log('Generating rows! ', rows);
    setExcelRows(rows);
  };
  const onChangeColumns = (columns: excel_column[]) => {
    console.log('Generating columns! ', columns);
    setExcelColumns(columns);
  };

  const handleExportAsExcel = async () => {
    const settings = { mergeCells: [] };
    if (summaryType === 'BY_ROLE') {
      const temp_columns = excelColumns;
      temp_columns.shift();
      console.log(excelColumns);
      console.log(temp_columns);
    }
    const buffer = await generateExcel(
      [
        {
          name: `${reportType} (${summaryType.replace('_', ' ')})`,
          columns: excelColumns,
          rows: excelRows,
        },
      ],
      settings,
    );
    saveAs(new Blob([buffer as Buffer]), `${project?.project_id}.xlsx`);
  };

  return (
    <>
      <div className="sticky top-16 bg-white z-10">
        <TabsMenu
          label="Report Type"
          tabs={summaryTabs}
          onSelectCallback={handleChangeSummary}
        />
      </div>
      <ReportTypeContext.Provider value={reportType}>
        <>
          <HeadcountProjectDetails />
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
          <HeadcountSummary />
          <Divider
            label={
              'Summary ' +
              summaryTabs.find((tab) => tab.current)?.name.toLowerCase()
            }
          />
          {summaryType === 'BY_DAY' && (
            <HeadcountTableByDate
              excelRowsCallback={onChangeRows}
              excelColumnsCallback={onChangeColumns}
            />
          )}
          {summaryType === 'BY_ROLE' && (
            <HeadcountTableByRole
              excelRowsCallback={onChangeRows}
              excelColumnsCallback={onChangeColumns}
            />
          )}
        </>
      </ReportTypeContext.Provider>
    </>
  );
}

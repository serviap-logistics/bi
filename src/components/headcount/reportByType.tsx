import { createContext, useState } from "react";
import TabsMenu, { tabs_menu_option_type } from "../utils/tabsMenu"
import HeadcountProjectDetails from "./projectDetail";
import HeadcountTableByDate from "./tableByDate";
import Divider from "../utils/divider";
import PillsMenu from "../utils/pillsMenu";
import HeadcountTableByRole from "./tableByRole";

type report_types_available = 'HOURS' | 'COST' | 'ALL';
type summary_types_available = 'BY_DAY' | 'BY_ROLE' ;

const DEFAULT_REPORT_TYPE = 'HOURS'
const DEFAULT_SUMMARY_TYPE = 'BY_DAY'

export const ReportTypeContext = createContext<report_types_available>(DEFAULT_REPORT_TYPE);
export const SummaryTypeContext = createContext<summary_types_available>(DEFAULT_SUMMARY_TYPE);

export default function HeadcountReportByType(){
  const [reportTypes, setReportTypes] = useState<tabs_menu_option_type[]>([
    {key: 'HOURS', current: true, name: 'Hours', icon: undefined},
    {key: 'COST', current: false, name: 'Cost', icon: undefined},
    {key: 'ALL', current: false, name: 'Hours & Cost', icon: undefined},
  ]);
  const [summaryTabs, setSummaryTypes] = useState<tabs_menu_option_type[]>([
    {key: 'BY_DAY', current: true, name: 'By Day', icon: undefined},
    {key: 'BY_ROLE', current: false, name: 'By Role', icon: undefined},
  ]);

  const [reportType, setReportType] = useState<report_types_available>(DEFAULT_REPORT_TYPE);
  const [summaryType, setSummaryType] = useState<summary_types_available>(DEFAULT_SUMMARY_TYPE);

  const handleChangeReport = (tab : tabs_menu_option_type) => {
    if (reportType !== tab.key) {
      setReportTypes(reportTypes.map((option) => ({...option, current: option.key === tab.key})))
      setReportType(tab.key as report_types_available)
    }
  }
  const handleChangeSummary = (tab : tabs_menu_option_type) => {
    if (summaryType !== tab.key) {
      setSummaryTypes(summaryTabs.map((option) => ({...option, current: option.key === tab.key})))
      setSummaryType(tab.key as summary_types_available)
    }
  }

  return (
    <>
      <div className="sticky top-16 bg-white z-10">
        <TabsMenu label="Report Type" tabs={reportTypes} onSelectCallback={handleChangeReport} />
      </div>
      <ReportTypeContext.Provider value={reportType}>
        <HeadcountProjectDetails />
        {
          (reportType === 'HOURS' || reportType === 'COST') &&
          <>
            <div className="sticky top-[8rem] bg-white z-10">
              <PillsMenu tabs={summaryTabs} onSelectCallback={handleChangeSummary} default_key="BY_DAY" />
            </div>
            <Divider label={"Summary " + summaryTabs.find((tab) => tab.current)?.name.toLowerCase()}/>
            {
              summaryType === 'BY_DAY' && <HeadcountTableByDate />
            }
            {
              summaryType === 'BY_ROLE' && <HeadcountTableByRole />
            }
          </>
        }
      </ReportTypeContext.Provider>
    </>
  )
}
import { createContext, useState } from "react";
import TabsMenu, { tabs_menu_option_type } from "../utils/tabsMenu"
import HeadcountProjectDetails from "./projectDetail";
import HeadcountTableByDate from "./tableByDate";
import Divider from "../utils/divider";
import PillsMenu from "../utils/pillsMenu";

type report_types_available = 'HOURS' | 'COST' | 'ALL';
const tabs : tabs_menu_option_type[] = [
  {key: 'HOURS', current: true, name: 'Hours', icon: undefined, content: null},
  {key: 'COST', current: false, name: 'Cost', icon: undefined, content: null},
  {key: 'ALL', current: false, name: 'Hours & Cost', icon: undefined, content: null},
]

type summary_types_available = 'BY_DAY' | 'BY_ROLE' ;
const summary_tabs : tabs_menu_option_type[] = [
  {key: 'HOURS', current: true, name: 'By Day', icon: undefined, content: null},
  {key: 'COST', current: false, name: 'By Role', icon: undefined, content: null},
]

export const ReportTypeContext = createContext<report_types_available>('HOURS');
export const SummaryTypeContext = createContext<summary_types_available>('BY_DAY');

export default function HeadcountReportByType(){
  const [currentTab, setCurrentTab] = useState<report_types_available>('HOURS');
  const [summaryTab, setSummaryTab] = useState<summary_types_available>('BY_DAY');

  const setActiveTab = (tabs, key) => tabs.map((tab) => (tab.current = tab.key === key));

  const handleChangeTab = (tab : tabs_menu_option_type) => {
    if (currentTab !== tab.key) {
      setActiveTab(tabs, tab.key)
      setCurrentTab(tab.key as report_types_available)
    }
  }
  const handleChangeSummaryTab = (tab : tabs_menu_option_type) => {
    if (summaryTab !== tab.key) {
      setActiveTab(summaryTab, tab.key)
      setSummaryTab(tab.key as summary_types_available)
    }
  }

  return (
    <>
      <TabsMenu label="Report Type" tabs={tabs} onSelectCallback={handleChangeTab} />
      <ReportTypeContext.Provider value={currentTab}>
        <HeadcountProjectDetails />
        {
          (currentTab === 'HOURS' || currentTab === 'COST') &&
          <>
            <PillsMenu tabs={summary_tabs} onSelectCallback={handleChangeSummaryTab} default_key="BY_DAY" />
            <Divider label={"Summary " + summary_tabs.find((tab) => tab.current)?.name.toLowerCase()}/>
            {summaryTab === 'BY_DAY' && <HeadcountTableByDate />}
          </>
        }
      </ReportTypeContext.Provider>
    </>
  )
}
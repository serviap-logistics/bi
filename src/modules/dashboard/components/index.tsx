import { createContext, useContext, useEffect, useState } from 'react';
import PurchasesSummary from '../projectSummary/purchasesSummary';
import ProjectDetails from '../projectSummary/projectDetail';
import FinanceSummary from '../projectSummary/financeSummary';
import DashboardAllProjects from './allProjects';
import { project } from '../../services/projects';
import DashboardFilters from './filters';
import { cost_analysis, getCostAnalysis } from '../../services/cost_analysis';
import HeadcountSummary from '../projectSummary/headcountSummary';
import { CountryContext } from '../../../App';

export const ProjectContext = createContext<project | undefined>(undefined);

export const CostAnalysisContext = createContext<cost_analysis | undefined>(
  undefined,
);

export default function Dashboard() {
  const country = useContext(CountryContext);
  const [project, setProject] = useState<project | undefined>();
  const [costAnalysis, setCostAnalysis] = useState<cost_analysis | undefined>();
  const [headcountSubtotal, setHeadcountSubtotal] = useState<number>(0);
  const [purchasesSubtotal, setPurchasesSubtotal] = useState<number>(0);

  const updateCostAnalysis = async (cost_analysis_id: string) => {
    const cost_analysis: cost_analysis[] = await getCostAnalysis(country, {
      view: 'BI',
      fields: [
        'cost_analysis_id',
        'cost_analysis_code',
        'total_labor_cost',
        'total_labor_hours',
        'start_date',
        'end_date',
      ],
      formula: encodeURI(`cost_analysis_id='${cost_analysis_id}'`),
    });
    if (cost_analysis.length == 1) {
      setCostAnalysis(cost_analysis[0]);
    } else if (cost_analysis.length > 1) {
      console.log('More than 1 CA found! Send alert...');
    }
  };

  useEffect(() => {
    if (project?.cost_analysis_id) {
      updateCostAnalysis(project.cost_analysis_id);
    } else {
      setCostAnalysis(undefined);
    }
  }, [project]);

  return (
    <div id="purchase__section">
      <ProjectContext.Provider value={project}>
        <CostAnalysisContext.Provider value={costAnalysis}>
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
            {country === 'USA' ? 'Dashboard' : 'Resumen'}
          </h3>
          <DashboardFilters onChangeCallback={setProject} />
          {project && (
            <>
              <ProjectDetails />
              {country === 'USA' && (
                <HeadcountSummary
                  onUpdateSubtotalCallback={setHeadcountSubtotal}
                />
              )}
              <PurchasesSummary
                onUpdateSubtotalCallback={setPurchasesSubtotal}
              />
              <FinanceSummary
                headcount_subtotal={headcountSubtotal}
                purchases_subtotal={purchasesSubtotal}
              />
            </>
          )}
          {!project && <DashboardAllProjects />}
        </CostAnalysisContext.Provider>
      </ProjectContext.Provider>
    </div>
  );
}

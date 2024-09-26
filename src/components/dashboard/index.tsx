import { createContext, useEffect, useState } from 'react';
import { project_type } from '../../types/project.type';
import { cost_analysis_type } from '../../types/cost_analysis.type';
import DashboardFilters from './filters';
import { getCostAnalysis } from '../../api/cost_analysis';
import HeadcountSummary from './headcountSummary';
import PurchasesSummary from './purchasesSummary';
import ProjectDetails from './projectDetail';
import FinanceSummary from './financeSummary';
import DashboardAllProjects from './allProjects';

export const ProjectContext = createContext<project_type | undefined>(
  undefined,
);

export const CostAnalysisContext = createContext<
  cost_analysis_type | undefined
>(undefined);

export default function Dashboard() {
  const [project, setProject] = useState<project_type | undefined>();
  const [costAnalysis, setCostAnalysis] = useState<
    cost_analysis_type | undefined
  >();
  const [headcountSubtotal, setHeadcountSubtotal] = useState<number>(0);
  const [purchasesSubtotal, setPurchasesSubtotal] = useState<number>(0);

  const updateCostAnalysis = async (cost_analysis_id: string) => {
    const cost_analysis: cost_analysis_type[] = await getCostAnalysis({
      view: 'BI',
      fields: [
        'cost_analysis_id',
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
            Dashboard
          </h3>
          <DashboardFilters onChangeCallback={setProject} />
          {project && (
            <>
              <ProjectDetails />
              <HeadcountSummary
                onUpdateSubtotalCallback={setHeadcountSubtotal}
              />
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

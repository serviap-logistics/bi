import { createContext, useContext, useEffect, useState } from 'react';
import HeadcountFilters from './filters';
import { cost_analysis, getCostAnalysis } from '../../services/cost_analysis';
import HeadcountReportByType from './reportByType';
import { project } from '../../services/projects';
import { CountryContext } from '../../../App';

export const ProjectContext = createContext<project | undefined>(undefined);

export const CostAnalysisContext = createContext<cost_analysis | undefined>(
  undefined,
);

export default function Headcount() {
  const country = useContext(CountryContext);
  const [project, setProject] = useState<project | undefined>();
  const [costAnalysis, setCostAnalysis] = useState<cost_analysis | undefined>();

  const updateCostAnalysis = async (cost_analysis_id: string) => {
    const cost_analysis: cost_analysis[] = await getCostAnalysis(country, {
      view: 'BI',
      fields: [
        'cost_analysis_id',
        'cost_analysis_code',
        'total_labor_cost',
        'total_labor_hours',
        'total_labor_perdiem_count',
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
            Headcount
          </h3>
          <HeadcountFilters onChangeCallback={setProject} />
          {project && <HeadcountReportByType />}
        </CostAnalysisContext.Provider>
      </ProjectContext.Provider>
    </div>
  );
}

import { createContext, useEffect, useState } from 'react';
import PurchasesReportFilters from './filters';
import PurchasesAmountsByCategory from './amountByCategory';
import PurchasesAmountsByCategoryGraph from './amountByCategoryGraph';
import ProjectDetails from './projectDetail';
import { project_type } from '../../types/project.type';
import { purchase_type } from '../../types/purchase.type';
import { cost_analysis_type } from '../../types/cost_analysis.type';
import TableByCategory from './tableByCategory';
import { getPurchases as getAirtablePurchases } from '../../api/purchases';
import { getCostAnalysis as getAirtableCostAnalysis } from '../../api/cost_analysis';

export const ProjectContext = createContext<project_type | undefined>(
  undefined,
);

export const CostAnalysisContext = createContext<
  cost_analysis_type | undefined
>(undefined);

export default function Purchases() {
  const [purchases, setPurchases] = useState<purchase_type[]>([]);
  const [project, setProject] = useState<project_type | undefined>();
  const [costAnalysis, setCostAnalysis] = useState<
    cost_analysis_type | undefined
  >();
  const [requestCounter, setRequestCounter] = useState(0);
  const [responses, setResponses] = useState<object>({});

  const getPurchases = async () => {
    const currentRequest = requestCounter + 1;
    setRequestCounter(currentRequest);
    const purchases_found: purchase_type[] = await getAirtablePurchases({
      view: 'BI',
      formula: project
        ? encodeURI(`{project_id}="${project.project_id}"`)
        : undefined,
      fields: [
        'cost_analysis_id',
        'project_id',
        'status_request',
        'Category',
        'total_cost',
      ],
      offset: undefined,
    });
    setResponses((prevState) => ({
      ...prevState,
      [currentRequest]: purchases_found,
    }));
  };

  const getCostAnalysis = async () => {
    const ca_found: cost_analysis_type[] = await getAirtableCostAnalysis({
      view: 'BI',
      formula: encodeURI(`{cost_analysis_id}='${project?.cost_analysis_id}'`),
      fields: [
        'total_cost',
        'cost_analysis_id',
        'cost_analysis_id',
        'total_purchases_cost',
        'total_material_cost',
        'total_labor_cost',
        'total_labor_staffing_cost',
        'total_equipment_cost',
        'total_subcontractor_cost',
        'total_lodge_cost',
        'total_miscelanea_cost',
      ],
      offset: undefined,
    });
    if (ca_found.length == 1) {
      setCostAnalysis(ca_found[0]);
    }
  };

  const handleSelectProject = (project: project_type) => {
    setProject(project);
  };

  useEffect(() => {
    // Ya que se encontró la última respuesta, se eliminan todas las demás (hasta que se haga la siguiente petición).
    setResponses({});
  }, [purchases]);

  useEffect(() => {
    const lastReponse = Math.max(
      ...Object.keys(responses).map((key) => Number(key)),
    );
    if (Object.keys(responses).length > 0 && requestCounter === lastReponse) {
      setPurchases(responses[requestCounter]);
    }
  }, [responses]);

  useEffect(() => {
    getPurchases();
    if (project?.cost_analysis_id) {
      getCostAnalysis();
    } else {
      setCostAnalysis(undefined);
    }
  }, [project]);

  return (
    <div id="purchase__section">
      <ProjectContext.Provider value={project}>
        <CostAnalysisContext.Provider value={costAnalysis}>
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
            Purchases Summary
          </h3>
          <PurchasesReportFilters onSelectCallback={handleSelectProject} />
          <ProjectDetails purchases={purchases} />
          {project && <TableByCategory purchases={purchases} />}
          <PurchasesAmountsByCategory purchases={purchases} />
          {purchases.length > 0 && (
            <PurchasesAmountsByCategoryGraph purchases={purchases} />
          )}
        </CostAnalysisContext.Provider>
      </ProjectContext.Provider>
    </div>
  );
}

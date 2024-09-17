import { useContext, useEffect, useState } from 'react';
import { CostAnalysisContext, ProjectContext } from '.';
import { getPercentageUsed, groupListBy } from '../../utils';
import Toast from '../utils/toast';
import { getRegistrationTimes } from '../../api/registration_times';
import { cost_analysis_type } from '../../types/cost_analysis.type';
import { getCALaborDetails } from '../../api/ca_labor_details';

export default function HeadcountProjectDetails() {
  const project = useContext(ProjectContext);
  const costAnalysis = useContext(CostAnalysisContext);
  type report_data = { people: number };
  const [budget, setBudget] = useState<report_data>({
    people: 0,
  });
  const [real, setReal] = useState<report_data>({
    people: 0,
  });
  const [indicators, setIndicators] = useState({
    people_difference: 0,
    people_percentage_used: 0,
  });

  const updateDifference = (budget: report_data, real: report_data) => {
    setIndicators({
      people_difference: budget.people - real.people,
      people_percentage_used: getPercentageUsed(budget.people, real.people),
    });
  };

  const updateBudget = async (costAnalysis: cost_analysis_type) => {
    // Se obtienen los Labors Details de la tabla CO Labor Details
    const budget_times = await getCALaborDetails({
      fields: ['cost_analysis_id', 'employee_role', 'people_quantity'],
      view: 'BI',
      formula: encodeURI(`cost_analysis_id='${costAnalysis.cost_analysis_id}'`),
    });
    const people_by_role: object = groupListBy('employee_role', budget_times);
    // Por cada role encontrado, se determina la cantidad de personas involucradas (buscando el maximo)
    if (Object.entries(people_by_role).length > 0) {
      Object.entries(people_by_role).map(
        ([role, records]) =>
          (people_by_role[role] = records.reduce(
            (total, record) =>
              record.people_quantity > total ? record.people_quantity : total,
            0,
          )),
      );
    }
    setBudget({
      // La candidad de personas esperadas sera el total por cada uno de los tipos de role.
      people:
        Object.values(people_by_role).length > 0
          ? Object.values(people_by_role).reduce(
              (total, quantity) => total + quantity,
            )
          : 0,
    });
  };

  const updateReal = async (project_id) => {
    const real_times = await getRegistrationTimes({
      worked: true,
      travel: true,
      waiting: true,
      project_id: project_id,
    });
    const total_employees = [
      ...new Set(real_times.map((record) => record.employee_id)),
    ].length;

    setReal({
      people: total_employees,
    });
  };

  useEffect(() => {
    updateDifference(budget, real);
  }, [budget, real]);

  useEffect(() => {
    if (costAnalysis) updateBudget(costAnalysis);
  }, [costAnalysis]);

  useEffect(() => {
    if (project) updateReal(project.project_id);
  }, [project]);

  return (
    <div className="overflow-hidden bg-white sm:rounded-md border-b border-gray-200">
      <ul
        role="list"
        className="divide-y divide-gray-200 flex flex-col align-middle"
      >
        <li className="px-4 py-4 sm:px-6 lg:px-10 grid grid-cols-2 grap-y-4 gap-x-8">
          <div>
            <p className="order-first text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              {project?.project_id ? project?.project_id : 'ALL PROJECTS'}
            </p>
            {project && project.customer_name && (
              <div>
                <p className="text-base leading-7 text-gray-600">
                  {project.customer_name}
                </p>
                <p className="text-xs text-gray-600">
                  {project.start_date} - {project.end_date}
                </p>
              </div>
            )}
          </div>
          <div className="text-center grid grid-cols-2">
            <p className="col-span-2 font-semibold tracking-tight text-gray-900">
              People Quantity
            </p>
            <div>
              <p className="tracking-tight text-gray-900">Expected</p>
              <p>
                <span className="text-lg font-semibold mr-1.5">
                  {budget.people}
                </span>
                labors
              </p>
            </div>
            <div>
              <p className="tracking-tight text-gray-900">Registered</p>
              <p>
                <span className="text-lg font-semibold mr-1.5">
                  {real.people}
                </span>
                labors
              </p>
            </div>
            <div className="col-span-2">
              <Toast
                text={indicators.people_percentage_used.toFixed(2) + '%'}
                color={
                  indicators.people_percentage_used <= 50
                    ? 'success'
                    : indicators.people_percentage_used <= 70
                      ? 'info'
                      : indicators.people_percentage_used <= 90
                        ? 'warning'
                        : 'error'
                }
              />
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}

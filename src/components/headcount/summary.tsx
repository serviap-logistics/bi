import { useContext, useEffect, useState } from 'react';
import { CostAnalysisContext, ProjectContext } from '.';
import {
  getPercentageUsed,
  getToastColor,
  groupListBy,
  USDollar,
} from '../../utils';
import Toast from '../utils/toast';
import { ReportTypeContext } from './reportByType';
import { getRegistrationTimes } from '../../api/registration_times';
import { cost_analysis_type } from '../../types/cost_analysis.type';
import { getCALaborDetails } from '../../api/ca_labor_details';

type report_data = { hours: number; cost: number; people: number };

export default function HeadcountSummary() {
  const project = useContext(ProjectContext);
  const costAnalysis = useContext(CostAnalysisContext);
  const reportType = useContext(ReportTypeContext);
  const [budget, setBudget] = useState<report_data>({
    hours: 0,
    cost: 0,
    people: 0,
  });
  const [real, setReal] = useState<report_data>({
    hours: 0,
    cost: 0,
    people: 0,
  });
  const [indicators, setIndicators] = useState({
    hours_difference: 0,
    hours_percentage_used: 0,
    cost_difference: 0,
    cost_percentage_used: 0,
    people_difference: 0,
    people_percentage_used: 0,
  });

  const updateDifference = (budget: report_data, real: report_data) => {
    setIndicators({
      hours_difference: budget.hours - real.hours,
      hours_percentage_used: getPercentageUsed(budget.hours, real.hours),
      cost_difference: budget.cost - real.cost,
      cost_percentage_used: getPercentageUsed(budget.cost, real.cost),
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
    if (Object.entries(people_by_role).length > 0) {
      // Por cada role encontrado, se determina la cantidad de personas involucradas (buscando el maximo)
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
      hours: costAnalysis.total_labor_hours ?? 0,
      cost: costAnalysis.total_labor_cost ?? 0,
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
    const total_cost = real_times
      .map((record) => record.subtotal)
      .reduce((total: number, cost: any) => total + cost, 0);
    const total_hours = real_times
      .map((record) => record.total_hours)
      .reduce((total, hours) => total + hours, 0);
    const total_employees = [
      ...new Set(real_times.map((record) => record.employee_id)),
    ].length;

    setReal({
      hours: total_hours,
      cost: total_cost,
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
    <div className="overflow-hidden bg-white sm:rounded-md">
      <ul
        role="list"
        className="divide-y divide-gray-200 flex flex-col align-middle"
      >
        {project && (
          <li className="px-4 py-4 sm:px-6 flex grap-y-4 justify-evenly text-center">
            {/* Cost Analysis TOTAL */}
            <div>
              <p className="text-base leading-7 font-semibold text-gray-600">
                Cost Analysis
              </p>
              <p className="text-lg text-gray-600">
                {reportType === 'HOURS' &&
                  budget.hours.toLocaleString() + ' hours'}
                {reportType === 'COST' && USDollar.format(budget.cost)}
                {reportType === 'PEOPLE' && budget.people + ' labors'}
              </p>
            </div>
            {/* REAL */}
            <div>
              <p className="text-base leading-7 font-semibold text-gray-600">
                Hour Registration
              </p>
              <p className="text-lg text-gray-600">
                {reportType === 'HOURS' &&
                  real.hours.toLocaleString() + ' hours'}
                {reportType === 'COST' && USDollar.format(real.cost)}
                {reportType === 'PEOPLE' && real.people + ' labors'}
              </p>
            </div>
            {/* Difference */}
            <div>
              <p className="text-base leading-7 font-semibold text-gray-600">
                Difference
              </p>
              <p className="text-lg text-gray-600">
                {reportType === 'HOURS' &&
                  indicators.hours_difference.toLocaleString() + ' hours'}
                {reportType === 'COST' &&
                  USDollar.format(indicators.cost_difference)}
                {reportType === 'PEOPLE' &&
                  indicators.people_difference + ' labors'}
              </p>
            </div>
            {/* % Used */}
            <div>
              <p className="text-base leading-7 font-semibold text-gray-600">
                % Used
              </p>
              <p className="text-lg text-gray-600">
                {
                  <Toast
                    text={
                      (reportType === 'HOURS'
                        ? indicators.hours_percentage_used
                        : reportType === 'COST'
                          ? indicators.cost_percentage_used
                          : indicators.people_percentage_used
                      ).toFixed(2) + '%'
                    }
                    text_size="text-base"
                    color={getToastColor(
                      reportType === 'HOURS'
                        ? indicators.hours_percentage_used
                        : reportType === 'COST'
                          ? indicators.cost_percentage_used
                          : indicators.people_percentage_used,
                    )}
                  />
                }
              </p>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}

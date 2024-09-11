import { useContext, useEffect, useState } from 'react';
import { CostAnalysisContext, ProjectContext } from '.';
import { USDollar } from '../../utils';
import Toast from '../utils/toast';
import { ReportTypeContext } from './reportByType';
import { getRegistrationTimes } from '../../api/registration_times';
import { cost_analysis_type } from '../../types/cost_analysis.type';

export default function HeadcountProjectDetails() {
  const project = useContext(ProjectContext);
  const costAnalysis = useContext(CostAnalysisContext);
  const reportType = useContext(ReportTypeContext);
  type report_data = { hours: number; cost: number; people: number };
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
  });

  const getPercentage = (budget, real): number =>
    budget !== 0 ? (real * 100) / budget : real;

  const updateDifference = (budget: report_data, real: report_data) => {
    setIndicators({
      hours_difference: budget.hours - real.hours,
      hours_percentage_used: getPercentage(budget.hours, real.hours),
      cost_difference: budget.cost - real.cost,
      cost_percentage_used: getPercentage(budget.cost, real.cost),
    });
  };

  const updateBudget = (costAnalysis: cost_analysis_type) => {
    setBudget({
      hours: costAnalysis.total_labor_hours ?? 0,
      cost: costAnalysis.total_labor_cost ?? 0,
      people: 0,
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
      .map((record) => record.total_cost)
      .reduce((total, cost) => total + cost, 0);
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
                {' '}
                <Toast
                  text="TO DEFINE"
                  text_size="text-base"
                  color="error"
                />{' '}
              </p>
            </div>
            <div>
              <p className="tracking-tight text-gray-900">Registered</p>
              <p>
                {' '}
                <span className="text-lg font-semibold">
                  {real.people}
                </span>{' '}
                labors
              </p>
            </div>
            <div className="col-span-2">
              <Toast
                text={'Loading...'}
                color={
                  1000 <= 50
                    ? 'success'
                    : 1000 <= 70
                      ? 'info'
                      : 1000 <= 90
                        ? 'warning'
                        : 'error'
                }
              />
            </div>
          </div>
        </li>
        {project && (
          <li className="px-4 py-4 sm:px-6 flex grap-y-4 justify-evenly text-center">
            {/* Cost Analysis TOTAL */}
            <div>
              <p className="text-base leading-7 font-semibold text-gray-600">
                Cost Analysis
              </p>
              {(reportType === 'HOURS' || reportType === 'ALL') && (
                <p className="text-lg text-gray-600">
                  {budget.hours.toLocaleString() + ' hours'}
                </p>
              )}
              {(reportType === 'COST' || reportType === 'ALL') && (
                <p
                  className={`text-lg text-gray-600 mt-${reportType !== 'ALL' ? 0 : 1}`}
                >
                  {USDollar.format(budget.cost)}
                </p>
              )}
            </div>
            {/* REAL */}
            <div>
              <p className="text-base leading-7 font-semibold text-gray-600">
                Hour Registration
              </p>
              {(reportType === 'HOURS' || reportType === 'ALL') && (
                <p className="text-lg text-gray-600">
                  {' '}
                  {real.hours.toLocaleString() + ' hours'}
                </p>
              )}
              {(reportType === 'COST' || reportType === 'ALL') && (
                <p
                  className={`text-lg text-gray-600 mt-${reportType !== 'ALL' ? 0 : 1}`}
                >
                  {' '}
                  {USDollar.format(real.cost)}
                </p>
              )}
            </div>
            {/* Difference */}
            <div>
              <p className="text-base leading-7 font-semibold text-gray-600">
                Difference
              </p>
              {(reportType === 'HOURS' || reportType === 'ALL') && (
                <p className="text-lg text-gray-600">
                  {indicators.hours_difference.toLocaleString() + ' hours'}
                </p>
              )}
              {(reportType === 'COST' || reportType === 'ALL') && (
                <p
                  className={`text-lg text-gray-600 mt-${reportType !== 'ALL' ? 0 : 1}`}
                >
                  {USDollar.format(indicators.cost_difference)}
                </p>
              )}
            </div>
            {/* % Used */}
            <div>
              <p className="text-base leading-7 font-semibold text-gray-600">
                % Used
              </p>
              {(reportType === 'HOURS' || reportType === 'ALL') && (
                <p className="text-lg text-gray-600">
                  {' '}
                  {
                    <Toast
                      text={indicators.hours_percentage_used.toFixed(2) + '%'}
                      text_size="text-base"
                      color={
                        indicators.hours_percentage_used <= 50
                          ? 'success'
                          : indicators.hours_percentage_used <= 70
                            ? 'info'
                            : indicators.hours_percentage_used <= 90
                              ? 'warning'
                              : 'error'
                      }
                    />
                  }
                </p>
              )}
              {(reportType === 'COST' || reportType === 'ALL') && (
                <p className="text-lg text-gray-600">
                  {' '}
                  {
                    <Toast
                      text={indicators.cost_percentage_used.toFixed(2) + '%'}
                      text_size="text-base"
                      color={
                        indicators.cost_percentage_used <= 50
                          ? 'success'
                          : indicators.cost_percentage_used <= 70
                            ? 'info'
                            : indicators.cost_percentage_used <= 90
                              ? 'warning'
                              : 'error'
                      }
                    />
                  }
                </p>
              )}
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}

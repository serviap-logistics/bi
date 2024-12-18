import { useContext, useEffect, useState } from 'react';
import { CostAnalysisContext, ProjectContext } from '.';
import { getPercentageUsed, Indicator, USDollar } from '../../../utils';
import { purchase } from '../services/purchases';
import Toast from '../../../utils/components/toast';

export default function ProjectDetails(props: { purchases: purchase[] }) {
  const { purchases } = props;
  const project = useContext(ProjectContext);
  const costAnalysis = useContext(CostAnalysisContext);
  const [indicator, setIndicator] = useState<Indicator>();

  const updateIndicators = (purchases: purchase[]) => {
    const indicator = getPercentageUsed(
      costAnalysis?.total_cost ?? 0,
      purchases.reduce((total, purchase) => total + purchase.total_cost, 0),
    );
    setIndicator(indicator);
  };

  useEffect(() => {
    updateIndicators(purchases);
  }, [purchases]);

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul
        role="list"
        className="divide-y divide-gray-200 text-center flex justify-center flex-col align-middle"
      >
        <li className="px-4 py-4 sm:px-6 flex flex-col grap-y-4">
          <p className="order-first text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
            {project?.project_id ? project?.project_id : 'ALL PROJECTS'}
          </p>
          {project && project.customer_name && (
            <div>
              <p className="text-base leading-7 text-gray-600">
                {project.project_name}
              </p>
              <p className="text-base leading-7 text-gray-600">
                {project.customer_name}
              </p>
              <p className="text-xs text-gray-600">
                {project.start_date} - {project.end_date}
              </p>
            </div>
          )}
        </li>
        {project && (
          <li className="px-4 py-4 sm:px-6 flex grap-y-4 justify-evenly">
            <>
              {/* Cost Analysis TOTAL */}
              <div>
                <p className="text-base leading-7 font-semibold text-gray-600">
                  Cost Analysis
                </p>
                <p className="text-lg text-gray-600">
                  {USDollar.format(
                    costAnalysis != undefined
                      ? (costAnalysis.total_purchases_cost ?? 0)
                      : 0,
                  ) + ' USD'}
                </p>
                <p className="text-xs text-gray-600">
                  (Only purchases amounts)
                </p>
              </div>
              {/* Purchases TOTAL */}
              <div>
                <p className="text-base leading-7 font-semibold text-gray-600">
                  Purchases
                </p>
                <p className="text-lg text-gray-600">
                  {USDollar.format(
                    purchases.reduce(
                      (total, purchase) => total + purchase.total_cost,
                      0,
                    ),
                  ) + ' USD'}
                </p>
                <p className="text-xs text-gray-600">
                  ({purchases.length} items)
                </p>
              </div>
              {/* Difference */}
              <div>
                <p className="text-base leading-7 font-semibold text-gray-600">
                  Difference
                </p>
                <p className="text-lg text-gray-600">
                  {USDollar.format(
                    (costAnalysis?.total_purchases_cost ?? 0) -
                      purchases.reduce(
                        (total, purchase) => total + purchase.total_cost,
                        0,
                      ),
                  ) + ' USD'}
                </p>
              </div>
              {/* % Used */}
              <div>
                <p className="text-base leading-7 font-semibold text-gray-600">
                  Status
                </p>
                <p className="text-lg text-gray-600">
                  <Toast
                    text={
                      (indicator?.status !== 'NO BUDGET!'
                        ? indicator?.value.toFixed(2) + '% '
                        : '') + indicator?.status
                    }
                    text_size="text-base"
                    color={indicator?.color ?? 'error'}
                  />
                </p>
              </div>
            </>
          </li>
        )}
      </ul>
    </div>
  );
}

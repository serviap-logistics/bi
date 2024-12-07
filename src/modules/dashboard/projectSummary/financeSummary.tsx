import { useContext } from 'react';
import { CostAnalysisContext, ProjectContext } from '../components';
import { getPercentageUsed, USDollar } from '../../../utils';
import Toast from '../../../utils/components/toast';

export default function FinanceSummary(props: {
  headcount_subtotal: number;
  purchases_subtotal: number;
}) {
  const { headcount_subtotal, purchases_subtotal } = props;
  const project = useContext(ProjectContext);
  const costAnalysis = useContext(CostAnalysisContext);

  return (
    <div className="overflow-hidden bg-white sm:rounded-md">
      <ul
        role="list"
        className="divide-y divide-gray-200 flex flex-col align-middle justify-center text-center"
      >
        <li className="px-4 py-4 sm:px-6 flex flex-col grap-y-4">
          <p className="order-first text-xl font-semibold tracking-tight text-gray-900">
            {project?.project_id ? 'Finance Summary' : ''}
          </p>
        </li>
        {project && (
          <li className="px-4 py-4 sm:px-6 flex grap-y-4 justify-evenly text-center">
            {/* Cost Analysis TOTAL */}
            <div>
              <p className="text-base leading-7 font-semibold text-gray-600">
                Budget
              </p>
              <p className="text-lg text-gray-600 py-1">
                {USDollar.format(costAnalysis?.total_cost ?? 0) + ' USD'}
              </p>
            </div>
            {/* REAL */}
            <div>
              <p className="text-base leading-7 font-semibold text-gray-600">
                Real Amount
              </p>
              <p className="text-lg text-gray-600 py-1">
                {USDollar.format(headcount_subtotal + purchases_subtotal) +
                  ' USD'}
              </p>
            </div>
            {/* Difference */}
            <div>
              <p className="text-base leading-7 font-semibold text-gray-600">
                Difference
              </p>
              <p className="text-lg text-gray-600 py-1">
                {USDollar.format(
                  (costAnalysis?.total_cost ?? 0) -
                    (headcount_subtotal + purchases_subtotal),
                ) + ' USD'}
              </p>
            </div>
            {/* % Used */}
            <div>
              <p className="text-base leading-7 font-semibold text-gray-600">
                Status
              </p>
              <p className="text-lg text-gray-600 flex flex-col">
                {
                  <Toast
                    text={
                      (getPercentageUsed(
                        costAnalysis?.total_cost ?? 0,
                        headcount_subtotal + purchases_subtotal,
                      ).status !== 'NO BUDGET!'
                        ? getPercentageUsed(
                            costAnalysis?.total_cost ?? 0,
                            headcount_subtotal + purchases_subtotal,
                          ).value.toFixed(2) + '% '
                        : '') +
                      getPercentageUsed(
                        costAnalysis?.total_cost ?? 0,
                        headcount_subtotal + purchases_subtotal,
                      ).status
                    }
                    text_size="text-base"
                    color={
                      getPercentageUsed(
                        costAnalysis?.total_cost ?? 0,
                        headcount_subtotal + purchases_subtotal,
                      ).color
                    }
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

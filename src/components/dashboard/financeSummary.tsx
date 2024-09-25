import { useContext } from 'react';
import { CostAnalysisContext, ProjectContext } from '.';
import { getPercentageUsed, getToastColor, USDollar } from '../../utils';
import Toast from '../utils/toast';

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
                Cost Analysis
              </p>
              <p className="text-lg text-gray-600 py-1">
                {USDollar.format(costAnalysis?.total_cost ?? 0)}
              </p>
            </div>
            {/* REAL */}
            <div>
              <p className="text-base leading-7 font-semibold text-gray-600">
                Real Amount
              </p>
              <p className="text-lg text-gray-600 py-1">
                {USDollar.format(headcount_subtotal + purchases_subtotal)}
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
                )}
              </p>
            </div>
            {/* % Used */}
            <div>
              <p className="text-base leading-7 font-semibold text-gray-600">
                % Used
              </p>
              <p className="text-lg text-gray-600 flex flex-col">
                {
                  <Toast
                    text={
                      getPercentageUsed(
                        costAnalysis?.total_cost ?? 0,
                        headcount_subtotal + purchases_subtotal,
                      ).toFixed(2) + '%'
                    }
                    text_size="text-base"
                    color={getToastColor(
                      getPercentageUsed(
                        costAnalysis?.total_cost ?? 0,
                        headcount_subtotal + purchases_subtotal,
                      ),
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

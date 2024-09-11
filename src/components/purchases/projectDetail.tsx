import { useContext } from 'react';
import { CostAnalysisContext, ProjectContext } from '.';
import { purchase_type } from '../../types/purchase.type';
import { USDollar } from '../../utils';
import Toast from '../utils/toast';

export default function ProjectDetails(props: { purchases: purchase_type[] }) {
  const { purchases } = props;
  const project = useContext(ProjectContext);
  const costAnalysis = useContext(CostAnalysisContext);

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
                      ? (costAnalysis.total_material_cost ?? 0) +
                          (costAnalysis.total_equipment_cost ?? 0) +
                          (costAnalysis.total_subcontractor_cost ?? 0) +
                          (costAnalysis.total_miscelanea_cost ?? 0) +
                          (costAnalysis.total_labor_staffing_cost ?? 0) +
                          (costAnalysis.total_lodge_cost ?? 0)
                      : 0,
                  )}
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
                  )}
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
                    (costAnalysis?.total_cost ?? 0) -
                      purchases.reduce(
                        (total, purchase) => total + purchase.total_cost,
                        0,
                      ),
                  )}
                </p>
              </div>
              {/* % Used */}
              <div>
                <p className="text-base leading-7 font-semibold text-gray-600">
                  % Used
                </p>
                <p className="text-lg text-gray-600">
                  {costAnalysis != undefined &&
                  (costAnalysis?.total_cost ?? 0) != 0 ? (
                    <Toast
                      text={
                        (
                          (purchases.reduce(
                            (total, purchase) => total + purchase.total_cost,
                            0,
                          ) *
                            100) /
                          costAnalysis.total_cost
                        ).toFixed(2) + '%'
                      }
                      text_size="text-base"
                      color={
                        (purchases.reduce(
                          (total, purchase) => total + purchase.total_cost,
                          0,
                        ) *
                          100) /
                          costAnalysis.total_cost <=
                        50
                          ? 'success'
                          : (purchases.reduce(
                                (total, purchase) =>
                                  total + purchase.total_cost,
                                0,
                              ) *
                                100) /
                                costAnalysis.total_cost <=
                              70
                            ? 'info'
                            : (purchases.reduce(
                                  (total, purchase) =>
                                    total + purchase.total_cost,
                                  0,
                                ) *
                                  100) /
                                  costAnalysis.total_cost <=
                                90
                              ? 'warning'
                              : 'error'
                      }
                    />
                  ) : (
                    <Toast
                      text={
                        purchases
                          .reduce(
                            (total, purchase) => total + purchase.total_cost,
                            0,
                          )
                          .toFixed(2) + '%'
                      }
                      text_size="text-base"
                      color={
                        purchases.reduce(
                          (total, purchase) => total + purchase.total_cost,
                          0,
                        ) > 0
                          ? 'error'
                          : 'success'
                      }
                    />
                  )}
                </p>
              </div>
            </>
          </li>
        )}
      </ul>
    </div>
  );
}

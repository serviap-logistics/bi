import { useContext, useEffect, useState } from 'react';
import { CostAnalysisContext, ProjectContext } from '.';
import { USDollar } from '../../utils';
import Toast from '../utils/toast';
import {
  getPurchases as getAirtablePurchases,
  purchase,
} from '../../api/purchases';

export default function PurchasesSummary(props: {
  onUpdateSubtotalCallback: any;
}) {
  const { onUpdateSubtotalCallback } = props;
  const project = useContext(ProjectContext);
  const costAnalysis = useContext(CostAnalysisContext);
  const [purchases, setPurchases] = useState<purchase[]>([]);
  const getPurchases = async () => {
    const purchases_found: purchase[] = await getAirtablePurchases({
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
    setPurchases(purchases_found);
  };

  useEffect(() => {
    getPurchases();
  }, [project]);

  useEffect(() => {
    onUpdateSubtotalCallback(
      purchases.reduce((total, purchase) => total + purchase.total_cost, 0),
    );
  }, [purchases]);

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul
        role="list"
        className="divide-y divide-gray-200 text-center flex justify-center flex-col align-middle"
      >
        <li className="px-4 py-4 sm:px-6 flex flex-col grap-y-4">
          <p className="order-first text-xl font-semibold tracking-tight text-gray-900">
            {project?.project_id ? 'Purchases Summary' : ''}
          </p>
        </li>
        {project && (
          <li className="px-4 py-4 sm:px-6 flex grap-y-4 justify-evenly">
            <>
              {/* Cost Analysis TOTAL */}
              <div>
                <p className="text-base leading-7 font-semibold text-gray-600">
                  Purchasing Budget
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
                  ) + ' USD'}
                </p>
                <p className="text-xs text-gray-600">(From Cost Analysis)</p>
              </div>
              {/* Purchases TOTAL */}
              <div>
                <p className="text-base leading-7 font-semibold text-gray-600">
                  Purchase Expenses
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
                    (costAnalysis?.total_cost ?? 0) -
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
                      text={'NO BUDGET!'}
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

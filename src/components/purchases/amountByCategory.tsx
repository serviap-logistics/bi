import { useEffect, useState } from "react";
import { classNames, USDollar } from "../../utils";
import { HomeModernIcon, TruckIcon, UserGroupIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { purchase_type } from "../../types/purchase.type";

export default function PurchasesAmountsByCategory( props : {purchases : purchase_type[] }) {
  const { purchases } = props
  const [results, setResults] = useState({
    'Travel' : { amount: 0, icon: TruckIcon, count: 0, unit: '', bgColor: 'bg-pink-600' },
    'Tools' : { amount: 0, icon: WrenchScrewdriverIcon, count: 0, unit: '', bgColor: 'bg-purple-600' },
    'Lodging' : { amount: 0, icon: HomeModernIcon, count: 0, unit: '', bgColor: 'bg-yellow-500' },
    'Staffing' : { amount: 0, icon: UserGroupIcon, count: 0, unit: '', bgColor: 'bg-green-500' },
  })

  const updateResults = (purchases) => {
    const travel_purchases : purchase_type[] = purchases.filter((purchase : purchase_type) => purchase.Category.includes('Travel') )
    const tools_purchases : purchase_type[] = purchases.filter((purchase : purchase_type) => purchase.Category.includes('Tools') )
    const lodging_purchases : purchase_type[] = purchases.filter((purchase : purchase_type) => purchase.Category.includes('Lodging') )
    const staffing_purchases : purchase_type[] = purchases.filter((purchase : purchase_type) => purchase.Category.includes('Staffing') )
    const travel_total = travel_purchases.reduce((total, purchase) => {return total + purchase.total_cost}, 0)
    const tools_total = tools_purchases.reduce((total, purchase) => {return total + purchase.total_cost}, 0)
    const lodging_total = lodging_purchases.reduce((total, purchase) => {return total + purchase.total_cost}, 0)
    const staffing_total = staffing_purchases.reduce((total, purchase) => {return total + purchase.total_cost}, 0)
    setResults(({
      ...results,
      'Travel': {
        ...results['Travel'],
        count: travel_purchases.length,
        amount: travel_total > 1000 ? travel_total / 1000 : travel_total,
        unit: travel_total > 1000 ? 'k' : ''
      },
      'Tools': {
        ...results['Tools'],
        count: tools_purchases.length,
        amount: tools_total > 1000 ? tools_total / 1000 : tools_total,
        unit: tools_total > 1000 ? 'k' : ''
      },
      'Lodging': {
        ...results['Lodging'],
        count: lodging_purchases.length,
        amount: lodging_total > 1000 ? lodging_total / 1000 : lodging_total,
        unit: lodging_total > 1000 ? 'k' : ''
      },
      'Staffing': {
        ...results['Staffing'],
        count: staffing_purchases.length,
        amount: staffing_total > 1000 ? staffing_total / 1000 : staffing_total,
        unit: staffing_total > 1000 ? 'k' : ''
      }
    }))
  }

  useEffect(() => {
    updateResults(purchases)
  }, [purchases])

  return (
    <div className="my-4">
      <h2 className="text-sm font-medium text-gray-500">Summary by category</h2>
      <ul role="list" className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {Object.entries(results).map(([name, result]) => (
            <li key={name} className="col-span-1 flex rounded-md shadow-sm">
              <div
                className={classNames(
                  result.bgColor,
                  'flex w-16 lg:w-12 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white',
                )}
              >
                <result.icon className="h-7 w-7"/>
              </div>
              <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white">
                <div className="flex-1 truncate px-4 lg:px-2 py-2 text-sm">
                  <a className="font-medium text-gray-900 hover:text-gray-600">
                    {name}
                  </a>
                  <p className="text-gray-500">{result.count} Purchases</p>
                </div>
                <div className="flex-initial pr-10 sm:pr-8 md:pr-4">
                  <p className="text-gray-700 font-semibold text-lg">{USDollar.format(result.amount) + result.unit}</p>
                </div>
              </div>
            </li>
        ))}
      </ul>
    </div>
  )
}

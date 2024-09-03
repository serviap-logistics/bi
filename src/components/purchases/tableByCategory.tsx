import { useContext, useEffect, useState } from "react";
import Table from "../utils/table";
import { CostAnalysisContext } from ".";
import { USDollar } from "../../utils";
import { purchase_type } from "../../types/purchase.type";

export default function TableByCategory(props: {purchases: purchase_type[]}) {
  const { purchases } = props
  const [costAnalysis] = useContext(CostAnalysisContext)
  const [table, setTable] = useState<{columns: string[], rows: any[]}>({ columns: [], rows: [] })
  const defaultBudgets = {
    'Travel': 0,
    'Tools': 0,
    'Lodging': 0,
    'Staffing': 0,
    'Equipment': 0,
    'Subcontractor': 0,
  }
  const [budgets, setBudgets] = useState(defaultBudgets)
  const defaultResults = {
    'Travel' : 0,
    'Tools' : 0,
    'Lodging' :0,
    'Staffing' : 0,
    'Equipment' : 0,
    'Subcontractor' : 0,
  }
  const [results, setResults] = useState(defaultResults)

  const updateBudgetAmounts = (costAnalysis) => {
    setBudgets({
      'Travel': costAnalysis.total_miscelanea_cost,
      'Tools': costAnalysis.total_material_cost,
      'Lodging': costAnalysis.total_lodge_cost,
      'Staffing': costAnalysis.total_worker_staffing_cost,
      'Equipment': costAnalysis.total_equipment_cost,
      'Subcontractor': costAnalysis.total_subcontractor_cost,
    })
  }
  const updatePurchaseAmounts = (purchases) => {
    const travel_purchases : purchase_type[] = purchases.filter((purchase : purchase_type) => purchase.Category.includes('Travel') )
    const travel_total = travel_purchases.reduce((total, purchase) => {return total + purchase.total_cost}, 0)
    const tools_purchases : purchase_type[] = purchases.filter(
      (purchase : purchase_type) => purchase.Category.includes('Tools - Tools') || purchase.Category.includes('Tools - Consumables')
    )
    const tools_total = tools_purchases.reduce((total, purchase) => {return total + purchase.total_cost}, 0)
    const equipment_purchases : purchase_type[] = purchases.filter((purchase : purchase_type) => purchase.Category.includes('Equipment') )
    const equipment_total = equipment_purchases.reduce((total, purchase) => {return total + purchase.total_cost}, 0)
    const lodging_purchases : purchase_type[] = purchases.filter((purchase : purchase_type) => purchase.Category.includes('Lodging') )
    const lodging_total = lodging_purchases.reduce((total, purchase) => {return total + purchase.total_cost}, 0)
    const staffing_purchases : purchase_type[] = purchases.filter((purchase : purchase_type) => purchase.Category.includes('Staffing') )
    const staffing_total = staffing_purchases.reduce((total, purchase) => {return total + purchase.total_cost}, 0)
    const subcontractor_purchases : purchase_type[] = purchases.filter((purchase : purchase_type) => purchase.Category.includes('Subcontractor') )
    const subcontractor_total = subcontractor_purchases.reduce((total, purchase) => {return total + purchase.total_cost}, 0)

    setResults({
      'Travel' : travel_total,
      'Tools' : tools_total,
      'Lodging' : lodging_total,
      'Staffing' : staffing_total,
      'Equipment' : equipment_total,
      'Subcontractor' : subcontractor_total,
    })
  }

  const formatAsTable = () => {
    setTable({
      columns: ['Category', 'Budget', 'Real', 'Difference', '% used'],
      rows: [
        [ 'Tools / Consumables',
          USDollar.format(budgets['Tools']), USDollar.format(results['Tools']), // Budget, Real
          USDollar.format(budgets['Tools'] - results['Tools']), // Difference
          (budgets['Tools'] > 0 ? (results['Tools']*100)/budgets['Tools'] : 0) + '%' // % used
        ],
        [ 'Equipment',
          USDollar.format(budgets['Equipment']), USDollar.format(results['Equipment']),
          USDollar.format(budgets['Equipment'] - results['Equipment']),
          (budgets['Equipment'] > 0 ? (results['Equipment']*100)/budgets['Equipment'] : 0) + '%' // % used
        ],
        [ 'Subcontractor',
          USDollar.format(budgets['Subcontractor']), USDollar.format(results['Subcontractor']),
          USDollar.format(budgets['Subcontractor'] - results['Subcontractor']),
          (budgets['Subcontractor'] > 0 ? (results['Subcontractor']*100)/budgets['Subcontractor'] : 0) + '%' // % used
        ],
        [ 'Lodge',
          USDollar.format(budgets['Lodging']), USDollar.format(results['Lodging']),
          USDollar.format(budgets['Lodging'] - results['Lodging']),
          (budgets['Lodging'] > 0 ? (results['Lodging']*100)/budgets['Lodging'] : 0) + '%' // % used
        ],
        [ 'Travel',
          USDollar.format(budgets['Travel']), USDollar.format(results['Travel']),
          USDollar.format(budgets['Travel'] - results['Travel']),
          (budgets['Travel'] > 0 ? (results['Travel']*100)/budgets['Travel'] : 0) + '%' // % used
        ],
        [ 'Staffing',
          USDollar.format(budgets['Staffing']), USDollar.format(results['Staffing']),
          USDollar.format(budgets['Staffing'] - results['Staffing']),
          (budgets['Staffing'] > 0 ? (results['Staffing']*100)/budgets['Staffing'] : 0) + '%' // % used
        ],
      ],
    })
  }

  useEffect(() => {
    if(costAnalysis) {
      updateBudgetAmounts(costAnalysis);
    } else {
      setBudgets(defaultBudgets);
    }
  }, [costAnalysis])

  useEffect(() => {
    if(purchases.length > 0) {
      updatePurchaseAmounts(purchases);
    } else {
      setResults(defaultResults)
    }
  }, [purchases])

  useEffect(() => {
    formatAsTable();
  }, [budgets, results])

  return (
    <Table columns={table.columns} rows={table.rows} />
  )
}

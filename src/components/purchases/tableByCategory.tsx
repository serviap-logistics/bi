import { useContext, useEffect, useState } from 'react';
import Table from '../utils/table';
import { CostAnalysisContext } from '.';
import { USDollar } from '../../utils';
import { purchase_type } from '../../types/purchase.type';
import Toast from '../utils/toast';

export default function TableByCategory(props: { purchases: purchase_type[] }) {
  const { purchases } = props;
  const costAnalysis = useContext(CostAnalysisContext);
  const [table, setTable] = useState<{ columns: string[]; rows: any[] }>({
    columns: [],
    rows: [],
  });
  const defaultBudgets = {
    Travel: 0,
    Tools: 0,
    Lodging: 0,
    Staffing: 0,
    Equipment: 0,
    Subcontractor: 0,
  };
  const [budgets, setBudgets] = useState(defaultBudgets);
  const defaultResults = {
    Travel: 0,
    Tools: 0,
    Lodging: 0,
    Staffing: 0,
    Equipment: 0,
    Subcontractor: 0,
  };
  const [results, setResults] = useState(defaultResults);

  const updateBudgetAmounts = (costAnalysis) => {
    setBudgets({
      Travel: costAnalysis.total_miscelanea_cost,
      Tools: costAnalysis.total_material_cost,
      Lodging: costAnalysis.total_lodge_cost,
      Staffing: costAnalysis.total_labor_staffing_cost,
      Equipment: costAnalysis.total_equipment_cost,
      Subcontractor: costAnalysis.total_subcontractor_cost,
    });
  };
  const updatePurchaseAmounts = (purchases) => {
    const travel_purchases: purchase_type[] = purchases.filter(
      (purchase: purchase_type) => purchase.Category.includes('Travel'),
    );
    const travel_total = travel_purchases.reduce((total, purchase) => {
      return total + purchase.total_cost;
    }, 0);
    const tools_purchases: purchase_type[] = purchases.filter(
      (purchase: purchase_type) =>
        purchase.Category.includes('Tools - Tools') ||
        purchase.Category.includes('Tools - Consumables'),
    );
    const tools_total = tools_purchases.reduce((total, purchase) => {
      return total + purchase.total_cost;
    }, 0);
    const equipment_purchases: purchase_type[] = purchases.filter(
      (purchase: purchase_type) => purchase.Category.includes('Equipment'),
    );
    const equipment_total = equipment_purchases.reduce((total, purchase) => {
      return total + purchase.total_cost;
    }, 0);
    const lodging_purchases: purchase_type[] = purchases.filter(
      (purchase: purchase_type) => purchase.Category.includes('Lodging'),
    );
    const lodging_total = lodging_purchases.reduce((total, purchase) => {
      return total + purchase.total_cost;
    }, 0);
    const staffing_purchases: purchase_type[] = purchases.filter(
      (purchase: purchase_type) => purchase.Category.includes('Staffing'),
    );
    const staffing_total = staffing_purchases.reduce((total, purchase) => {
      return total + purchase.total_cost;
    }, 0);
    const subcontractor_purchases: purchase_type[] = purchases.filter(
      (purchase: purchase_type) => purchase.Category.includes('Subcontractor'),
    );
    const subcontractor_total = subcontractor_purchases.reduce(
      (total, purchase) => {
        return total + purchase.total_cost;
      },
      0,
    );

    setResults({
      Travel: travel_total,
      Tools: tools_total,
      Lodging: lodging_total,
      Staffing: staffing_total,
      Equipment: equipment_total,
      Subcontractor: subcontractor_total,
    });
  };

  const formatAsTable = () => {
    const data = {
      tools: {
        name: 'Tools / Consumables',
        budget: budgets['Tools'],
        real: results['Tools'],
        difference: budgets['Tools'] - results['Tools'],
        used:
          budgets['Tools'] > 0
            ? (results['Tools'] * 100) / budgets['Tools']
            : results['Tools'],
      },
      equipment: {
        name: 'Equipment',
        budget: budgets['Equipment'],
        real: results['Equipment'],
        difference: budgets['Equipment'] - results['Equipment'],
        used:
          budgets['Equipment'] > 0
            ? (results['Equipment'] * 100) / budgets['Equipment']
            : results['Equipment'],
      },
      subcontractor: {
        name: 'Subcontractor',
        budget: budgets['Subcontractor'],
        real: results['Subcontractor'],
        difference: budgets['Subcontractor'] - results['Subcontractor'],
        used:
          budgets['Subcontractor'] > 0
            ? (results['Subcontractor'] * 100) / budgets['Subcontractor']
            : results['Subcontractor'],
      },
      lodging: {
        name: 'Lodging',
        budget: budgets['Lodging'],
        real: results['Lodging'],
        difference: budgets['Lodging'] - results['Lodging'],
        used:
          budgets['Lodging'] > 0
            ? (results['Lodging'] * 100) / budgets['Lodging']
            : results['Lodging'],
      },
      travel: {
        name: 'Travel',
        budget: budgets['Travel'],
        real: results['Travel'],
        difference: budgets['Travel'] - results['Travel'],
        used:
          budgets['Travel'] > 0
            ? (results['Travel'] * 100) / budgets['Travel']
            : results['Travel'],
      },
      staffing: {
        name: 'Staffing',
        budget: budgets['Staffing'],
        real: results['Staffing'],
        difference: budgets['Staffing'] - results['Staffing'],
        used:
          budgets['Staffing'] > 0
            ? (results['Staffing'] * 100) / budgets['Staffing']
            : results['Staffing'],
      },
    };

    const rows = Object.values(data).map((section) => [
      section.name,
      USDollar.format(section.budget),
      USDollar.format(section.real), // Budget, Real
      USDollar.format(section.difference), // Difference
      <Toast
        text={section.used.toFixed(2) + '%'} // % used
        color={
          section.used <= 50
            ? 'success'
            : section.used <= 70
              ? 'info'
              : section.used <= 90
                ? 'warning'
                : 'error'
        }
      />,
    ]);
    setTable({
      columns: ['Category', 'Budget', 'Real', 'Difference', '% used'],
      rows: rows,
    });
  };

  useEffect(() => {
    if (costAnalysis) {
      updateBudgetAmounts(costAnalysis);
    } else {
      setBudgets(defaultBudgets);
    }
  }, [costAnalysis]);

  useEffect(() => {
    if (purchases.length > 0) {
      updatePurchaseAmounts(purchases);
    } else {
      setResults(defaultResults);
    }
  }, [purchases]);

  useEffect(() => {
    formatAsTable();
  }, [budgets, results]);

  return (
    <Table
      columns={table.columns}
      rows={table.rows}
      styles={{ static_headers: false, static_bottom: false }}
    />
  );
}

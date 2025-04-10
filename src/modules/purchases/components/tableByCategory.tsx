import { useContext, useEffect, useState } from 'react';
import { CostAnalysisContext } from '.';
import { getPercentageUsed, USDollar } from '../../../utils';
import { purchase } from '../services/purchases';
import Toast from '../../../utils/components/toast';
import Table from '../../../utils/components/table';
import { CountryContext } from '../../../App';

export default function TableByCategory(props: { purchases: purchase[] }) {
  const { purchases } = props;
  const costAnalysis = useContext(CostAnalysisContext);
  const country = useContext(CountryContext);
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
    Bill: 0,
  };
  const [budgets, setBudgets] = useState(defaultBudgets);
  const defaultResults = {
    Travel: 0,
    Tools: 0,
    Lodging: 0,
    Staffing: 0,
    Equipment: 0,
    Subcontractor: 0,
    Bill: 0,
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
      Bill: 0,
    });
  };
  const updatePurchaseAmounts = (purchases) => {
    const travel_purchases: purchase[] = purchases.filter(
      (purchase: purchase) => purchase.Category.includes('Travel'),
    );
    const travel_total = travel_purchases.reduce((total, purchase) => {
      return total + purchase.total_cost;
    }, 0);
    const tools_purchases: purchase[] = purchases.filter(
      (purchase: purchase) =>
        purchase.Category.includes('Tools - Tools') ||
        purchase.Category.includes('Tools - Consumables'),
    );
    const tools_total = tools_purchases.reduce((total, purchase) => {
      return total + purchase.total_cost;
    }, 0);
    const equipment_purchases: purchase[] = purchases.filter(
      (purchase: purchase) => purchase.Category.includes('Equipment'),
    );
    const equipment_total = equipment_purchases.reduce((total, purchase) => {
      return total + purchase.total_cost;
    }, 0);
    const lodging_purchases: purchase[] = purchases.filter(
      (purchase: purchase) => purchase.Category.includes('Lodging'),
    );
    const lodging_total = lodging_purchases.reduce((total, purchase) => {
      return total + purchase.total_cost;
    }, 0);
    const staffing_purchases: purchase[] = purchases.filter(
      (purchase: purchase) => purchase.Category.includes('Staffing'),
    );
    const staffing_total = staffing_purchases.reduce((total, purchase) => {
      return total + purchase.total_cost;
    }, 0);
    const subcontractor_purchases: purchase[] = purchases.filter(
      (purchase: purchase) => purchase.Category.includes('Subcontractor'),
    );
    const subcontractor_total = subcontractor_purchases.reduce(
      (total, purchase) => {
        return total + purchase.total_cost;
      },
      0,
    );
    const bill_purchases: purchase[] = purchases.filter((purchase: purchase) =>
      purchase.Category.includes('Bill.com'),
    );
    const bill_total = bill_purchases.reduce((total, purchase) => {
      return total + purchase.total_cost;
    }, 0);

    setResults({
      Travel: travel_total,
      Tools: tools_total,
      Lodging: lodging_total,
      Staffing: staffing_total,
      Equipment: equipment_total,
      Subcontractor: subcontractor_total,
      Bill: bill_total,
    });
  };

  const formatAsTable = () => {
    const data = {
      travel: {
        name: country === 'USA' ? 'Travel' : 'Gastos de viaje',
        budget: budgets['Travel'],
        real: results['Travel'],
        difference: budgets['Travel'] - results['Travel'],
        used: getPercentageUsed(budgets['Travel'], results['Travel']),
      },
      lodging: {
        name: country === 'USA' ? 'Lodging' : 'Hospedaje',
        budget: budgets['Lodging'],
        real: results['Lodging'],
        difference: budgets['Lodging'] - results['Lodging'],
        used: getPercentageUsed(budgets['Lodging'], results['Lodging']),
      },
      equipment: {
        name: country === 'USA' ? 'Equipment' : 'Equipo',
        budget: budgets['Equipment'],
        real: results['Equipment'],
        difference: budgets['Equipment'] - results['Equipment'],
        used: getPercentageUsed(budgets['Equipment'], results['Equipment']),
      },
      subcontractor: {
        name: country == 'USA' ? 'Subcontractor' : 'Subcontratación',
        budget: budgets['Subcontractor'],
        real: results['Subcontractor'],
        difference: budgets['Subcontractor'] - results['Subcontractor'],
        used: getPercentageUsed(
          budgets['Subcontractor'],
          results['Subcontractor'],
        ),
      },
      tools: {
        name:
          country === 'USA'
            ? 'Tools / Consumables'
            : 'Herramientas / Consumibles',
        budget: budgets['Tools'],
        real: results['Tools'],
        difference: budgets['Tools'] - results['Tools'],
        used: getPercentageUsed(budgets['Tools'], results['Tools']),
      },
      bill: {
        name: 'Bill.com',
        budget: budgets['Bill'],
        real: results['Bill'],
        difference: budgets['Bill'] - results['Bill'],
        used: getPercentageUsed(budgets['Bill'], results['Bill']),
      },
      staffing: {
        name: country === 'USA' ? 'Staffing' : 'Contratación de personal',
        budget: budgets['Staffing'],
        real: results['Staffing'],
        difference: budgets['Staffing'] - results['Staffing'],
        used: getPercentageUsed(budgets['Staffing'], results['Staffing']),
      },
    };

    const rows = Object.values(data).map((section) => [
      section.name,
      USDollar.format(section.budget) + (country === 'USA' ? ' USD' : ' MXN'),
      USDollar.format(section.real) + (country === 'USA' ? ' USD' : ' MXN'), // Budget, Real
      USDollar.format(section.difference) +
        (country === 'USA' ? ' USD' : ' MXN'), // Difference
      <Toast
        text={
          (section.used.status !== 'NO BUDGET!'
            ? section.used.value.toFixed(2) + '% '
            : '') + section.used.status
        } // % used
        color={section.used.color ?? 'error'}
      />,
    ]);
    setTable({
      columns: [
        country === 'USA' ? 'Category' : 'Categoría',
        country === 'USA' ? 'Budget' : 'Presupuestado',
        'Real',
        country === 'USA' ? 'Difference' : 'Diferencia',
        'Status',
      ],
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
      styles={{
        static_headers: false,
        dynamic_headers: false,
        static_bottom: false,
        max_height: 'max-h-[22rem]',
        row_height: 'sm',
      }}
    />
  );
}

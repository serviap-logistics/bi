import { useEffect, useState } from 'react';
import Chart, { Props } from 'react-apexcharts';
import { purchase_type } from '../../types/purchase.type';

const USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function PurchasesAmountsByCategoryGraph(props: {
  purchases: purchase_type[];
}) {
  const { purchases } = props;
  const [charts, setCharts] = useState({
    Travel: {
      type: 'pie',
      height: 400,
      width: 400,
      options: {
        stroke: { colors: ['#fff'] },
        fill: { opacity: 0.8 },
        legend: { show: true, onItemHover: { highlightDataSeries: false } },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: 'bottom',
              },
            },
          },
        ],
      },
      series: [{ name: '', data: [] }],
    } as Props,
    'Travel Bar': {
      type: 'bar',
      height: 400,
      width: 400,
      options: {
        stroke: { colors: ['#fff'] },
        fill: { opacity: 0.8 },
        legend: {
          show: true,
          onItemHover: { highlightDataSeries: false },
          formatter: (val: any) => USDollar.format(val),
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: 'bottom',
              },
            },
          },
        ],
        plotOptions: {
          bar: {
            borderRadius: 4,
            borderRadiusApplication: 'end',
            horizontal: false,
          },
        },
        dataLabels: {
          formatter: (val: number) => {
            return USDollar.format(val);
          },
        },
        yaxis: {
          labels: {
            formatter: (val: any) => {
              return USDollar.format(val);
            },
          },
        },
        tooltip: {
          enabled: true,
          y: { formatter: (val) => USDollar.format(val) },
        },
      },
      series: [{ name: '', data: [] }],
    } as Props,
    Tools: {
      type: 'pie',
      height: 460,
      width: 460,
      options: {
        stroke: { colors: ['#fff'] },
        fill: { opacity: 0.8 },
        legend: { show: true, onItemHover: { highlightDataSeries: false } },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: 'bottom',
              },
            },
          },
        ],
      },
      series: [{ name: '', data: [] }],
    } as Props,
    'Tools Bar': {
      type: 'bar',
      height: 400,
      width: 400,
      options: {
        stroke: { colors: ['#fff'] },
        fill: { opacity: 0.8 },
        legend: {
          show: true,
          onItemHover: { highlightDataSeries: false },
          // formatter: (val : any) => USDollar.format(val)
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: 'bottom',
              },
            },
          },
        ],
        plotOptions: {
          bar: {
            borderRadius: 4,
            borderRadiusApplication: 'end',
            horizontal: false,
          },
        },
        dataLabels: {
          formatter: (val: number) => {
            return USDollar.format(val);
          },
        },
        yaxis: {
          labels: {
            formatter: (val: number) => {
              return USDollar.format(val);
            },
          },
        },
        tooltip: {
          enabled: true,
          y: { formatter: (val) => USDollar.format(val) },
        },
      },
      series: [{ name: '', data: [] }],
    } as Props,
  });

  const updateResults = (purchases: purchase_type[]) => {
    const purchases_by_category = purchases.reduce((groups, purchase) => {
      const category = purchase.Category;
      if (!groups[category]) groups[category] = [];
      groups[category].push(purchase);

      return groups;
    }, {});

    const travel_purchases = Object.entries(purchases_by_category).filter(
      ([name, _]) => name.includes('Travel'),
    );
    const tools_purchases = Object.entries(purchases_by_category).filter(
      ([name, _]) => name.includes('Tools'),
    );

    setCharts({
      ...charts,
      Travel: {
        ...charts['Travel'],
        options: {
          labels: travel_purchases.map(([name, _]) =>
            name.replace('Travel - ', ''),
          ),
        },
        series: travel_purchases.map(([_, purchases]: [string, any]) =>
          purchases.reduce(
            (subtotal: any, purchase: purchase_type) =>
              subtotal + purchase.total_cost,
            0,
          ),
        ),
      },
      'Travel Bar': {
        ...charts['Travel Bar'],
        options: {
          labels: travel_purchases.map(([name, _]) =>
            name.replace('Travel - ', ''),
          ),
        },
        series: [
          {
            data: travel_purchases.map(([_, purchases]: [string, any]) =>
              purchases.reduce(
                (subtotal: any, purchase: purchase_type) =>
                  subtotal + purchase.total_cost,
                0,
              ),
            ),
          },
        ],
      },
      Tools: {
        ...charts['Tools'],
        options: {
          labels: tools_purchases.map(([name, _]) =>
            name.replace('Tools - ', ''),
          ),
        },
        series: tools_purchases.map(([_, purchases]: [string, any]) =>
          purchases.reduce(
            (subtotal: any, purchase: purchase_type) =>
              subtotal + purchase.total_cost,
            0,
          ),
        ),
      },
      'Tools Bar': {
        ...charts['Tools Bar'],
        options: {
          labels: tools_purchases.map(([name, _]) =>
            name.replace('Tools - ', ''),
          ),
        },
        series: [
          {
            data: tools_purchases.map(([_, purchases]: [string, any]) =>
              purchases.reduce(
                (subtotal: any, purchase: purchase_type) =>
                  subtotal + purchase.total_cost,
                0,
              ),
            ),
          },
        ],
      },
    });
  };

  useEffect(() => {
    updateResults(purchases);
  }, [purchases]);

  return (
    <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2">
      <Chart {...charts['Travel']} />
      <Chart {...charts['Tools']} />
      <Chart {...charts['Travel Bar']} />
      <Chart {...charts['Tools Bar']} />
    </div>
  );
}

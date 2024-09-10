import { useContext, useEffect, useState } from "react";
import Table from "../utils/table";
import { getRegistrationTimes } from "../../api/registration_times";
import { CostAnalysisContext, ProjectContext } from ".";
import { ReportTypeContext } from "./reportByType";
import { registration_time_type } from "../../types/registration_time.type";
import { getDateByTimestamp, getDatesBeetween, groupListBy } from "../../utils";
import { getCALaborDetails } from "../../api/ca_labor_details";
import { ca_labor_detail_type } from "../../types/ca_labor_detail.type";
import Alert from "../utils/alert";

type result_data = {
  'HEADERS': string[], // Table labels

  'Worked': (string | number)[],
  'Worked Overtime': (string | number)[],
  'Travel': (string | number)[],
  'Travel Overtime': (string | number)[],
}

type group_data = {
  'Worked': {},
  'Worked Overtime': {},
  'Travel': {},
  'Travel Overtime': {},
}

export default function HeadcountTableByRole() {
  const project = useContext(ProjectContext)
  const costAnalysis = useContext(CostAnalysisContext)
  const reportType = useContext(ReportTypeContext)
  const [rows, setRows] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [reportDates, setReportDates] = useState<{ start_date: string | undefined, end_date: string | undefined }>()

  const [budgets, setBudgets] = useState<group_data>({
    'Worked': [], 'Worked Overtime': [],
    'Travel': [], 'Travel Overtime': [],
  })
  const [reals, setReals] = useState<group_data>({
    'Worked': [], 'Worked Overtime': [],
    'Travel': [], 'Travel Overtime': [],
  })
  const [results, setResults] = useState<result_data>({
    'HEADERS': ['Role', 'People Quantity'],
    'Worked': [], 'Worked Overtime': [],
    'Travel': [], 'Travel Overtime': [],
  })

  const updateReportDates = () => {
    // El reporte por defecto comienza en al inicio del registro de horas reales,
    // si no existe, se utiliza la fecha de inicio del analisis de costos.
    // si no existe, se utiliza la fecha de inicio del proyecto.
    const start_date = project?.hour_registration_start_date ?? costAnalysis?.start_date ?? project?.start_date

    // Por defecto termina al final del analisis de costos o en al final del registro de horas reales,
    // la fecha mas reciente.
    const project_end_date = 
      (
        // Se calcula la fecha mas "grande" entre las horas reales, el end_date del proyecto.
        new Date(project?.hour_registration_end_date ?? '').getTime() > new Date(project?.end_date ?? '').getTime()
          ? project?.hour_registration_end_date : project?.end_date
      )
      
    // Se calcula la fecha mas "grande" entre el end_date del proyecto o el end_date del CA.
    const end_date =
      (
        // Se calcula la fecha mas "grande" entre las horas reales, el end_date del proyecto o el end_date del analisis de costos.
        new Date(project_end_date ?? '').getTime() > new Date(costAnalysis?.end_date ?? '').getTime() ? project_end_date : costAnalysis?.end_date ?? project_end_date
      )

    setReportDates({start_date: start_date, end_date: end_date})
  }

  const updateBudget = async () => {
    if(!costAnalysis?.cost_analysis_id || !reportDates?.start_date || !reportDates?.end_date) {
      setBudgets({
        'Worked' : {},
        'Worked Overtime' : {},
        'Travel' : {},
        'Travel Overtime' : {},
      })
      return
    }
    const budget_times : ca_labor_detail_type[] = await getCALaborDetails({
      view: 'BI',
      fields: [
        'cost_analysis_id', 'date',
        'people_quantity','employee_role',
        'worked_hours','travel_hours',
        'worked_hour_cost','travel_hour_cost',
        'subtotal_worked_hours','subtotal_travel_hours',
        'worked_overtime_hours', 'travel_overtime_hours',
        'worked_overtime_hour_cost', 'travel_overtime_hour_cost',
        'subtotal_worked_overtime', 'subtotal_travel_overtime'
      ],
      formula: encodeURI(`cost_analysis_id='${costAnalysis.cost_analysis_id}'`),
    })
    let times_formatted = budget_times.map((record) => ({
        ...record,
        date: getDateByTimestamp(record.date)
      })
    )
    let grouped_by_role = groupListBy('employee_role', times_formatted)
    let worked_by_role = {}
    Object.entries(grouped_by_role).map(([role, records] : [string, any]) => worked_by_role[role] =
      records.map((record) => ({
        date: record.date, people_quantity: record.people_quantity,
        hour_cost: record.worked_hour_cost,
        hours: record.worked_hours,
        subtotal: record.subtotal_worked_hours,
      })
    ))
    let worked_overtime_by_role = {}
    Object.entries(grouped_by_role).map( ([role, records] : [string, any]) => worked_overtime_by_role[role] =
      records.map((record) => ({
        date: record.date, people_quantity: record.people_quantity,
        hour_cost: record.worked_overtime_hour_cost,
        hours: record.worked_overtime_hours,
        subtotal: record.subtotal_worked_overtime,
      }))
    )
    let travel_by_role = {}
    Object.entries(grouped_by_role).map( ([role, records] : [string, any]) => travel_by_role[role] =
      records.map((record) => ({
        date: record.date, people_quantity: record.people_quantity,
        hour_cost: record.travel_hour_cost,
        hours: record.travel_hours,
        subtotal: record.subtotal_travel_hours,
      }))
    )
    let travel_overtime_by_role = {}
    Object.entries(grouped_by_role).map(([role, records] : [string, any]) => travel_overtime_by_role[role] = 
      records.map((record) => ({
        date: record.date, people_quantity: record.people_quantity,
        hour_cost: record.travel_overtime_hour_cost,
        hours: record.travel_overtime_hours,
        subtotal: record.subtotal_travel_overtime,
      }))
    )
    setBudgets({
      'Worked' : worked_by_role,
      'Worked Overtime' : worked_overtime_by_role,
      'Travel' : travel_by_role,
      'Travel Overtime' : travel_overtime_by_role,
    })
  }

  const updateRealByDate = async () => {
    if(!project?.project_id) {
      setReals({
        'Worked' : {},
        'Worked Overtime' : {},
        'Travel' : {},
        'Travel Overtime' : {},
      })
      return
    } else {
      const real_times: registration_time_type[] = await getRegistrationTimes({
        worked: true, travel: true, waiting: true, project_id: project.project_id
      })
      let times_formatted = real_times.map(
        ({total_cost, total_hours, start_date, category}) => ({
          cost: total_cost, hours: total_hours, date: getDateByTimestamp(start_date), category: category
        })
      )
      let grouped_by_date = groupListBy('date', times_formatted)
      let totals_by_date = Object.entries(grouped_by_date).map(
        ([date, records] : [string, any]) => ({
          date: date,
          total_cost: records.reduce((total, record) => total + record.cost,0),
          total_hours: records.reduce((total, record) => total + record.hours, 0),
        })
      )
      totals_by_date = totals_by_date.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      // setReals(totals_by_date)
      setReals({
        'Worked': {},
        'Worked Overtime': {},
        'Travel': {},
        'Travel Overtime': {},
      })
    }
  }

  const mergeResults = (budgets: group_data, reals: group_data) => {
    console.log('Trying merge with:')
    console.log('Budgets:')
    console.log(budgets)
    console.log('Reals:')
    console.log(reals)
    if (!reportDates?.start_date || !reportDates.end_date){
      console.log('ALERT: Some date is needed.')
    } else {
      const dates_beetween = getDatesBeetween(reportDates.start_date, reportDates.end_date)
      // Para este momento, budgets deberia existir con al menos un role y con todo en 0.
      const roles_available = Object.values(budgets).map((roles) => Object.keys(roles))[0]
      const groups_available = Object.keys(results)
      console.log(groups_available)
      if(roles_available.length === 0){
        console.log('Nothing to show...')
        setResults({
          ...results
        })
      } else {
        console.log('Roles available... ', roles_available)
        const worked_results = []; 
        const worked_dates : string[] = budgets['Worked'][roles_available[0]].map((record) => record.date)
        console.log('Report dates: ', dates_beetween.length)
        console.log('Budget dates: ', worked_dates.length)
        console.log(worked_dates)
        const dates_to_create = dates_beetween.filter((date) => !worked_dates.includes(date))
        console.log(dates_to_create)
        for(let pivot_date of dates_beetween){
          console.log(pivot_date)
        }
        console.log(worked_results)
      }
    }
  }

  const formatAsTable = (results : result_data) => {
    console.log(results)
    setColumns([])
    setRows(reportType?[]: [])
    /*
    const rows = results.map((result) =>
      reportType === 'HOURS' ? [
        result.date, result.budget_total_hours, result.real_total_hours.toFixed(2),
        result.difference_hours.toFixed(2), 
        <Toast
          text={result.percentage_hours.toFixed(2) + '%'}
          text_size="text-sm"
          color={
            (result.percentage_hours) <= 50 ? 'success'
          : (result.percentage_hours) <= 70 ? 'info'
          : (result.percentage_hours) <= 90 ? 'warning'
          : 'error'
          }
        />
      ]
      : [
        result.date, USDollar.format(result.budget_total_cost), USDollar.format(result.real_total_cost),
        USDollar.format(result.difference_cost),
        <Toast
          text={result.percentage_cost.toFixed(2) + '%'}
          text_size="text-sm"
          color={
            (result.percentage_cost) <= 50 ? 'success'
          : (result.percentage_cost) <= 70 ? 'info'
          : (result.percentage_cost) <= 90 ? 'warning'
          : 'error'
          }
        />
      ]
    )
    const summary_row = {
      budget: reportType === 'HOURS'
        ? results.reduce((total, result) => total + result.budget_total_hours,0)
        : USDollar.format(results.reduce((total, result) => total + result.budget_total_cost,0)),
      real: reportType === 'HOURS'
        ? results.reduce((total, result) => total + result.real_total_hours,0).toFixed(2)
        : USDollar.format(results.reduce((total, result) => total + result.real_total_cost,0)),
      difference: reportType === 'HOURS'
        ? results.reduce((total, result) => total + result.difference_hours,0).toFixed(2)
        : USDollar.format(results.reduce((total, result) => total + result.difference_cost,0)),
      percentage: reportType === 'HOURS'
        ? getPercentage(
          results.reduce((total, result) => total + result.budget_total_hours,0),
          results.reduce((total, result) => total + result.real_total_hours,0)
        )
        : getPercentage(
            results.reduce((total, result) => total + result.budget_total_cost,0),
            results.reduce((total, result) => total + result.real_total_cost,0)
        ),
    }
    rows.push([
      'TOTALS', summary_row.budget, summary_row.real, summary_row.difference,
      <Toast
        text={summary_row.percentage.toFixed(2) + '%'}
        text_size="text-sm"
        color={
          (summary_row.percentage) <= 50 ? 'success'
        : (summary_row.percentage) <= 70 ? 'info'
        : (summary_row.percentage) <= 90 ? 'warning'
        : 'error'
        }
      />,
    ])
    */
  }

  useEffect(() => {
    const {HEADERS, ...values} = results
    if(Object.values(values).flat(Infinity).length > 0) formatAsTable(results);
  }, [results])

  useEffect(() => {
    const budgetsCheck = Object.values(budgets).flat(Infinity).length > 0
    const realsCheck = Object.values(reals).flat(Infinity).length > 0
    if( budgetsCheck && realsCheck ){
      mergeResults(budgets, reals)
    }
  }, [budgets, reals])

  useEffect(() => {
    if(reportDates?.start_date != '' && reportDates?.end_date != ''){
      updateBudget();
      updateRealByDate();
    }
  }, [reportDates])

  useEffect(() => { updateReportDates() }, [costAnalysis, project]) 

  return (
    <div className="mx-auto max-w-full relative">
      {
        project?.start_date && project.end_date &&
        <Table
          columns={columns}
          rows={rows}
          styles={{
            vertical_lines: true, full_width: true, row_height: 'xs', rows:{remark_label: true},
            static_headers: true, static_bottom: true, max_height: 'max-h-[27rem]' 
          }}
        />
      }
      {
        (!project?.start_date || !project.end_date) &&
        <Alert
          status='error'
          label="No se cumplen los requisitos mínimos para mostrar este reporte."
          details='El proyecto no cuenta con fechas de comienzo o fin.'
        />
      }
    </div>
  )
}
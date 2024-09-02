import { useContext, useEffect, useState } from "react";
import { ProjectContext } from ".";
import { purchase_type } from "../../types/purchase.type";
import { cost_anaylsis_type } from "../../types/cost_analysis.type";
import { airtable_request_type } from "../../types/airtable_request.type";
import { generateEncode, USDollar } from "../../utils";
import { ENVIROMENT } from "../../constants/enviroment";

const {AIRTABLE_ACCESS_TOKEN, AIRTABLE_HOST, USA_SALES_BASE, USA_COST_ANALYSIS_TABLE} = ENVIROMENT

export default function ProjectDetails(props: { purchases: purchase_type[]}){
  const {purchases} = props
  const [project] = useContext(ProjectContext)
  const [costAnalysis, setCostAnalysis] = useState<cost_anaylsis_type>()

  const getCostAnalysis = async () => {
    try {
      const options = {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + AIRTABLE_ACCESS_TOKEN
        },
      }
      const request_settings : airtable_request_type = {
        view : 'BI',
        formula: encodeURI(`{ID}='${project?.cost_analysis_id}'`),
        fields: ['ID', 'total_cost'],
        offset : undefined
      }
      const request_url = `${AIRTABLE_HOST}/${USA_SALES_BASE}/${USA_COST_ANALYSIS_TABLE}${generateEncode(request_settings)}`
      const page = await fetch(request_url , options).then((res) => res.json())
      if(page?.records?.length == 1){
        const ca_found : cost_anaylsis_type = page.records.map(({id, createdTime, fields}) => ({
          id, createdTime, ...fields
        }))[0]
        setCostAnalysis(ca_found)
      }
    } catch (error) { 
      console.log('Error unexpected, here details...')
      console.log(error)
    }
  }

  useEffect(() => {
    if(project != undefined) getCostAnalysis();
  }, [project])

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200 text-center flex justify-center flex-col align-middle">
        <li className="px-4 py-4 sm:px-6 flex flex-col grap-y-4">
          <p className="order-first text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">{project?.project_id ? project?.project_id : 'ALL PROJECTS'}</p>
          {
            project && project.customer_name &&
            <div>
              <p className="text-base leading-7 text-gray-600">{project.customer_name}</p>
              <p className="text-xs text-gray-600">{project.start_date} - {project.end_date}</p>
            </div>
          }
        </li>  
        {
          project && project.cost_analysis_id && costAnalysis &&
          <li className="px-4 py-4 sm:px-6 flex grap-y-4 justify-evenly">
            <>
              <div>
                <p className="text-base leading-7 font-semibold text-gray-600">Cost Analysis</p>
                <p className="text-lg text-gray-600">{USDollar.format(costAnalysis.total_cost)}</p>
              </div>
              <div>
                <p className="text-base leading-7 font-semibold text-gray-600">Purchases</p>
                <p className="text-lg text-gray-600">
                  { USDollar.format(purchases.reduce((total, purchase) => total + purchase.total_cost, 0)) }
                </p>
              </div>
              <div>
                <p className="text-base leading-7 font-semibold text-gray-600">Difference</p>
                <p className="text-lg text-gray-600">
                  { USDollar.format(
                    costAnalysis.total_cost - purchases.reduce((total, purchase) => total + purchase.total_cost, 0)
                    ) }
                </p>
              </div>
              <div>
                <p className="text-base leading-7 font-semibold text-gray-600">% Used</p>
                <p className="text-lg text-gray-600">
                  { 
                    costAnalysis.total_cost != 0
                    ?  ((purchases.reduce((total, purchase) => total + purchase.total_cost, 0)*100)/costAnalysis.total_cost) + '%'
                    : 0 + '%'
                  }
                </p>
              </div>
            </>
          </li>  
        }
      </ul>
    </div>
  )
}
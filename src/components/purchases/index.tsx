import { createContext, useEffect, useState } from "react"
import { ENVIROMENT } from "../../constants/enviroment"
import { generateEncode, request_settings_type } from "../../utils"
import PurchasesReportFilters from "./filters"
import PurchasesAmountsByCategory from "./amountByCategory"
import PurchasesAmountsByCategoryGraph from "./amountByCategoryGraph"

const { AIRTABLE_ACCESS_TOKEN, AIRTABLE_HOST, USA_PURCHASES_BASE, USA_PURCHASES_TABLE } = ENVIROMENT
export type purchase_type = {
  id: string,
  cost_analysis_id: string,
  project_id: string,
  status_request: string,
  Category: string,
  total_cost: number
}

export const ProjectContext = createContext<[selected_project: string | undefined, setSelectedProject: any]>(
    ['', () => {}]
  )

export default function Purchases(){
  const [purchases, setPurchases] = useState<purchase_type[]>([])
  const [project, setProject] = useState(undefined)

  const getPurchases = async () => {
    let purchases_found : purchase_type[] = []
    try {
      const options = {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + AIRTABLE_ACCESS_TOKEN
        },
      }
      const request_settings : request_settings_type = {
        view : 'BI',
        formula: project ? encodeURI(`{project_id}="${project}"`) : undefined,
        fields: ['cost_analysis_id','project_id','status_request','Category','total_cost'],
        offset: undefined
      }
      do{
        const request_url = `${AIRTABLE_HOST}/${USA_PURCHASES_BASE}/${USA_PURCHASES_TABLE}${generateEncode(request_settings)}`
        const page = await fetch(request_url , options).then((res) => res.json())
        const records = page.records.map(({id, createdTime, fields}) => ({
          id, createdTime, ...fields
        }))
        purchases_found.push(...records)
        request_settings.offset = page?.offset
      }while(request_settings.offset != undefined)
      setPurchases(purchases_found)
    } catch (error) { 
      console.log('Error unexpected')
    }
  }

  useEffect(() => {
    getPurchases()
  },[project])

  return (
    <div id="purchase__section">
      <ProjectContext.Provider value={[project, setProject]}>
        <h3 className="text-base font-semibold leading-6 text-gray-900">Purchases Summary</h3>
        <PurchasesReportFilters />
        <PurchasesAmountsByCategory purchases={purchases} />
        <PurchasesAmountsByCategoryGraph purchases={purchases} />
      </ProjectContext.Provider>
    </div>
  )
}
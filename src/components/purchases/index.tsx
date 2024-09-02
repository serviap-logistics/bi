import { createContext, useEffect, useState } from "react"
import { ENVIROMENT } from "../../constants/enviroment"
import { generateEncode } from "../../utils"
import PurchasesReportFilters from "./filters"
import PurchasesAmountsByCategory from "./amountByCategory"
import PurchasesAmountsByCategoryGraph from "./amountByCategoryGraph"
import ProjectDetails from "./projectDetail"
import { project_type } from "../../types/project.type"
import { purchase_type } from "../../types/purchase.type"
import { airtable_request_type } from "../../types/airtable_request.type"

const { AIRTABLE_ACCESS_TOKEN, AIRTABLE_HOST, USA_PURCHASES_BASE, USA_PURCHASES_TABLE } = ENVIROMENT

export const ProjectContext = createContext<[selected_project: project_type | undefined, setSelectedProject: any]>(
    [undefined, () => {}]
  )

export default function Purchases(){
  const [purchases, setPurchases] = useState<purchase_type[]>([])
  const [project, setProject] = useState<project_type | undefined>()

  const getPurchases = async () => {
    let purchases_found : purchase_type[] = []
    try {
      const options = {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + AIRTABLE_ACCESS_TOKEN,
          'Content-Type': 'application/json'
        },
      }
      console.log(JSON.stringify(AIRTABLE_ACCESS_TOKEN))
      const request_settings : airtable_request_type = {
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
      console.log(error)
    }
  }

  useEffect(() => {
    getPurchases()
  },[project])

  return (
    <div id="purchase__section">
      <ProjectContext.Provider value={[project, setProject]}>
        <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Purchases Summary</h3>
        <PurchasesReportFilters />
        <ProjectDetails purchases={purchases} />
        <PurchasesAmountsByCategory purchases={purchases} />
        <PurchasesAmountsByCategoryGraph purchases={purchases} />
      </ProjectContext.Provider>
    </div>
  )
}
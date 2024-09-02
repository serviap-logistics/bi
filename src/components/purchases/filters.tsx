import { useContext, useEffect, useState } from "react";
import Select, { selectOption } from "../forms/select";
import { ENVIROMENT } from "../../constants/enviroment";
import { generateEncode } from "../../utils";
import { project_type } from "../../types/project.type";
import { ProjectContext } from ".";
import { airtable_request_type } from "../../types/airtable_request.type";

const {AIRTABLE_ACCESS_TOKEN, AIRTABLE_HOST, USA_OPERATIONS_BASE,USA_PROJECTS_TABLE} = ENVIROMENT

export default function PurchasesReportFilters() {
  const [projects, setProjects] = useState<project_type[]>()
  const [projectOptions, setProjectOptions] = useState<selectOption[]>([])
  const [_, setSelectedProject] = useContext(ProjectContext)

  const formatProjects = (projects : project_type[]) : selectOption[] => {
    const formatted : selectOption[] = projects.map(({id, Status, project_id}) => ({
      id: id,
      name: project_id,
      status: Status === 'Project Finished' ? 'success' : 
              Status === 'Project in Progress' ? 'warning' :
              Status === 'Preparation' ? 'info' :
              Status === 'Lost / Cancelled' ? 'error' : 'error'
    }))
    return formatted
  }

  const getProjects = async () => {
    let projects_found : project_type[] = []
    try {
      const options = {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + AIRTABLE_ACCESS_TOKEN
        },
      }
      const request_settings : airtable_request_type = {
        view : 'BI',
        formula: encodeURI(''),
        fields: ['project_id','Status','start_date','end_date','cost_analysis_id','customer_name'],
        offset : undefined
      }
      do{
        const request_url = `${AIRTABLE_HOST}/${USA_OPERATIONS_BASE}/${USA_PROJECTS_TABLE}${generateEncode(request_settings)}`
        const page = await fetch(request_url , options).then((res) => res.json())
        const records = page.records.map(({id, createdTime, fields}) => ({
          id, createdTime, ...fields
        }))
        projects_found.push(...records)
        request_settings.offset = page?.offset
      }while(request_settings.offset != undefined)
      setProjects(projects_found)
      const projects_formatted = formatProjects(projects_found)
      setProjectOptions(projects_formatted)
    } catch (error) { 
      console.log('Error unexpected')
    }
  }

  const updateProject = (project_id) => {
    setSelectedProject(projects?.find((project) => project.id === project_id));
  }

  const handleSelectProject = (selected : selectOption) => {
    updateProject(selected !== null ? selected.id : undefined);
  }

  useEffect(() => {
    getProjects()
  }, [])

  return <>
    <div className="rounded-md border-solid border-4 border-gray-100 bg-gray-100 px-6 py-5 sm:flex sm:items-start sm:justify-between">
      <div className="sm:flex sm:items-start">
        <Select label='Project' options={projectOptions} onSelectCallback={handleSelectProject} />
      </div>
    </div>
  </>
}
import { useContext, useEffect } from "react";
import { ProjectContext } from ".";

export default function ProjectDetails(){
  const [project] = useContext(ProjectContext)

  useEffect(() => {
    console.log(`PROJECT: ${project}`)
  }, [project])

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200 text-center flex justify-center">
        <li className="px-4 py-4 sm:px-6 flex max-w-xs flex-col grap-y-4">
          <p className="order-first text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">{project?.project_id ? project?.project_id : 'ALL PROJECTS'}</p>
          {
            project && project.customer_name &&
            <div>
              <p className="text-base leading-7 text-gray-600">{project.customer_name}</p>
              <p className="text-xs text-gray-600">{project.start_date} - {project.end_date}</p>
            </div>
          }
        </li>  
      </ul>
    </div>
  )
}
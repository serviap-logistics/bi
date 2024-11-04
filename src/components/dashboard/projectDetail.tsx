import { useContext } from 'react';
import { ProjectContext } from '.';

export default function HeadcountProjectDetails() {
  const project = useContext(ProjectContext);
  return (
    <div className="overflow-hidden bg-white sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        <li className="px-4 py-4 sm:px-6 lg:px-10 flex justify-center w-full">
          <div>
            <p className="order-first text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              {project?.project_id ? project?.project_id : ''}
              <span className="text-base text-center leading-7 text-gray-600">
                {' '}
                ({project?.project_name})
              </span>
            </p>
            {project && project.customer_name && (
              <div>
                <p className="text-base text-center leading-7 text-gray-600">
                  {project.customer_name}
                </p>
                <p className="text-xs text-center text-gray-600">
                  {project.start_date} - {project.end_date}
                </p>
              </div>
            )}
          </div>
        </li>
      </ul>
    </div>
  );
}

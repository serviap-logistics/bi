import { useEffect, useState } from 'react';
import {
  getProjects as getAirtableProjects,
  project,
} from '../../services/projects';
import Select, { selectOption } from '../../../utils/components/select';

export default function PurchasesReportFilters(props: {
  onSelectCallback: any;
}) {
  const { onSelectCallback } = props;
  const [projects, setProjects] = useState<project[]>();
  const [projectOptions, setProjectOptions] = useState<selectOption[]>([]);

  const formatProjects = (projects: project[]): selectOption[] => {
    const formatted: selectOption[] = projects.map(
      ({ id, Status, project_id, project_name }) => ({
        id: id,
        name: `${project_id} (${project_name})`,
        color:
          Status === 'Project Finished'
            ? 'success'
            : Status === 'Project in Progress'
              ? 'warning'
              : Status === 'Preparation'
                ? 'info'
                : Status === 'Lost / Cancelled'
                  ? 'error'
                  : 'error',
        toast: Status,
      }),
    );
    return formatted;
  };

  const getProjects = async () => {
    const projects_found: project[] = await getAirtableProjects({
      view: 'BI',
      formula: encodeURI(''),
      fields: [
        'project_id',
        'project_name',
        'Status',
        'start_date',
        'end_date',
        'cost_analysis_id',
        'customer_name',
      ],
      offset: undefined,
    });
    setProjects(projects_found);
    const projects_formatted = formatProjects(projects_found);
    setProjectOptions(projects_formatted);
  };

  const updateProject = (project_id) => {
    onSelectCallback(projects?.find((project) => project.id === project_id));
  };

  const handleSelectProject = (selected: selectOption) => {
    updateProject(selected !== null ? selected.id : undefined);
  };

  useEffect(() => {
    getProjects();
  }, []);

  return (
    <>
      <div className="rounded-md border-solid border-4 border-gray-100 bg-gray-100 px-6 py-5 sm:flex sm:items-start sm:justify-between">
        <div className="sm:flex sm:items-start">
          <Select
            label="Project"
            options={projectOptions}
            onSelectCallback={handleSelectProject}
            width="sm:w-[40rem]"
          />
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { getProjects, project } from '../../services/projects';
import Select, { selectOption } from '../../../utils/components/select';

export default function DashboardFilters(props: { onChangeCallback: any }) {
  const { onChangeCallback } = props;
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

  const updateProjects = async () => {
    const projects_found: project[] = await getProjects({
      view: 'BI',
      fields: [
        'project_id',
        'project_code',
        'project_name',
        'Status',
        'start_date',
        'end_date',
        'customer_name',
        'cost_analysis_id',
        'cost_analysis_code',
        'hour_registration_start_date',
        'hour_registration_end_date',
      ],
    });
    setProjects(projects_found);
  };

  const updateProject = (project_id) => {
    onChangeCallback(projects?.find((project) => project.id === project_id));
  };

  const handleSelectProject = (selected: selectOption) => {
    updateProject(selected !== null ? selected.id : undefined);
  };

  useEffect(() => {
    updateProjects();
  }, []);
  useEffect(() => {
    const projects_formatted = formatProjects(projects ?? []);
    setProjectOptions(projects_formatted);
  }, [projects]);

  return (
    <>
      <div className="rounded-md border-solid border-4 border-gray-100 bg-gray-100 px-6 py-5 sm:flex sm:items-start sm:justify-between z-20">
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

import { useEffect, useState } from 'react';
import Select, { selectOption } from '../utils/select';
import { project_type } from '../../types/project.type';
import { getProjects } from '../../api/projects';

export default function HeadcountFilters(props: { onChangeCallback: any }) {
  const { onChangeCallback } = props;
  const [projects, setProjects] = useState<project_type[]>();
  const [projectOptions, setProjectOptions] = useState<selectOption[]>([]);

  const formatProjects = (projects: project_type[]): selectOption[] => {
    const formatted: selectOption[] = projects.map(
      ({ id, Status, project_id }) => ({
        id: id,
        name: project_id,
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
    const projects_found: project_type[] = await getProjects({
      view: 'BI',
      fields: [
        'project_id',
        'Status',
        'start_date',
        'end_date',
        'customer_name',
        'cost_analysis_id',
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
            width="sm:w-[24rem]"
          />
        </div>
      </div>
    </>
  );
}

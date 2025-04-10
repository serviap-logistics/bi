import { useContext, useEffect, useState } from 'react';
import { getProjects, project } from '../../services/projects';
import QuerySelect, {
  QuerySelectOption,
} from '../../../utils/components/querySelect';
import { CountryContext } from '../../../App';

export default function HeadcountFilters(props: { onChangeCallback: any }) {
  const { onChangeCallback } = props;
  const country = useContext(CountryContext);
  const [projects, setProjects] = useState<project[]>();
  const [projectOptions, setProjectOptions] = useState<QuerySelectOption[]>([]);

  const formatProjects = (projects: project[]): QuerySelectOption[] => {
    const formatted: QuerySelectOption[] = projects.map(
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
    const projects_found: project[] = await getProjects(country, {
      view: 'BI',
      fields: [
        'project_id',
        'project_name',
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

  const handleSelectProject = (selected: QuerySelectOption) => {
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
          <QuerySelect
            label="Project"
            options={projectOptions}
            onSelectCallback={handleSelectProject}
            width="sm:w-[40rem]"
            setController={() => {}}
          />
        </div>
      </div>
    </>
  );
}

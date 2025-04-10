import { useContext, useEffect, useRef, useState } from 'react';
import {
  getProjects as getAirtableProjects,
  project,
} from '../../services/projects';
import QuerySelect, {
  QuerySelectOption,
} from '../../../utils/components/querySelect';
import { CountryContext } from '../../../App';

export default function PurchasesReportFilters(props: {
  onSelectCallback: any;
}) {
  const { onSelectCallback } = props;
  const [projects, setProjects] = useState<project[]>();
  const [projectOptions, setProjectOptions] = useState<QuerySelectOption[]>([]);
  const country = useContext(CountryContext);
  const clearSelection = useRef<() => void>();

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

  const getProjects = async () => {
    const projects_found: project[] = await getAirtableProjects(country, {
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

  const handleSelectProject = (selected: QuerySelectOption | null) => {
    updateProject(selected !== null ? selected.id : undefined);
  };

  useEffect(() => {
    handleSelectProject(null);
    if (clearSelection.current) clearSelection.current();
  }, [country]);

  useEffect(() => {
    console.log('Loading proyects...', country);
    getProjects();
  }, [country]);

  return (
    <>
      <div className="rounded-md border-solid border-4 border-gray-100 bg-gray-100 px-6 py-5 sm:flex sm:items-start sm:justify-between">
        <div className="sm:flex sm:items-start">
          <QuerySelect
            label={country === 'USA' ? 'Project' : 'Proyecto'}
            options={projectOptions}
            onSelectCallback={handleSelectProject}
            width="sm:w-[40rem]"
            setController={(fn) => (clearSelection.current = fn)}
          />
        </div>
      </div>
    </>
  );
}

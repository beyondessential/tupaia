import React from 'react';
import { useProject, useProjects } from '../../api';
import { useVizConfigContext } from '../../context';
import { Autocomplete } from './Autocomplete';

export const ProjectField = () => {
  const [{ visualisation, project }, { setProject }] = useVizConfigContext();

  const { data: defaultProject } = useProject(
    visualisation?.latestDataParameters?.hierarchy,
    data => setProject(data),
  );

  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();

  return (
    <Autocomplete
      id="project"
      placeholder="Select Project"
      value={project}
      defaultValue={defaultProject || project}
      options={projects}
      getOptionLabel={option => option['entity.name']}
      renderOption={option => <span>{option['entity.name']}</span>}
      onChange={(_, newProject) => {
        setProject(newProject);
      }}
      loading={isLoadingProjects}
    />
  );
};

/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ProjectCard as ProjectCardComponent } from './ProjectCard';
import { PROJECT_ACCESS_TYPES } from '../../constants';
import { getProjectAccessType } from '../../utils';
import { SingleProject } from '../../types';
import { ErrorBoundary } from '@tupaia/ui-components';

const EXPLORE_CODE = 'explore';

interface ProjectCardListProps {
  projects: SingleProject[];
  actions: {
    [key: string]: (props: any) => JSX.Element;
  };
  ProjectCard?: (props: any) => JSX.Element; // this is to allow for legacy project cards to be used, e.g. in the projects modal
}

type SortedProject = SingleProject & {
  ActionButton: (props: any) => JSX.Element;
};

export const ProjectCardList = ({
  projects,
  actions,
  ProjectCard = ProjectCardComponent,
}: ProjectCardListProps) => {
  const sortedProjects = Object.keys(PROJECT_ACCESS_TYPES).reduce((result, accessType) => {
    const action = actions[PROJECT_ACCESS_TYPES[accessType as keyof typeof PROJECT_ACCESS_TYPES]];
    // If there is no action passed in for this access type, then the project card is useless, so ignore it so that nothing breaks
    if (!action) return result;
    const accessTypeProjects = projects.filter(project => {
      const projectAccessType = getProjectAccessType(project);
      return project.code !== EXPLORE_CODE && projectAccessType === accessType;
    });
    return [
      ...result,
      ...accessTypeProjects
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map(project => ({
          ...project,
          ActionButton: actions[accessType],
        })),
    ];
  }, [] as SortedProject[]);

  // Have to wrap this in a fragment so that consuming components don't throw a TS error about type of component not being valid
  return (
    <>
      {sortedProjects.map(project => {
        const { name, description, logoUrl, imageUrl, names, ActionButton } = project;
        return (
          <ProjectCard
            key={name}
            name={name}
            description={description}
            imageUrl={imageUrl}
            logoUrl={logoUrl}
            ProjectButton={(props: any) => <ActionButton {...props} project={project} />}
            names={names}
          />
        );
      })}
    </>
  );
};

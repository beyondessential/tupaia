import React from 'react';
import { ProjectCard as ProjectCardComponent } from './ProjectCard';
import { PROJECT_ACCESS_TYPES } from '../../constants';
import { getProjectAccessType } from '../../utils';
import { SingleProject } from '../../types';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';

const EXPLORE_CODE = 'explore';

const NoResultsMessage = styled(Typography)`
  font-size: 0.875rem;
`;

interface ProjectCardListProps {
  projects: SingleProject[];
  actions: {
    [key: string]: (props: any) => JSX.Element;
  };
  ProjectCard?: (props: any) => JSX.Element; // this is to allow for legacy project cards to be used, e.g. in the projects modal
  selectedCountry?: string;
}

type SortedProject = SingleProject & {
  ActionButton: (props: any) => JSX.Element;
};

export const ProjectCardList = ({
  projects,
  actions,
  ProjectCard = ProjectCardComponent,
  selectedCountry,
}: ProjectCardListProps) => {
  const getActionButton = (project: SingleProject) => {
    const projectAccessType = getProjectAccessType(project);
    if (!projectAccessType) {
      return () => <></>;
    }
    const action = actions[PROJECT_ACCESS_TYPES[projectAccessType]];
    if (!action) {
      return () => <></>;
    }
    return action;
  };
  const getSortedProjects = () => {
    const exploreProjectRemoved = projects.filter(project => project.code !== EXPLORE_CODE);
    if (selectedCountry) {
      return exploreProjectRemoved
        .filter(project => {
          return project.names.includes(selectedCountry);
        })
        .map(project => ({
          ...project,
          ActionButton: getActionButton(project),
        }));
    }

    // when no country is selected, order by access type and then by sortOrder
    return Object.keys(PROJECT_ACCESS_TYPES).reduce((result, accessType) => {
      const action = actions[PROJECT_ACCESS_TYPES[accessType as keyof typeof PROJECT_ACCESS_TYPES]];
      // If there is no action passed in for this access type, then the project card is useless, so ignore it so that nothing breaks
      if (!action) return result;
      const accessTypeProjects = exploreProjectRemoved.filter(project => {
        const projectAccessType = getProjectAccessType(project);
        return projectAccessType === accessType;
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
  };

  const sortedProjects = getSortedProjects();

  // Have to wrap this in a fragment so that consuming components don't throw a TS error about type of component not being valid

  if (sortedProjects.length === 0) {
    return <NoResultsMessage>No results found</NoResultsMessage>;
  }
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

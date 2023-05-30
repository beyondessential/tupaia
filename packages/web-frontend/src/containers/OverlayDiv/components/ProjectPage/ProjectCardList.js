/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ProjectCard as ProjectCardComponent } from './ProjectCard';
import { PROJECT_ACCESS_TYPES } from '../../../../constants';
import { getProjectAccessType } from '../../../../utils';

const EXPLORE_CODE = 'explore';

export const ProjectCardList = ({ projects, actions, ProjectCard }) => {
  const sortedProjects = Object.keys(PROJECT_ACCESS_TYPES).reduce((result, accessType) => {
    const action = actions[PROJECT_ACCESS_TYPES[accessType]];
    // If there is no action passed in for this access type, then the project card is useless, so ignore it so that nothing breaks
    if (!action) return result;
    const accessTypeProjects = projects.filter(({ code, hasAccess, hasPendingAccess = false }) => {
      const projectAccessType = getProjectAccessType({ hasPendingAccess, hasAccess });
      return code !== EXPLORE_CODE && projectAccessType === accessType;
    });
    return [
      ...result,
      ...accessTypeProjects
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(project => ({
          ...project,
          ActionButton: actions[accessType],
        })),
    ];
  }, []);

  return sortedProjects.map(project => {
    const { name, description, logoUrl, imageUrl, names, ActionButton } = project;
    return (
      <ProjectCard
        key={name}
        name={name}
        description={description}
        imageUrl={imageUrl}
        logoUrl={logoUrl}
        ProjectButton={props => <ActionButton {...props} project={project} />}
        names={names}
      />
    );
  });
};

ProjectCardList.propTypes = {
  actions: PropTypes.shape({
    [PROJECT_ACCESS_TYPES.ALLOWED]: PropTypes.func.isRequired,
    [PROJECT_ACCESS_TYPES.DENIED]: PropTypes.func.isRequired,
    [PROJECT_ACCESS_TYPES.PENDING]: PropTypes.func.isRequired,
  }),
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      imageUrl: PropTypes.string.isRequired,
      logoUrl: PropTypes.string,
      names: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ).isRequired,
};

ProjectCardList.defaultProps = { ProjectCard: ProjectCardComponent };

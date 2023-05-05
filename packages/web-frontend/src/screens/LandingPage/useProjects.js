/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useDispatch, useSelector } from 'react-redux';
import { setProject, setRequestingAccess } from '../../projects/actions';
import { setOverlayComponent } from '../../actions';
import { REQUEST_PROJECT_ACCESS } from '../../containers/OverlayDiv/constants';

const LANDING_PAGES = ['wish', 'fanafana', 'unfpa'];
export const useProjects = () => {
  const projectData = useSelector(({ project }) => project?.projects || []);
  const dispatch = useDispatch();

  const navigateToRequestProjectAccess = project => {
    dispatch(setRequestingAccess(project));
    dispatch(setOverlayComponent(REQUEST_PROJECT_ACCESS));
  };

  const navigateToProject = project => {
    dispatch(setProject(project.code));
  };

  const projects = projectData.filter(p => LANDING_PAGES.includes(p.code));
  return { navigateToProject, navigateToRequestProjectAccess, projects };
};

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { MenuItem, Select, FormControl, CircularProgress } from '@material-ui/core';
import { useLocation, useNavigate } from 'react-router-dom';

import { useProjects } from '../api/queries';
import { setSelectedProject } from './actions';
import { selectSelectedProject } from './selectors';
import {
  buildSingleProjectBasePath,
  SINGLE_PROJECT_PATH_PARAM,
} from '../routes/scopes';
import { WHITE } from '../theme/colors';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.25rem 0.25rem 0.75rem;
`;

const Label = styled.div`
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${WHITE}cc; // 80% opacity
`;

const StyledSelect = styled(Select)`
  color: ${WHITE};
  font-size: 0.875rem;
  background-color: ${WHITE}14; // ~8% opacity
  border-radius: 4px;
  padding-inline: 0.5rem;

  &::before,
  &::after {
    display: none;
  }

  .MuiSelect-icon {
    color: ${WHITE};
  }

  .MuiSelect-select {
    padding-block: 0.5rem;
    padding-inline-end: 1.5rem;

    &:focus {
      background-color: transparent;
    }
  }
`;

const Loading = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${WHITE}cc;
  font-size: 0.875rem;
  padding-block: 0.5rem;
`;

// If currently inside the single-project section (URL begins with the active
// project code), swap that segment for the new code. Otherwise leave the URL
// alone — selecting a project from an all-data screen just primes the
// selection without navigating away.
const buildProjectSwapUrl = (pathname, search, hash, fromCode, toCode) => {
  if (!fromCode || !toCode) return null;
  const segments = pathname.split('/');
  if (segments[1] !== fromCode) return null;
  segments[1] = toCode;
  return `${segments.join('/')}${search}${hash}`;
};

const ProjectSelectorComponent = ({ collapsed, selectedProject, onSelectProject }) => {
  const { data: projects, isLoading } = useProjects();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!selectedProject && projects && projects.length > 0) {
      onSelectProject(projects[0]);
    }
  }, [selectedProject, projects, onSelectProject]);

  const handleChange = event => {
    const code = event.target.value;
    const project = projects?.find(p => p.code === code);
    if (!project) return;
    const previousCode = selectedProject?.code;
    onSelectProject(project);
    const swapUrl = buildProjectSwapUrl(
      location.pathname,
      location.search,
      location.hash,
      previousCode,
      project.code,
    );
    if (swapUrl) {
      navigate(swapUrl, { replace: true });
    }
  };

  if (collapsed) {
    return null;
  }

  if (isLoading) {
    return (
      <Wrapper>
        <Label>Project</Label>
        <Loading>
          <CircularProgress size={14} color="inherit" />
          <span>Loading…</span>
        </Loading>
      </Wrapper>
    );
  }

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <Wrapper>
      <Label>Project</Label>
      <FormControl fullWidth>
        <StyledSelect
          value={selectedProject?.code ?? ''}
          onChange={handleChange}
          MenuProps={{
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            transformOrigin: { vertical: 'top', horizontal: 'left' },
            getContentAnchorEl: null,
          }}
          inputProps={{ 'aria-label': 'Select project' }}
        >
          {projects.map(project => (
            <MenuItem key={project.code} value={project.code}>
              {project.name || project.code}
            </MenuItem>
          ))}
        </StyledSelect>
      </FormControl>
    </Wrapper>
  );
};

ProjectSelectorComponent.propTypes = {
  collapsed: PropTypes.bool,
  selectedProject: PropTypes.shape({
    code: PropTypes.string,
    name: PropTypes.string,
  }),
  onSelectProject: PropTypes.func.isRequired,
};

ProjectSelectorComponent.defaultProps = {
  collapsed: false,
  selectedProject: null,
};

const mapStateToProps = state => ({
  selectedProject: selectSelectedProject(state),
});

const mapDispatchToProps = dispatch => ({
  onSelectProject: project => dispatch(setSelectedProject(project)),
});

export const ProjectSelector = connect(mapStateToProps, mapDispatchToProps)(ProjectSelectorComponent);

// Route param name kept here so consumers don't need to import scopes directly
// when forwarding to navigation logic.
export { SINGLE_PROJECT_PATH_PARAM };

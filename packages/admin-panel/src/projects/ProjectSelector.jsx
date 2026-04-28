import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { MenuItem, Select, FormControl, CircularProgress } from '@material-ui/core';
import { useProjects } from '../api/queries';
import { setSelectedProject } from './actions';
import { selectSelectedProject } from './selectors';
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

export const ProjectSelector = ({ collapsed = false }) => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(selectSelectedProject);
  const { data: projects, isLoading } = useProjects();

  useEffect(() => {
    if (!selectedProject && projects && projects.length > 0) {
      dispatch(setSelectedProject(projects[0]));
    }
  }, [selectedProject, projects, dispatch]);

  const handleChange = event => {
    const code = event.target.value;
    const project = projects?.find(p => p.code === code);
    if (project) {
      dispatch(setSelectedProject(project));
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

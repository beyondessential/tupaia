import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { MenuItem, Select, FormControl, CircularProgress } from '@material-ui/core';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProjects } from '../api/queries';
import { useSaveSelectedProject } from '../api/mutations';
import { useSelectedProjectCode, useSidebarProjectCode } from './useSelectedProject';
import { SINGLE_PROJECT_PATH_PARAM } from '../routes/scopes';
import { BLUE, LIGHT_BLACK, WHITE } from '../theme/colors';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-block-start: 0.5rem;
  padding: 0.25rem 1rem 0.75rem;
`;

const Label = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.palette.text.hint};
  margin-block-end: 0.2rem;
`;

const StyledSelect = styled(Select)`
  font-size: 0.875rem;

  &::before,
  &:hover:not(.Mui-disabled)::before {
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  }

  &::after {
    border-bottom: 1px solid ${props => props.theme.palette.primary.main};
  }

  .MuiSelect-select:focus {
    background-color: transparent;
  }

  .MuiSelect-select {
    padding-block: 1rem;
  }
`;

const StyledMenuItem = styled(MenuItem)`
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  color: ${WHITE};

  &:hover,
  &.Mui-selected,
  &.Mui-selected:hover {
    background-color: transparent;
  }
`;

const menuProps = {
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  transformOrigin: { vertical: 'top', horizontal: 'left' },
  getContentAnchorEl: null,
  PaperProps: {
    style: {
      backgroundColor: LIGHT_BLACK,
      border: `1px solid ${BLUE}`,
      borderRadius: 3,
      marginTop: 2,
    },
  },
};

const Loading = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${WHITE}cc;
  font-size: 0.875rem;
  padding-block: 0.5rem;
`;

// Swap the project-code segment when already on a single-project URL.
// Returns null when the user isn't on a project URL — caller stays put.
const buildSingleProjectTargetUrl = (pathname, search, hash, fromUrlCode, toCode) => {
  if (!fromUrlCode) return null;
  const segments = pathname.split('/');
  if (segments[1] !== fromUrlCode) return null;
  segments[1] = toCode;
  return `${segments.join('/')}${search}${hash}`;
};

export const ProjectSelector = ({ collapsed }) => {
  const { data: projects, isLoading } = useProjects();
  const navigate = useNavigate();
  const location = useLocation();
  const urlProjectCode = useSelectedProjectCode();
  const sidebarProjectCode = useSidebarProjectCode();
  const { mutate: saveSelectedProject } = useSaveSelectedProject();

  const handleChange = event => {
    const code = event.target.value;
    if (!code || code === sidebarProjectCode) return;

    const project = projects?.find(p => p.code === code);
    if (project?.id) {
      // Fire-and-forget — the new project is reflected immediately via the
      // controlled select; the persisted preference catches up async.
      saveSelectedProject(project.id);
    }

    // Single-project URL → swap the code segment.
    // All Data URL → stay put; sidebar updates from the saved preference.
    const target = buildSingleProjectTargetUrl(
      location.pathname,
      location.search,
      location.hash,
      urlProjectCode,
      code,
    );
    if (target) navigate(target, { replace: true });
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
          value={sidebarProjectCode ?? ''}
          onChange={handleChange}
          MenuProps={menuProps}
          IconComponent={ExpandMore}
          inputProps={{ 'aria-label': 'Select project' }}
        >
          {projects.map(project => (
            <StyledMenuItem key={project.code} value={project.code}>
              {project.name || project.code}
            </StyledMenuItem>
          ))}
        </StyledSelect>
      </FormControl>
    </Wrapper>
  );
};

ProjectSelector.propTypes = {
  collapsed: PropTypes.bool,
};

ProjectSelector.defaultProps = {
  collapsed: false,
};

export { SINGLE_PROJECT_PATH_PARAM };

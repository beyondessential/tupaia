import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router';
import { Autocomplete, SpinningLoader } from '@tupaia/ui-components';
import { Typography } from '@material-ui/core';
import {
  MODAL_ROUTES,
  DEFAULT_URL,
  PROJECT_ACCESS_TYPES,
  TUPAIA_LIGHT_LOGO_SRC,
  URL_SEARCH_PARAMS,
  MOBILE_BREAKPOINT,
} from '../constants';
import { useCountries, useProjects, useUser } from '../api/queries';
import {
  ProjectAllowedLink,
  ProjectCardList,
  ProjectDeniedLink,
  ProjectLoginLink,
  ProjectPendingLink,
} from '../layout';
import { Modal, RouterButton } from '../components';
import { SingleProject } from '../types';
import { useModal } from '../utils';

const OFF_WHITE = '#B8B8B8';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.9rem 0 0;
  padding-left: 3.125rem;
  padding-right: 3.125rem;
  width: 65rem;
  max-width: 100%;
  text-align: left;
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding: 0.9rem 0;
  }
`;

const TagLine = styled.p`
  margin: 0.5rem 0.4rem 1.5rem;
  max-width: 26rem;
  font-size: 0.875rem;
  font-weight: 400;
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.8125rem;
  margin: 1.4rem 0;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    padding-left: 0.675rem;
    padding-right: 0.675rem;
  }
`;

const ExploreButton = styled(RouterButton).attrs({
  variant: 'outlined',
  color: 'default',
  to: DEFAULT_URL,
})`
  margin-top: 0.3rem;
  margin-bottom: 1rem;
  margin-left: 0.3rem;
  width: 10.5rem;
  height: 2.5rem;
  line-height: 1.125rem;
  border-radius: 3px;
  font-size: 0.875rem;
  font-weight: 500;
  font-style: normal;
  text-align: center;
  text-transform: none;
  border-color: ${({ theme }) => theme.palette.text.primary};
`;

const Line = styled.div`
  background-color: ${({ theme }) => theme.palette.text.secondary};
  height: 1px;
  margin-top: 0.7rem;
`;

const ProjectsTitle = styled(Typography).attrs({
  variant: 'h1',
})`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 1.3rem;
  font-weight: 500;
`;

const ProjectsTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-block-start: 1rem;
  margin-inline-start: 0.4rem;
`;

const Logo = styled.img`
  width: 6.6875rem;
  height: 2.6875rem;
`;

const Loader = styled.div`
  margin-top: 1.5rem;
  min-height: 15rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AutoCompleteWrapper = styled.div`
  border-left: 1px solid ${({ theme }) => theme.palette.text.secondary};
  margin-inline-start: 0.9rem;
  padding-inline-start: 1.3rem;
  width: 100%;
  max-width: 19rem;
`;

const SearchAutocomplete = styled(Autocomplete)`
  .MuiInputBase-root {
    background-color: ${({ theme }) => theme.palette.background.paper};
  }
  .MuiFormControl-root {
    margin-block-end: 0;
  }
  .MuiOutlinedInput-notchedOutline {
    border-color: ${OFF_WHITE};
  }
  .MuiInputBase-input::placeholder {
    color: ${OFF_WHITE};
    font-size: 0.875rem;
  }
  .MuiInputBase-input {
    font-size: 0.875rem;
  }
  .MuiAutocomplete-endAdornment {
    top: initial;
  }
  .MuiSvgIcon-root {
    color: ${OFF_WHITE};
  }
`;

const Option = styled.span`
  font-size: 0.875rem;
`;

/**
 * This is the projects view that is shown when the projects modal is open
 */
export const ProjectsModal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const { closeModal } = useModal();
  const { data: projects = [], isFetching } = useProjects();
  const { isLoggedIn } = useUser();
  const location = useLocation();
  const { data: countries, isLoading } = useCountries();

  return (
    <Modal isOpen onClose={closeModal}>
      <Wrapper>
        <div>
          <Logo src={TUPAIA_LIGHT_LOGO_SRC} alt="Tupaia logo" />
          <TagLine>
            Data aggregation, analysis, and visualisation for the most remote settings in the world.
          </TagLine>
        </div>
        <div>
          <ExploreButton>Explore tupaia.org</ExploreButton>
          <Line />
          <ProjectsTitleWrapper>
            <ProjectsTitle>Projects</ProjectsTitle>
            <AutoCompleteWrapper>
              <SearchAutocomplete
                options={countries?.map(({ name }) => ({ label: name, value: name })) ?? []}
                loading={isLoading}
                placeholder="Search country..."
                onInputChange={(_, newValue) => setSearchTerm(newValue)}
                getOptionLabel={option => option.label}
                value={selectedCountry}
                onChange={(_, newValue) => {
                  return setSelectedCountry(newValue);
                }}
                renderOption={({ label }) => <Option>{label}</Option>}
                muiProps={{
                  filterOptions: options => {
                    if (!searchTerm) return options;
                    return options.filter(option =>
                      option.label.toLowerCase().startsWith(searchTerm.toLowerCase()),
                    );
                  },
                }}
                getOptionSelected={(option, value) => option.value === value}
              />
            </AutoCompleteWrapper>
          </ProjectsTitleWrapper>
          {isFetching ? (
            <Loader>
              <SpinningLoader />
            </Loader>
          ) : (
            <ProjectsGrid>
              <ProjectCardList
                selectedCountry={selectedCountry?.value}
                projects={projects}
                actions={{
                  [PROJECT_ACCESS_TYPES.ALLOWED]: ({
                    project: { id, code, homeEntityCode, dashboardGroupName },
                  }: {
                    project: SingleProject;
                  }) => (
                    <ProjectAllowedLink
                      projectId={id}
                      url={`/${code}/${homeEntityCode}${
                        dashboardGroupName ? `/${encodeURIComponent(dashboardGroupName)}` : ''
                      }`}
                    />
                  ),
                  [PROJECT_ACCESS_TYPES.PENDING]: () => <ProjectPendingLink />,
                  [PROJECT_ACCESS_TYPES.DENIED]: ({
                    project: { code },
                  }: {
                    project: SingleProject;
                  }) => {
                    if (isLoggedIn) {
                      return (
                        <ProjectDeniedLink
                          url={`?${URL_SEARCH_PARAMS.PROJECT}=${code}#${MODAL_ROUTES.REQUEST_PROJECT_ACCESS}`}
                        />
                      );
                    }

                    return <ProjectLoginLink routerState={{ referrer: location }} />;
                  },
                }}
              />
            </ProjectsGrid>
          )}
        </div>
      </Wrapper>
    </Modal>
  );
};

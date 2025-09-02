import { Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { useLocation } from 'react-router';
import styled from 'styled-components';

import { Autocomplete, SpinningLoader } from '@tupaia/ui-components';
import { useCountriesQuery, useProjects, useUser } from '../api/queries';
import { Modal, RouterButton } from '../components';
import {
  DEFAULT_URL,
  MODAL_ROUTES,
  PROJECT_ACCESS_TYPES,
  TUPAIA_LIGHT_LOGO_SRC,
  URL_SEARCH_PARAMS,
} from '../constants';
import {
  ProjectAllowedLink,
  ProjectCardList,
  ProjectDeniedLink,
  ProjectLoginLink,
  ProjectPendingLink,
} from '../layout';
import { SingleProject } from '../types';
import { useModal } from '../utils';

interface CountryAutocompleteOption {
  label: string;
  value: string;
}

const OFF_WHITE = '#B8B8B8';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  inline-size: 65rem;
  max-inline-size: 100%;
  padding-block: 0.9rem;
  padding-inline: 0;
  text-align: start;
  ${props => props.theme.breakpoints.up('md')} {
    padding-block-end: 0;
    padding-inline: 3.125rem;
  }
`;

const TagLine = styled.p`
  font-size: 0.875rem;
  font-weight: 400;
  margin-block: 0.5rem 1.5rem;
  margin-inline: 0.4rem;
  max-width: 26rem;
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.8125rem;
  margin-block: 1.4rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    padding-inline: 0.675rem;
  }
`;

const ExploreButton = styled(RouterButton).attrs({
  variant: 'outlined',
  color: 'default',
  to: DEFAULT_URL,
})`
  block-size: 2.5rem;
  border-color: ${({ theme }) => theme.palette.text.primary};
  border-radius: 0.1875rem;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 500;
  inline-size: 10.5rem;
  line-height: 1.3;
  margin-block: 0.3rem 1rem;
  margin-inline-start: 0.3rem;
  text-align: center;
  text-transform: none;
`;

const Line = styled.div`
  background-color: ${({ theme }) => theme.palette.text.secondary};
  height: 1px;
  margin-block-start: 0.7rem;
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
  max-inline-size: 19rem;
`;

const SearchAutocomplete = styled(Autocomplete<CountryAutocompleteOption>)`
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
  const [selectedCountry, setSelectedCountry] = useState<CountryAutocompleteOption | null>(null);
  const { closeModal } = useModal();
  const { data: projects = [], isFetching } = useProjects();
  const { isLoggedIn } = useUser();
  const location = useLocation();
  const { data: countries, isLoading } = useCountriesQuery();

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
                placeholder="Search country…"
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
                  [PROJECT_ACCESS_TYPES.PENDING]: ProjectPendingLink,
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

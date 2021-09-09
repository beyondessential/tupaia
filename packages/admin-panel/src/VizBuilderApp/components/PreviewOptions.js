/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import debounce from 'lodash.debounce';
import blue from '@material-ui/core/colors/blue';
import MuiPaper from '@material-ui/core/Paper';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';

import {
  Autocomplete as AutocompleteComponent,
  FlexEnd,
  FlexSpaceBetween,
  FlexStart,
  ImportModal,
} from '@tupaia/ui-components';
import { useLocations, useProjects } from '../api/queries';
import { usePreviewData, useVizBuilderConfig } from '../context';
import { LinkButton } from './LinkButton';
import { useUploadTestData } from '../api';

const Container = styled(FlexSpaceBetween)`
  padding: 24px 0;
`;

const Autocomplete = styled(AutocompleteComponent)`
  flex: 1;
  margin: 0 15px 0 0;
  max-width: 30%;

  input.MuiInputBase-input.MuiOutlinedInput-input.MuiAutocomplete-input {
    font-size: 14px;
    line-height: 1;
    padding: 10px;
  }

  .MuiFormControl-root {
    margin: 0;
  }
`;

const PaperComponent = styled(MuiPaper)`
  .MuiAutocomplete-option {
    font-size: 14px;
  }
`;

const UploadedFileContainer = styled(FlexSpaceBetween)`
  width: 100%;
  padding: 14px;
  background-color: ${props => props.theme.palette.blue[100]};
  border: 1px solid ${props => props.theme.palette.blue[300]};
  border-radius: 3px;
  font-size: 14px;
  .MuiSvgIcon-root {
    margin-right: 10px;
  }
`;

const UploadedFile = ({ children, onRemove }) => (
  <UploadedFileContainer>
    <FlexStart>
      <InsertDriveFileIcon color="primary">{children}</InsertDriveFileIcon>
      <span>{children}</span>
    </FlexStart>
    <FlexEnd>
      <LinkButton onClick={onRemove}>Remove</LinkButton>
    </FlexEnd>
  </UploadedFileContainer>
);

const ProjectField = ({ project, projects, isLoadingProjects, onChange }) => (
  <Autocomplete
    id="project"
    placeholder="Select Project"
    value={project}
    defaultValue={project}
    options={projects}
    getOptionLabel={option => option['entity.name']}
    renderOption={option => <span>{option['entity.name']}</span>}
    onChange={onChange}
    loading={isLoadingProjects}
    muiProps={{ PaperComponent }}
  />
);

const LocationField = ({
  disabled,
  location,
  locations,
  isLoadingLocations,
  setLocationSearch,
  onChange,
}) => (
  <Autocomplete
    id="location"
    placeholder="Select Location"
    value={location}
    options={locations}
    loading={isLoadingLocations}
    onInputChange={debounce(
      (event, newValue) => {
        setLocationSearch(newValue.name);
      },
      [200],
    )}
    getOptionLabel={option => option.name}
    renderOption={option => <span>{option.name}</span>}
    onChange={onChange}
    muiProps={{ PaperComponent }}
    disabled={disabled}
  />
);

const UploadDataModal = ({ isOpen, onSubmit, onClose }) => (
  <ImportModal
    isOpen={isOpen}
    onSubmit={onSubmit}
    onClose={onClose}
    title="Upload test data"
    subtitle="Please upload a .json file with test data:"
    actionText="Upload"
    loadingText="Uploading"
    showLoadingContainer={false}
  />
);

export const PreviewOptions = () => {
  const { setShowData } = usePreviewData();
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedProjectOption, setSelectedProjectOption] = useState(null);
  const [selectedLocationOption, setSelectedLocationOption] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [{ project, location }, { setProject, setLocation, setTestData }] = useVizBuilderConfig();
  const { mutateAsync: uploadTestData } = useUploadTestData();

  const handleSelectProject = (event, value) => {
    if (!value) {
      return;
    }

    setSelectedProjectOption(value);
    setProject(value['project.code']);
  };

  const handleSelectLocation = (event, value) => {
    if (!value) {
      return;
    }

    setSelectedLocationOption(value);
    setLocation(value.code);
  };

  const handleUploadData = async file => {
    const response = await uploadTestData(file);
    setShowData(false);
    setFileName(response.fileName);
    setTestData(response.data);

    return response;
  };

  const handleRemoveData = () => {
    setShowData(false);
    setFileName('');
    setTestData(null);
  };

  // Show the default options in the dropdown when an item is selected.
  // Otherwise it shows no options
  const locationQuery = locationSearch === location ? '' : locationSearch;

  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
  const { data: locations = [], isLoading: isLoadingLocations } = useLocations(
    project,
    locationQuery,
  );

  const limitedLocations = locations.slice(0, 1000); // limit the options to 1000 to stop the ui jamming

  return (
    <Container>
      <FlexStart flex={1}>
        {fileName ? (
          <UploadedFile onRemove={handleRemoveData}>{fileName}</UploadedFile>
        ) : (
          <>
            <ProjectField
              project={selectedProjectOption}
              projects={projects}
              isLoadingProjects={isLoadingProjects}
              onChange={handleSelectProject}
            />
            <LocationField
              disabled={project === null}
              location={selectedLocationOption}
              locations={limitedLocations}
              isLoadingLocations={isLoadingLocations}
              setLocationSearch={setLocationSearch}
              onChange={handleSelectLocation}
            />
            <LinkButton
              onClick={() => {
                setIsImportModalOpen(true);
              }}
            >
              or upload data
            </LinkButton>
          </>
        )}
        <UploadDataModal
          isOpen={isImportModalOpen}
          onSubmit={handleUploadData}
          onClose={() => {
            setIsImportModalOpen(false);
          }}
        />
      </FlexStart>
    </Container>
  );
};

UploadedFile.propTypes = {
  children: PropTypes.node.isRequired,
  onRemove: PropTypes.func.isRequired,
};

ProjectField.propTypes = {
  project: PropTypes.string,
  projects: PropTypes.array.isRequired,
  isLoadingProjects: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

ProjectField.defaultProps = {
  project: null,
};

LocationField.propTypes = {
  disabled: PropTypes.bool.isRequired,
  location: PropTypes.string,
  locations: PropTypes.array,
  isLoadingLocations: PropTypes.bool.isRequired,
  setLocationSearch: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

LocationField.defaultProps = {
  location: null,
  locations: [],
};

UploadDataModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

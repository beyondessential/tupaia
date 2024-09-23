/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import { FlexEnd, FlexSpaceBetween, FlexStart } from '@tupaia/ui-components';
import { usePreviewDataContext, useVizConfigContext } from '../../context';
import { LinkButton } from '../LinkButton';
import { useUploadTestData } from '../../api';
import { ProjectField } from './ProjectField';
import { LocationField } from './LocationField';
import { DateRangeField } from './DateRangeField';
import { ImportModal } from './ImportModal';

const Container = styled(FlexSpaceBetween)`
  padding: 24px 0;
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
      {children}
    </FlexStart>
    <FlexEnd>
      <LinkButton onClick={onRemove}>Remove</LinkButton>
    </FlexEnd>
  </UploadedFileContainer>
);

UploadedFile.propTypes = {
  children: PropTypes.node.isRequired,
  onRemove: PropTypes.func.isRequired,
};

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
    hasCustomButton={true}
  />
);

UploadDataModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export const PreviewOptions = () => {
  const { setShowData } = usePreviewDataContext();
  const [_, { setTestData }] = useVizConfigContext();

  const [fileName, setFileName] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const { mutateAsync: uploadTestData } = useUploadTestData();

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

  return (
    <Container>
      <FlexStart flex={1}>
        {fileName ? (
          <UploadedFile onRemove={handleRemoveData}>{fileName}</UploadedFile>
        ) : (
          <>
            <ProjectField />
            <LocationField />
            <DateRangeField />
            <LinkButton
              onClick={() => {
                setIsImportModalOpen(true);
              }}
            >
              or upload data
            </LinkButton>{' '}
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

/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ExpandMore, Close } from '@material-ui/icons';
import {
  Dialog,
  Box,
  Radio,
  RadioGroup,
  Collapse,
  Checkbox,
  FormControl,
  FormControlLabel,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from '@material-ui/core';
import { Alert, AlertAction, AlertLink } from './Alert';
import { GREY } from '../styles';

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    padding: 25px 30px 20px;
    max-width: 800px;
  }
`;

const Title = styled(Typography)`
  font-size: 21px;
  margin-bottom: 20px;
`;

const PreviewTitle = styled(Typography)`
  font-size: 16px;
  margin-bottom: 0.5em;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 3px;
  right: 3px;
`;

const StyledRadioGroup = styled(RadioGroup)`
  margin-top: 10px;

  .MuiRadio-root {
    padding: 5px 8px;
  }
`;

const StyledAlert = styled(Alert)`
  &.MuiAlert-root {
    margin: 20px auto 10px;
    padding: 5px 16px 5px 13px;
  }
`;

const OptionsButton = styled(Button)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-transform: none;
  margin-top: 10px;
  padding-left: 0;
`;

const PreviewContainer = styled.div`
  background: #f5f5f5;
  overflow: scroll;
  width: 533px; // static width
  height: 400px; // static height
`;

const PreviewZoomContainer = styled.div`
  zoom: 0.5;
`;

const PreviewContentContainer = styled.div`
  background: white;
  min-width: 800px; // large enough for chart to be clear with legend to the right
  width: max-content; // allow chart to expand horizontally as much as it wants
  pointer-events: none;
`;

const NoPreviewAvailableMessage = styled.div`
  color: ${GREY};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const ColContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const LeftCol = styled.div`
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
`;
const RightCol = styled.div`
  flex: 1;
`;

const ExportControls = styled.div`
  flex: 1;
`;

export const STATUS = {
  CLOSED: 'closed',
  IDLE: 'idle',
  EXPORTING: 'exporting',
  ERROR: 'error',
};

const formatLabels = {
  png: 'PNG',
  xlsx: 'Excel (Raw Data)',
};

const formatHasPreview = {
  png: true,
};

export const ExportDialog = ({
  status,
  isOpen,
  onClose,
  isMatrix,
  onExport,
  exportOptions,
  setExportOptions,
  exportContent,
}) => {
  const formats = isMatrix ? ['xlsx'] : ['png', 'xlsx'];
  const [selectedFormat, setSelectedFormat] = useState(formats[0]);
  const [expanded, setExpanded] = useState(false);

  const { exportWithLabels, exportWithTable, exportWithTableDisabled } = exportOptions;

  const exportRef = useRef(null);

  useEffect(() => {
    setSelectedFormat(formats[0]);
  }, [formats[0]]);

  const onChangeExportOptions = newExportOptions => {
    setExportOptions({
      ...exportOptions,
      ...newExportOptions,
    });
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const loading = status === STATUS.EXPORTING;

  return (
    <StyledDialog open={isOpen} fullWidth>
      <CloseButton onClick={onClose}>
        <Close />
      </CloseButton>
      <Title>Export this chart</Title>
      <ColContainer>
        <LeftCol>
          {loading && (
            <Box pb={3} style={{ margin: 'auto' }}>
              <CircularProgress />
            </Box>
          )}
          {status === STATUS.ERROR && (
            <>
              <StyledAlert severity="error">
                There was an error with the export. Please try again.
                <AlertAction onClick={() => onExport(selectedFormat)}>Retry export</AlertAction> or
                contact <AlertLink href="mailto:support@tupaia.org">support@tupaia.org</AlertLink>
              </StyledAlert>
            </>
          )}
          {status === STATUS.IDLE && (
            <ExportControls>
              <Typography>The chart will be exported and downloaded to your browser</Typography>
              <FormControl component="fieldset">
                <StyledRadioGroup
                  name="format"
                  value={selectedFormat}
                  onChange={(e, value) => setSelectedFormat(value)}
                >
                  {formats.map(format => (
                    <FormControlLabel
                      key={format}
                      value={format}
                      control={<Radio color="primary" />}
                      label={formatLabels[format]}
                    />
                  ))}
                </StyledRadioGroup>
              </FormControl>
              {selectedFormat === 'png' && (
                <>
                  <OptionsButton onClick={handleExpandClick}>
                    <Typography>Advanced Options</Typography>
                    <ExpandMore />
                  </OptionsButton>
                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          checked={exportWithLabels}
                          onChange={event =>
                            onChangeExportOptions({ exportWithLabels: event.target.checked })
                          }
                          name="exportWithLabels"
                        />
                      }
                      label="Export With Labels"
                    />
                    {!exportWithTableDisabled && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            color="primary"
                            checked={exportWithTable}
                            onChange={event =>
                              onChangeExportOptions({ exportWithTable: event.target.checked })
                            }
                            name="exportWithTable"
                          />
                        }
                        label="Export With Table"
                      />
                    )}
                  </Collapse>
                </>
              )}
            </ExportControls>
          )}
          <div>
            <Button disabled={loading} color="primary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={loading}
              color="primary"
              onClick={() => onExport(selectedFormat, exportRef)}
            >
              Export chart
            </Button>
          </div>
        </LeftCol>
        <RightCol>
          <PreviewTitle>Preview</PreviewTitle>
          <PreviewContainer>
            {formatHasPreview[selectedFormat] ? (
              <PreviewZoomContainer>
                <PreviewContentContainer ref={exportRef}>{exportContent}</PreviewContentContainer>
              </PreviewZoomContainer>
            ) : (
              <NoPreviewAvailableMessage>
                <span>No preview available</span>
              </NoPreviewAvailableMessage>
            )}
          </PreviewContainer>
        </RightCol>
      </ColContainer>
    </StyledDialog>
  );
};

ExportDialog.propTypes = {
  status: PropTypes.PropTypes.oneOf(Object.values(STATUS)).isRequired,
  onClose: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  setExportOptions: PropTypes.func.isRequired,
  exportOptions: PropTypes.object,
  isOpen: PropTypes.bool,
  isMatrix: PropTypes.bool,
  exportContent: PropTypes.any.isRequired, // element
};

ExportDialog.defaultProps = {
  isOpen: false,
  exportOptions: {},
  isMatrix: false,
};

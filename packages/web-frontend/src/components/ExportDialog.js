/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useEffect } from 'react';
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
import { FlexEnd, FlexStart } from './Flexbox';

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    padding: 25px 30px 20px;
  }
`;

const Title = styled(Typography)`
  font-size: 21px;
  margin-bottom: 20px;
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

export const STATUS = {
  CLOSED: 'closed',
  IDLE: 'idle',
  EXPORTING: 'exporting',
  ANIMATING: 'animating',
  ERROR: 'error',
};

const formatLabels = {
  png: 'PNG',
  xlsx: 'Excel (Raw Data)',
};

export const ExportDialog = ({
  status,
  isOpen,
  onClose,
  isMatrix,
  onExport,
  exportOptions,
  setExportOptions,
}) => {
  const formats = isMatrix ? ['xlsx'] : ['png', 'xlsx'];
  const [selectedFormat, setSelectedFormat] = useState(formats[0]);
  const [expanded, setExpanded] = useState(false);
  const { exportWithLabels, exportWithTable, exportWithTableDisabled } = exportOptions;

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

  const loading = status === STATUS.EXPORTING || status === STATUS.ANIMATING;

  return (
    <StyledDialog open={isOpen} maxWidth="xs" fullWidth>
      <CloseButton onClick={onClose}>
        <Close />
      </CloseButton>
      <Title>Export this chart</Title>
      <FlexStart minHeight={160}>
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
          <div>
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
          </div>
        )}
      </FlexStart>
      <FlexEnd>
        <Button disabled={loading} color="primary" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={loading} color="primary" onClick={() => onExport(selectedFormat)}>
          Export chart
        </Button>
      </FlexEnd>
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
};

ExportDialog.defaultProps = {
  isOpen: false,
  exportOptions: {},
  isMatrix: false,
};

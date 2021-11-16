/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Dialog from 'material-ui/Dialog';
import Box from '@material-ui/core/Box';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import Checkbox from 'material-ui/Checkbox';
import CircularProgress from 'material-ui/CircularProgress';
import { DIALOG_Z_INDEX } from '../styles';
import { Alert, AlertAction, AlertLink } from './Alert';

const formatLabels = {
  png: 'PNG',
  xlsx: 'Excel (Raw Data)',
};

const styles = {
  dialog: {
    zIndex: DIALOG_Z_INDEX + 1,
  },
  dialogContent: {
    maxWidth: 450,
  },
  options: {
    marginTop: 20,
  },
  option: {
    marginTop: 5,
  },
};

const StyledAlert = styled(Alert)`
  &.MuiAlert-root {
    margin: 20px auto 10px;
    padding: 5px 16px 5px 13px;
  }
`;

export const STATUS = {
  CLOSED: 'closed',
  IDLE: 'idle',
  EXPORTING: 'exporting',
  ANIMATING: 'animating',
  SUCCESS: 'success',
  ERROR: 'error',
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
  const { exportWithLabels } = exportOptions;

  useEffect(() => {
    setSelectedFormat(formats[0]);
  }, [formats[0]]);

  const toggleLabels = () => {
    const newExportOptions = {
      ...exportOptions,
      exportWithLabels: !exportWithLabels,
    };
    setExportOptions(newExportOptions);
  };

  return (
    <Dialog
      title="Export this chart"
      actions={
        <>
          <FlatButton label="Cancel" primary onClick={onClose} />
          <FlatButton label="Export chart" primary onClick={() => onExport(selectedFormat)} />
        </>
      }
      open={isOpen}
      modal={false}
      style={styles.dialog}
      contentStyle={styles.dialogContent}
      autoScrollBodyContent
    >
      {status === STATUS.EXPORTING && (
        <Box textAlign="center">
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
      {status === STATUS.SUCCESS && <div>Export complete.</div>}
      {status === STATUS.IDLE && (
        <div>
          The chart will be exported and downloaded to your browser.
          <RadioButtonGroup
            name="format"
            onChange={(e, value) => setSelectedFormat(value)}
            style={styles.options}
            valueSelected={selectedFormat}
          >
            {formats.map(type => (
              <RadioButton
                key={type}
                value={type}
                label={formatLabels[type] ? formatLabels[type] : type}
                style={styles.option}
              />
            ))}
          </RadioButtonGroup>
          <Checkbox label="Export With Labels" checked={exportWithLabels} onCheck={toggleLabels} />
        </div>
      )}
    </Dialog>
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
  exportOptions: null,
  isMatrix: false,
};

/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Dialog from 'material-ui/Dialog';
import Box from '@material-ui/core/Box';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
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

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const ExportDialog = ({
  status,
  isOpen,
  onClose,
  formats,
  onExport,
  selectedFormat,
  setSelectedFormat,
}) => {
  // const [selectedFormat, setSelectedFormat] = React.useState(formats[0]);

  // React.useEffect(() => {
  //   setSelectedFormat(formats[0]);
  // }, [formats[0]]);

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
      {status === STATUS.LOADING && (
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
        </div>
      )}
    </Dialog>
  );
};

ExportDialog.propTypes = {
  status: PropTypes.PropTypes.oneOf([STATUS.IDLE, STATUS.LOADING, STATUS.SUCCESS, STATUS.ERROR])
    .isRequired,
  onClose: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  setSelectedFormat: PropTypes.func.isRequired,
  selectedFormat: PropTypes.string,
  isOpen: PropTypes.bool,
  formats: PropTypes.array,
};

ExportDialog.defaultProps = {
  isOpen: false,
  selectedFormat: null,
  formats: ['png'],
};

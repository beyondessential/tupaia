/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import Box from '@material-ui/core/Box';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import CircularProgress from 'material-ui/CircularProgress';
import { Error } from './Error';
import { DIALOG_Z_INDEX } from '../styles';

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

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const ExportDialog = ({ status, isOpen, onClose, formats, onExport }) => {
  const [selectedFormat, onSelectFormat] = React.useState(formats[0]);

  return (
    <Dialog
      title="Export this chart"
      actions={
        <>
          <FlatButton label="Cancel" primary onClick={onClose} />
          <FlatButton label="Export chart" primary onClick={onExport} />
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
      {status === STATUS.ERROR && <Error>There was an error. Please try again.</Error>}
      {status === STATUS.SUCCESS && <div>Export complete.</div>}
      {status === STATUS.IDLE && (
        <div>
          The chart will be exported and downloaded to your browser:
          <RadioButtonGroup
            name="format"
            onChange={(e, value) => onSelectFormat(value)}
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
  isOpen: PropTypes.bool,
  formats: PropTypes.array,
};

ExportDialog.defaultProps = {
  isOpen: false,
  formats: ['png'],
};

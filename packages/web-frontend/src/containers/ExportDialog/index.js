/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import CircularProgress from 'material-ui/CircularProgress';

import { Error } from '../../components/Error';
import { closeExportDialog, attemptChartExport, selectChartExportFormat } from '../../actions';
import { DIALOG_Z_INDEX, WHITE } from '../../styles';
import { selectCurrentProjectCode } from '../../selectors';

const formatLabels = {
  png: 'PNG',
  xlsx: 'Excel (Raw Data)',
};

class ExportDialog extends PureComponent {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit() {
    this.props.onChartExport();
  }

  getHasNoAccess() {
    return !this.props.emailAddress;
  }

  getActions() {
    const { onClose, isComplete } = this.props;

    if (isComplete || this.getHasNoAccess()) {
      return [<FlatButton label="Close" primary onClick={onClose} />];
    }

    const actions = [];

    actions.push(<FlatButton label="Cancel" primary onClick={onClose} />);
    actions.push(<FlatButton label="Export chart" primary onClick={this.onSubmit} />);

    return actions;
  }

  renderBody() {
    const {
      errorMessage,
      emailAddress,
      formats,
      isComplete,
      isLoading,
      selectedFormat,
      onSelectFormat,
    } = this.props;

    if (isLoading) {
      return (
        <div style={styles.loadingWrapper}>
          <CircularProgress />
        </div>
      );
    }

    if (this.getHasNoAccess()) {
      return (
        <div>In order to export charts on Tupaia, please log-in or create a user account.</div>
      );
    }

    if (isComplete) {
      return (
        <div>Thank you, your chart is currently exporting and will be emailed to you shortly.</div>
      );
    }

    return (
      <div>
        The chart will be exported and emailed as an attachment to:
        <div style={styles.emailAddress}>{emailAddress}</div>
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
        {errorMessage ? <Error>{errorMessage}</Error> : null}
      </div>
    );
  }

  render() {
    const { isVisible } = this.props;

    return (
      <Dialog
        title="Export this chart"
        actions={this.getActions()}
        open={isVisible}
        modal={false}
        style={styles.dialog}
        contentStyle={styles.dialogContent}
        autoScrollBodyContent
      >
        {this.renderBody()}
      </Dialog>
    );
  }
}

const styles = {
  dialog: {
    zIndex: DIALOG_Z_INDEX + 1,
  },
  dialogContent: {
    maxWidth: 450,
  },
  emailAddress: {
    fontSize: 18,
    marginTop: 5,
    color: WHITE,
  },
  options: {
    marginTop: 20,
  },
  option: {
    marginTop: 5,
  },
  loadingWrapper: {
    textAlign: 'center',
  },
};

ExportDialog.propTypes = {
  emailAddress: PropTypes.string.isRequired,
  formats: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  isVisible: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isComplete: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  onChartExport: PropTypes.func.isRequired,
  selectedFormat: PropTypes.string.isRequired,
  onSelectFormat: PropTypes.func.isRequired,
  projectCode: PropTypes.string,
};

const mapStateToProps = state => {
  const { chartExport, authentication, disaster } = state;
  const { currentUserEmail } = authentication;
  const { selectedDisaster } = disaster;

  return {
    emailAddress: currentUserEmail,
    selectedDisaster,
    projectCode: selectCurrentProjectCode(state),
    ...chartExport,
  };
};

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(closeExportDialog()),
  onSelectFormat: format => dispatch(selectChartExportFormat(format)),
  dispatch, // For merge props.
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { dispatch } = dispatchProps;

  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    onChartExport: () => {
      const {
        viewId,
        organisationUnitCode,
        organisationUnitName,
        dashboardGroupId,
        startDate,
        endDate,
        chartType,
        extraConfig,
        selectedFormat,
        projectCode,
      } = stateProps;

      dispatch(
        attemptChartExport({
          ...stateProps,
          viewId,
          organisationUnitCode,
          organisationUnitName,
          dashboardGroupId,
          startDate,
          endDate,
          chartType,
          extraConfig,
          projectCode,
          exportFileName: chartType
            ? `tupaia-export-${chartType}.${selectedFormat}`
            : `tupaia-export.${selectedFormat}`,
        }),
      );
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ExportDialog);

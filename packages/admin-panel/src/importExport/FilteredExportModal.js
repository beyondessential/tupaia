/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { connect } from 'react-redux';
import { selectSurvey, dismissDialog } from './actions';
import { getErrorMessage } from './selectors';
import { AsyncModal, InputField } from '../widgets';

export class FilteredExportModalComponent extends React.Component {
  constructor(props) {
    super(props);
    autobind(this);
  }

  renderContent() {
    const { surveyData, onSelectSurvey } = this.props;

    if (surveyData && surveyData.length > 0) {
      return (
        <div className="FilteredExportModal">
          {surveyData.map(row => (
            <InputField
              type="checkbox"
              inputKey={row.code}
              key={row.code}
              onChange={(inputKey, value, target) => onSelectSurvey(value, target.checked)}
              label={row.name}
              value={row.code}
              placeholder=""
            />
          ))}
        </div>
      );
    }

    return null;
  }

  render() {
    const { isLoading, errorMessage, onSave, onDismiss, title } = this.props;
    return (
      <AsyncModal
        isLoading={isLoading}
        errorMessage={errorMessage}
        renderContent={this.renderContent}
        isConfirmDisabled={false}
        onConfirm={onSave}
        confirmLabel="Export"
        onDismiss={onDismiss}
        title={title}
      />
    );
  }
}

FilteredExportModalComponent.propTypes = {
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  onSelectSurvey: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
  title: PropTypes.string,
  surveyData: PropTypes.array,
  selectedSurveyCodes: PropTypes.object,
};

FilteredExportModalComponent.defaultProps = {
  errorMessage: null,
  title: null,
  surveyData: [],
  selectedSurveyCodes: {},
};

const mapStateToProps = state => {
  const {
    importExport: { surveyData, selectedSurveyCodes },
  } = state;

  return {
    isLoading: false,
    surveyData,
    selectedSurveyCodes,
    errorMessage: getErrorMessage(state),
  };
};

const mergeProps = (state, { dispatch }, ownProps) => {
  const { selectedSurveyCodes, ...stateProps } = state;
  return {
    ...stateProps,
    ...ownProps,
    onSelectSurvey: (surveyCode, checked) => dispatch(selectSurvey(surveyCode, checked)),
    onSave: () => {
      console.log('SELECTED SURVEY CODES');
      console.log(selectedSurveyCodes);
      // dispatch();
    },
    onDismiss: () => dispatch(dismissDialog()),
  };
};

export const FilteredExportModal = connect(
  mapStateToProps,
  null,
  mergeProps,
)(FilteredExportModalComponent);

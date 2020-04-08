/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { connect } from 'react-redux';
import { selectSurvey, exportData, dismissDialog } from './actions';
import { getErrorMessage } from './selectors';
import { AsyncModal, InputField } from '../widgets';

// @TODO move to utils
const extractParams = template =>
  [...template.matchAll(/\[(\w+)\]/gi)].map(matchArray => matchArray[1]);

// @TODO support more than a _raw_ filter
const getSearchTermFilter = (filter, row) => {
  const template = filter._raw_;

  if (!template) {
    return null;
  }

  let searchTermFilter = template;
  for (const param of extractParams(template)) {
    searchTermFilter = searchTermFilter.replace(`[${param}]`, `'${row[param]}'`);
  }

  return { _raw_: searchTermFilter };
};

export class FilteredExportModalComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { file: null, queryParameter: {} };
    autobind(this);
  }

  handleQueryParameterChange(parameterKey, value) {
    this.setState({
      queryParameters: {
        ...this.state.queryParameters,
        [parameterKey]: value,
      },
    });
  }

  renderContent() {
    const { filter, row, onSelectSurvey, instruction, queryParameters } = this.props;

    if (filter.endpoint) {
      return (
        <div className="FilteredExportModal">
          <p>{instruction}</p>
          {queryParameters.map(queryParameter => (
            <InputField
              key={queryParameter.parameterKey}
              inputKey={queryParameter.parameterKey}
              {...queryParameter}
              onChange={this.handleQueryParameterChange}
              label={queryParameter.instruction}
              placeholder={queryParameter.label}
              searchTermFilter={getSearchTermFilter(filter, row)}
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
  filter: PropTypes.object,
  row: PropTypes.object,
  queryParameters: PropTypes.array,
  instruction: PropTypes.string,
  selectedSurveyCodes: PropTypes.object,
};

FilteredExportModalComponent.defaultProps = {
  errorMessage: null,
  title: null,
  filter: {},
  row: {},
  queryParameters: [],
  instruction: '',
  selectedSurveyCodes: {},
};

const mapStateToProps = state => {
  const {
    importExport: { filter, row, export: exportConfig },
  } = state;

  return {
    isLoading: false,
    filter,
    row,
    export: exportConfig,
    selectedSurveyCodes: {},
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
      dispatch(exportData('surveyResponses'));
    },
    onDismiss: () => dispatch(dismissDialog()),
  };
};

export const FilteredExportModal = connect(
  mapStateToProps,
  null,
  mergeProps,
)(FilteredExportModalComponent);

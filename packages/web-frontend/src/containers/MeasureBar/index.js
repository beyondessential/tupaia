/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * MeasureBar
 *
 * Similar to LocationBar, provides measures in a grouped listing. Measures from redux state.
 * Updates redux state with action when a measure is selected. Map listens to this part of state
 * and renders appropriately.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shallowEqual from 'shallowequal';

import { Control } from './Control';
import { setMeasure, clearMeasure, toggleMeasureExpand, updateMeasureConfig } from '../../actions';
import { HierarchyItem } from '../../components/HierarchyItem';
import {
  selectCurrentOrgUnit,
  selectCurrentMeasure,
  selectCurrentProject,
  selectMeasureBarItemById,
} from '../../selectors';
import { getDefaultDates, getLimits } from '../../utils/periodGranularities';

export class MeasureBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasNeverBeenChanged: true,
    };
  }

  shouldComponentUpdate(nextProps) {
    const propsAreUnchanged = shallowEqual(this.props, nextProps);
    if (propsAreUnchanged) return false;
    return true;
  }

  handleSelectMeasure = measure => {
    if (this.state.hasNeverBeenChanged) {
      this.setState({
        hasNeverBeenChanged: false,
      });
    }

    this.props.onSelectMeasure(measure);
  };

  renderDefaultMeasure() {
    const { currentMeasure, currentOrganisationUnitCode, defaultMeasure } = this.props;

    return (
      <HierarchyItem
        nestedMargin="0px"
        label={defaultMeasure.name}
        isSelected={currentMeasure.measureId === defaultMeasure.measureId}
        onClick={() => this.handleSelectMeasure(defaultMeasure, currentOrganisationUnitCode)}
      />
    );
  }

  renderNestedHierarchyItems(children) {
    const { currentMeasure, currentOrganisationUnitCode, onClearMeasure } = this.props;

    return children.map(childObject => {
      let nestedItems;

      if (childObject.children && childObject.children.length) {
        nestedItems = this.renderNestedHierarchyItems(childObject.children);
      }

      let onClick = null;

      if (!childObject.children) {
        onClick =
          childObject.measureId === currentMeasure.measureId
            ? () => onClearMeasure()
            : () => this.handleSelectMeasure(childObject, currentOrganisationUnitCode);
      }

      return (
        <HierarchyItem
          label={childObject.name}
          info={childObject.info}
          isSelected={
            childObject.children ? null : childObject.measureId === currentMeasure.measureId
          }
          key={childObject.measureId}
          onClick={onClick}
          nestedItems={nestedItems}
        />
      );
    });
  }

  renderHierarchy() {
    const { measureHierarchy, defaultMeasure } = this.props;

    const items = measureHierarchy.map(({ name: groupName, children, info }) => {
      if (!Array.isArray(children)) return null;
      const nestedItems = this.renderNestedHierarchyItems(children);
      if (nestedItems.length === 0) return null;
      return (
        <HierarchyItem
          nestedMargin="0px"
          label={groupName}
          info={info}
          nestedItems={nestedItems}
          key={groupName}
        />
      );
    });

    return (
      <>
        {defaultMeasure ? this.renderDefaultMeasure() : null}
        {items}
      </>
    );
  }

  renderEmptyMessage() {
    const { currentOrganisationUnitName } = this.props;
    const orgName = currentOrganisationUnitName || 'Your current selection';

    return `Select an area with valid data. ${orgName} has no map overlays available.`;
  }

  render() {
    const {
      currentMeasure,
      isMeasureLoading,
      currentOrganisationUnitName,
      onUpdateMeasurePeriod,
    } = this.props;
    const orgName = currentOrganisationUnitName || 'Your current selection';
    const emptyMessage = `Select an area with valid data. ${orgName} has no map overlays available.`;

    const defaultDates = getDefaultDates(currentMeasure);

    const datePickerLimits = getLimits(
      currentMeasure.periodGranularity,
      currentMeasure.datePickerLimits,
    );

    const { isTimePeriodEditable = true } = currentMeasure;

    const showDatePicker = isTimePeriodEditable && currentMeasure.periodGranularity;

    return (
      <Control
        emptyMessage={emptyMessage}
        selectedMeasure={currentMeasure}
        showDatePicker={showDatePicker}
        defaultDates={defaultDates}
        datePickerLimits={datePickerLimits}
        isMeasureLoading={isMeasureLoading}
        onUpdateMeasurePeriod={onUpdateMeasurePeriod}
      >
        {this.renderHierarchy()}
      </Control>
    );
  }
}

const MeasureShape = PropTypes.shape({
  measureId: PropTypes.string,
  name: PropTypes.string,
});

MeasureBar.propTypes = {
  currentMeasure: MeasureShape.isRequired,
  measureHierarchy: PropTypes.array.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  isMeasureLoading: PropTypes.bool.isRequired,
  onSelectMeasure: PropTypes.func.isRequired,
  onClearMeasure: PropTypes.func.isRequired,
  onUpdateMeasurePeriod: PropTypes.func.isRequired,
  currentOrganisationUnitCode: PropTypes.string,
  currentOrganisationUnitName: PropTypes.string,
  defaultMeasure: MeasureShape,
};

const mapStateToProps = state => {
  const { measureHierarchy, isExpanded } = state.measureBar;
  const { isMeasureLoading } = state.map;
  const { isLoadingOrganisationUnit } = state.global;

  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentMeasure = selectCurrentMeasure(state);
  const activeProject = selectCurrentProject(state);

  const defaultMeasure = selectMeasureBarItemById(state, activeProject.defaultMeasure);

  return {
    currentMeasure,
    measureHierarchy,
    isExpanded,
    currentOrganisationUnitCode: currentOrganisationUnit.organisationUnitCode,
    currentOrganisationUnitName: currentOrganisationUnit.name,
    isMeasureLoading: isMeasureLoading || isLoadingOrganisationUnit,
    defaultMeasure,
  };
};

const mapDispatchToProps = dispatch => ({
  onExpandClick: () => dispatch(toggleMeasureExpand()),
  onClearMeasure: () => dispatch(clearMeasure()),
  onSelectMeasure: measure => dispatch(setMeasure(measure.measureId)),
  dispatch,
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { dispatch } = dispatchProps;
  const { currentMeasure } = stateProps;

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    onUpdateMeasurePeriod: (startDate, endDate) =>
      dispatch(updateMeasureConfig(currentMeasure.measureId, { startDate, endDate })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(MeasureBar);

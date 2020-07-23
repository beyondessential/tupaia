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
import {
  changeMeasure,
  clearMeasure,
  toggleMeasureExpand,
  updateMeasureConfig,
} from '../../actions';
import { HierarchyItem } from '../../components/HierarchyItem';
import { selectCurrentOrgUnit, selectMeasureBarItemById } from '../../selectors';

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

  handleSelectMeasure = (measure, organisationUnitCode) => {
    if (this.state.hasNeverBeenChanged) {
      this.setState({
        hasNeverBeenChanged: false,
      });
    }

    this.props.onSelectMeasure(measure, organisationUnitCode);
  };

  renderSelectedMeasure() {
    const { currentMeasure, currentOrganisationUnitCode } = this.props;

    return (
      <HierarchyItem
        nestedMargin="0px"
        label={currentMeasure.name}
        isSelected={currentMeasure.measureId}
        onClick={() => this.handleSelectMeasure(currentMeasure, currentOrganisationUnitCode)}
      />
    );
  }

  renderHierarchy() {
    const {
      currentMeasure,
      measureHierarchy,
      currentOrganisationUnitCode,
      onClearMeasure,
    } = this.props;

    const items = Object.entries(measureHierarchy).map(([categoryName, children]) => {
      if (!Array.isArray(children)) return null;
      const nestedItems = children.map(measure => {
        const onClick =
          measure.measureId === currentMeasure.measureId
            ? () => onClearMeasure()
            : () => this.handleSelectMeasure(measure, currentOrganisationUnitCode);
        return (
          <HierarchyItem
            label={measure.name}
            isSelected={measure.measureId === currentMeasure.measureId}
            key={measure.measureId}
            onClick={onClick}
          />
        );
      });
      if (nestedItems.length === 0) return null;
      return (
        <HierarchyItem
          nestedMargin="0px"
          label={categoryName}
          nestedItems={nestedItems}
          key={categoryName}
        />
      );
    });

    return (
      <React.Fragment>
        {this.renderSelectedMeasure()}
        {items}
      </React.Fragment>
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

    return (
      <Control
        emptyMessage={emptyMessage}
        selectedMeasure={currentMeasure}
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
  measureHierarchy: PropTypes.shape({}).isRequired,
  isMeasureLoading: PropTypes.bool.isRequired,
  onSelectMeasure: PropTypes.func.isRequired,
  onClearMeasure: PropTypes.func.isRequired,
  onUpdateMeasurePeriod: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { currentMeasure, measureHierarchy, isExpanded } = state.measureBar;
  const { isMeasureLoading } = state.map;
  const { currentOrganisationUnitCode, isLoadingOrganisationUnit } = state.global;

  // In the name or normalising our redux state,
  // currentMeasure should be normalised to currentMeasureId,
  // and measureInfo selected from measureHierarchy like this.
  // Using this approach so a larger normalisation refactor is one file easier
  // in the future.
  const selectedMeasureInfo = selectMeasureBarItemById(state, currentMeasure.measureId);

  return {
    currentMeasure: selectedMeasureInfo || {},
    measureHierarchy,
    isExpanded,
    isMeasureLoading: isMeasureLoading || isLoadingOrganisationUnit,
    currentOrganisationUnitCode,
    currentOrganisationUnitName: selectCurrentOrgUnit(state).name,
  };
};

const mapDispatchToProps = dispatch => ({
  onExpandClick: () => dispatch(toggleMeasureExpand()),
  onClearMeasure: () => dispatch(clearMeasure()),
  onSelectMeasure: (measure, orgUnitCode) =>
    dispatch(changeMeasure(measure.measureId, orgUnitCode)),
  onUpdateMeasurePeriod: (startDate, endDate) =>
    dispatch(updateMeasureConfig({ startDate, endDate })),
});

export default connect(mapStateToProps, mapDispatchToProps)(MeasureBar);

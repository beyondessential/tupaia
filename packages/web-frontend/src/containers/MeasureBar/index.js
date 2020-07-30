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

import List from '@material-ui/core/List';
import CircularProgress from '@material-ui/core/CircularProgress';

import { ControlBar } from '../../components/ControlBar';
import { changeMeasure, clearMeasure, toggleMeasureExpand } from '../../actions';
import { HierarchyItem } from '../../components/HierarchyItem';
import TupaiaIcon from '../../images/TupaiaIcon.svg';
import { MAP_OVERLAY_SELECTOR } from '../../styles';
import { selectCurrentOrgUnit, selectCurrentMeasure } from '../../selectors';

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

    return `Select an area with valid data. ${orgName} has no map overlays available`;
  }

  renderContents() {
    const { isExpanded, measureHierarchy } = this.props;

    if (!isExpanded) return null;
    if (Object.keys(measureHierarchy).length === 0) return this.renderEmptyMessage();

    return this.renderHierarchy();
  }

  render() {
    const { currentMeasure, isExpanded, onExpandClick, isMeasureLoading } = this.props;

    const icon = isMeasureLoading ? (
      <CircularProgress size={24} thickness={4} />
    ) : (
      <TupaiaIcon style={{ height: 26, width: 24 }} />
    );

    return (
      <ControlBar
        value={this.state.hasNeverBeenChanged ? null : currentMeasure.name}
        isExpanded={isExpanded}
        onExpandClick={() => onExpandClick()}
        icon={icon}
        style={{
          background: MAP_OVERLAY_SELECTOR.background,
          border: MAP_OVERLAY_SELECTOR.border,
        }}
      >
        <List
          style={{
            flexDirection: 'column',
            overflowY: 'auto',
            whiteSpace: 'pre-line',
          }}
        >
          {this.renderContents()}
        </List>
      </ControlBar>
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
  isExpanded: PropTypes.bool.isRequired,
  isMeasureLoading: PropTypes.bool.isRequired,
  onExpandClick: PropTypes.func.isRequired,
  onSelectMeasure: PropTypes.func.isRequired,
  onClearMeasure: PropTypes.func.isRequired,
  currentOrganisationUnitCode: PropTypes.string.isRequired,
  currentOrganisationUnitName: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  const { measureHierarchy, isExpanded } = state.measureBar;
  const { isMeasureLoading } = state.map;
  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentMeasure = selectCurrentMeasure(state);

  return {
    currentMeasure,
    measureHierarchy,
    isExpanded,
    isMeasureLoading,
    currentOrganisationUnitCode: currentOrganisationUnit.organisationUnitCode,
    currentOrganisationUnitName: currentOrganisationUnit.name,
  };
};

const mapDispatchToProps = dispatch => ({
  onExpandClick: () => dispatch(toggleMeasureExpand()),
  onClearMeasure: () => dispatch(clearMeasure()),
  onSelectMeasure: (measure, orgUnitCode) =>
    dispatch(changeMeasure(measure.measureId, orgUnitCode)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MeasureBar);

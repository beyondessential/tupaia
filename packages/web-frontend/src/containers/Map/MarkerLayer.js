/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { LayerGroup } from 'react-leaflet';
import { selectMeasureName } from '../../reducers/mapReducers';
import { MEASURE_TYPE_SHADING } from '../../utils/measures';
import MeasureMarker from './MeasureMarker';

export const MARKER_TYPES = {
  DOT_MARKER: 'dot',
  CIRCLE_MARKER: 'circle',
  CIRCLE_HEATMAP: 'circleHeatmap',
  SQUARE: 'square',
};

/**
 * MarkerLayer - Component to render measures
 */
export class MarkerLayer extends Component {
  constructor(props) {
    super(props);

    // Syncs leaflet state with redux state to prevent duplicate openPopup() commands.
    this.activePopupId = null;
    this.markerRefs = {};
  }

  componentWillReceiveProps(nextProps) {
    const { currentPopupId } = nextProps;

    // Open the popup from the redux state.
    if (currentPopupId !== this.activePopupId) {
      this.openPopup(currentPopupId);
    }
  }

  shouldComponentUpdate(nextProps) {
    const { currentCountry, measureName, measureId, sidePanelWidth, measureData } = this.props;
    if (
      nextProps.measureName !== measureName ||
      nextProps.measureId !== measureId ||
      nextProps.currentCountry !== currentCountry ||
      nextProps.sidePanelWidth !== sidePanelWidth ||
      nextProps.measureData !== measureData
    ) {
      return true;
    }
    return false;
  }

  componentDidUpdate(prevProps) {
    const { measureId, currentPopupId } = this.props;

    // Re-open popups after a measure update.
    if (prevProps.measureId !== measureId) {
      this.openPopup(currentPopupId);
    }
  }

  addMarkerRef(organisationUnitCode, ref) {
    this.markerRefs[organisationUnitCode] = ref;

    // If the org unit was selected before the popup actually opens, open it now.
    if (this.activePopupId === organisationUnitCode) {
      this.openPopup(organisationUnitCode);
    }
  }

  openPopup(organisationUnitCode) {
    const { markerRefs } = this;

    this.activePopupId = organisationUnitCode;

    if (organisationUnitCode) {
      const ref = markerRefs[organisationUnitCode];
      if (ref && ref.leafletElement) {
        ref.leafletElement.openPopup();
      }
    }
  }

  renderMeasures() {
    const { measureData, measureOptions, isMeasureLoading } = this.props;

    if (
      !measureData ||
      measureData.length < 1 ||
      !measureOptions.find(mo => mo.type !== MEASURE_TYPE_SHADING)
    )
      return null;
    if (isMeasureLoading) return null;

    return measureData.map(data => {
      const code = data.organisationUnitCode;

      return (
        <MeasureMarker
          key={code}
          organisationUnitCode={code}
          markerRef={ref => this.addMarkerRef(code, ref)}
        />
      );
    });
  }

  render() {
    return <LayerGroup>{this.renderMeasures()}</LayerGroup>;
  }
}

MarkerLayer.propTypes = {
  measureData: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = state => {
  const { isSidePanelExpanded } = state.global;
  const {
    measureInfo: { measureData, measureOptions, measureId, currentCountry },
    popup,
    isMeasureLoading,
  } = state.map;
  const { contractedWidth, expandedWidth } = state.dashboard;

  return {
    measureId,
    isMeasureLoading,
    measureOptions,
    currentCountry,
    measureData: measureData || [],
    measureName: selectMeasureName(state),
    currentPopupId: popup,
    sidePanelWidth: isSidePanelExpanded ? expandedWidth : contractedWidth,
  };
};

export default connect(mapStateToProps)(MarkerLayer);

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
import { changeOrgUnit, openMapPopup, closeMapPopup } from '../../actions';
import { CircleProportionMarker, IconMarker, MeasurePopup } from '../../components/Marker';
import { selectMeasureName } from '../../reducers/mapReducers';
import { getMeasureDisplayInfo } from '../../utils';
import { MEASURE_TYPE_SHADING } from '../../utils/measures';

export const MARKER_TYPES = {
  DOT_MARKER: 'dot',
  CIRCLE_MARKER: 'circle',
  CIRCLE_HEATMAP: 'circleHeatmap',
  SQUARE: 'square',
};

const MIN_RADIUS = 1;
const MAX_ALLOWED_RADIUS = 1000;

function calculateRadiusScaleFactor(processedDataSet) {
  // Check if any of the radii in the dataset are larger than the max allowed
  // radius, and scale everything down proportionally if so.
  // (this needs to happen here instead of inside the circle marker component
  // because it needs to operate on the dataset level, not the datapoint level)
  const maxRadius = processedDataSet
    .map(d => parseInt(d.radius, 10) || 1)
    .reduce((state, current) => Math.max(state, current), 0);
  return maxRadius < MAX_ALLOWED_RADIUS ? 1 : (1 / maxRadius) * MAX_ALLOWED_RADIUS;
}

const MeasureMarker = props => {
  const { icon, radius } = props;

  if (parseInt(radius, 10) === 0) {
    if (icon) {
      // we have an icon, so don't render the radius at all
      return <IconMarker {...props} />;
    }

    // we have no icon and zero radius -- use minimum radius instead
    return <CircleProportionMarker {...props} radius={MIN_RADIUS} />;
  }

  if (radius && icon) {
    const { markerRef, ...otherProps } = props;
    return (
      <React.Fragment>
        <CircleProportionMarker markerRef={() => null} {...otherProps} />
        <IconMarker {...otherProps} markerRef={markerRef} />
      </React.Fragment>
    );
  }
  if (radius) {
    return <CircleProportionMarker {...props} />;
  }
  return <IconMarker {...props} />;
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
    const { currentCountry, measureName, measureId, sidePanelWidth, hiddenMeasures } = this.props;
    if (
      nextProps.measureName !== measureName ||
      nextProps.measureId !== measureId ||
      nextProps.currentCountry !== currentCountry ||
      nextProps.sidePanelWidth !== sidePanelWidth ||
      nextProps.hiddenMeasures !== hiddenMeasures
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

  onPopup(organisationUnitCode, open = true) {
    const { onPopupOpen, onPopupClose } = this.props;

    if (open) {
      this.activePopupId = organisationUnitCode;
      onPopupOpen(organisationUnitCode);
    } else {
      this.activePopupId = this.activePopupId === organisationUnitCode ? null : this.activePopupId;
      onPopupClose(organisationUnitCode);
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
    const {
      measureData,
      measureOptions,
      hiddenMeasures,
      onChangeOrgUnit,
      sidePanelWidth,
      measureName,
      isMeasureLoading,
    } = this.props;

    // debugger;
    if (
      !measureData ||
      measureData.length < 1 ||
      !measureOptions.find(mo => mo.type !== MEASURE_TYPE_SHADING)
    )
      return null;
    if (isMeasureLoading) return null;

    // debugger;
    const processedData = measureData
      .filter(data => data.coordinates && data.coordinates.length === 2)
      .map(data => getMeasureDisplayInfo(data, measureOptions, hiddenMeasures))
      .filter(displayInfo => !displayInfo.isHidden);

    const radiusScaleFactor = calculateRadiusScaleFactor(processedData);

    const PopupChild = ({ data }) => (
      <MeasurePopup
        data={data}
        measureOptions={measureOptions}
        measureName={measureName}
        sidePanelWidth={sidePanelWidth}
        onOrgUnitClick={onChangeOrgUnit}
        onOpen={() => this.onPopup(data.organisationUnitCode)}
        onClose={() => this.onPopup(data.organisationUnitCode, false)}
      />
    );

    return processedData.map(data => {
      const popup = <PopupChild data={data} />;
      const code = data.organisationUnitCode;

      return (
        <MeasureMarker
          key={code}
          markerRef={ref => this.addMarkerRef(code, ref)}
          radiusScaleFactor={radiusScaleFactor}
          {...data}
        >
          {popup}
        </MeasureMarker>
      );
    });
  }

  render() {
    return <LayerGroup>{this.renderMeasures()}</LayerGroup>;
  }
}

MarkerLayer.propTypes = {
  // measureInfo: PropTypes.shape({}).isRequired,
};

const mapStateToProps = state => {
  const { isSidePanelExpanded } = state.global;
  const {
    measureInfo: { measureData, measureOptions, hiddenMeasures, measureId, currentCountry },
    popup,
    isMeasureLoading,
  } = state.map;
  const { contractedWidth, expandedWidth } = state.dashboard;

  const measureDataWithCoords = measureData.reduce([], (array, value) =>
    array.concat([{ ...value, ...state.orgUnit.orgUnitMap[value.orgUnitCode] }]),
  );

  return {
    measureId,
    isMeasureLoading,
    hiddenMeasures,
    measureOptions,
    currentCountry,
    measureData: measureDataWithCoords,
    measureName: selectMeasureName(state),
    currentPopupId: popup,
    sidePanelWidth: isSidePanelExpanded ? expandedWidth : contractedWidth,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeOrgUnit: (organisationUnit, shouldChangeMapBounds = false) => {
    dispatch(changeOrgUnit(organisationUnit, shouldChangeMapBounds));
  },
  onPopupOpen: orgUnitCode => dispatch(openMapPopup(orgUnitCode)),
  onPopupClose: orgUnitCode => dispatch(closeMapPopup(orgUnitCode)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MarkerLayer);

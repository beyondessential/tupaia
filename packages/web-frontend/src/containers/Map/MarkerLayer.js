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
import {
  selectHasPolygonMeasure,
  selectAllMeasuresWithDisplayInfo,
  selectRadiusScaleFactor,
} from '../../reducers/mapReducers';
import { selectOrgUnit } from '../../reducers/orgUnitReducers';
import { ShadedPolygon } from './ConnectedPolygon';

export const MARKER_TYPES = {
  DOT_MARKER: 'dot',
  CIRCLE_MARKER: 'circle',
  CIRCLE_HEATMAP: 'circleHeatmap',
  SQUARE: 'square',
};

const MIN_RADIUS = 1;

const MeasureMarker = props => {
  const { icon, radius, region, displayPolygons } = props;

  if (displayPolygons) {
    if (region) {
      return <ShadedPolygon positions={region} {...props} />;
    }

    return <IconMarker {...props} />;
  }

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
    const { measureData, currentCountry, measureId, sidePanelWidth } = this.props;
    if (
      nextProps.measureId !== measureId ||
      nextProps.currentCountry !== currentCountry ||
      nextProps.sidePanelWidth !== sidePanelWidth ||
      nextProps.measureData.length !== measureData.length ||
      nextProps.measureData.find(
        (data, index) =>
          data.organisationUnitCode !== measureData[index].organisationUnitCode ||
          data.coordinates !== measureData[index].coordinates ||
          data.color !== measureData[index].color ||
          data.isHidden !== measureData[index].isHidden,
      )
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
      onChangeOrgUnit,
      sidePanelWidth,
      measureName,
      isMeasureLoading,
      radiusScaleFactor,
      displayPolygons,
    } = this.props;

    if (!measureData || !measureData.length) return null;

    if (isMeasureLoading) return null;
    const processedData = measureData
      .filter(data => data.coordinates && data.coordinates.length === 2)
      .filter(displayInfo => !displayInfo.isHidden);

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
          displayPolygons={displayPolygons}
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

MarkerLayer.propTypes = {};

const mapStateToProps = state => {
  const { isSidePanelExpanded } = state.global;
  const {
    measureInfo: { measureOptions, measureId, currentCountry },
    popup,
    isMeasureLoading,
  } = state.map;

  const { contractedWidth, expandedWidth } = state.dashboard;
  const measureData = selectAllMeasuresWithDisplayInfo(state)
    .map(data => ({
      ...data,
      ...selectOrgUnit(state, data.organisationUnitCode),
    }))
    .map(({ location, ...otherData }) => ({
      ...otherData,
      coordinates: location && location.point,
      region: location && location.region,
    }));

  return {
    isMeasureLoading,
    measureOptions,
    measureId,
    currentCountry,
    measureData,
    radiusScaleFactor: selectRadiusScaleFactor(state),
    displayPolygons: selectHasPolygonMeasure(state),
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

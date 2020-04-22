/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'react-leaflet';
import { MARKER_POPUP_STYLE, TOP_BAR_HEIGHT } from '../../styles';

import { MarkerDataPropType, MeasureOptionsGroupPropType } from './propTypes';
import { getFormattedInfo } from '../../utils/measures';

const PopupHeader = ({ text }) => <h2 style={MARKER_POPUP_STYLE.header}>{text}</h2>;

PopupHeader.propTypes = {
  text: PropTypes.string.isRequired,
};

const PopupCoordinates = ({ coordinates }) => {
  const coordinatesLabel = coordinates.map(c => c.toFixed(5)).join(', ');

  return <div style={MARKER_POPUP_STYLE.contentItem}>{`(${coordinatesLabel})`}</div>;
};

PopupCoordinates.propTypes = {
  coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
};

const PopupDataItem = ({ value, measureName }) => (
  <div>
    <span>{`${measureName}: `}</span>
    <strong>{value}</strong>
  </div>
);

PopupDataItem.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  measureName: PropTypes.string.isRequired,
};

const PopupDataItemList = ({ measureOptions, data }) =>
  measureOptions
    .filter(measureOption => !measureOption.hideFromPopup)
    .map(measureOption => {
      const { key, name } = measureOption;
      const formattedInfo = getFormattedInfo(data, measureOption);

      return <PopupDataItem key={key} measureName={name} value={formattedInfo.value} />;
    });

PopupDataItemList.propTypes = {
  data: MarkerDataPropType.isRequired,
  measureOptions: MeasureOptionsGroupPropType.isRequired,
  defaultMeasureName: PropTypes.string.isRequired,
};

export class PopupMarker extends PureComponent {
  render() {
    const {
      onDetailButtonClick,
      onOpen,
      onClose,
      sidePanelWidth,
      buttonText,
      headerText,
      coordinates,
      children,
      popupRef,
    } = this.props;

    return (
      <Popup
        pane="popupPane"
        autoPanPaddingTopLeft={[0, TOP_BAR_HEIGHT]}
        autoPanPaddingBottomRight={[sidePanelWidth, TOP_BAR_HEIGHT]}
        minWidth={300}
        maxWidth={300}
        onOpen={onOpen}
        onClose={onClose}
        ref={popupRef}
      >
        <div style={MARKER_POPUP_STYLE.content}>
          <PopupHeader text={headerText} />
          {coordinates && <PopupCoordinates coordinates={coordinates} />}
          <div style={MARKER_POPUP_STYLE.contentItem}>{children}</div>
          <div>
            <button type="button" style={MARKER_POPUP_STYLE.button} onClick={onDetailButtonClick}>
              {buttonText}
            </button>
          </div>
        </div>
      </Popup>
    );
  }
}

export const MeasurePopup = ({ data, measureOptions, onOrgUnitClick }) => {
  const { name, coordinates, organisationUnitCode } = data;

  return (
    <PopupMarker
      headerText={name}
      buttonText="See Dashboard"
      coordinates={coordinates}
      onDetailButtonClick={() => onOrgUnitClick(organisationUnitCode)}
    >
      <PopupDataItemList data={data} measureOptions={measureOptions} />
    </PopupMarker>
  );
};

MeasurePopup.propTypes = {
  data: MarkerDataPropType.isRequired,
  measureOptions: MeasureOptionsGroupPropType.isRequired,
  onOrgUnitClick: PropTypes.func.isRequired,
};

PopupMarker.propTypes = {
  coordinates: PropTypes.arrayOf(PropTypes.number),
  onDetailButtonClick: PropTypes.func,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  popupRef: PropTypes.func,
  sidePanelWidth: PropTypes.number,
};

PopupMarker.defaultProps = {
  onOpen: () => null,
  onClose: () => null,
  popupRef: () => null,
  sidePanelWidth: 0,
  coordinates: null,
};

/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import { PopupDataItemList } from '@tupaia/ui-components/lib/map';
import PropTypes from 'prop-types';
import { Popup } from 'react-leaflet';
import { MARKER_POPUP_STYLE, TOP_BAR_HEIGHT } from '../../styles';

import { MarkerDataPropType, MeasureOptionsGroupPropType } from './propTypes';

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
const buildHeaderText = (data, popupHeaderFormat) => {
  const { organisationUnitCode, name } = data;
  const replacements = {
    code: organisationUnitCode,
    name,
  };
  return Object.entries(replacements).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, value),
    popupHeaderFormat,
  );
};

export const MeasurePopup = ({ data, measureOptions, onOrgUnitClick }) => {
  const { coordinates, organisationUnitCode } = data;
  const { popupHeaderFormat = '{name}' } = measureOptions.reduce(
    (all, mo) => ({ ...all, ...mo }),
    {},
  );
  return (
    <PopupMarker
      headerText={buildHeaderText(data, popupHeaderFormat)}
      buttonText="See Dashboard"
      coordinates={coordinates}
      onDetailButtonClick={() => onOrgUnitClick(organisationUnitCode)}
    >
      <PopupDataItemList measureOptions={measureOptions} data={data} showNoDataLabel="true" />
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

import React from 'react';
import { PopupDataItemList } from '../PopupDataItemList';
import { PopupMarker } from './PopupMarker';
import { MeasureData, Series } from '../../types';

const buildHeaderText = (markerData: MeasureData, popupHeaderFormat: string): string => {
  const { organisationUnitCode, name } = markerData;
  const replacements = {
    code: organisationUnitCode,
    name,
  };
  return Object.entries(replacements).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, value || ''),
    popupHeaderFormat,
  );
};

interface MeasurePopupProps {
  markerData: MeasureData;
  serieses: Series[];
  onSeeOrgUnitDashboard?: (organisationUnitCode?: string) => void;
  multiOverlaySerieses?: Series[];
}

export const MeasurePopup = React.memo(
  ({ markerData, serieses, onSeeOrgUnitDashboard, multiOverlaySerieses }: MeasurePopupProps) => {
    const { coordinates, organisationUnitCode } = markerData;
    const { popupHeaderFormat = '{name}' } = serieses.reduce(
      (all, mo) => Object.assign(all, mo),
      {} as Series,
    );

    let onDetailButtonClick;
    if (onSeeOrgUnitDashboard) {
      onDetailButtonClick = () => onSeeOrgUnitDashboard(organisationUnitCode!);
    }

    return (
      <PopupMarker
        headerText={buildHeaderText(markerData, popupHeaderFormat)}
        buttonText="See Dashboard"
        coordinates={coordinates}
        onDetailButtonClick={onDetailButtonClick}
      >
        <PopupDataItemList serieses={multiOverlaySerieses || serieses} data={markerData} />
      </PopupMarker>
    );
  },
);

import React from 'react';
import { getFormattedInfo } from '../utils';
import { Series, MeasureData } from '../types';

interface PopupDataItemProps {
  measureName: Series['name'];
  value: string;
}

const PopupDataItem = ({ measureName, value }: PopupDataItemProps) => (
  <div key={measureName}>
    <span>{`${measureName}: `}</span>
    <strong>{value}</strong>
  </div>
);

interface PopupDataItemListProps {
  serieses: Series[];
  data?: MeasureData;
}

export const PopupDataItemList = ({
  serieses,
  data = {} as MeasureData,
}: PopupDataItemListProps) => {
  return (
    <>
      {serieses
        .filter(series => !series.hideFromPopup)
        .sort((measure1, measure2) => measure1.sortOrder - measure2.sortOrder)
        .map(series => {
          const { name } = series;
          const { formattedValue, valueInfo } = getFormattedInfo(data, series);

          return valueInfo.hideFromPopup ? null : (
            <PopupDataItem key={name} measureName={name} value={formattedValue} />
          );
        })
        .filter(popupItem => popupItem !== null)}
    </>
  );
};

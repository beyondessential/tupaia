import { createSelector } from 'reselect';
import { getMeasureFromHierarchy } from '../../utils';
import { selectCurrentOverlayCode } from './urlSelectors';

export const selectCurrentMeasure = createSelector(
  [selectCurrentOverlayCode, state => state.measureBar.measureHierarchy],
  (currentMeasureId, measureHierarchy) =>
    getMeasureFromHierarchy(measureHierarchy, currentMeasureId),
);

/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { LegendProps, Series } from '@tupaia/ui-map-components';
import { useState } from 'react';

export const useHiddenMapValues = (
  serieses: Series[] = [],
): { hiddenValues: LegendProps['hiddenValues']; setHiddenValue: Function } => {
  const [hiddenValues, setHiddenValues] = useState({});
  const [prevSerieses, setPrevSerieses] = useState(serieses);

  // reset hidden values when changing overlay or entity
  if (JSON.stringify(serieses) !== JSON.stringify(prevSerieses)) {
    setPrevSerieses(serieses);
    const hiddenByDefault = serieses.reduce((values, { hideByDefault, key }) => {
      return { ...values, [key]: hideByDefault };
    }, {});
    setHiddenValues(hiddenByDefault);
  }

  const setHiddenValue = (key, value, hidden) => {
    setHiddenValues(currentState => ({
      ...currentState,
      [key]: { ...currentState[key], [value]: hidden },
    }));
  };

  return { setHiddenValue, hiddenValues };
};

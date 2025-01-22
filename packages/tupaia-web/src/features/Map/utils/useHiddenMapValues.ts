import { useState } from 'react';
import { LegendProps, Series, Value } from '@tupaia/ui-map-components';

export const useHiddenMapValues = (serieses: Series[] = []) => {
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

  const setValueHidden = (key: string, value: Value, hidden: boolean) => {
    setHiddenValues((currentState: LegendProps['hiddenValues']) => ({
      ...currentState,
      [key]: { ...currentState[key], [value!]: hidden },
    }));
  };

  return { setValueHidden, hiddenValues };
};

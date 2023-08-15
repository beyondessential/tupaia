import React, { useState } from 'react';
import {
  TextField,
  RadioGroup,
  DatePicker,
  DateTimePicker,
  Select,
  Autocomplete,
} from '@tupaia/ui-components';
import { useEntities } from '../api/queries';

const getFormattedOptions = options => {
  return options.map(x => {
    try {
      // Most of the options data is an array of strings but some of the data is in json
      const optionConfig = JSON.parse(x);
      if (optionConfig && optionConfig.label && optionConfig.value) {
        return optionConfig;
      }
    } catch (e) {
      //
    }

    return { label: x, value: x };
  });
};

export const EntityQuestion = ({ options, ...props }) => {
  const formattedOptions = getFormattedOptions(options);
  console.log(formattedOptions);
  const [entity, setEntity] = useState(null);
  const { data: countries = [] } = useEntities('explore', 'country');
  const entityOptions = countries.map(c => ({
    value: c.code,
    label: c.name,
  }));

  return (
    <Autocomplete
      {...props}
      options={entityOptions}
      getOptionLabel={option => option.label}
      onChange={(e, { value }) => setEntity(value)}
    />
  );
};

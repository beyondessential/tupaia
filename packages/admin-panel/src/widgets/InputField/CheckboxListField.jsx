import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import {
  FormControl as MuiFormControl,
  FormControlLabel,
  FormGroup as MuiFormGroup,
  FormLabel,
  TextField,
  Typography,
} from '@material-ui/core';
import { Search } from '@material-ui/icons';
import { InputLabel, useDebounce } from '@tupaia/ui-components';
import { get } from '../../VizBuilderApp/api/api';
import { Checkbox } from '../Checkbox';
import { convertSearchTermToFilter } from '../../utilities';

const useOptions = (
  endpoint,
  baseFilter,
  searchTerm,
  labelColumn,
  valueColumn,
  distinct = null,
  pageSize,
) => {
  return useQuery(
    ['options', endpoint, baseFilter, searchTerm, labelColumn, valueColumn, distinct, pageSize],
    async () => {
      const filter = convertSearchTermToFilter({ ...baseFilter, [labelColumn]: searchTerm });
      return get(endpoint, {
        params: {
          filter: JSON.stringify(filter),
          sort: JSON.stringify([`${labelColumn} ASC`]),
          columns: JSON.stringify([labelColumn, valueColumn]),
          pageSize,
          distinct,
        },
      });
    },
    { enabled: !!endpoint },
  );
};

const Container = styled.div`
  height: 100%;
  max-height: 15rem;
  overflow-y: auto;
  border: 1px solid
    ${({ theme, $invalid }) => {
      return $invalid ? theme.palette.error.main : theme.palette.grey['400'];
    }};
  padding-inline: 1rem;
  padding-block-start: 0.2rem;
  border-radius: 4px;
  margin-block-start: 0.5rem;
`;

const FormGroup = styled(MuiFormGroup)`
  flex: 1;
`;

const Legend = styled(FormLabel).attrs({
  component: 'legend',
})`
  &.Mui-focused {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

const FormControl = styled(MuiFormControl)`
  width: 100%;
  .MuiSvgIcon-fontSizeSmall {
    font-size: 1rem;
  }
`;

const SearchField = styled(TextField).attrs({
  fullWidth: true,
  placeholder: 'Search',
  color: 'primary',
  ariaLabel: 'Search',
  InputProps: {
    startAdornment: <Search />,
  },
})`
  margin-block-end: 0.5rem;
  font-size: 0.875rem;
  .MuiSvgIcon-root {
    font-size: 1rem;
    color: ${({ theme }) => theme.palette.grey['600']};
  }
  .MuiInputBase-input {
    padding-block: 0.6rem;
    padding-inline-start: 0.2rem;
  }
  .MuiInput-underline {
    &:before {
      border-bottom: 1px solid ${({ theme }) => theme.palette.grey['400']};
    }
    &:hover {
      &:before {
        border-color: ${({ theme }) => theme.palette.text.secondary};
        border-width: 1px;
      }
    }
    &:focus-visible {
      outline: none;
      &:after {
        border-width: 1px;
      }
    }
  }
`;

// this wraps the legend and any tooltip
const LegendWrapper = styled.div`
  display: flex;
`;

const NoResults = styled(Typography)`
  margin-block-end: 0.5rem;
`;

export const CheckboxListField = ({
  endpoint,
  baseFilter,
  optionLabelKey,
  optionValueKey,
  label,
  required,
  distinct = null,
  pageSize = 10,
  value,
  onChange,
  tooltip,
  error,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: options, isLoading } = useOptions(
    endpoint,
    baseFilter,
    debouncedSearchTerm,
    optionLabelKey,
    optionValueKey,
    distinct,
    pageSize,
  );

  const selectedValue = value || [];

  const handleOnChangeValue = checkedValue => {
    let updatedValue = [...selectedValue];
    if (selectedValue.includes(checkedValue)) {
      updatedValue = selectedValue.filter(v => v !== checkedValue);
    } else {
      updatedValue = [...selectedValue, checkedValue];
    }
    onChange(updatedValue);
  };

  const optionsList = useMemo(() => {
    return (
      options?.map(option => ({
        ...option,
        checked: selectedValue?.includes(option[optionValueKey]),
        value: option[optionValueKey],
        label: option[optionLabelKey],
      })) ?? []
    );
  }, [options, selectedValue]);

  return (
    <FormControl component="fieldset" required={required} error={error}>
      <LegendWrapper>
        <InputLabel label={label} as={Legend} tooltip={tooltip} error={error} required={required} />
      </LegendWrapper>

      <Container $invalid={error}>
        <SearchField value={searchTerm} onChange={event => setSearchTerm(event.target.value)} />
        <FormGroup>
          {isLoading && <div>Loading...</div>}
          {!optionsList?.length && !isLoading && <NoResults>No results found</NoResults>}

          {optionsList?.map(option => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  name={option.value}
                  value={option.value}
                  label={option.label}
                  color="primary"
                  size="small"
                  onChange={() => handleOnChangeValue(option.value)}
                  checked={option.checked === true}
                />
              }
              label={option[optionLabelKey]}
            />
          ))}
        </FormGroup>
      </Container>
    </FormControl>
  );
};

CheckboxListField.propTypes = {
  endpoint: PropTypes.string.isRequired,
  baseFilter: PropTypes.object,
  optionLabelKey: PropTypes.string.isRequired,
  optionValueKey: PropTypes.string.isRequired,
  distinct: PropTypes.bool,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  pageSize: PropTypes.number,
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  tooltip: PropTypes.string,
  error: PropTypes.bool,
};

CheckboxListField.defaultProps = {
  baseFilter: {},
  distinct: null,
  required: false,
  pageSize: 10,
  value: [],
  tooltip: null,
  error: false,
};

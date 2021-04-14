/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MuiRadio from '@material-ui/core/Radio';
import MuiRadioGroup from '@material-ui/core/RadioGroup';
import MuiFormControlLabel from '@material-ui/core/FormControlLabel';
import MuiFormControl from '@material-ui/core/FormControl';
import MuiFormLabel from '@material-ui/core/FormLabel';
import OpenIcon from '@material-ui/icons/AddBox';
import CloseIcon from '@material-ui/icons/IndeterminateCheckBox';
import * as COLORS from '../../constants';

const middle = '29px';

const FormControl = styled(MuiFormControl)`
  position: relative;
  display: flex;
  background: ${COLORS.GREY_F9};
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  padding-left: 2rem;

  &.open {
    background: white;
    padding-bottom: 0.6rem;
  }

  .border {
    display: none;
  }

  // Nested Group container
  .MuiFormGroup-root {
    padding-left: 2rem;
  }

  // Nested Control Container
  .MuiFormControl-root {
    position: relative;
    background: white;
    border-bottom: none;
    padding-left: 0;

    .border {
      display: block;
    }

    // horizontal dash
    &:before {
      position: absolute;
      top: ${middle};
      width: 20px;
      left: -20px;
      content: '';
      border-top: 1px dashed ${COLORS.GREY_CC};
    }

    &.selected:before {
      border-top: 1px solid ${props => props.theme.palette.primary.main};
    }

    // last bottom dash
    &:last-child > .border:after {
      display: none;
    }

    // Nested Label
    .MuiFormLabel-root {
      font-weight: normal;
      font-size: 16px;
      line-height: 19px;
    }
  }
`;

const Border = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;

  // top vertical dash
  &:before {
    position: absolute;
    top: 0;
    left: -21px;
    height: ${middle};
    content: '';
    border-left: 1px dashed ${COLORS.GREY_CC};
  }

  // bottom vertical dash
  &:after {
    position: absolute;
    top: ${middle};
    height: calc(100% - 29px);
    left: -21px;
    content: '';
    border-left: 1px dashed ${COLORS.GREY_CC};
  }

  &.active {
    &:after,
    &:before {
      border-left: 1px solid ${props => props.theme.palette.primary.main};
    }
  }

  &.selected {
    &:before {
      border-left: 1px solid ${props => props.theme.palette.primary.main};
    }
  }
`;

// Label
const FormLabel = styled(MuiFormLabel)`
  position: relative;
  display: flex;
  align-items: flex-start;
  color: ${props => props.theme.palette.text.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  padding-top: 1.25rem;
  padding-right: 1rem;
  padding-bottom: 1.25rem;

  // vertical dash
  &.open:after {
    position: absolute;
    top: 42px;
    height: calc(100% - 42px);
    left: 11px;
    content: '';
    border-left: 1px dashed ${COLORS.GREY_CC};
  }

  &.selected {
    &:after {
      border-left: 1px solid ${props => props.theme.palette.primary.main};
    }
  }

  &:hover {
    cursor: pointer;

    .MuiSvgIcon-root {
      color: ${props => props.theme.palette.text.secondary};
    }
  }

  .MuiSvgIcon-root {
    position: relative;
    color: ${props => props.theme.palette.text.tertiary};
    margin-right: 10px;
    margin-top: -5px;
    top: 2px;
  }

  .MuiSvgIcon-root.MuiSvgIcon-colorPrimary {
    color: ${props => props.theme.palette.primary.main};
  }

  &.Mui-focused {
    color: ${props => props.theme.palette.text.primary};
  }
`;

const FormControlLabel = styled(MuiFormControlLabel)`
  position: relative;
  font-size: 14px;
  color: ${props => props.theme.palette.text.secondary};

  // horizontal dash
  .MuiRadio-root:before {
    position: absolute;
    top: 50%;
    width: 18px;
    left: -9px;
    content: '';
    border-top: 1px dashed ${COLORS.GREY_CC};
  }

  // top vertical dash
  &:before {
    position: absolute;
    content: '';
    top: 0;
    height: 50%;
    left: -10px;
    border-left: 1px dashed ${COLORS.GREY_CC};
  }

  // bottom vertical dash
  &:after {
    position: absolute;
    content: '';
    top: 50%;
    height: 50%;
    left: -10px;
    border-left: 1px dashed ${COLORS.GREY_CC};
  }

  &.active {
    &:after,
    &:before {
      border-left: 1px solid ${props => props.theme.palette.primary.main};
    }
  }

  &.selected {
    .MuiRadio-root:before {
      border-top: 1px solid ${props => props.theme.palette.primary.main};
    }

    &:before {
      border-left: 1px solid ${props => props.theme.palette.primary.main};
    }
  }

  &:last-child:after {
    border: none;
  }

  &:hover {
    cursor: pointer;

    .MuiSvgIcon-root {
      color: ${props => props.theme.palette.primary.main};
    }
  }
`;

const Radio = styled(MuiRadio)`
  &.Mui-checked {
    color: ${props => props.theme.palette.primary.main};

    & + .MuiFormControlLabel-label {
      color: ${props => props.theme.palette.primary.main};
    }
  }

  .MuiSvgIcon-root {
    font-size: 24px;
  }
`;

const getActiveClass = (path, selectedPath) => {
  for (let i = 0; i < path.length; i++) {
    const current = path[i];
    const selected = selectedPath[i];
    const last = i === path.length - 1;

    if (current === selected) {
      if (last) {
        return 'selected';
      }

      continue;
    }

    if (current < selected) {
      if (last) {
        return 'active';
      }
    }
    return '';
  }

  return '';
};

export const RadioGroup = ({
  name,
  options,
  value,
  setValue,
  selectedPath,
  setSelectedPath,
  path,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(openState => openState !== true);
  };

  const activeClassName = getActiveClass(path, selectedPath);

  return (
    <FormControl key={name} component="fieldset" className={[open && 'open', activeClassName]}>
      <Border className={['border', activeClassName]} />
      <FormLabel onClick={handleOpen} className={[open && 'open', activeClassName]}>
        {open ? <CloseIcon color="primary" /> : <OpenIcon />}
        {name}
      </FormLabel>
      {open && (
        <MuiRadioGroup
          name="measureId"
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
        >
          {options.map((option, index) =>
            option.children ? (
              <RadioGroup
                key={option.name}
                name={option.name}
                options={option.children}
                value={value}
                setValue={setValue}
                selectedPath={selectedPath}
                setSelectedPath={setSelectedPath}
                path={[...path, index]}
              />
            ) : (
              <FormControlLabel
                control={<Radio />}
                key={option.measureId}
                value={option.measureId}
                label={option.name}
                className={getActiveClass([...path, index], selectedPath)}
                onChange={() => {
                  setSelectedPath([...path, index]);
                }}
              />
            ),
          )}
        </MuiRadioGroup>
      )}
    </FormControl>
  );
};

RadioGroup.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  value: PropTypes.string.isRequired,
  selectedPath: PropTypes.string.isRequired,
  setSelectedPath: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  path: PropTypes.array.isRequired,
};

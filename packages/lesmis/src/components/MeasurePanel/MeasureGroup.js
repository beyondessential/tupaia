/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import MuiRadio from '@material-ui/core/Radio';
import MuiRadioGroup from '@material-ui/core/RadioGroup';
import MuiFormControlLabel from '@material-ui/core/FormControlLabel';
import MuiFormControl from '@material-ui/core/FormControl';
import MuiFormLabel from '@material-ui/core/FormLabel';
import OpenIcon from '@material-ui/icons/AddBox';
import CloseIcon from '@material-ui/icons/IndeterminateCheckBox';
import * as COLORS from '../../constants';

const DASH_OFFSET = '1.18rem';

const HorizontalDash = css`
  position: absolute;
  content: '';
  border-top: 1px dashed ${COLORS.GREY_CC};
`;

const VerticalDash = css`
  position: absolute;
  content: '';
  border-left: 1px dashed ${COLORS.GREY_CC};
`;

const HorizontalHighlight = css`
  border-top: 1px solid ${props => props.theme.palette.primary.main};
`;

const VerticalHighlight = css`
  border-left: 1px solid ${props => props.theme.palette.primary.main};
`;

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

  // Nested Form Control
  .MuiFormControl-root {
    position: relative;
    background: white;
    border-bottom: none;
    padding-left: 0;

    .border {
      display: block;
    }

    &:before {
      ${HorizontalDash};
      top: ${DASH_OFFSET};
      width: 1.25rem;
      left: -1.25rem;
    }

    &.selected:before {
      ${HorizontalHighlight};
    }

    // last bottom dash
    &:last-child > .border:after {
      display: none;
    }

    // Nested Label
    .MuiFormLabel-root {
      font-weight: normal;
      font-size: 1rem;
      line-height: 1.18rem;
    }
  }
`;

const Border = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;

  &:before {
    ${VerticalDash};
    top: 0;
    left: -1.3rem;
    height: ${DASH_OFFSET};
  }

  &:after {
    ${VerticalDash};
    top: ${DASH_OFFSET};
    height: calc(100% - 1.18rem);
    left: -1.3rem;
  }

  &.active {
    &:after,
    &:before {
      ${VerticalHighlight};
    }
  }

  &.selected {
    &:before {
      ${VerticalHighlight};
    }
  }
`;

const FormLabel = styled(MuiFormLabel)`
  position: relative;
  display: flex;
  align-items: flex-start;
  color: ${props => props.theme.palette.text.primary};
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.18rem;
  padding-top: 1.25rem;
  padding-right: 1rem;
  padding-bottom: 1.25rem;

  &.open:after {
    ${VerticalDash};
    top: 2.6rem;
    height: calc(100% - 2.6rem);
    left: 0.68rem;
  }

  &.selected {
    &:after {
      ${VerticalHighlight};
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
    margin-right: 0.625rem;
    margin-top: -0.3rem;
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
  font-size: 0.875rem;
  color: ${props => props.theme.palette.text.secondary};

  .MuiRadio-root:before {
    ${HorizontalDash};
    top: 50%;
    width: 1.125rem;
    left: -0.56rem;
  }

  &:before {
    ${VerticalDash};
    top: 0;
    height: 50%;
    left: -0.625rem;
  }

  &:after {
    ${VerticalDash};
    top: 50%;
    height: 50%;
    left: -0.625rem;
  }

  &.active {
    &:after,
    &:before {
      ${VerticalHighlight};
    }
  }

  &.selected {
    .MuiRadio-root:before {
      ${HorizontalHighlight};
    }

    &:before {
      ${VerticalHighlight};
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
    font-size: 1.5rem;
  }
`;

/**
 * Calculates whether the measure group is the selected one or is part of the
 * path to the selected one
 */
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

export const MeasureGroup = ({
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
              <MeasureGroup
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

MeasureGroup.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  value: PropTypes.string.isRequired,
  selectedPath: PropTypes.string.isRequired,
  setSelectedPath: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  path: PropTypes.array.isRequired,
};

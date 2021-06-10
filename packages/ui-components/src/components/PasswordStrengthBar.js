/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import MuiBox from '@material-ui/core/Box';

const Container = styled(MuiBox)`
  .bar > div > div {
    min-height: 6px;
    margin-left: -2px;
  }
`;

const Label = styled(Typography)`
  font-size: 0.75rem;
  line-height: 0.875rem;
  color: ${props => props.theme.palette.text.secondary};
  margin-bottom: 0.6rem;
`;

const HelperText = styled(Typography)`
  font-size: 0.75rem;
  line-height: 0.875rem;
  color: ${props => props.theme.palette.text.tertiary};
  margin-top: 1rem;
`;

const PasswordStrengthBarFallback = styled.div`
  background: ${props => props.theme.palette.grey['400']};
  height: 6px;
  margin: 0 1rem;
`;

export const PasswordStrengthBar = ({
  StrengthBarComponent,
  password,
  minLength,
  helperText,
  barColors,
  scoreWords,
  ...props
}) => {
  const theme = useTheme();
  return (
    <Container {...props}>
      <Label>Password Strength</Label>
      <Suspense fallback={<PasswordStrengthBarFallback />}>
        <StrengthBarComponent
          className="bar"
          password={password}
          minLength={minLength}
          barColors={barColors}
          scoreWords={scoreWords}
          scoreWordStyle={{
            position: 'absolute',
            top: '-1.8rem',
            right: '0',
            fontSize: '0.75rem',
            color: theme.palette.text.tertiary,
            textTransform: 'capitalize',
          }}
        />
      </Suspense>
      {helperText && <HelperText>{helperText}</HelperText>}
    </Container>
  );
};

PasswordStrengthBar.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  StrengthBarComponent: PropTypes.any,
  password: PropTypes.string,
  helperText: PropTypes.string,
  minLength: PropTypes.number,
  barColors: PropTypes.arrayOf(PropTypes.string),
  scoreWords: PropTypes.arrayOf(PropTypes.string),
};

PasswordStrengthBar.defaultProps = {
  StrengthBarComponent: null,
  password: '',
  minLength: 9,
  helperText: null,
  barColors: ['#deded0', '#FF9811', '#FF9811', '#FF9811', '#FF9811'],
  scoreWords: ['weak', 'okay', 'good', 'strong', 'very strong'],
};

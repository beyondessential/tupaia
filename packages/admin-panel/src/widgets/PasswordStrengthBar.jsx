import React, { lazy, Suspense } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import MuiBox from '@material-ui/core/Box';

// Lazy load the password strength library as it uses zxcvbn which is a large dependency.
// For more about lazy loading components @see: https://reactjs.org/docs/code-splitting.html#reactlazy
const PasswordStrengthBarComponent = lazy(() => import('react-password-strength-bar'));

const Label = styled(Typography)`
  font-size: 0.9rem;
  line-height: 1.2rem;
  color: ${props => props.theme.palette.text.primary};
  margin-bottom: 0.6rem;
`;

const HelperText = styled(Typography)`
  font-size: 0.9rem;
  line-height: 1rem;
  color: ${props => props.theme.palette.text.tertiary};
  margin-top: 1rem;
`;

export const PasswordStrengthBarFallback = styled.div`
  background: ${props => props.theme.palette.grey['400']};
  height: 6px;
  margin: 0 1rem;
`;

const StyledStrengthBar = styled(PasswordStrengthBarComponent)`
  > div > div {
    min-height: 6px;
  }
`;

export const PasswordStrengthBar = ({
  password,
  minLength,
  helperText,
  barColors,
  scoreWords,
  ...props
}) => (
  <MuiBox {...props}>
    <Label>Password Strength</Label>
    <Suspense fallback={<div>loading...</div>}>
      <StyledStrengthBar
        className="bar"
        password={password}
        minLength={minLength}
        barColors={barColors}
        scoreWords={scoreWords}
        scoreWordStyle={{
          position: 'absolute',
          top: '-2rem',
          right: '0',
          fontSize: '0.8rem',
          color: '#6F7B82',
          textTransform: 'capitalize',
        }}
      />
    </Suspense>
    {helperText && <HelperText>{helperText}</HelperText>}
  </MuiBox>
);

PasswordStrengthBar.propTypes = {
  password: PropTypes.string,
  helperText: PropTypes.string,
  minLength: PropTypes.number,
  barColors: PropTypes.arrayOf(PropTypes.string),
  scoreWords: PropTypes.arrayOf(PropTypes.string),
};

PasswordStrengthBar.defaultProps = {
  password: '',
  minLength: 9,
  helperText: null,
  barColors: ['#deded0', '#f6b44d', '#f6b44d', '#2b90ef', '#25c281'],
  scoreWords: ['weak', 'okay', 'good', 'strong', 'very strong'],
};

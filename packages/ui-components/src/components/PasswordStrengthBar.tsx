import React, { ElementType, Suspense } from 'react';
import styled from 'styled-components';
import { useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import MuiBox, { BoxProps } from '@material-ui/core/Box';

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

interface PasswordStrengthBarProps extends BoxProps {
  StrengthBarComponent?: ElementType;
  password?: string;
  helperText?: string;
  minLength?: number;
  barColors?: string[];
  scoreWords?: string[];
}

export const PasswordStrengthBar = ({
  StrengthBarComponent = PasswordStrengthBarFallback,
  password = '',
  minLength = 9,
  helperText,
  barColors = ['#deded0', '#FF9811', '#FF9811', '#FF9811', '#FF9811'],
  scoreWords = ['weak', 'okay', 'good', 'strong', 'very strong'],
  ...props
}: PasswordStrengthBarProps) => {
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
            color: theme.palette.text.secondary,
            textTransform: 'capitalize',
          }}
        />
      </Suspense>
      {helperText && <HelperText>{helperText}</HelperText>}
    </Container>
  );
};

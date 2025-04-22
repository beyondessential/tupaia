import React from 'react';
import styled from 'styled-components';
import GitHubIcon from '@material-ui/icons/GitHub';
import { FlexCenter } from './Layout';

export const ENV_BANNER_HEIGHT = 40;

const StyledBanner = styled(FlexCenter)<{
  $color: CSSStyleDeclaration['color'];
}>`
  background: ${props => props.$color};
  box-sizing: border-box;
  color: white;
  font-size: 13px;
  font-weight: 500;
  padding: 12px;
  text-align: center;
  height: ${ENV_BANNER_HEIGHT}px;

  .MuiSvgIcon-root {
    font-size: 16px;
    margin-right: 0.4rem;
  }
`;

export const EnvBanner = ({ color = '#f39c12' }: { color?: CSSStyleDeclaration['color'] }) => {
  const deploymentName = process.env.REACT_APP_DEPLOYMENT_NAME;

  if (
    !deploymentName ||
    typeof deploymentName !== 'string' ||
    ['main', 'master', 'production'].includes(deploymentName) // don't show banner on prod
  ) {
    return null;
  }

  return (
    <StyledBanner $color={color}>
      <GitHubIcon />
      {deploymentName}
    </StyledBanner>
  );
};

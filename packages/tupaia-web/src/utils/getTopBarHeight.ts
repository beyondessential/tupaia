import { ENV_BANNER_HEIGHT } from '@tupaia/ui-components';
import { TOP_BAR_HEIGHT, TOP_BAR_HEIGHT_MOBILE } from '../constants';

const envBannerIsVisible = () => {
  const deploymentName = process.env.REACT_APP_DEPLOYMENT_NAME;
  return (
    deploymentName &&
    typeof deploymentName === 'string' &&
    !['main', 'master', 'production'].includes(deploymentName)
  );
};
export const getMobileTopBarHeight = () => {
  if (envBannerIsVisible()) {
    const height = Number.parseInt(TOP_BAR_HEIGHT_MOBILE) + ENV_BANNER_HEIGHT;
    return `${height}px`;
  }
  return TOP_BAR_HEIGHT_MOBILE;
};

export const getTopBarHeight = () => {
  if (envBannerIsVisible()) {
    const height = Number.parseInt(TOP_BAR_HEIGHT) + ENV_BANNER_HEIGHT;
    return `${height}px`;
  }
  return TOP_BAR_HEIGHT;
};

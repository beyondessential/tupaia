import styled from 'styled-components';
import { PageContainer } from '../components';

export const GradientPageContainer = styled(PageContainer)`
  background: ${({
    theme,
  }) => `linear-gradient(252deg, ${theme.palette.primary.main}24 1.92%, ${theme.palette.background.default}33 29.06%),
    linear-gradient(242deg, ${theme.palette.background.default}4d 68.02%, ${theme.palette.primary.main}28 100%);
  `};
`;

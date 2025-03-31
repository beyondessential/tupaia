import { Container } from '@material-ui/core';
import styled from 'styled-components';

/**
 * @deprecated
 * Consider using `SafeArea` or `SafeAreaColumn` from @tupaia/ui-components instead, augmenting it
 * with {@link styled} as needed. This component sets `flex` and `position` values, which are easier
 * to work with when set by the consumer. This component remains for backward compatibility, and
 * will be removed in the future.
 */
export const PageContainer = styled(Container).attrs({
  maxWidth: false,
})`
  flex: 1;
  padding-left: max(env(safe-area-inset-left, 0), 1.25rem);
  padding-right: max(env(safe-area-inset-right, 0), 1.25rem);
  position: relative;
`;

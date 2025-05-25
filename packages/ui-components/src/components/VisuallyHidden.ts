import styled from 'styled-components';

/**
 * Could alternatively be named `ScreenReaderOnly`.
 * @see https://www.a11yproject.com/posts/how-to-hide-content
 */
export const VisuallyHidden = styled.span`
  &:not(:active, :focus-visible, :focus-within) {
    border: 0;
    clip: rect(0 0 0 0);
    height: auto;
    margin: 0;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
`;

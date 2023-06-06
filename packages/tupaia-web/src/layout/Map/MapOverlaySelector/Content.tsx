import styled from 'styled-components';

export const Content = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: auto;
  padding: 21px 16px 15px 18px;
  color: ${({ theme }) => theme.palette.text.primary};
`;

export const ContentText = styled.div`
  font-weight: 500;
  font-size: 16px;
  line-height: 21px;
  padding-right: 15px;
`;

export const EmptyContentText = styled(ContentText)`
  font-weight: 400;
  padding-right: 6px;
`;

export const ExpandedContent = styled.div`
  pointer-events: auto;
  background: ${({ theme }) => theme.mapOverlaySelector.divider};
  color: ${({ theme }) => theme.palette.text.primary};
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  overflow-y: auto;
  padding: 15px;
  flex-basis: 0;
  flex-grow: 1;
`;

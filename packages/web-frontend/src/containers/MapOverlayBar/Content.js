import styled from 'styled-components';
import { MAP_OVERLAY_SELECTOR } from '../../styles';

export const Content = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: auto;
  padding: 21px 16px 15px 18px;
  color: #ffffff;
`;

export const ContentText = styled.div`
  font-weight: 500;
  font-size: 16px;
  line-height: 21px;
  padding-right: 15px;
`;

export const EmptyContentText = styled(ContentText)`
  font-size: 16px;
  padding-right: 6px;
`;

export const ExpandedContent = styled.div`
  pointer-events: auto;
  background: ${MAP_OVERLAY_SELECTOR.subBackground};
  color: #fff;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  overflow-y: auto;
  padding: 15px;
  flex-basis: 0;
  flex-grow: 1;
`;

import styled from 'styled-components';
import { MAP_OVERLAY_SELECTOR } from '../../styles';

export const Content = styled.div`
  display: flex;
  pointer-events: auto;
  padding: 12px 15px;
  background: ${MAP_OVERLAY_SELECTOR.background};
  color: #ffffff;
  justify-content: space-between;
  align-items: center;
  border-bottom-left-radius: ${({ expanded, selected, period }) =>
    !expanded && (!selected || !period) ? '5px' : '0'};
  border-bottom-right-radius: ${({ expanded, selected, period }) =>
    !expanded && (!selected || !period) ? '5px' : '0'};

  &:hover {
    cursor: pointer;
  }

  .MuiSvgIcon-root {
    transition: transform 0.3s ease;
    transform: rotate(${({ expanded }) => (expanded ? '180deg' : '0deg')});
  }
`;

export const ContentText = styled.div`
  font-size: 16px;
`;

export const EmptyContentText = styled(ContentText)`
  font-size: 16px;
  padding-right: 6px;
`;

export const ExpandedContent = styled.div`
  pointer-events: auto;
  background: #203e5c;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  overflow-y: auto;
  padding: 15px;
  flex-basis: 0;
  flex-grow: 1;
`;

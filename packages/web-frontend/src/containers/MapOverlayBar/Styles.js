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

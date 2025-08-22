import React from 'react';
import styled, { keyframes } from 'styled-components';

// Keyframe animations
const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const pulse = keyframes`
  0% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.4;
  }
`;

const TypingIndicatorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  animation: ${fadeIn} 0.3s --ease-out-quad;
  margin-top: 0.875rem;
  margin-left: 1.25rem;
`;

const TypingBubble = styled.div`
  background: ${props => props.theme.palette.common.white};
  border-radius: calc(infinity * 1px);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TypingDot = styled.div<{ delay?: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
  animation: ${pulse} 1.4s ease-in-out infinite;
  animation-delay: ${props => props.delay || 0}s;
`;

export const TypingIndicator = () => {
  return (
    <TypingIndicatorContainer>
      <TypingBubble>
        <TypingDot />
        <TypingDot delay={0.2} />
        <TypingDot delay={0.4} />
      </TypingBubble>
    </TypingIndicatorContainer>
  );
};

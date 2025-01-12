import styled from 'styled-components';

export const AccountSettingsColumn = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  width: 100%;

  ${({ theme }) => theme.breakpoints.down('md')} {
    // Whitespace after section title & description when in single-column layout...
    :first-child {
      margin-bottom: 1.9rem;
    }
    // ...unless it’s the only thing in the section.
    :last-child {
      margin-bottom: 0;
    }
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    width: 28.5%;
    margin-bottom: 0;
    &:first-child {
      width: 43%;
      margin-bottom: 0;
      p {
        max-width: 22rem;
      }
    }
    &:last-child {
      justify-content: flex-end;
    }
  }
`;

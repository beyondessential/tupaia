import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { TextField, TextFieldProps } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { Close, Search } from '@material-ui/icons';
import { IconButton } from '@tupaia/ui-components';
import { MOBILE_BREAKPOINT, TOP_BAR_HEIGHT_MOBILE } from '../../constants';
import { QRCodeScanner } from '../QRCodeScanner';

const SearchInput = styled(TextField).attrs({
  variant: 'outlined',
  placeholder: 'Search location…',
  fullWidth: true,
  InputProps: {
    startAdornment: <SearchIcon />,
  },
})<TextFieldProps>`
  .MuiInputBase-root {
    background: ${({ theme }) => theme.palette.background.paper};
    border-radius: 2.7rem;
    font-size: 1rem;
  }

  .MuiOutlinedInput-notchedOutline {
    border: 2px transparent solid;
  }

  &:hover .MuiOutlinedInput-notchedOutline {
    border: 2px ${({ theme }) => theme.palette.form.border} solid;
  }

  .Mui-focused .MuiOutlinedInput-notchedOutline {
    border: 2px ${({ theme }) => theme.palette.primary.main} solid;
  }

  .MuiInputBase-input {
    padding: 0.6rem;
  }

  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    height: 100%;
    .MuiInputBase-root {
      height: 100%;
      border-radius: 0;
    }

    .MuiOutlinedInput-notchedOutline,
    &:hover .MuiOutlinedInput-notchedOutline,
    .Mui-focused .MuiOutlinedInput-notchedOutline {
      border: none;
    }

    .MuiInputBase-input {
      padding: 0.6rem;
    }
  }
`;

const MobileCloseButton = styled(IconButton)`
  top: 0.1rem;
  right: 0.1rem;
  z-index: 1;
`;

const Container = styled.div<{
  $mobileIsActive: boolean;
}>`
  position: relative;
  display: flex;
  width: 100%;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    width: ${({ $mobileIsActive }) => ($mobileIsActive ? '100%' : '0')};
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    height: ${TOP_BAR_HEIGHT_MOBILE};
    // Place on top of the hamburger menu on mobile
    z-index: 1;
    display: flex;
    background: ${({ theme }) => theme.palette.background.paper};
  }
`;

const MobileOpenButton = styled(IconButton)`
  display: none;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: block;
  }
`;
const MobileWrapper = styled.div`
  display: none;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: flex;
  }
`;

interface SearchBarProps {
  value?: string;
  onChange: (newValue: string) => void;
  onFocusChange: (isFocused: boolean) => void;
  onClose: () => void;
}

export const SearchBar = ({ value = '', onChange, onFocusChange, onClose }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mobileIsActive, setMobileIsActive] = useState(false);

  const onOpen = () => {
    setMobileIsActive(true);
    inputRef.current?.focus();
  };

  const handleClickClose = () => {
    // If there is text in the search bar, clear it but don't close the search bar input
    if (value.length > 0) {
      onChange('');
      onClose();
      // If there is no text in the search bar, close the search bar input
    } else {
      setMobileIsActive(false);
      onClose();
    }
  };

  const onChangeInputValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <>
      <MobileOpenButton onClick={onOpen} color="default">
        <Search />
      </MobileOpenButton>
      <Container $mobileIsActive={mobileIsActive}>
        <SearchInput
          value={value}
          onChange={onChangeInputValue}
          onFocus={() => onFocusChange(true)}
          inputRef={inputRef}
        />
        <MobileWrapper>
          <QRCodeScanner onCloseEntitySearch={handleClickClose} />
          <MobileCloseButton onClick={handleClickClose} color="default">
            <Close />
          </MobileCloseButton>
        </MobileWrapper>
      </Container>
    </>
  );
};

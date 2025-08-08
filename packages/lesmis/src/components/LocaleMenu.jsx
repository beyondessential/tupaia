import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { generatePath, useNavigate, useLocation } from 'react-router-dom';
import MuiButton from '@material-ui/core/Button';
import MuiMenu from '@material-ui/core/Menu';
import MuiMenuItem from '@material-ui/core/MenuItem';
import LanguageIcon from '@material-ui/icons/Language';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { LaosFlagSmall } from './Icons/LaosFlagSmall';
import { EnglishFlagSmall } from './Icons/EnglishFlagSmall';
import { useUrlParams } from '../utils';

const StyledButton = styled(MuiButton)`
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 140%;

  .MuiButton-startIcon {
    color: ${props => props.theme.palette.text.secondary};
    margin-right: 3px;
  }

  .MuiButton-endIcon {
    margin-left: 2px;

    .MuiSvgIcon-root {
      font-size: 0.9rem;
    }
  }
`;

const StyledMenu = styled(MuiMenu)`
  .MuiList-root {
    padding: 0.5rem 0.3rem;
  }

  .MuiMenu-paper {
    overflow: visible;
    border: 1px solid ${props => props.theme.palette.grey['400']};

    &:before {
      position: absolute;
      top: -8px;
      right: 36px;
      z-index: -1;
      content: '';
      border-right: 5px solid transparent;
      border-left: 5px solid transparent;
      border-bottom: 7px solid ${props => props.theme.palette.grey['400']};
    }

    &:after {
      position: absolute;
      top: -7px;
      right: 36px;
      content: '';
      z-index: 1;
      border-right: 5px solid transparent;
      border-left: 5px solid transparent;
      border-bottom: 7px solid white;
    }
  }
`;

const MenuItem = styled(MuiMenuItem)`
  font-size: 0.75rem;
  line-height: 140%;
  width: 9.3rem;
  border-radius: 5px;

  svg {
    width: 1.9rem;
    margin-right: 0.375rem;
  }
`;

const options = [
  { code: 'en', label: 'English', Icon: EnglishFlagSmall },
  { code: 'lo', label: 'Laotian', Icon: LaosFlagSmall },
];

export const LocaleMenu = ({ className }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { locale, entityCode, view } = useUrlParams();
  const { search } = useLocation();
  const queryClient = useQueryClient();

  const generateNewPath = newLocale => {
    if (entityCode && view) {
      return generatePath(`/:locale/:entityCode/:view`, {
        locale: newLocale,
        entityCode,
        view,
      });
    }
    if (entityCode) {
      return generatePath(`/:locale/:entityCode`, {
        locale: newLocale,
        entityCode,
      });
    }
    return generatePath(`/:locale`, {
      locale: newLocale,
    });
  };

  const handleChange = (event, newLocale) => {
    const path = generateNewPath(newLocale);
    const link = `${path}${search}`;
    navigate(link, {
      replace: true,
    });
    setAnchorEl(null);
    queryClient.clear();

    window.localStorage.setItem('lesmis-locale', newLocale);
  };

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const selectedLocale = options.find(o => o.code === locale);

  return (
    <>
      <StyledButton
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        endIcon={<ArrowDropDownIcon />}
        className={className}
      >
        <span>{selectedLocale.label}</span>
      </StyledButton>
      <StyledMenu
        id="simple-menu"
        anchorEl={anchorEl}
        // This is needed to make the position work
        getContentAnchorEl={null}
        keepMounted
        elevation={0}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        variant="menu"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {options.map(({ code, label, Icon }) => (
          <MenuItem
            key={code}
            selected={code === locale}
            button
            onClick={event => handleChange(event, code)}
          >
            <Icon />
            {label}
          </MenuItem>
        ))}
      </StyledMenu>
    </>
  );
};

LocaleMenu.propTypes = {
  className: PropTypes.string,
};

LocaleMenu.defaultProps = {
  className: null,
};

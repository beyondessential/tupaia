/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { NavLink as BaseNavLink } from 'react-router-dom';
import { Button } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';

const Wrapper = styled.div`
  max-width: 100%;
  padding-right: 2rem;
  display: flex;
`;

const Container = styled.div`
  overflow-x: hidden;
`;

const NavBar = styled.nav`
  margin-block: 1.43rem;
  margin-inline-start: 1.2rem;
  display: flex;
  flex-wrap: nowrap;
`;

const NavLink = styled(BaseNavLink)`
  line-height: 1.5;
  text-decoration: none;
  padding-inline: 1.43rem;
  padding-block: 0.43rem;
  white-space: nowrap;
  color: ${props => props.theme.palette.text.secondary};
  &.active {
    color: ${props => props.theme.palette.text.primary};
    border-bottom: 4px solid ${props => props.theme.palette.secondary.main};
  }
  &:not(:last-child) {
    border-right: 1px solid ${props => props.theme.palette.text.tertiary};
  }
  &:hover {
    color: ${props => props.theme.palette.text.primary};
    font-weight: ${props => props.theme.typography.fontWeightMedium};
  }
  /**
   * The following is a workaround to stop the bold text on hover from shifting the layout of the navbar
   * 
   **/

  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  &:after {
    content: attr(data-text) / '';
    height: 0;
    overflow: hidden;
    user-select: none;
    pointer-events: none;
    font-weight: ${props => props.theme.typography.fontWeightMedium};
    visibility: hidden;
  }
`;

const ScrollButton = styled(Button)`
  width: 2rem;
`;

const useIsMenuOverflowing = ref => {
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [ref?.current]);

  const handleResize = () => {
    if (ref.current) {
      const { current } = ref;
      const boundingRect = current.getBoundingClientRect();
      const { width } = boundingRect;
      setIsOverflowing(width < current.scrollWidth);
    }
  };

  return isOverflowing;
};

const getNextItemToScrollTo = ref => {
  if (ref.current) {
    const { current } = ref;
    const boundingRect = current.getBoundingClientRect();
    const menuItems = current.getElementsByTagName('a');
    const visibleItems = [];
    for (let i = 0; i < menuItems.length; i++) {
      const menuItem = menuItems[i];
      const menuItemBoundingRect = menuItem?.getBoundingClientRect();

      // if the right side of the menu item - 30px is inside of the right side of the container, it is considered visible
      const itemIsVisible = menuItemBoundingRect.right - 30 <= boundingRect.right;
      if (!itemIsVisible) {
        break;
      }
      visibleItems.push(menuItem);
    }
    // if there are 15 items, and 5 are visible at a time, I want to get the last visible element + 5

    const arrayOfRemainingItems = Array.from(menuItems).slice(visibleItems.length);

    const maxIndexToScroll = Math.min(visibleItems.length, arrayOfRemainingItems.length);

    const finalNextScrollItem = arrayOfRemainingItems[maxIndexToScroll - 1];
    return finalNextScrollItem;
  }
};

const getItemsVisible = ref => {
  if (ref.current) {
    const { current } = ref;
    const boundingRect = current.getBoundingClientRect();
    const menuItems = current.getElementsByTagName('a');

    const visibleItems = Array.from(menuItems).filter(menuItem => {
      const menuItemBoundingRect = menuItem?.getBoundingClientRect();

      const BUFFER = 30;
      // if the right side of the menu item - 30px is inside of the right side of the container, it is considered visible
      const itemIsInsideRightBounds = menuItemBoundingRect.right - BUFFER <= boundingRect.right;
      const itemIsInsideLeftBounds = menuItemBoundingRect.left + BUFFER >= boundingRect.left;

      return itemIsInsideRightBounds && itemIsInsideLeftBounds;
    });
    return visibleItems;
  }
  return [];
};

const getPreviousItemToScrollTo = ref => {
  const visibleItems = getItemsVisible(ref);
  if (ref.current) {
    const { current } = ref;
    const menuItems = current.getElementsByTagName('a');
    const currentFirstVisibleItemIndex = Array.from(menuItems).indexOf(visibleItems[0]);
    const smallestIndex = Math.max(0, currentFirstVisibleItemIndex - visibleItems.length);
    const nextPrevItems = Array.from(menuItems).slice(smallestIndex, currentFirstVisibleItemIndex);
  }
};

export const SecondaryNavbar = ({ links: linkInput, baseRoute }) => {
  const wrapperRef = useRef(null);

  const links = linkInput.map(link => ({
    ...link,
    target: link.exact ? link.to : `${baseRoute}${link.to}`,
  }));

  const isOverflowing = useIsMenuOverflowing(wrapperRef);

  const scrollToNextVisibleItems = () => {
    const nextItem = getNextItemToScrollTo(wrapperRef);
    if (nextItem) {
      nextItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
    }
  };

  const scrollToPrevVisibleItems = () => {
    const prevItem = getPreviousItemToScrollTo(wrapperRef);
    if (prevItem) {
      prevItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
    }
  };

  return (
    <Wrapper>
      {isOverflowing && (
        <ScrollButton onClick={scrollToPrevVisibleItems}>
          <KeyboardArrowLeft />
        </ScrollButton>
      )}
      <Container ref={wrapperRef}>
        <NavBar>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.target}
              isActive={(match, location) => {
                if (!match) {
                  return false;
                }
                return match.url === location.pathname;
              }}
              data-text={link.label}
            >
              {link.label}
            </NavLink>
          ))}
        </NavBar>
      </Container>
      {isOverflowing && (
        <ScrollButton onClick={scrollToNextVisibleItems}>
          <KeyboardArrowRight />
        </ScrollButton>
      )}
    </Wrapper>
  );
};

SecondaryNavbar.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }),
  ).isRequired,
  baseRoute: PropTypes.string.isRequired,
};

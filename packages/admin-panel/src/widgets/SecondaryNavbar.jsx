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
  padding-inline: 1.5rem;
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
  min-width: 0;
`;

const useScrollableMenu = (containerRef, navLinkRefs) => {
  const [hasOverflow, setHasOverflow] = useState(false);
  const [overflows, setOverflows] = useState({ left: false, right: false });

  useEffect(() => {
    const observer = new IntersectionObserver(detectOverflow, {
      root: containerRef.current,
      threshold: 1,
    });

    const firstLink = navLinkRefs.current[0];
    if (firstLink.current) {
      observer.observe(firstLink.current);
    }

    const lastLink = navLinkRefs.current[navLinkRefs.current.length - 1];
    if (lastLink.current) {
      observer.observe(lastLink.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [containerRef?.current, navLinkRefs?.current]);

  const detectOverflow = entries => {
    const leftItem = entries.find(entry => entry.target === navLinkRefs.current[0].current);
    const rightItem = entries.find(
      entry => entry.target === navLinkRefs.current[navLinkRefs.current.length - 1].current,
    );
    if (rightItem) {
      console.log('rightItem', rightItem.isIntersecting);
    }

    const leftIsVisible = leftItem?.isIntersecting;
    const rightIsVisible = rightItem?.isIntersecting;

    setOverflows({
      left: !leftIsVisible,
      right: !rightIsVisible,
    });
  };

  const getIsElementVisible = element => {
    if (element) {
      const boundingRect = element.getBoundingClientRect();
      const containerBoundingRect = containerRef.current.getBoundingClientRect();
      const { left, right } = boundingRect;
      return left >= containerBoundingRect.left && right <= containerBoundingRect.right;
    }
    return false;
  };

  const handleScroll = item => {
    if (item) {
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const scrollToNextVisibleItems = () => {
    const visibleElements = navLinkRefs.current.filter(ref => getIsElementVisible(ref.current));
    const remainingElements = navLinkRefs.current.slice(visibleElements.length);
    const numToScroll = Math.min(remainingElements.length, visibleElements.length);
    const currentLastVisibleElementIndex = navLinkRefs.current.indexOf(
      visibleElements[visibleElements.length - 1],
    );
    const nextIndex = currentLastVisibleElementIndex + numToScroll;

    const nextItem = navLinkRefs.current[nextIndex];
    if (!nextItem) return;

    handleScroll(nextItem.current);
  };

  const scrollToPrevVisibleItems = () => {
    const visibleElements = navLinkRefs.current.filter(ref => getIsElementVisible(ref.current));
    const elsBeforeVisible = navLinkRefs.current.slice(0, visibleElements.length);
    const numToScroll = Math.min(visibleElements.length, elsBeforeVisible.length);
    const currentFirstVisibleElementIndex = navLinkRefs.current.indexOf(visibleElements[0]);
    const prevIndex = Math.max(0, currentFirstVisibleElementIndex - numToScroll);

    const prevItem = navLinkRefs.current[prevIndex];
    if (!prevItem) return;
    handleScroll(prevItem.current);
  };

  return {
    hasOverflow,
    scrollToNextVisibleItems,
    scrollToPrevVisibleItems,
    overflows,
  };
};

export const SecondaryNavbar = ({ links: linkInput, baseRoute }) => {
  const containerRef = useRef(null);
  const navLinkRefs = useRef(linkInput.map(() => React.createRef()));
  const links = linkInput.map(link => ({
    ...link,
    target: link.exact ? link.to : `${baseRoute}${link.to}`,
  }));

  const { hasOverflow, scrollToNextVisibleItems, scrollToPrevVisibleItems, overflows } =
    useScrollableMenu(containerRef, navLinkRefs);

  return (
    <Wrapper>
      {overflows?.left && (
        <ScrollButton onClick={scrollToPrevVisibleItems}>
          <KeyboardArrowLeft />
        </ScrollButton>
      )}
      <Container ref={containerRef}>
        <NavBar>
          {links.map((link, i) => (
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
              ref={navLinkRefs.current[i]}
            >
              {link.label}
            </NavLink>
          ))}
        </NavBar>
      </Container>
      {overflows.right && (
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

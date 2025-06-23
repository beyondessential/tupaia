import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { Button } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { labelToId } from '../../utilities';
import { generateTitle } from '../../pages/resources/resourceName';

const Wrapper = styled.div`
  max-width: 100%;
  display: flex;
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: ${props => props.theme.palette.background.default};
`;

const Container = styled.div`
  overflow-x: hidden;
  position: relative;
  margin-block: 1.43rem;
`;

const NavBar = styled.nav`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
`;

const RouteLink = styled(Link)`
  line-height: 1.5;
  text-decoration: none;
  padding-block: 0.43rem;
  padding-inline: 1.43rem;
  white-space: nowrap;
  color: ${({ theme }) => theme.palette.text.secondary};
  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.palette.divider};
  }

  &:hover,
  &:focus,
  &:focus-visible {
    color: ${({ theme }) => theme.palette.text.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    outline: none;
  }
  /**
   * The following is a workaround to stop the bold text on hover from shifting the layout of the navbar
   *
   **/

  display: inline-flex;
  flex-direction: column;
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
  ${({ $active, theme }) =>
    $active &&
    css`
      color: ${theme.palette.text.primary};
      border-bottom: 4px solid ${theme.palette.primary.main};
      font-weight: ${theme.typography.fontWeightMedium};
    `}
`;

const ScrollButton = styled(Button)`
  width: 2rem;
  min-width: 0;
  color: ${props => props.theme.palette.text.secondary};
`;

const useScrollableMenu = (containerRef, navLinkRefs) => {
  const [overflows, setOverflows] = useState({ left: false, right: false });
  const [numToScroll, setNumToScroll] = useState(0);

  useEffect(() => {
    // observer for when we scroll, to see if we need to show the scroll buttons
    const observer = new IntersectionObserver(detectOverflow, {
      root: containerRef.current,
      threshold: 0.8,
    });

    const firstLink = navLinkRefs.current[0];
    if (firstLink.current) {
      observer.observe(firstLink.current);
    }

    const lastLink = navLinkRefs.current.at(-1);
    if (lastLink.current) {
      observer.observe(lastLink.current);
    }

    // resize event listener to see how many elements are visible and set the number of elements to scroll each time
    window.addEventListener('resize', handleResizeEvent);
    handleResizeEvent();

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', handleResizeEvent);
    };
  }, [containerRef?.current, navLinkRefs?.current]);

  const detectOverflow = entries => {
    if (entries.length === 0) return;

    const leftEntry = entries.find(entry => entry.target === navLinkRefs.current[0].current);

    const rightEntry = entries.find(
      entry => entry.target === navLinkRefs.current[navLinkRefs.current.length - 1].current,
    );

    const isLeftVisible = leftEntry?.isIntersecting;
    const isRightVisible = rightEntry?.isIntersecting;

    setOverflows({
      left: !isLeftVisible,
      right: !isRightVisible,
    });
  };

  const handleResizeEvent = () => {
    // see how many elements are visible and set the number of elements to scroll each time
    const visibleElements = navLinkRefs.current.filter(ref => getIsElementVisible(ref.current));
    setNumToScroll(visibleElements.length);

    // check if the first and last elements are visible, and set the overflows accordingly
    const leftOverflow = !getIsElementVisible(navLinkRefs.current[0].current);
    const rightOverflow = !getIsElementVisible(
      navLinkRefs.current[navLinkRefs.current.length - 1].current,
    );

    setOverflows({
      left: leftOverflow,
      right: rightOverflow,
    });
  };

  const getIsElementVisible = (element, buffer = 20) => {
    if (!element) return false;

    const boundingRect = element.getBoundingClientRect();
    const containerBoundingRect = containerRef.current.getBoundingClientRect();
    const { left, right } = boundingRect;
    const { left: containerLeft, right: containerRight } = containerBoundingRect;

    // include a buffer to account say that within 20px of the edge is still considered visible
    const isVisible = left >= containerLeft - buffer && right <= containerRight + buffer;
    return isVisible;
  };

  const handleScroll = item => {
    if (!item) return;

    // scroll to the item, with smooth behavior and aligning to the start of the container
    item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  };

  const scrollToNextVisibleItem = () => {
    // get the currently visible elements
    const visibleElements = navLinkRefs.current.filter(ref => getIsElementVisible(ref.current));

    // get the index of the last visible element
    const lastVisibleElementIndex = navLinkRefs.current.indexOf(
      visibleElements[visibleElements.length - 1],
    );

    // the next item to scroll to is the one after the last visible element
    const nextIndex = lastVisibleElementIndex + 1;
    const nextItem = navLinkRefs.current[nextIndex];
    if (!nextItem) return;
    handleScroll(nextItem.current);
  };

  const scrollToPrevVisibleItem = () => {
    // get the currently visible elements
    const visibleElements = navLinkRefs.current.filter(ref => getIsElementVisible(ref.current, 50));
    // get the index of the first visible element
    const firstVisibleElementIndex = navLinkRefs.current.indexOf(visibleElements[0]);
    // the previous item to scroll to is the current first visible element minus the number of elements to scroll or 0 if it's negative
    const prevIndex = Math.max(firstVisibleElementIndex - numToScroll, 0);

    const prevItem = navLinkRefs.current[prevIndex];
    if (!prevItem) return;
    handleScroll(prevItem.current);
  };

  return {
    scrollToNextVisibleItem,
    scrollToPrevVisibleItem,
    overflows,
  };
};

export const SecondaryNavbar = ({ links: linkInput, basePath }) => {
  const containerRef = useRef(null);
  const location = useLocation();
  const navLinkRefs = useRef(linkInput.map(React.createRef));

  const getIsActive = link => {
    const matchResult = matchPath(link.target, location.pathname);
    const nestedViewMatch = link.nestedViews
      ? link.nestedViews.find(nestedView =>
          matchPath(`${link.target}${nestedView.path}`, location.pathname),
        )
      : false;
    return !!matchResult || !!nestedViewMatch;
  };

  const links = linkInput?.map(({ exact, path, resourceName, label, ...rest }) => {
    const linkTitle = label ?? generateTitle(resourceName);
    const target = exact ? path : `${basePath}${path}`;

    return {
      ...rest,
      title: linkTitle,
      target,
      id: `app-sub-view-${labelToId(linkTitle)}`,
      active: getIsActive({
        ...rest,
        target,
      }),
    };
  });

  const { scrollToNextVisibleItem, scrollToPrevVisibleItem, overflows } = useScrollableMenu(
    containerRef,
    navLinkRefs,
  );

  return (
    <Wrapper>
      {overflows?.left && (
        <ScrollButton onClick={scrollToPrevVisibleItem}>
          <KeyboardArrowLeft />
        </ScrollButton>
      )}
      <Container ref={containerRef}>
        <NavBar>
          {links.map(({ title, target, active }, i) => (
            <RouteLink
              key={title}
              to={target}
              data-text={title}
              ref={navLinkRefs.current[i]}
              $active={active}
            >
              {title}
            </RouteLink>
          ))}
        </NavBar>
      </Container>
      {overflows.right && (
        <ScrollButton onClick={scrollToNextVisibleItem}>
          <KeyboardArrowRight />
        </ScrollButton>
      )}
    </Wrapper>
  );
};

SecondaryNavbar.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string,
      exact: PropTypes.bool,
    }),
  ).isRequired,
  basePath: PropTypes.string.isRequired,
};

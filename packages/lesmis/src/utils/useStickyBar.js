import { useCallback, useEffect, useState } from 'react';
import { NAVBAR_HEIGHT_INT } from '../constants';

// Utility for sticking the tab bar to the top of the page and scrolling up to the tab bar
export const useStickyBar = containerRef => {
  const [isScrolledPastTop, setIsScrolledPastTop] = useState(false);
  const [stickyBarsHeight, setStickyBarsHeight] = useState(0);

  const onLoadTabBar = useCallback(tabBarNode => {
    if (tabBarNode !== null) {
      const tabBarHeight = tabBarNode.getBoundingClientRect().height;
      setStickyBarsHeight(tabBarHeight + NAVBAR_HEIGHT_INT);
    }
  }, []);

  useEffect(() => {
    const detectScrolledPastTop = () =>
      setIsScrolledPastTop(containerRef.current.getBoundingClientRect().top < stickyBarsHeight);

    // detect once when the effect is run
    detectScrolledPastTop();
    // and again on scroll events
    window.addEventListener('scroll', detectScrolledPastTop);

    return () => window.removeEventListener('scroll', detectScrolledPastTop);
  }, [stickyBarsHeight]);

  const scrollToTop = useCallback(() => {
    // if the top of the dashboards container is above the sticky dashboard header, scroll to the top
    if (isScrolledPastTop) {
      const newTop = containerRef.current.offsetTop - stickyBarsHeight;
      window.scrollTo({ top: newTop, behavior: 'smooth' });
    }
  }, [isScrolledPastTop, stickyBarsHeight]);

  return {
    scrollToTop,
    isScrolledPastTop,
    onLoadTabBar,
  };
};

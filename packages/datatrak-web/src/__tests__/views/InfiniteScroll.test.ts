import { getIsAtEndOfList } from '../../views/LandingPage/ActivityFeedSection/InfiniteScroll';

const rect = (top: number, height: number) =>
  ({ top, bottom: top + height, height, left: 0, right: 100, width: 100 }) as DOMRect;

/** jsdom does no layout, so give each element the geometry and visibility a browser would */
const element = ({
  top,
  height,
  isVisible = true,
}: {
  top: number;
  height: number;
  isVisible?: boolean;
}) => {
  const el = document.createElement('div');
  el.getBoundingClientRect = () => rect(top, height);
  el.checkVisibility = () => isVisible;
  return el;
};

describe('getIsAtEndOfList', () => {
  it('is true when the loader is within the container', () => {
    const container = element({ top: 0, height: 600 });
    const loader = element({ top: 550, height: 40 });
    expect(getIsAtEndOfList(container, loader)).toBe(true);
  });

  it('is false when the loader is below the visible part of the list', () => {
    const container = element({ top: 0, height: 600 });
    const loader = element({ top: 2000, height: 40 });
    expect(getIsAtEndOfList(container, loader)).toBe(false);
  });

  it('is false for a hidden list, whose rects all read as zero', () => {
    const container = element({ top: 0, height: 0, isVisible: false });
    const loader = element({ top: 0, height: 0, isVisible: false });
    expect(getIsAtEndOfList(container, loader)).toBe(false);
  });

  it('is false for a list with no height, even if reported visible', () => {
    const container = element({ top: 0, height: 0 });
    const loader = element({ top: 0, height: 0 });
    expect(getIsAtEndOfList(container, loader)).toBe(false);
  });

  it('falls back to client rects where checkVisibility isn’t available', () => {
    const container = document.createElement('div');
    container.getBoundingClientRect = () => rect(0, 600);
    // jsdom has no layout, so an element has no client rects, as when hidden with display: none
    const loader = element({ top: 550, height: 40 });
    Object.defineProperty(container, 'checkVisibility', { value: undefined });
    expect(getIsAtEndOfList(container, loader)).toBe(false);

    container.getClientRects = () => [rect(0, 600)] as unknown as DOMRectList;
    expect(getIsAtEndOfList(container, loader)).toBe(true);
  });

  it('is false without both elements', () => {
    expect(getIsAtEndOfList(null, element({ top: 0, height: 40 }))).toBe(false);
    expect(getIsAtEndOfList(element({ top: 0, height: 600 }), undefined)).toBe(false);
  });
});

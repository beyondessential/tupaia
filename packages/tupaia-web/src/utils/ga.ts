type WindowWithGa = Window & {
  ga: (...args: any[]) => void;
};

const ga = ((window as unknown) as WindowWithGa).ga || (() => {});

if (!((window as unknown) as WindowWithGa).ga) {
  // eslint-disable-next-line no-console
  console.warn('Google Analytics library not found');
}

export const gaEvent = (category: string, action: string, label?: string) =>
  ga('send', 'event', category, action, label);

export default ga;

import { ReactElement, ReactNode } from 'react';

const isNullish = (obj): obj is null | undefined => obj == null;

/** @privateRemarks React uses this alias internally, but doesn’t export it */
type ReactText = string | number;

const isReactText = (node: ReactNode): node is ReactText => {
  return typeof node === 'string' || typeof node === 'number';
};

/**
 * @privateRemarks Adapted from https://impedans.me/web/searching-the-inner-text-content-of-nested-react-nodes
 */
export const innerText = (node: ReactNode): string => {
  // No children
  if (isReactText(node)) return String(node);
  if (isNullish(node) || typeof node === 'boolean') return '';

  // Multiple children
  if (Array.isArray(node)) return node.map(innerText).join('');

  // Single child
  const child = (node as ReactElement).props.children; // Type includes {} from ReactFragment, hence cast
  return innerText(child);
};

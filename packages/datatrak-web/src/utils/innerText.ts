import React, {
  Children,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  ReactNodeArray,
  ReactPortal,
  isValidElement,
} from 'react';

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
  if (isReactText(node)) return node as string;
  if (isNullish(node) || typeof node === 'boolean') return '';

  // Failsafe
  if (!isValidElement(node)) return '';

  // Multiple children
  if (Array.isArray(node)) {
    const joined: ReactText[] = [];
    for (const child of node) {
      joined.push(isReactText(child) ? child : innerText(child as ReactElement));
    }
    return joined.filter(Boolean).join(' ');
  }

  // Single child
  const child = node.props.children;
  return innerText(child);
};

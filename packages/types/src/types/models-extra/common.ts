/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

/**
 * One of the two shapes which {@link ReferenceProps} can take.
 *
 * @see LinkReferenceProps
 * @see ReferenceProps
 */
export interface PlaintextReferenceProps {
  text: string;
  name?: never;
  link?: never;
}

/**
 * One of the two shapes which {@link ReferenceProps} can take.
 *
 * @see PlaintextReferenceProps
 * @see ReferenceProps
 */
export interface LinkReferenceProps {
  text?: never;
  name: string;
  link: string;
}

/**
 * Props for the reference prop of the `ReferenceTooltip` ui-component. It can have either a piece
 * of plaintext to display in the tooltip, or a named link; but not both.
 */
export type ReferenceProps = PlaintextReferenceProps | LinkReferenceProps;

const isPlaintextReferenceProp = (obj: ReferenceProps): obj is PlaintextReferenceProps =>
  'text' in obj && !('name' in obj) && !('link' in obj);

const isLinkReferenceProp = (obj: ReferenceProps): obj is LinkReferenceProps =>
  !('text' in obj) && 'name' in obj && 'link' in obj;

import { LinkProps as ReactRouterLinkProps } from 'react-router-dom';

declare module 'react-router-dom' {
  export type LinkProps = ReactRouterLinkProps & {
    disabled?: boolean;
  };
}

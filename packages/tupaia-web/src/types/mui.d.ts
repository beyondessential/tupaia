import { ListItemProps as MuiListItemProps } from '@material-ui/core';

declare module '@material-ui/core' {
  export type ListItemProps = Omit<MuiListItemProps, 'button'> & {
    button?: boolean; // override this to make it optional, due to issue with 'button' prop in MuiListItemProps throwing an error when it is undefined
  };
}

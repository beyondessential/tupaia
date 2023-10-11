import {
  ListItemProps as MuiListItemProps,
  FormHelperTextProps,
  TextFieldProps as MuiTextFieldProps,
} from '@material-ui/core';

declare module '@material-ui/core' {
  export type ListItemProps = Omit<MuiListItemProps, 'button'> & {
    button?: boolean; // override this to make it optional, due to issue with 'button' prop in MuiListItemProps throwing an error when it is undefined
  };

  export type TextFieldProps = MuiTextFieldProps & {
    FormHelperTextProps?: FormHelperTextProps; // override this to handle the issue with 'component' prop in MuiFormHelperTextProps not being recognized in TextFieldProps
  };
}

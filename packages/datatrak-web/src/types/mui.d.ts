import {
  ListItemProps as MuiListItemProps,
  FormHelperTextProps,
  TextFieldProps as MuiTextFieldProps,
} from '@material-ui/core';

import {
  KeyboardDatePickerProps as MuiKeyboardDatePickerProps,
  KeyboardDateTimePickerProps as MuiKeyboardDateTimePickerProps,
} from '@material-ui/pickers';

declare module '@material-ui/core' {
  export type ListItemProps = Omit<MuiListItemProps, 'button'> & {
    button?: boolean; // override this to make it optional, due to issue with 'button' prop in MuiListItemProps throwing an error when it is undefined
  };

  export type TextFieldProps = MuiTextFieldProps & {
    FormHelperTextProps?: FormHelperTextProps; // override this to handle the issue with 'component' prop in MuiFormHelperTextProps not being recognized in TextFieldProps
  };
}

declare module '@material-ui/pickers' {
  export type KeyboardDatePickerProps = MuiKeyboardDatePickerProps & {
    FormHelperTextProps?: FormHelperTextProps; // override this to handle the issue with 'component' prop in MuiFormHelperTextProps not being recognized in TextFieldProps
  };
  export type KeyboardDateTimePickerProps = MuiKeyboardDateTimePickerProps & {
    FormHelperTextProps?: FormHelperTextProps; // override this to handle the issue with 'component' prop in MuiFormHelperTextProps not being recognized in TextFieldProps
  };
}

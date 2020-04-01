import React from 'react';
import { addDecorator, configure } from '@storybook/react';
import { StylesProvider } from "@material-ui/styles";

addDecorator(storyFn => <StylesProvider injectFirst>{storyFn()}</StylesProvider>);

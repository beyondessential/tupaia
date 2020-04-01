import React from 'react';
import { addDecorator, configure } from '@storybook/react';
import { StylesProvider } from "@material-ui/styles";
import 'semantic-ui-css/semantic.min.css'

addDecorator(storyFn => <StylesProvider injectFirst>{storyFn()}</StylesProvider>);

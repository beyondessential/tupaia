# @tupaia/datatrak-web

Browser based data collection for [Tupaia](https://tupaia.org/).

## App Directory Structure

- `api`: API layer abstractions such as react-query queries and mutations.
- `components`: Reusable components that are used throughout the app such as Button, Form components, etc.
- `constants`: App wide constants such as colors, fonts, etc. Some constants are also defined in the components files or directories.
- `layout`: App wide layout components such as Header, Footer etc.
- `theme`: @material-ui theme configuration.
- `utils`: App wide utils such as navigation utils etc.
- `views`: Top level templates that map to router paths. These might contain components that are specific to the view but are not substantial enough to be a feature such as a one-off form.
- `types`: App specific types

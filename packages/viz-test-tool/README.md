# @tupaia/viz-test-tool

The @tupaia/viz-test-tool is used to test the data in Tupaia visualisations.

It can be run in two modes:

```
yarn workspace @tupaia/viz-test-tool health-check <deployment> (defaults to localhost)
```

Which checks all the visuals on the deployment to see if any have errors.

```
yarn workspace @tupaia/viz-test-tool compare <deploymentA> <deploymentB> (defaults to localhost)
```

Which compares data between deploymentA and deploymentB to see if they match.

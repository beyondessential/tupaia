# Tupaia contributions guide

Thank you for taking the time to contribute, and welcome to the Tupaia!
We value your expertise, insights, and commitment to making Tupaia a global good. This
document is a guide on how to contribute to Tupaia effectively, ensuring it remains a
cohesive, maintainable, and globally valuable product.

## Code of conduct

This project and everyone participating in it is governed by the
[BES Open Source Code of Conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable behaviour to [opensource@bes.au](mailto:opensource@bes.au).

## Copyright attribution

All open-source contributors to Tupaia will be required to sign a Contributor License Agreement (CLA)
before BES can accept your contribution into the project code. This is done so that we can continue
to maintain the codebase covered by a single license. Signing a CLA can be done through GitHub
before merging in your first pull request.

## Our philosophy

Our core philosophy is to maintain the long-term sustainability of Tupaia. We, at BES work hard
to maintain a cohesive vision for the project. While we encourage collaboration and contributions,
we also want to avoid fragmentation that could compromise Tupaia’s usability, maintainability,
and value. We believe that the best way to contribute is to align your efforts with our existing
product roadmap.

## Contributing

Before considering becoming an open-source contributor for Tupaia, please take note that becoming
an open-source contributor requires a significant amount of time onboarding, and ongoing
coordination and support from BES as the project maintainers. As such we encourage contributions
from individuals and organisations who are prepared to invest significant amounts of time into
their work, ensuring alignment with our roadmap and the highest quality results. While we appreciate
the interest of potential casual contributors, we aim to collaborate with contributors who are
serious about their commitment to Tupaia. If you’re ready to deeply engage and uphold Tupaia’s
vision and standards, we warmly welcome your involvement.

### Following our roadmap

Before making your contribution, make sure that it aligns with our product roadmap for Tupaia.
This ensures that your contribution builds towards a cohesive vision for Tupaia. This generally
means pulling in features from our existing roadmap, and speeding up the delivery process into the
core product. We will gladly co-design features if you identify something missing from the roadmap
that will benefit the users of Tupaia.

#### Meaningful contributions (under construction)

To assess whether or not your contribution will be meaningful to the development of Tupaia before
making your contribution, put your contribution idea against the following criteria:

**Documentation:**

- If there is no documentation for a specific aspect of Tupaia.
- If a specific area in the project’s documentation is either: lacking detail, outdated or unclear.

**Features:**

- If the feature aligns with the Tupaia roadmap.
- If your feature has been co-designed with a BES developer.

### Developer onboarding and orientation

Being a complex product, Tupaia is at the stage where supported onboarding is necessary for the
project’s contributors. The BES Tupaia team are happy to provide hands-on support for serious and
committed contributors, but we will ask to see evidence of your commitment as well as a CV.

Steps for onboarding and setting up your development environment can be found on our [README](/#readme).
However, it’s most likely that support is needed from a BES developer in order for a successful and
stable onboarding.

## Making your code contribution

You can find an outline of the project structure and prerequisites on our [README](/#readme).

### Code quality

When making your contribution, please ensure that your code is of high quality. Follows best
practices, write clean and readable code, add comments where necessary, and thoroughly test your
code. We have a code review process for all contributions, and have a high bar for quality.

### Branch naming conventions

For open-source contribution branches, the naming convention is:

    <issue-id>-<description>

For example, `1736-pdf-export-crash`.

### Branching strategy

1. When creating a branch for your contribution, branch off the latest `dev`.
2. Make your commits on the branch you made.
3. Once your changes are complete, pull from the latest `dev` and create a pull request on GitHub.

### Pull requests

When your contribution is ready for review, create a pull request. A BES developer will review
your changes and provide feedback. If your pull request has been approved by a reviewer, it
will then go through a round of internal testing. Once your changes have passed testing, they
can be merged into main and be included in an upcoming Tupaia release.

#### Pull request title rules

We use a squash-and-merge strategy when merging PRs into dev. This means the commit messages in dev will match the PR titles. We like to keep standardised commit messages as an easy way to track release changes and for record keeping purposes.

The title of pull requests must be in [Conventional Commit](https://beyond-essential.slab.com/posts/pr-titles-conventional-commits-avgsj3xb) format. This is used to generate
changelogs, and to provide a consistent format for commits landing in the main branch, as pull
requests are merged in “squash” mode.

```plain
type: <description>
type(scope): <description>
```

When a Linear card is applicable, the Linear card number should be included:

```plain
type: TEAM-123: <description>
type(scope): TEAM-123: <description>
```

The following types are conventional:

- `ci` for changes to the CI/CD workflows
- `db` for changes to the database schema, migrations, etc
- `deps` for changes to dependencies or dependency upgrades
- `doc` for documentation changes
- `env` for changes to the environment variables
- `feat` for new features
- `fix` for bug fixes
- `fmt` for automatic formatting changes
- `merge` for merging between branches (generally between `master` and `dev`)
- `refactor` for code refactoring
- `repo` for changes to the repository structure (e.g. `.gitignore`, `.editorconfig`, etc)
- `revert` for reverting a previous commit
- `style` for stylistic changes that do not affect the meaning of the code
- `test` for adding missing tests or correcting existing tests
- `tweak` for minor changes that do not fit into any other category

When merging, additional change lines may be added to the squashed commit message to provide further
context to be pulled into changelogs.

Using Conventional Commit format for actual commit messages within pull requests is not required.

### Note on Forking

While Tupaia is open-source, there is always the possibility for forking the repository, which
we strongly recommend against. We will not provide any support for forked versions of Tupaia.
We have seen projects struggle and even fail because of this type of splintering. Instead, we
encourage you to collaborate with us on the mainline product roadmap.

## Licence

Any contributions you make will be licensed under [our open-source licence](/LICENSE)

---

Again, thank you for considering contributing to Tupaia. With your help, we can make Tupaia a
sustainable, useful, and valuable global good.

The Tupaia Team

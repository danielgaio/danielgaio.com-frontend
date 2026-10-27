# AWS infrastructure

AWS hosts the website's application, data, deployment and operations. TypeScript infrastructure definitions, such as AWS CDK, belong here once the account, region and affordable architecture are selected. No infrastructure package or deployed stack is created by the repository migration.

Track architecture/account/budget work in [issue #6](https://github.com/danielgaio/danielgaio.com-frontend/issues/6). The initial total AWS target is US$10/month across the live site and learning exercises. Inspect existing resources and current regional pricing before provisioning. Learning can justify advanced services; bounded experiments must include demonstrable outcomes, cost visibility and verified teardown.

The frontend and API may have independent deployment, access and scaling boundaries within this single repository. GitHub remains the source-control and project-management platform; use AWS-native application deployment tooling unless Daniel chooses otherwise.

## Overview ##

The [Black Duck by Synopsys](https://www.synopsys.com/software-integrity/security-testing/software-composition-analysis.html) plugin for TFS and Azure DevOps allows automatic identification of open source security vulnerabilities during your application build process. The integration allows you to enforce policies configured in Black Duck to receive alerts and fail builds when policy violations are met. 

## What is Black Duck? ##

Black Duck by Synopsys helps organizations identify and manage open source security, license compliance and operational risks across applications and containers. Black Duck is powered by the world’s largest open source KnowledgeBase™, which containins information from over 13,000 unique sources, includes support for over 80 programming languages, provides timely and enhanced vulnerability information, and is backed by a dedicated team of open source and security experts. The KnowledgeBase™, combined with the broadest support for platforms, languages and integrations, is why 2,000 organizations worldwide rely on Black Duck to secure and manage open source.

## Key Features ## 

Open Source Discovery: Rapid scanning and identification of open source libraries, versions, license, and community activity powered by the Black Duck® KnowledgeBase™.

![catalog](images/catalog.png)

Identify Open Source Risk: Create an inventory of all open source components in use which automatically maps them to known security vulnerabilities, giving you insight to the severity of the vulnerability.

![riskreport](images/riskreport.png)

Policy Enforcement:  Leverage policy management to secure your code and manage your external and internal compliance mandates.

![policy](images/policy.png)

Risk Remediation: Make data-driven decisions around vulnerability remediation prioritization, powered by Black Duck Security Advisories (BDSA).  BDSA provides enahnced security vulnerability data including possible fixes, workarounds, more technical data, exploit information, and accurate CVSS and CWE classifications all within 24 to 48 hours of a vulnerability being published.

![vulnerability](images/vulnerability.png)

Continuous Monitoring for New Security Vulnerabilities: Continously monitor and alert on newly reported open source security vulnerabilities, without having to re-scan your code.

![monitoring](images/monitoring.png)

## The Extension ##

Black Duck for TFS and Azure DevOps is architected to integrate seamlessly with TFS and Azure DevOps build and release pipelines. 

![extension](images/extension.png)

Using other tools in your CI/CD pipeline such as Jenkins, Artifactory, and others? We have easy to use plugins for the most popular development tools, and REST APIs that allow you to build your own integrations for virtually any commercial or custom development environment. Check out our [Integrations page](https://synopsys.atlassian.net/wiki/spaces/INTDOCS/overview) for more information! 

## Documentation ##

Instructions and examples for the TFS or Azure DevOps Extension are available on our [Public Confluence](https://synopsys.atlassian.net/wiki/spaces/INTDOCS/pages/622655/Running+Hub+Detect+with+TFS+or+Azure+DevOps)

For information on the full capabilities of Detect visit [Black Duck Detect Docs](https://synopsys.atlassian.net/wiki/spaces/INTDOCS/pages/622633/Hub+Detect)

## Pre-Requisites ##

Before calling Detect in TFS or Azure DevOps, an active instance of Black Duck is required.

If you do not have Black Duck, refer to [Black Duck on the Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/black-duck-software.blackduck_hub_431) for more information.

Follow the steps to [Deploy Black Duck on Azure](https://synopsys.atlassian.net/wiki/spaces/PARTNERS/pages/7471182/Installing+Black+Duck+in+Azure+Using+the+Azure+Marketplace) for more information on deploying from the Azure Marketplace.

## Want to contribute? ##

Running into an issue? Want to contribute? All code for this extension is [available on Github](https://github.com/blackducksoftware/detect-for-tfs).  

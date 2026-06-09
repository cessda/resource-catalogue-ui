[![EOSC Beyond Logo][eosc-logo]]()

# Resource Catalogue UI

[![License][license-badge]][license-link]
[![Contributor Covenant][coc-badge]][coc-link]
[![SQAaaS badge shields.io][sqaaas-badge]][sqaaas-link]

---

## Description

The Resource Catalogue UI is an Angular-based web application that serves as
the front-end for the [Resource Catalogue][backend-repo] platform. It provides
an intuitive interface for discovering, managing, and onboarding research
resources within the European Open Science Cloud (EOSC) ecosystem.

The project operates under the EOSC Beyond initiative, which aims to promote
Open Science and foster innovation within the framework of the European Open
Science Cloud (EOSC).

---

## Getting Started

For a Docker Compose based setup, see the [Docker](#docker) section below.

Follow these steps to set up a development environment for Resource Catalogue UI:

### Prerequisites

* Node.js 20+
* npm 10+
* Angular CLI 20+
* A running instance of the [Resource Catalogue][backend-repo] backend
  (default: `http://localhost:8080`)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/madgeek-arc/resource-catalogue-ui-eosc.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the proxy (optional):

   The default `proxy.conf.json` forwards `/api` requests to
   `http://localhost:8080`. Adjust the `target` value if your backend runs
   on a different host or port.

#### How to Run

Start the development server with hot-reload:

```bash
npm start
```

The application will be available at `http://localhost:4200`.

---

## Building

Build for production:

```bash
npm run build:prod
```

Build for the beta environment:

```bash
npm run build:beta
```

> **Note:** Beta builds enable additional debugging information and display a **Beta** label in the top-left corner of the application.

The compiled output is placed in the `dist/` directory.

---

## Test Execution

```bash
npm test
```

Test results will be displayed in the terminal.

---

## Docker

A `compose.yaml` is provided for running the UI as a container alongside the
backend stack.

> **Note:** The backend must be started first so that the shared `rc-net`
> Docker network exists before starting the UI container.

```bash
# Start the backend stack first (see resource-catalogue/compose/README.md)
# Then start the UI:
docker compose up -d
```

The UI will be available at `http://localhost:4200`.

The `API_BASE_URL` environment variable controls where the nginx reverse proxy
forwards API calls (default: `http://backend:8080/api`).

---

## Versioning

This project adheres to [Semantic Versioning](https://semver.org/).
For the available versions, see the
[tags](https://github.com/madgeek-arc/resource-catalogue-ui-eosc/tags).

---

## Authors

* Konstantinos Spyrou - Development - [GitHub](https://github.com/spyroukostas)
* Andreas Mantas - Development - [GitHub](https://github.com/amantas)

See the [contributors list][contrib] for a full list of contributors.

---

## Acknowledgements

Special thanks to all contributors, testers and the open-source community for
their invaluable support and resources.

---

[eosc-logo]: https://eosc.eu/wp-content/uploads/2024/02/EOSC-Beyond-logo.png
[license-badge]: https://img.shields.io/badge/license-Apache%202.0-blue.svg
[license-link]: LICENSE
[coc-badge]: https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg
[coc-link]: CODE_OF_CONDUCT.md
[sqaaas-badge]: https://img.shields.io/badge/sqaaas%20software-bronze-e6ae77
[sqaaas-link]: https://api.eu.badgr.io/public/assertions/Xgz4hAJ9SP6fRuq72lLcIQ
[contrib]: https://github.com/madgeek-arc/resource-catalogue-ui-eosc/graphs/contributors
[backend-repo]: https://github.com/madgeek-arc/resource-catalogue

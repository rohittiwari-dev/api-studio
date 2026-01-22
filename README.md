# ⚡ Api Studio

<div align="center">

![Api Studio](https://img.shields.io/badge/version-1.1.1-blue.svg?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb.svg?style=flat-square)
![License](https://img.shields.io/badge/license-AGPL--3.0-green.svg?style=flat-square)
[![GitHub stars](https://img.shields.io/github/stars/rohittiwari-dev/api-client?style=flat-square&logo=github)](https://github.com/rohittiwari-dev/api-client)

**The Developer-First API Development Ecosystem.**

[Features](#-features) • [Getting Started](#-getting-started) • [Self-Hosting](#-self-hosting) • [Contributing](#-contributing)

</div>

---

**Api Studio** is a modern, open-source alternative to tools like Postman and Insomnia. Built for privacy, performance, and developer experience, it provides a comprehensive suite of tools to build, test, and debug your APIs.

> **Why Api Studio?**
> We believe your API data belongs to you. No forced cloud sync, no bloat—just a powerful, local-first API workspace.

## ✨ Features

### 🔌 Webhook Inspector & Mock Server `[NEW]`

Debug incoming webhooks with ease. Create unique endpoints to capture, inspect, and replay requests instantly.

- **Real-time Inspection**: Watch headers, payloads, and query params arrive in real-time.
- **Custom Responses**: Configure static responses (status code, body, headers) to mock 3rd party services.
- **Request History**: Keep a log of all incoming events for debugging.

### 🚀 Advanced Request Builder

Craft complex HTTP requests with a refined UI.

- **All HTTP Methods**: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS.
- **Smart Body Editor**: JSON/XML syntax highlighting with error detection.
- **Multi-Format Support**: Form-data, URL-encoded, Binary files.
- **Code Generation**: Export requests to curl, Python, JavaScript, Go, and more.

### 🔐 Robust Authentication

Server-side authentication handling to bypass CORS and browser restrictions.

- **Supported Mechanisms**:
    - Basic Auth
    - Bearer Token (JWT)
    - OAuth 2.0 & 1.0a
    - API Key (Header/Query)
    - Digest Auth
    - AWS Signature (Coming Soon)
- **Security**: Sensitive tokens are masked and never logged.

### ⚡ Developer Experience

- **Workspaces & Collections**: Organize endpoints by project or environment.
- **Environment Variables**: Switch between Dev/Stage/Prod with variable substitution `{{api_url}}`.
- **Cookie Jar**: Automatic cookie storage and management.
- **Proxy Mode**: Built-in proxy to resolve CORS issues during development.

---

## 🛠️ Technology Stack

Built with the bleeding edge of the React ecosystem to ensure speed and stability.

| Core          | Infrastructure                                 | UI & Styling       |
| :------------ | :--------------------------------------------- | :----------------- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | **Radix UI**       |
| **Logic**     | [React 19](https://react.dev/)                 | **Tailwind CSS 4** |
| **State**     | [Zustand](https://zustand-demo.pmnd.rs/)       | **Framer Motion**  |
| **Data**      | [TanStack Query](https://tanstack.com/query)   | **Lucide Icons**   |
| **DB**        | PostgreSQL + Prisma                            | **Sonner**         |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** or **Bun**
- **PostgreSQL** database
- **Redis** (Optional, for caching/rate-limiting)

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/rohittiwari-dev/api-client.git
    cd api-client
    ```

2. **Install dependencies**

    ```bash
    bun install  # Recommended
    # or
    npm install
    ```

3. **Configure Environment**

    ```bash
    cp .env.example .env
    ```

    _Edit `.env` with your database credentials and auth secrets._

4. **Initialize Database**

    ```bash
    bun run db:push
    ```

5. **Start Developing**
    ```bash
    bun run dev
    ```
    Visit [http://localhost:3000](http://localhost:3000) to start building.

## 🐳 Self-Hosting

Easily deploy your own private instance using Docker.

```bash
docker-compose up -d
```

See [SELF_HOSTING.md](./SELF_HOSTING.md) for advanced configuration.

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's fixing a bug, adding a new feature, or improving documentation.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open-sourced under the [AGPL-3.0](./LICENSE) license.

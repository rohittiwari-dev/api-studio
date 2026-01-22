# 🤝 Contributing to Api Studio

<div align="center">

![Open Source](https://img.shields.io/badge/Open%20Source-Love-red?style=flat-square)
![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue?style=flat-square)

**Thank you for your interest in contributing!**
We are building the best developer-first API testing ecosystem, and we'd love your help.

[Code of Conduct](#-code-of-conduct) • [Development Setup](#-development-setup) • [Pull Request Process](#-pull-request-process) • [Architecture](#-architecture)

</div>

---

## 📜 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Be respectful and inclusive of people of all backgrounds.
- Accept constructive criticism gracefully.
- Focus on what's best for the community.
- Show empathy towards other community members.

---

## 💻 Development Setup

### Prerequisites

- **Node.js 18+** or **Bun** (Recommended)
- **PostgreSQL** Database
- **Git**

### ⚡ Quick Start

1. **Fork & Clone**

    ```bash
    git clone https://github.com/YOUR_USERNAME/api-client.git
    cd api-client
    ```

2. **Install Dependencies**

    ```bash
    bun install
    ```

3. **Configure Environment**

    ```bash
    cp .env.example .env
    # Edit .env with your local database credentials
    ```

4. **Initialize Database**

    ```bash
    bun run db:push
    ```

5. **Start Dev Server**
    ```bash
    bun run dev
    ```
    Visit [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture

Understanding the project structure will help you navigate the codebase.

| Directory           | Description                                  |
| :------------------ | :------------------------------------------- |
| `src/app`           | Next.js App Router pages and layouts         |
| `src/modules`       | Feature-based modules (Auth, Requests, etc.) |
| `src/components/ui` | Reusable UI components (shadcn/ui)           |
| `src/lib`           | Utility functions and shared helpers         |
| `src/store`         | Global state management (Zustand)            |

### Module Structure

Each feature in `src/modules` follows a strict structure:

```
src/modules/feature-name/
├── components/     # React components
├── hooks/          # Custom hooks
├── store/          # Zustand stores
├── types/          # TypeScript types
└── utils/          # Utility functions
```

---

## 🔄 Pull Request Process

1. **Create a Branch**
   Use descriptive names: `feature/add-oauth2`, `fix/login-bug`.

    ```bash
    git checkout -b feature/your-feature
    ```

2. **Make Changes**
    - Use **TypeScript** for all new code.
    - Follow the **Prettier** and **ESLint** configuration.
    - Ensure components are responsive and accessible.

3. **Commit Messages**
   We follow [Conventional Commits](https://www.conventionalcommits.org/).

    ```bash
    feat(auth): add google oauth provider
    fix(ui): resolve button misalignment on mobile
    docs(readme): update installation steps
    ```

4. **Submit PR**
    - Push to your fork: `git push origin feature/your-feature`
    - Open a PR against the `main` branch.
    - Fill out the PR template completely.

---

## 🛠️ Coding Standards

### TypeScript

- **Strict Typing**: Avoid `any` whenever possible. Use `unknown` or specific types.
- **Interfaces**: Use `interface` for object shapes and component props.

### React / Next.js

- **Server Components**: Use Server Components by default. Add `"use client"` only when interactivity is needed.
- **Hooks**: separate logic into custom hooks under `modules/*/hooks`.

### Styling

- **Tailwind CSS**: Use utility classes for styling.
- **Variables**: Use CSS variables for colors to support theming (Dark/Light mode).

---

## 🐛 Reporting Bugs

Found a bug? Please open an issue with:

1. **Steps to reproduce**
2. **Expected behavior** vs **Actual behavior**
3. **Screenshots** (if visual)
4. **Browser/OS version**

---

## ❓ Questions?

Join the discussion on [GitHub Discussions](https://github.com/rohittiwari-dev/api-client/discussions).

**Happy Coding! 🚀**

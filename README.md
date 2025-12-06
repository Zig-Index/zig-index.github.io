# Zig Index

An automated indexing registry for discovering Zig projects.

**[Live Site](https://zig-index.github.io)** · **[Add Your Project](https://zig-index.github.io/how-to-add)** · **[Registry](https://github.com/Zig-Index/registry)**

> All new projects will appear on the live site within few hours automatically!

**Zig Index is an independent and unofficial registry of Zig projects. It is not affiliated with, endorsed by, or maintained by the Zig Software Foundation or any of its founders. All projects listed on this website are owned and maintained by their respective developers and the community. No ownership or responsibility is claimed over any third-party software hosted or indexed. I do not own or claim any rights to trademarks, logos, or names referenced or displayed; all such assets belong to their respective owners.**

## Features

- 📦 **Automated Registry** - Automatic fetching based on GitHub tags
- ⚡ **Fast** - Fully static site with pre-built data
- 🔍 **Search & Filter** - Find projects by topic, license, or text search
- 🔄 **Automated Updates** - Registry data, stats, and releases updated automatically via GitHub Actions
- ⭐ **Rich Metadata** - Stars, forks, releases, and assets fetched at build time
- 🎨 **Dark Mode** - Beautiful light and dark themes
- 📱 **Responsive** - Works great on all devices

## Repository Structure

This is the main website repository. The registry data is maintained separately:

- **Website**: https://github.com/Zig-Index/zig-index.github.io (this repo)
- **Registry**: https://github.com/Zig-Index/registry (submodule at `src/registry`)

## Add Your Project

To add your project to Zig Index:

1. Fork the [registry repository](https://github.com/Zig-Index/registry)
2. Create a JSON file in `database/username/repo-name.json`
3. Submit a Pull Request

See the [registry README](https://github.com/Zig-Index/registry) for details.


## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/Zig-Index/zig-index.github.io.git
cd zig-index.github.io

# Or if already cloned, initialize submodules
git submodule update --init --recursive

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file (see `.env.example`):

```env
# Optional: GitHub token for higher API rate limits
# Get one at https://github.com/settings/tokens
GITHUB_TOKEN=your_github_token_here
```

## Tech Stack

- [Astro](https://astro.build) - Static site generator
- [React](https://react.dev) - UI components
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [TanStack Query](https://tanstack.com/query) - Data fetching & caching
- [Framer Motion](https://framer.com/motion) - Animations
- [Fuse.js](https://fusejs.io) - Fuzzy search

## License

MIT License - see [LICENSE](LICENSE) file.

## Links

- **Website**: https://zig-index.github.io
- **Registry**: https://github.com/Zig-Index/registry
- **Zig Language**: https://ziglang.org

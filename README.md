# Dosa

A modern cross-platform mobile application built with SvelteKit and Capacitor, featuring authentication, internationalization, and a beautiful UI.

## 📱 Features

- **Cross-Platform**: Web, iOS, and Android support via Capacitor
- **Authentication**: Secure authentication with Supabase (Email/Password, Google, Apple Sign-In)
- **Internationalization**: Multi-language support (English, German) with Paraglide.js
- **Modern UI**: Beautiful, responsive design with Tailwind CSS v4
- **Offline Support**: PWA capabilities with service workers
- **Error Tracking**: Integrated Sentry for monitoring and debugging
- **Type Safety**: Full TypeScript support with Zod validation
- **Testing**: Comprehensive testing with Vitest and Playwright

## 🛠️ Tech Stack

### Frontend
- [SvelteKit 2](https://kit.svelte.dev/) - Web framework
- [Svelte 5](https://svelte.dev/) - UI framework with runes
- [Tailwind CSS v4](https://tailwindcss.com/) - Styling
- [Paraglide.js](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) - i18n

### Mobile
- [Capacitor 7](https://capacitorjs.com/) - Native mobile runtime
- Plugins: Camera, Geolocation, Push Notifications, Secure Storage, and more

### Backend & Services
- [Supabase](https://supabase.com/) - Backend as a Service (Auth, Database)
- [Prisma](https://www.prisma.io/) - Database ORM
- [Vercel](https://vercel.com/) - Hosting & Serverless functions

### Development Tools
- [Vite 7](https://vitejs.dev/) - Build tool
- [TypeScript 5](https://www.typescriptlang.org/) - Type safety
- [ESLint](https://eslint.org/) - Code linting
- [Prettier](https://prettier.io/) - Code formatting
- [Vitest](https://vitest.dev/) - Unit testing
- [Playwright](https://playwright.dev/) - E2E testing
- [Storybook](https://storybook.js.org/) - Component documentation

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** or **pnpm** or **yarn**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd dosa
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Copy `env.example` to `.env` and fill in your values:

```bash
cp env.example .env
```

Required variables:
- `PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed Supabase configuration.

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📱 Mobile Development

### Sync web assets to native projects

```bash
npm run sync
```

### Run on Android

```bash
npm run dev:android
```

### Run on iOS (macOS only)

```bash
npm run dev:ios
```

### Build for mobile

```bash
npm run build:mobile
```

## 🏗️ Building

### Build for production (web)

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## 🧪 Testing

### Run unit tests

```bash
npm run test:unit
```

### Run E2E tests

```bash
npm run test:e2e
```

### Run all tests

```bash
npm test
```

## 🎨 Component Development

### Start Storybook

```bash
npm run storybook
```

### Build Storybook

```bash
npm run build-storybook
```

## 🗄️ Database

### Generate Prisma Client

```bash
npm run prisma:generate
```

### Run migrations (development)

```bash
npm run prisma:migrate
```

### Deploy migrations (production)

```bash
npm run prisma:deploy
```

## 📝 Code Quality

### Format code

```bash
npm run format
```

### Lint code

```bash
npm run lint
```

### Fix linting issues

```bash
npm run lint:fix
```

### Type check

```bash
npm run check
```

## 🌍 Internationalization

This project supports multiple languages using Paraglide.js:
- English (`en`)
- German (`de-de`)

Translation files are located in the `messages/` directory.

## 📦 Project Structure

```
dosa/
├── src/
│   ├── lib/              # Shared libraries and utilities
│   │   ├── guards/       # Route guards
│   │   ├── login/        # Login logic
│   │   ├── paraglide/    # i18n generated files
│   │   ├── profile/      # Profile utilities
│   │   ├── server/       # Server-side utilities
│   │   ├── stores/       # Svelte stores
│   │   ├── supabase/     # Supabase client
│   │   └── types/        # TypeScript types
│   ├── routes/           # SvelteKit routes
│   │   ├── api/          # API endpoints
│   │   ├── app/          # Authenticated app routes
│   │   ├── auth/         # Authentication routes
│   │   ├── demo/         # Demo pages
│   │   └── login/        # Login page
│   └── stories/          # Storybook stories
├── android/              # Android native project
├── ios/                  # iOS native project
├── messages/             # i18n translation files
├── e2e/                  # E2E tests
└── static/               # Static assets
```

## 🚀 Deployment

### Vercel (Web)

The app is configured to deploy to Vercel automatically:

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy! Vercel will automatically build and deploy on push

### Mobile App Stores

1. Build production versions:
   ```bash
   npm run build:mobile
   ```

2. **Android**: Open `android/` in Android Studio and build signed APK/AAB
3. **iOS**: Open `ios/App/App.xcworkspace` in Xcode and archive

## 📄 License

This project is private and not licensed for public use.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues and questions, please open an issue in the repository.

---

Built with ❤️ using SvelteKit and Capacitor

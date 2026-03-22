import { fileURLToPath } from 'node:url'

// Resolve aria-hidden to its ESM version (fixes CJS/ESM compatibility with reka-ui)
const ariaHiddenPath = fileURLToPath(
  import.meta.resolve('aria-hidden/dist/es2015/index.js'),
)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  /*
  extends: [
    'gh:cssninjaStudio/tairo/layers/tairo#2.0.0',
  ],
   */
  modules: [
    'reka-ui/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/image',
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxt/eslint',
    'nuxt-echarts',
  ],
  $development: {
    experimental: {
      // Disable prefetch for development, this will make the development faster.
      defaults: {
        nuxtLink: {
          prefetch: false,
        },
      },
    },
  },
  devtools: { enabled: true },

  css: [
    /**
     * Load Tailwind CSS
     */
    '~/assets/main.css',
    /**
     * ECharts dark mode styles
     */
    '~/assets/echarts.css',
  ],

  runtimeConfig: {
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authSecret: process.env.AUTH_SECRET,
    public: {
      // mapbox config
      mapboxToken: '', // set it via NUXT_PUBLIC_MAPBOX_TOKEN env
      siteUrl: '', // set it via NUXT_PUBLIC_SITE_URL
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    },
  },

  // Force aria-hidden to use ESM version instead of CJS (reka-ui dependency)
  alias: {
    'aria-hidden': ariaHiddenPath,
  },

  routeRules: {
    '/': {
      swr: 3600,
    },
    '/demos': {
      swr: 3600,
    },
    '/starters/**': {
      swr: 3600,
    },
    '/auth/**': {
      swr: 3600,
    },
    '/documentation': {
      swr: 3600,
    },
    '/documentation/**': {
      swr: 3600,
    },
    '/dashboards/**': {
      swr: 3600,
    },
    '/layouts/**': {
      swr: 3600,
    },
    '/wizard/**': {
      swr: 3600,
    },
  },

  sourcemap: {
    server: false,
    client: false,
  },
  future: {
    compatibilityVersion: 4,
  },
  // content: {
  //   build: {
  //     markdown: {
  //       toc: { depth: 3, searchDepth: 2 },
  //       highlight: {
  //         theme: {
  //           default: 'github-light',
  //           dark: 'github-dark',
  //         },
  //       },
  //     },
  //   },
  //   renderer: {
  //     anchorLinks: true,
  //   },
  // },

  experimental: {
    viewTransition: true,
    // buildCache: true,
    sharedPrerenderData: true,
    defaults: {
      nuxtLink: {
        // Here we disable the prefetch for visibility and enable it for interaction.
        // This is a good balance between performance and user experience when having a lot of links.
        prefetchOn: {
          visibility: false,
          interaction: true,
        },
      },
    },
  },
  compatibilityDate: '2026-02-21',

  nitro: {
    logging: {
      compressedSizes: false,
    },
    // SSL configuration for production (re-encrypt termination on OpenShift)
    // Set NITRO_SSL_CERT and NITRO_SSL_KEY env vars pointing to certificate files
    ...(process.env.NITRO_SSL_CERT && process.env.NITRO_SSL_KEY
      ? {
          https: {
            cert: process.env.NITRO_SSL_CERT,
            key: process.env.NITRO_SSL_KEY,
          },
        }
      : {}),
    // Disable prerendering during container builds (no DB available)
    prerender: {
      crawlLinks: false,
      routes: [],
    },
    // Externalize SQLite adapter - not needed in production (PostgreSQL only)
    externals: {
      external: [
        'better-sqlite3',
        '@prisma/adapter-better-sqlite3',
      ],
    },
    // esbuild: {
    //   options: {
    //     target: 'esnext',
    //   },
    // },
  },

  vite: {
    server: {
      allowedHosts: [
        'portal.me',
      ],
    },
    define: {
      // Enable / disable Options API support. Disabling this will result in smaller bundles
      // but may affect compatibility with 3rd party libraries if they rely on Options API.
      __VUE_OPTIONS_API__: false,
    },
    css: {
      // LightningCSS is a rust-based CSS minifier that is faster than the default CSS minifier.
      // @see https://vite.dev/guide/features.html#lightning-css
      // @see https://lightningcss.dev/
      transformer: 'lightningcss',
    },
    build: {
      target: 'esnext',
      cssMinify: 'lightningcss',
      reportCompressedSize: false,
    },
    // Defining the optimizeDeps.include option prebuilds the dependencies, this avoids
    // some reloads when navigating between pages during development.
    // It's also useful to track their usage.
    optimizeDeps: {
      include: [
        'aria-hidden',
        'scule',
        'klona',
        'ohash',
        'zod',
      ],
    },
  },

  typescript: {
    tsConfig: {
      // Here you can customize the generated tsconfig.json file
      // vueCompilerOptions: {
      //   target: 3.4,
      // },
    },
  },

  echarts: {
    charts: ['SankeyChart', 'BarChart', 'LineChart', 'PieChart', 'FunnelChart', 'HeatmapChart'],
    components: ['TooltipComponent', 'TitleComponent', 'GridComponent', 'LegendComponent', 'CalendarComponent', 'VisualMapComponent'],
  },

  eslint: {
    config: {
      stylistic: {
        semi: false,
        indent: 2,
        quotes: 'single',
      },
    },
  },
  fonts: {
    families: [
      // Red Hat brand fonts
      {
        name: 'Red Hat Display',
        provider: 'google',
        weights: ['300', '400', '500', '700', '900'],
      },
      {
        name: 'Red Hat Text',
        provider: 'google',
        weights: ['300', '400', '500', '700'],
      },
      {
        name: 'Red Hat Mono',
        provider: 'google',
        weights: ['300', '400', '500', '700'],
      },
      // Locale-specific fonts
      {
        name: 'Noto Sans JP',
        provider: 'google',
        weights: ['100 900'],
      },
      {
        name: 'Noto Naskh Arabic',
        provider: 'google',
        weights: ['400 700'],
      },
    ],
    experimental: {
      processCSSVariables: true,
    },
  },

  i18n: {
    baseUrl: '/',
    // We use the no_prefix strategy to avoid having the locale prefix in the URL,
    // This may not be the best strategy for SEO, but it's the best for the demo.
    // We recommend using the default prefix_except_default strategy for SEO.
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: [
      { code: 'en', dir: 'ltr', language: 'en-US', file: 'en-US.yaml', name: 'English', isCatchallLocale: true },
      { code: 'fr', dir: 'ltr', language: 'fr-FR', file: 'fr-FR.yaml', name: 'Français' },
      { code: 'es', dir: 'ltr', language: 'es-ES', file: 'es-ES.yaml', name: 'Español' },
      { code: 'de', dir: 'ltr', language: 'de-DE', file: 'de-DE.yaml', name: 'Deutsch' },
      { code: 'ar', dir: 'rtl', language: 'ar-SA', file: 'ar-SA.yaml', name: 'العربية' },
      { code: 'ja', dir: 'ltr', language: 'ja-JP', file: 'ja-JP.yaml', name: '日本語' },
    ],
  },
})

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'profilegoogle',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/vuetify',
    '@nuxtjs/composition-api/module',
    '@nuxt/typescript-build',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next'
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },
  auth: {
    strategies: {
      google: {
        scheme: 'oauth2',
        endpoints: {
          authorization: 'https://accounts.google.com/o/oauth2/auth',
          token: undefined,
          userInfo: 'https://www.googleapis.com/oauth2/v3/userinfo',
          logout: false
        },
        clientId: process.env.GOOGLE_APP_ID,
        scope: [
          'email',
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'
        ],
        codeChallengeMethod: '',
        responseType: 'id_token token',
        redirectUri: `${process.env.REDIRECT_URL}/form`,
        state: ''
      }
    }
  },
  env: {
    GOOGLE_OAUTH_API: process.env.GOOGLE_OAUTH_API || '',
    GOOGLE_SHEET_API: process.env.GOOGLE_SHEET_API || '',
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID || '',
    GOOGLE_APP_ID: process.env.GOOGLE_APP_ID || '',
    REDIRECT_URL: process.env.REDIRECT_URL || 'http://localhost:3000',
    PROJECT_SHEET_NAME: process.env.PROJECT_SHEET_NAME || '',
    REPORT_SHEET_NAME: process.env.REPORT_SHEET_NAME || '',
    SERVICE_ACCOUNT_PRIVATE_KEY: process.env.SERVICE_ACCOUNT_PRIVATE_KEY || '',
    SERVICE_ACCOUNT: process.env.SERVICE_ACCOUNT || ''
  }
}

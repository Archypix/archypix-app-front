import Aura from '@primeuix/themes/aura';
import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig: {
        public: { // Overrideable by NUXT_PUBLIC_*
            backendHost: 'http://127.0.0.1:8000',
            backendHostSSR: 'http://127.0.0.1:8000',
            isStandalone: true,
        }
    },

    app: {
        head: {
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
        },
        pageTransition: {name: 'page', mode: 'out-in'},
        layoutTransition: {name: 'layout', mode: 'out-in'}
    },

    components: [
        {
            path: '~/components',
            pathPrefix: false,
        },
    ],

    modules: [
        '@primevue/nuxt-module',
        '@pinia/nuxt',
        '@vueuse/nuxt',
        '@nuxtjs/leaflet'
        //'@nuxtjs/tailwindcss'
    ],

    vite: {
        plugins: [
            tailwindcss(),
        ],
        css: {
            preprocessorOptions: {}
        }
    },

    primevue: {
        options: {
            ripple: true,
            theme: {
                preset: Aura,
                options: {
                    prefix: 'p',
                    darkModeSelector: '',
                    cssLayer: { name: "primeui", order: "theme, base, primevue, archypix;", }
                }
            }
        }
    },

    pinia: {
        storesDirs: ['./stores/**'],
    },

    css: [
        '@/assets/css/common.styl',
        'primeicons/primeicons.css',
        '@/assets/css/tailwind.css'
    ],

    routeRules: {
        // Client-side only
        '/': {ssr: false},
        '/admin/**': {ssr: false},
        // Other pages default to CDN cache.
        '/**': {isr: false, swr: false, ssr: true, prerender: false},
    },

    $production: {},

    $development: {
        devtools: {
            enabled: true,
            timeline: {
                enabled: true
            }
        }
    },

    compatibilityDate: '2024-07-28',

    vue: {
        compilerOptions: {
            whitespace: 'condense',
            comments: false,
        },
    },
})

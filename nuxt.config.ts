// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: ["@nuxt/eslint"],
    eslint: {
        checker: true,
    },
    compatibilityDate: "2025-07-30", // Date Format: YYYY-MM-DD
});

import {useToast} from "primevue/usetoast";

export const useToastService = () => {
    const nuxtApp = useNuxtApp();
    // @ts-ignore
    const getToast: typeof useToast = () => nuxtApp.vueApp.config.globalProperties.$toast

    const apiError = (e: ApiError | null, summary: string) => {
        const detail = e ? (e.error_type + ': ' + e.message) : 'An unknown error occurred when trying to reach the server'
        getToast().add({
            severity: 'error',
            summary,
            detail,
            life: 5000,
            // group: 'br'
        })
    }

    const success = (summary: string, detail: string | null = null) => {
        getToast().add({
            severity: 'success',
            summary,
            detail,
            life: 5000,
            // group: 'br'
        })
    }

    return {apiError, success}
}

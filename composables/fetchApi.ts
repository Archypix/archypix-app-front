import {useUserStore} from "~/stores/user";
import {hash} from "ohash";


export enum ErrorType {
    BadRequest = 'BadRequest',
    Unauthorized = 'Unauthorized',
    NotFound = 'NotFound',
    UnprocessableEntity = 'UnprocessableEntity',
    InternalError = 'InternalError',
    // Form validation (see UnprocessableEntity for type check related errors)
    InvalidInput = 'InvalidInput',
    // Sign in / status types
    UserNotFound = 'UserNotFound',
    UserBanned = 'UserBanned',
    UserUnconfirmed = 'UserUnconfirmed',
    // Sign in types
    InvalidEmailOrPassword = "InvalidEmailOrPassword",
    TFARequiredOverEmail = "TFARequiredOverEmail",
    TFARequired = "TFARequired",
    InvalidTOTPCode = "InvalidTOTPCode",
    // Sign up types
    EmailAlreadyExists = "EmailAlreadyExists",
    // Confirm
    ConfirmationAlreadyUsed = "ConfirmationAlreadyUsed",
    ConfirmationNotFound = "ConfirmationNotFound",
    // Admin
    UserNotAdmin = 'UserNotAdmin',
    // Database error
    DatabaseError = 'DatabaseError',
    // Front end
    NoConfirmCodeToken = 'NoConfirmCodeToken',
    CantReachApi = 'CantReachApi',

}

export type ApiError = {
    error_type: ErrorType
    message: string
    rollback: boolean
}
export type HttpError = {
    statusCode: number
    statusMessage: string
    data: ApiError | null
}

const genericFetchApi = async function <B, R>(ssr: boolean, method: string, auth_token: string | null | undefined,
                                       id: string | null | undefined, path: string, body: B, useUseFetch: boolean): Promise<R> {

    return new Promise<R>(async (resolve: (data: R) => void, reject: (error: ApiError | null) => void) => {
        const backend_host = import.meta.server ? useRuntimeConfig()?.public?.backendHostSSR : useRuntimeConfig()?.public?.backendHost;

        let data: R | undefined = undefined;
        let error: HttpError | null = null;
        if (useUseFetch) {
            console.log('useFetchApi', 'method:', method, 'ssr:', ssr, `(${import.meta.server})`, 'uid:', id, 'path:', path, 'body:', body)
            let result = await useFetch<R, HttpError>(backend_host + path, {
                key: hash([ssr, method, auth_token, id, path, body]),
                method: method,
                headers: {
                    'User-Agent': import.meta.server ? '' : window.navigator.userAgent, // Needed only for login & signup queries.
                    'X-Auth-Token': auth_token,
                    'X-User-Id': id
                },
                server: ssr,
                body: body,
            })
            data = result.data?.value;
            error = result.error?.value ?? null;
        }else {
            console.log('fetchApi', 'method:', method, 'uid:', id, 'path:', path, 'body:', body)
            try {
                data = await $fetch<R, HttpError>(backend_host + path, {
                    key: hash([ssr, method, auth_token, id, path, body]),
                    method: method,
                    headers: {
                        'User-Agent': window.navigator.userAgent,
                        'X-Auth-Token': auth_token,
                        'X-User-Id': id
                    },
                    server: ssr,
                    body: body,
                })
            }catch (e) {
                error = e?.value;
            }
        }

        // Handle successful responses
        if (!error) {
            // For empty responses with 200 OK status
            if (data === null) {
                console.log('useFetchApi', 'Success: Empty response')
                resolve(undefined as unknown as R)
            } else {
                console.log('useFetchApi', 'Success:', data)
                resolve(data as R)
            }
        } else {
            let error_data = error?.data ?? null;
            if (error_data == null) {
                console.error('useFetchApi', 'Unknown error:', error?.statusCode, error?.statusMessage, error)
                error_data = {
                    error_type: ErrorType.CantReachApi,
                    message: 'Unable to reach the API, please try again later',
                    rollback: true
                }
            } else {
                console.log('useFetchApi', 'Known error:', error_data.error_type, '-', error_data.message)
            }
            reject(error_data)
        }
    })
}


export const useGetApi = async function <R>(ssr: boolean = false, path: string) {
    let user = useUserStore()
    return await useFetchApi<undefined, R>(ssr, 'GET', user.auth_token, user.id, path, undefined)
}

export const usePostApi = async function <B, R>(ssr: boolean = false, path: string, body: B) {
    let user = useUserStore()
    return await useFetchApi<B, R>(ssr, 'POST', user.auth_token, user.id, path, body)
}
export const usePatchApi = async function <B, R>(ssr: boolean = false, path: string, body: B) {
    let user = useUserStore()
    return await useFetchApi<B, R>(ssr, 'PATCH', user.auth_token, user.id, path, body)
}
export const useDeleteApi = async function <B, R>(ssr: boolean = false, path: string, body: B) {
    let user = useUserStore()
    return await useFetchApi<B, R>(ssr, 'DELETE', user.auth_token, user.id, path, body)
}

export const useFetchApi = async function <B, R>(ssr: boolean = false, method: string, auth_token: string | null | undefined,
                                                 id: string | null | undefined, path: string, body: B): Promise<R> {
    return genericFetchApi(true, method, auth_token, id, path, body, true);
}


export const getApi = async function <R>(path: string) {
    let user = useUserStore()
    return await fetchApi<undefined, R>('GET', user.auth_token, user.id, path, undefined)
}
export const postApi = async function <B, R>(path: string, body: B) {
    let user = useUserStore()
    return await fetchApi<B, R>('POST', user.auth_token, user.id, path, body)
}
export const patchApi = async function <B, R>(path: string, body: B) {
    let user = useUserStore()
    return await fetchApi<B, R>('PATCH', user.auth_token, user.id, path, body)
}
export const deleteApi = async function <B, R>(path: string, body: B) {
    let user = useUserStore()
    return await fetchApi<B, R>('DELETE', user.auth_token, user.id, path, body)
}
export const fetchApi = async function <B, R>(method: string, auth_token: string | null | undefined,
                                                 id: string | null | undefined, path: string, body: B): Promise<R> {
    return genericFetchApi(false, method, auth_token, id, path, body, false);
}

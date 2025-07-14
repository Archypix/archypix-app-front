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
    UnknownError = 'UnknownError',
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

interface HttpRes {
    statusCode: number,
    statusMessage: string,
    data: any
}

const genericFetchApi = async function <B, R>(ssr: boolean, method: string, auth_token: string | null | undefined,
                                              id: string | null | undefined, path: string, body: B, useUseFetch: boolean): Promise<R> {

    return new Promise<R>(async (resolve: (data: R) => void, reject: (error: ApiError) => void) => {
        const backend_host = import.meta.server ? useRuntimeConfig()?.public?.backendHostSSR : useRuntimeConfig()?.public?.backendHost;

        let response: HttpRes = {
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            data: null
        };
        if (useUseFetch) {
            console.log('useFetchApi', 'method:', method, 'ssr:', ssr, `(${import.meta.server})`, 'uid:', id, 'path:', path, 'body:', body)
            // @ts-ignore
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
            });
            if (result.data?.value) {
                response = {
                    statusCode: 200,
                    statusMessage: 'OK',
                    data: result.data.value,
                }
            } else if (result.error?.value) {
                response = {
                    statusCode: result.error.value.statusCode,
                    statusMessage: result.error.value.statusMessage,
                    data: result.error.value.data,
                }
            }
        } else {
            console.log('fetchApi', 'method:', method, 'uid:', id, 'path:', path, 'body:', body)
            response = await new Promise<HttpRes>((resolve, _reject) => {
                // @ts-ignore
                $fetch<R, null>(backend_host + path, {
                    method: method,
                    headers: {
                        'User-Agent': window.navigator.userAgent,
                        'X-Auth-Token': auth_token,
                        'X-User-Id': id
                    },
                    server: ssr,
                    body: body,
                    async onResponse({response}) {
                        resolve({
                            statusCode: response.status,
                            statusMessage: response.statusText,
                            data: response._data,
                        });
                    },
                })
                    .then(() => {
                    })
                    .catch(() => {
                    })
            });
        }

        if (response.statusCode === 200) {
            if (!response.data) {
                console.log('useFetchApi', 'Success: Empty response')
                resolve(undefined as unknown as R)
            } else {
                console.log('useFetchApi', 'Success:', response.data)
                resolve(response.data as R)
            }

        } else {
            if (!response.data) {
                console.error('useFetchApi', 'Unknown error:', response?.statusCode, response?.statusMessage, response.data)
                reject({
                    error_type: ErrorType.UnknownError,
                    message: `Unknown error: ${response?.statusCode} ${response?.statusMessage}`,
                    rollback: true
                })
            } else {
                console.log('useFetchApi', 'Known error:', response.data.error_type, '-', response.data.message)
                reject(response.data as ApiError)
            }
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

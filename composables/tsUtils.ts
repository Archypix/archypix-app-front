export function numberEntries<T>(obj: { [key: number]: T }): [number, T][] {
    return Object.entries(obj).map(([k, v]) => [Number(k), v]);
}

export type ValueOf<T> = T[keyof T];

export function useInitializeStore(apiCall) {
    let promise: Promise<void>;
    let resolve: () => void;
    promise = new Promise((r) => {
        resolve = r;
    });

    (async function () {
        await apiCall();
        resolve();
    })();

    return promise;
}

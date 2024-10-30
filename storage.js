//54145a.github.io global.js
const UPDATE_MIN_INTERVAL = 1000;

function createDeepProxy(target, handler) {
    const deepHandler = Object.assign({}, handler);
    deepHandler.get = (target, property) => {
        const value = Reflect.get(target, property);
        if (typeof value === "object" && value !== null) {
            return createDeepProxy(value, handler);
        } else {
            if (handler.get) {
                return handler.get(target, property, void 0);
            } else {
                return value;
            }
        }
    };
    return new Proxy(target, deepHandler);
}
function createStorageObject(defaultValue, updator) {
    let scheduledUpdate = false;
    let cache = Object.assign({}, defaultValue);
    return createDeepProxy(cache, {
        set(target, property, value) {
            if (!scheduledUpdate) {
                scheduledUpdate = true;
                setTimeout(async () => {
                    scheduledUpdate = false;
                    await updator(cache);
                }, UPDATE_MIN_INTERVAL);
            }
            return Reflect.set(target, property, value);
        }
    });
}
function getStorage(name) {
    const defaultValue = localStorage.getItem(name);
    return createStorageObject(
        defaultValue ? JSON.parse(defaultValue) : {},
        async data => {
            localStorage[name] = JSON.stringify(data);
        }
    );
}
export { getStorage };

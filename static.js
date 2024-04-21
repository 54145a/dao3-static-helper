class Static {
    /**
     * @param {URL} baseUrl
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    /**
     * @param {string} hash
     * @returns {URL}
     */
    get(hash) {
        return new URL(`${this.baseUrl.toString()}${hash}`);
    }
    /**
     * @param {string|Blob} data
     * @returns {Promise<object>}
     */
    async post(data) {
        const postResult = await fetch(this.baseUrl, {
            method: "POST",
            headers: {},
            body: data,
            mode: "cors"
        });
        const resultData = await postResult.json();
        return resultData;
    }
}
export { Static };
import API from 'presonus-studiolive-api'

type ResponseType = {}

// Singleton discovery
let lastRequestTime = new Date(0);

let lastResponse: ResponseType = {}
let discoveryPromise: Promise<ResponseType>;

export function search() {
    _search(true)
    return lastResponse
}

async function _search(updateTimestamp = false) {
    if (updateTimestamp) {
        lastRequestTime = new Date()
    }

    if (discoveryPromise) return discoveryPromise

    discoveryPromise = API.discover(10 * 1000)
    discoveryPromise.then(r => lastResponse = r)
    discoveryPromise.then(() => {
        discoveryPromise = null
        // Repeat search if a request was made at least once since 20 seconds ago
        if (new Date().getTime() - lastRequestTime.getTime() < 20 * 1000) _search()
    })

    return discoveryPromise
}
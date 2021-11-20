import API, { DiscoveryType } from 'presonus-studiolive-api'

// Singleton discovery
let lastRequestTime = new Date(0);

let lastResponse: DiscoveryType[] = []
let discoveryPromise: Promise<DiscoveryType[]>;

export function search() {
    _search(true)
    return lastResponse
}

async function _search(updateTimestamp = false) {
    if (updateTimestamp) {
        lastRequestTime = new Date()
    }

    if (discoveryPromise) return discoveryPromise

    discoveryPromise = API.discover(6 * 1000)
    discoveryPromise.then(r => lastResponse = r)
    discoveryPromise.then(() => {
        discoveryPromise = null
        // Repeat search if a request was made at least once since 20 seconds ago
        if (new Date().getTime() - lastRequestTime.getTime() < 20 * 1000) _search()
    })

    return discoveryPromise
}
import type { DiscoveryType } from 'presonus-studiolive-api'
import { Discovery } from 'presonus-studiolive-api'

let discoveryMap: {
    [uid: string]: DiscoveryType
} = {};

let discoveryClient: Discovery = new Discovery()
discoveryClient.on('discover', function (obj: DiscoveryType) {
    discoveryMap[obj.serial] = obj
})

export function startDiscovery() {
    stopDiscovery()
    discoveryClient.start();
    logger.info("Started discovery service")
}

export function stopDiscovery() {
    discoveryClient.stop()
}

export function search() {
    return Object.values(discoveryMap)
}
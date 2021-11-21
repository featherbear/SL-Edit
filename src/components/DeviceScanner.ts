import type { DiscoveryType } from 'presonus-studiolive-api'
import { Discovery } from 'presonus-studiolive-api'
import { EventEmitter } from 'stream';

export namespace DeviceScanner {

    interface DeviceChangeEventData {
        prev: DiscoveryType
        cur: DiscoveryType
    }

    let discoveryMap: {
        [uid: string]: DiscoveryType
    } = {};

    let emitter = new EventEmitter()

    let discoveryClient: Discovery = new Discovery()
    discoveryClient.on('discover', function (obj: DiscoveryType) {
        const previousEntry: DiscoveryType = discoveryMap[obj.serial]
        discoveryMap[obj.serial] = obj

        if (!previousEntry) emitter.emit('deviceFound', obj)

        else if (previousEntry.ip !== obj.ip || previousEntry.port !== obj.port) emitter.emit('deviceChanged', {
            prev: previousEntry,
            cur: obj
        } as DeviceChangeEventData)
    })

    export function onDeviceFound(fn: (obj: DiscoveryType) => void) {
        emitter.on('deviceFound', fn)
    }

    export function onDeviceChanged(fn: (obj: DeviceChangeEventData) => void) {
        emitter.on('deviceChanged', fn)
    }

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
}
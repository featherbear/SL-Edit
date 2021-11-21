import type { DiscoveryType, ZlibPayload } from "presonus-studiolive-api"
import Storage from "../components/Storage"
import { uid } from 'uid'

export interface DeviceModel {
    id: string
    sl_opts: {
        friendly_name: string
    }
    internals: {
        serial: string
        devicename: string
    }
    cache?: {
        [k: string]: any
        // mixer_name: string
        // mixer_version: string
        // mixer_version_date: string
    }
}

export class Device {
    data: DeviceModel

    constructor(data: DeviceModel) {
        this.data = data
    }

    static findDeviceBySerial(serial: string): Device {
        let deviceData = Object.values(Storage.read().devices)
            .find(({ internals: { serial: entrySerial } }) => serial == entrySerial)
        return deviceData ? new this(deviceData) : null
    }

    static findDeviceByID(id: string): Device {
        let deviceData = Storage.read().devices[id]
        return deviceData ? new this(deviceData) : null
    }

    private static createDevice({ friendly_name = "", serial, devicename }) {
        let existingDevice = this.findDeviceBySerial(serial)
        if (existingDevice) {
            throw new Error("Tried to create device but serial is already associated to another device")
        }

        let id: string
        let deviceData: DeviceModel = {
            /* VOLATILE */ id: null,
            sl_opts: {
                friendly_name: friendly_name?.trim() ?? ""
            },
            internals: {
                serial,
                devicename
            },
        }

        Storage.update(data => {
            while (Object.keys(data.devices).includes((id = uid(20))));
            deviceData.id = id
            data.devices[id] = deviceData
        })

        return new this(deviceData)
    }

    static createDeviceFromDiscoveryPayload(payload: DiscoveryType, friendly_name?: string) {
        return this.createDevice({ devicename: payload.name, serial: payload.serial, friendly_name })
    }

    static createDeviceFromZlibPayload(payload: ZlibPayload, friendly_name?: string) {
        let device = this.createDevice({
            friendly_name, devicename: payload.children.global.values.devicename,
            serial: payload.children.global.values.mixer_serial
        })

        device.updateCache((cache) => {
            return {
                ...cache,
                mixer_name: payload.children.global.values.mixer_name,
                mixer_version: payload.children.global.values.mixer_version,
                mixer_version_date: payload.children.global.values.mixer_version_date
            }
        })
    }

    updateCache(fn: (cache: DeviceModel['cache']) => DeviceModel['cache'] | void) {
        let result = fn(this.data.cache ?? {})
        if (result) this.data.cache = result
        Storage.store()
    }

    toJSON() {
        return this.data
    }
}
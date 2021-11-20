import type { ZlibPayload } from "presonus-studiolive-api"
import Storage from "src/components/Storage"
import { uid } from 'uid'

export interface DeviceModel {
    id: string
    serial: string
    mixer_name: string
    devicename: string
    mixer_version: string
    mixer_version_date: string
}

export class Device {
    data: DeviceModel

    constructor(data: DeviceModel) {
        this.data = data
    }

    static findDeviceBySerial(serial: string): Device {
        let deviceData = Object.values(Storage.read().devices)
            .find(({ serial: entrySerial }) => serial == entrySerial)
        return deviceData ? new this(deviceData) : null
    }

    static findDeviceByID(id: string): Device {
        let deviceData = Storage.read().devices[id]
        return deviceData ? new this(deviceData) : null
    }

    static createDeviceFromZlibPayload(payload: ZlibPayload) {
        const serial = payload.children.global.values.mixer_serial

        {
            let existingDevice = this.findDeviceBySerial(serial)
            if (existingDevice) {
                throw new Error("Tried to create device but serial is already associated to another device")
            }
        }

        let id

        let deviceData = {
             /* VOLATILE */ id: null,
            serial,
            mixer_name: payload.children.global.values.mixer_name,
            devicename: payload.children.global.values.devicename,
            mixer_version: payload.children.global.values.mixer_version,
            mixer_version_date: payload.children.global.values.mixer_version_date
        }
        Storage.update(data => {
            while (Object.keys(data.devices).includes((id = uid(20))));
            deviceData.id = id
            data.devices[id] = deviceData
        })

        return new this(deviceData)
    }

    toJSON() {
        return this.data
    }
}
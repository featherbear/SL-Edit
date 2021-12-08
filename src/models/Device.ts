import type { DiscoveryType, ZlibPayload } from "presonus-studiolive-api"
import Storage from "../components/Storage"
import { uid } from 'uid'

import CC, { ConsoleClientConnector } from '../components/controllers/ConsoleClient'

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

let ConsoleClientConnectorMap: { [deviceID: string]: ConsoleClientConnector } = {}
const findConnector = (deviceID: string) => ConsoleClientConnectorMap[deviceID]


export class Device {
    data: DeviceModel
    #client: ConsoleClientConnector

    constructor(data: DeviceModel) {
        this.data = data
    }

    notifyAddress(host: string, port: number) {
        let connector = findConnector(this.data.id)
        if (!connector || connector.host !== host || connector.port !== port) {
            const wasOldClientConnected = !!connector?.isConnected
            connector = ConsoleClientConnectorMap[this.data.id] = CC.createClient(host, port)
            if (wasOldClientConnected) findConnector(this.data.id).connect()

            connector.with(client => {
                client.once('connected', () => {
                    logger.info(`Connected to ${this.data.internals.serial}`)
                })
            })
        }
    }

    async getInstance() {
        const existingConnector = findConnector(this.data.id)
        if (!existingConnector) {
            logger.debug(`Tried get instance for ${this.data.internals.serial} but the device was not associated with an address yet`)
            return null;
        }
        if (!existingConnector.isConnected) {
            logger.debug(`Waiting for connection to ${this.data.internals.serial}`)
            await existingConnector.connect()
        }

        return existingConnector
        // C.connect()
        // C.with((client) => {
        // 	client.on(MESSAGETYPES.ZLIB, function (d: ZlibPayload) {
        // 		const serial = d.children.global.values.mixer_serial

        // 		let mappedDevice = Device.findDeviceBySerial(serial)
        // 		if (!mappedDevice) {
        // 			logger.info("New device found")
        // 			Device.createDeviceFromZlibPayload(d)
        // 		} else {
        // 			logger.info("Connected to " + mappedDevice.data.id)
        // 		}
        // 	})

        // 	client.mute(CHANNELS.LINE.CHANNEL_1, CHANNELTYPES.LINE)
        // 	// setInterval(() => console.log(client.state), 1000)
        // 	// // client.on('data', (data) => {
        // 	// // 	console.log(data);
        // 	// // 	console.log(client.state);
        // 	// // })

        // })
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

    private static createDevice({ friendly_name = "", serial, devicename, host = null, port = null }) {
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
            }
        }

        Storage.update(data => {
            while (Object.keys(data.devices).includes((id = uid(20))));
            deviceData.id = id
            data.devices[id] = deviceData
        })

        let instance = new this(deviceData)
        if (host && port) instance.notifyAddress(host, port)

        return instance
    }

    static createDeviceFromDiscoveryPayload(payload: DiscoveryType, friendly_name?: string) {
        return this.createDevice({ devicename: payload.name, serial: payload.serial, friendly_name, host: payload.ip, port: payload.port })
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
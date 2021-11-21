import { DeviceScanner } from "src/components/DeviceScanner";
import { Device } from "src/models/Device";

interface RegistrationSuccessResponse {
    status: true
    deviceID: string
}

interface RegistrationFailResponse {
    status: false
    error: string
}

export type RegistrationResponse = RegistrationFailResponse | RegistrationSuccessResponse

export interface RegistrationParameters {
    serial: string
    friendly_name: string
}

export function post(req, res, next) {
    const FAIL = (errorMessage: string) => res.end(JSON.stringify({ status: false, error: errorMessage.trim() } as RegistrationFailResponse))

    let args: RegistrationParameters = req.body

    let serial = args.serial?.trim()
    if (!serial) return FAIL('`serial` not provided')

    let scannedDevice = DeviceScanner.search().find((d) => d.serial == args.serial)
    if (!scannedDevice) return FAIL('Could not find a device with the provided serial')
    if (scannedDevice['id']) return FAIL('A device matching the provided serial already exists')

    let deviceID: string
    try {
        deviceID = Device.createDeviceFromDiscoveryPayload(scannedDevice, args.friendly_name).data.id
    } catch (e) {
        console.log('Caught create error');
        return FAIL(e.message)
    }

    if (!deviceID) return FAIL("An unknown error occurred")

    res.end(JSON.stringify({ status: true, deviceID } as RegistrationSuccessResponse))
}
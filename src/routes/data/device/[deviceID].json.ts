import { Device } from "../../../models/Device"

export async function get(req, res, next) {
    const { deviceID } = req.params

    let device = Device.findDeviceByID(deviceID)
    if (!device) return next()

    // TODO: wait for time.. or let it get changed into another value?
    device.getInstance()

    return res.end(JSON.stringify(device.data))
}
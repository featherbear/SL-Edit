import { Device } from "src/models/Device"

export function get(req, res, next) {
    const { deviceID } = req.params
    console.log(deviceID);
    let device = Device.findDeviceByID(deviceID)
    if (!device) {
        return next()
    }

    return res.end(JSON.stringify(device.data))
}
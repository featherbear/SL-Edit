import type { ConsoleClientConnector } from "$controllers/ConsoleClient";
import { Device } from "../../../models/Device"

export async function get(req, res, next) {
    const { deviceID } = req.params

    let device = Device.findDeviceByID(deviceID)
    if (!device) return next()

    // Fetch the client connector, max 1s wait
    let client: ConsoleClientConnector = await new Promise((resolve, reject) => {
        setTimeout(() => resolve(null), 1000)
        device.getInstance().then(client => {
            resolve(client)
        })
    });

    return res.end(JSON.stringify(device.data))
}

import type { DiscoveryType } from 'presonus-studiolive-api'
import { DeviceScanner } from 'src/components/DeviceScanner'
import { Device } from 'src/models/Device'

export function get(req, res, next) {
    let searchData = DeviceScanner.search().map((d => {
        let mappedDeviceID = Device.findDeviceBySerial(d.serial)?.data?.id
        if (mappedDeviceID) d['id'] = mappedDeviceID
        return d
    }))

    return res.end(JSON.stringify({
        asOf: new Date(),
        data: searchData
    } as ScanResponse))
}

export interface ScanResponse {
    asOf: string | Date,
    data: DiscoveryType[]
}
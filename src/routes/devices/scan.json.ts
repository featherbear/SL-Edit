
import { Device } from 'src/models/Device'
import { search } from '../../components/DeviceScanner'

export function get(req, res, next) {
    let searchData = search().map((d => {
        let mappedDeviceID = Device.findDeviceBySerial(d.serial)?.data?.id
        if (mappedDeviceID) d['id'] = mappedDeviceID
        return d
    }))

    return res.end(JSON.stringify({
        asOf: new Date(),
        data: searchData
    }))
}
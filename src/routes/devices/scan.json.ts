
import { search } from '../../components/DeviceScanner'

export function get(req, res, next) {
    console.log('gon get data');
    return res.end(JSON.stringify({
        asOf: new Date(),
        data: search()
    }))
}
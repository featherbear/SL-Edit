
import Storage from '../../components/Storage'

export function get(req, res, next) {
    let data = Storage.read()
    return res.end(JSON.stringify(data.devices ?? {}))
}
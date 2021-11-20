import type { DeviceModel } from "./Device";

interface StorageModel {
    settings: {
        [k: string]: any
    }
    devices: {
        [uid: string]: DeviceModel
    }
}

export default StorageModel
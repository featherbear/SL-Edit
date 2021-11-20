import { existsSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

const storageFile = "config.json"

const storagePath = join(__dirname, storageFile)

export default class <DataType = {}> {
    #data: DataType & {}

    constructor(seed: DataType) {
        this.#data = existsSync(storagePath) ? JSON.parse(readFileSync(storagePath, 'utf8')) : seed
    }

    /**
     * Modify the data
     * @param fn Operator function
     */
    async update(fn: (data: DataType) => void);
    /**
     * Replace the data structure
     * @param data New value
     */
    async update(data: DataType);
    async update(dataOrFn) {
        if (typeof dataOrFn === 'function') {
            await dataOrFn(this.#data)
        } else {
            this.#data = dataOrFn as DataType
        }

        this.store()
    }

    /**
     * Perform an operation of an immutable data structure
     * @param fn Reader function
     */
    async with(fn: (data: DataType) => void) {
        await fn({ ...this.#data })
    }

    /**
     * @returns Copy of the data structure
     */
    read(): DataType {
        return { ...this.#data }
    }

    /**
     * Write the current data structure to the filesystem
     */
    store() {
        writeFileSync(storagePath, JSON.stringify(this.#data), 'utf8')
    }
}


// import camo from 'camo'
// let dbRefPromise: Promise<any>;

// function requireInit(target, name, descriptor) {
//     return {
//         ...descriptor, value: async (...args) => {
//             if (!dbRefPromise) dbRefPromise = camo.connect("nedb://memory")
//             await dbRefPromise
//             descriptor.value(...args)
//         }
//     };
// }


// class StorageWrapper {
//     constructor() {

//     }

//     @requireInit
//     async save(d) {
//         console.log('abc');
//     }
// }

// export default new StorageWrapper
import camo from 'camo'
let dbRefPromise: Promise<any>;

function requireInit(target, name, descriptor) {
    return {
        ...descriptor, value: async (...args) => {
            if (!dbRefPromise) dbRefPromise = camo.connect("nedb://memory")
            await dbRefPromise
            descriptor.value(...args)
        }
    };
}


class StorageWrapper {
    constructor() {

    }

    @requireInit
    async save(d) {
        console.log('abc');
    }
}

export default new StorageWrapper
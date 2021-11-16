import SLAPI from 'presonus-studiolive-api'

export function createClient(host: string, port?: number) {
    function requireConnected(target, name, descriptor) {
        return {
            ...descriptor, value: async (...args) => {
                if (!client.isConnected) {
                    throw new Error("Client not yet connected")
                }
                descriptor.value(...args)
            }
        };
    }

    let client: ConsoleClientConnector

    class ConsoleClientConnector {
        #connected: boolean
        #client: SLAPI

        constructor() {
            this.#connected = false
            this.#client = new SLAPI(host, port)
        }

        get isConnected() {
            return this.#connected;
        }

        connect() {
            this.#client.connect()
        }

        with(fn: (client: SLAPI) => any ) {
            fn(this.#client)
        }

        @requireConnected
        some_function_requiring_connect() {
            console.log('abc');
        }
    }

    return (client = new ConsoleClientConnector);
}

export default {
    createClient
}
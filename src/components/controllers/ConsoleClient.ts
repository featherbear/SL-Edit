import SLAPI from 'presonus-studiolive-api'

/**
 * 
 * @param host 
 * @param port default 53000
 * @returns 
 */
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
        #host: string
        #port: number

        constructor() {
            this.#connected = false
            this.#client = new SLAPI(host, port)
            this.#host = host
            this.#port = port
        }

        get host() {
            return this.#host
        }

        get port() {
            return this.#port
        }

        get isConnected() {
            return this.#connected
        }

        connect() {
            this.#client.connect().then(() => {
                this.#connected = true
            })
            // Wait for the connect event? or just be a promise
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

export type ConsoleClientConnector = ReturnType<typeof createClient>

export default {
    createClient
}
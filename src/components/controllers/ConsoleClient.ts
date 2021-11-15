import SLAPI from 'presonus-studiolive-api'

export function createClient() {
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

        constructor() {
            this.#connected = false
        }

        get isConnected() {
            return this.#connected;
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
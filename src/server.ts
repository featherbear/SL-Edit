import dotenv from 'dotenv'
dotenv.config()
import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

import CC from '$controllers/ConsoleClient'
import Storage from './components/Storage'


import * as winston from 'winston'
import { CHANNELTYPES, CHANNELS, MESSAGETYPES, ZlibPayload } from 'presonus-studiolive-api';
import { Device, DeviceModel } from './models/Device';
import { startDiscovery } from './components/DeviceScanner';

global.logger = winston.createLogger({
	transports: [
		new winston.transports.Console()
	]
})

polka()
	.use(
		compression({ threshold: 0 }) as any,
		sirv('static', { dev }),
		sapper.middleware()
	)
	.listen(PORT, function () {
		logger.info("Server started")
	})


startDiscovery();

let C = CC.createClient("192.168.0.18")
C.connect()
C.with((client) => {
	client.on(MESSAGETYPES.ZLIB, function (d: ZlibPayload) {
		const serial = d.children.global.values.mixer_serial

		let mappedDevice = Device.findDeviceBySerial(serial)
		if (!mappedDevice) {
			logger.info("New device found")
			Device.createDeviceFromZlibPayload(d)
		} else {
			logger.info("Connected to " + mappedDevice.data.id)
		}
	})

	client.mute(CHANNELS.LINE.CHANNEL_1, CHANNELTYPES.LINE)
	// setInterval(() => console.log(client.state), 1000)
	// // client.on('data', (data) => {
	// // 	console.log(data);
	// // 	console.log(client.state);
	// // })

})


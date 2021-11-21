import dotenv from 'dotenv'
dotenv.config()
import polka from 'polka';
import sirv from 'sirv';
import { json } from 'body-parser'
import compression from 'compression';
import * as sapper from '@sapper/server';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

import CC from '$controllers/ConsoleClient'
import Storage from './components/Storage'


import * as winston from 'winston'
import { CHANNELTYPES, CHANNELS, MESSAGETYPES, ZlibPayload } from 'presonus-studiolive-api';
import { Device, DeviceModel } from './models/Device';

import { DeviceScanner } from './components/DeviceScanner';

global.logger = winston.createLogger({
	level: 'debug',
	transports: [
		new winston.transports.Console()
	]
})

polka()
	.use(
		compression({ threshold: 0 }) as any,
		sirv('static', { dev }),
		json(),
		sapper.middleware()
	)
	.listen(PORT, function () {
		logger.info("Server started")
	})


DeviceScanner.onDeviceFound(function (device) {
	logger.debug(`Found device ${device.name} (SN: ${device.serial}) at ${device.ip}:${device.port}`)
})
DeviceScanner.onDeviceChanged(function ({ prev, cur }) {
	logger.debug(`Device ${cur.name} (SN: ${cur.serial}) changed its address to ${cur.ip}:${cur.port}`)
})

DeviceScanner.startDiscovery();

// let C = CC.createClient("192.168.0.18")
// C.connect()
// C.with((client) => {
// 	client.on(MESSAGETYPES.ZLIB, function (d: ZlibPayload) {
// 		const serial = d.children.global.values.mixer_serial

// 		let mappedDevice = Device.findDeviceBySerial(serial)
// 		if (!mappedDevice) {
// 			logger.info("New device found")
// 			Device.createDeviceFromZlibPayload(d)
// 		} else {
// 			logger.info("Connected to " + mappedDevice.data.id)
// 		}
// 	})

// 	client.mute(CHANNELS.LINE.CHANNEL_1, CHANNELTYPES.LINE)
// 	// setInterval(() => console.log(client.state), 1000)
// 	// // client.on('data', (data) => {
// 	// // 	console.log(data);
// 	// // 	console.log(client.state);
// 	// // })

// })


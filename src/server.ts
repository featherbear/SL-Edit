import dotenv from 'dotenv'
dotenv.config()
import polka from 'polka';
import sirv from 'sirv';
import { json } from 'body-parser'
import compression from 'compression';
import * as sapper from '@sapper/server';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

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


DeviceScanner.onDeviceFound(function (deviceDiscovery) {
	const existingDevice = Device.findDeviceBySerial(deviceDiscovery.serial)
	const isNewString = existingDevice ? "" : "new "
	logger.debug(`Found ${isNewString}device ${deviceDiscovery.name} (SN: ${deviceDiscovery.serial}) at ${deviceDiscovery.ip}:${deviceDiscovery.port}`)

	existingDevice?.notifyAddress(deviceDiscovery.ip, deviceDiscovery.port)
})

DeviceScanner.onDeviceChanged(function ({ prev, cur }) {
	logger.debug(`Device ${cur.name} (SN: ${cur.serial}) changed its address to ${cur.ip}:${cur.port}`)
	Device.findDeviceBySerial(cur.serial)?.notifyAddress(cur.ip, cur.port)
})

DeviceScanner.startDiscovery();



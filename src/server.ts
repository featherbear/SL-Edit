import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

import CC from '$controllers/ConsoleClient'
import Storage from './components/Storage'

import * as winston from 'winston'
import { CHANNELTYPES, CHANNELS, MESSAGETYPES } from 'presonus-studiolive-api';

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


import zlib from 'zlib'




let C = CC.createClient("192.168.0.18")
C.connect()
C.with((client) => {
	client.on('data', function({code, data}) {
		if (code == "ZB") {
			// next 4 bytes are the size (little )
			console.log("ZEE BEE");
			let b = data.data.slice(4)
			let defl = zlib.inflateSync(b)
			console.log(defl.toString());
			console.log(data);
		}
	})
	client.mute(CHANNELS.LINE.CHANNEL_1, CHANNELTYPES.LINE)
	// setInterval(() => console.log(client.state), 1000)
	// // client.on('data', (data) => {
	// // 	console.log(data);
	// // 	console.log(client.state);
	// // })

})
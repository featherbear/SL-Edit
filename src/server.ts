import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

import CC from '$controllers/ConsoleClient'
import Storage from './components/Storage'

import * as winston from 'winston'

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

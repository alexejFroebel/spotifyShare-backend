const Koa = require('koa');
const websockify = require('koa-websocket');
const Router = require('koa-router');
const logger = require('koa-logger');
const koaBody = require('koa-body');
const apiRoutes = require('./routes/api');
const wsRoutes = require('./routes/ws');

const app = websockify(new Koa());
const apiRouter = new Router();
const wsRouter = new Router();
const database = require('./database');

database.initialize();
app.use(koaBody());
apiRouter.use('/api', apiRoutes.routes());
wsRouter.use('/ws', wsRoutes.routes());
app.ws.use(wsRouter.routes());
app.use(apiRouter.routes());
app.use(logger());
app.use(apiRouter.allowedMethods());
app.listen(5000);

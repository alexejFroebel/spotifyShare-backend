const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const routes = require('./routes');

const app = new Koa();
const router = new Router();
const database = require('./database');

database.initialize();

router.use('/api', routes.routes());

app.use(logger());
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(5000);

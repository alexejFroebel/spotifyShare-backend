const Router = require('koa-router');
const uuidv4 = require('uuid/v4');
const { User } = require('../../database');
const session = require('./session');

const router = new Router();


router.get('/userid', async (ctx) => {
  const created = new Date();
  const userId = uuidv4();
  try {
    await new User({ userId, created }).save();
  } catch (err) {
    ctx.throw(500, err);
  }
  ctx.body = userId;
});
router.get('/', async (ctx) => {
  ctx.body = 'heyoo';
});
router.use('/session', session.routes());
/*
Errors:
9000 no ws connection established
9001 userid not found in database
9002 user already has session
9003 already session with id
9004 session does not exist
9005 invalid session pin
9006 invalid session secret
9007 owner cant leave
9008 wrong token
*/
module.exports = router;

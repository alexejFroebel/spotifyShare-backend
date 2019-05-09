const Router = require('koa-router');
const uuidv4 = require('uuid/v4');
const { User, Session } = require('../../database');
const server = require('../../server');

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
router.post('/session/create', async (ctx) => {
  const { userId, pin, sessionId } = ctx.request.body;
  ctx.assert(userId, 400, 'no user id');
  ctx.assert(sessionId, 400, 'no session id');
  const hasWsConnection = server.hasWsConnection(userId);
  if (!hasWsConnection) {
    ctx.throw(400, '9000');
  }
  const user = await User.findOne({ userId });
  if (!user) {
    ctx.throw(400, '9001');
  }
  const sessionFromUser = await Session.findOne({ ownerUserId: userId });
  if (sessionFromUser) {
    ctx.throw(400, '9002');
  }
  const sessionWithSameName = await Session.findOne({ sessionId });
  if (sessionWithSameName) {
    ctx.throw(400, '9003');
  }
  try {
    const created = new Date();
    const members = [userId];
    const newSession = new Session({
      ownerUserId: userId, pin, sessionId, created, members,
    });
    await newSession.save();
  } catch (err) {
    console.log(err);
  }
  ctx.body('success');
});
router.get('/', async (ctx) => {
  ctx.body = 'heyoo';
});
/*
Errors:
9000 no ws connection established
9001 userid not found in database
9002 user already has session
9003 already session with id
*/
module.exports = router;

const Router = require('koa-router');
const createSession = require('./createSession');
const joinSession = require('./joinSession');
const leaveSession = require('./leaveSession');

const router = new Router();

router.post('/create', createSession());
router.post('/join', joinSession());
router.post('/leave', leaveSession());
/*
Errors:
9000 no ws connection established
9001 userid not found in database
9002 user already in session
9003 already session with id
9004 session does not exist
9005 invalid session pin
9006 invalid session secret
9007 no token provided by delete
*/
module.exports = router;

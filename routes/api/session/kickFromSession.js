const { Session } = require('../../../database');
const sessionManager = require('./sessionManager');
const server = require('../../../server');

function kickFromSession() {
  return async (ctx) => {
    const {
      userId, sessionId, secret, token, kickUserId,
    } = ctx.request.body;
    ctx.assert(userId, 400, 'no userId');
    ctx.assert(sessionId, 400, 'no sessionId');
    ctx.assert(secret, 400, '9010');
    ctx.assert(token, 400, '9007');
    ctx.assert(kickUserId, 400, 'no kickUserId');
    const userIsInValidSession = await sessionManager.checkIfUserIsInValidSession(userId, sessionId);
    if (!userIsInValidSession) {
      ctx.throw(400, '9002');
    }
    let session;
    try {
      session = await Session.findOne({ sessionId });
    } catch (err) {
      console.log(err);
      return;
    }
    const { ownerUserId, secret: sessionSecret, tokenInfo } = session;
    const sessionToken = tokenInfo.token;
    if (ownerUserId !== userId) {
      ctx.throw(400, '9010');
    }
    if (secret !== sessionSecret) {
      ctx.throw(400, '9006');
    }
    if (token !== sessionToken) {
      ctx.throw(400, '9008');
    }
    const sessionMembers = session.members;
    delete sessionMembers[kickUserId];
    session.markModified('members');
    try {
      await session.save();
    } catch (err) {
      console.log(err);
      return;
    }
    // FIXME send kick message to client
    server.sendMessageToSession(sessionId, 'NEW_MEMBERS', sessionMembers);
    ctx.status = 200;
    server.closeConnection(kickUserId);
  };
}
module.exports = kickFromSession;

const { User, Session } = require('../../../database');
const server = require('../../../server');

async function validUser(ctx, userId) {
  const user = await User.findOne({ userId });
  if (!user) {
    ctx.throw(400, '9001');
  }
}
function hasWsConnection(ctx, userId) {
  const wsConnectionExists = server.hasWsConnection(userId);
  if (!wsConnectionExists) {
    ctx.throw(400, '9000');
  }
}
async function userHasNoSession(ctx, userId) {
  const sessionFromUser = await Session.findOne({ ownerUserId: userId });
  if (sessionFromUser) {
    ctx.throw(400, '9002');
  }
}
async function sessionIsUnique(ctx, sessionId) {
  const sessionWithSameName = await Session.findOne({ sessionId });
  if (sessionWithSameName) {
    ctx.throw(400, '9003');
  }
}
module.exports.validUser = validUser;
module.exports.hasWsConnection = hasWsConnection;
module.exports.userHasNoSession = userHasNoSession;
module.exports.sessionIsUnique = sessionIsUnique;

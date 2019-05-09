const { Session } = require('../database');

const connections = {};

function sendMessage(connection, eventType, value) {
  const json = {
    EventType: eventType,
    value,
  };
  connection.send(JSON.stringify(json));
}
function sendClientMessage(userId, eventType, value) {
  const connectionOfUser = connections[userId];
  sendMessage(connectionOfUser, eventType, value);
}
async function sendMessageToSession(sessionId, eventType, value) {
  let listOfUserIds;
  try {
    const session = await Session.findOne({ sessionId });
    const { members } = session;
    listOfUserIds = Object.keys(members);
  } catch (err) {
    console.log(err);
  }
  listOfUserIds.forEach((userId) => {
    const connectionOfUser = connections[userId];
    sendMessage(connectionOfUser, eventType, value);
  });
}
function register(userid, connection) {
  connection.on('message', (message) => {
    console.log(`message from: ${userid}: ${message}`);
  });
  connection.on('error', (error) => {
    console.log(`Error: ${error} from ${userid}`);
  });
  connection.on('close', (e) => {
    console.log(`Connection closed${e}`);
    delete connections[userid];
  });
  connections[userid] = connection;
  sendMessage(connection, 'Connection', 'okay');
}


function hasWsConnection(userId) {
  if (connections[userId]) {
    return true;
  }
  return false;
}
module.exports.register = register;
module.exports.hasWsConnection = hasWsConnection;
module.exports.sendMessage = sendMessage;
module.exports.sendMessageToSession = sendMessageToSession;
module.exports.sendClientMessage = sendClientMessage;

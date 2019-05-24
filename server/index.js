const { Session, User } = require('../database');

const connections = {};


async function deleteUser(userId) {
  const user = await User.findOne({ userId });
  if (user) {
    user.remove();
  }
  delete connections[userId];
}
async function sendMessage(connection, eventType, value) {
  const json = {
    EventType: eventType,
    value,
  };
  return connection.send(JSON.stringify(json));
}
function sendClientMessage(userId, eventType, value) {
  const connectionOfUser = connections[userId];
  return sendMessage(connectionOfUser, eventType, value);
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
  listOfUserIds.forEach(async (userId) => {
    const connectionOfUser = connections[userId];
    await sendMessage(connectionOfUser, eventType, value);
  });
}
function register(userId, connection) {
  connection.on('message', (message) => {
    console.log(`message from: ${userId}: ${message}`);
  });
  connection.on('error', (error) => {
    console.log(`Error: ${error} from ${userId}`);
  });
  connection.on('close', (e) => {
    console.log(`Connection closed${e}`);
    deleteUser(userId);
  });
  console.log('connected');
  connections[userId] = connection;
  sendMessage(connection, 'Connection', 'okay');
}


function hasWsConnection(userId) {
  if (connections[userId]) {
    return true;
  }
  return false;
}

function closeConnection(userId) {
  const connection = connections[userId];
  if (connection) {
    connection.close();
  }
}
module.exports.register = register;
module.exports.hasWsConnection = hasWsConnection;
module.exports.sendMessage = sendMessage;
module.exports.sendMessageToSession = sendMessageToSession;
module.exports.sendClientMessage = sendClientMessage;
module.exports.closeConnection = closeConnection;

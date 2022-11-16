const mongoose = require("mongoose");
const UserSchema = require("./user");
const dotenv = require("dotenv");

dotenv.config();

// Uncomment the following to debug mongoose queries, etc.
// mongoose.set("debug", true);
let dbConnection;

function setConnection(newConn) {
  dbConnection = newConn;
  return dbConnection;
}

function getDbConnection() {
  if (!dbConnection) {
    dbConnection = mongoose.createConnection(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  return dbConnection;
}

// mongoose.connect(
//   "mongodb+srv://" +
//     process.env.MONGO_USER +
//     ":" +
//     process.env.MONGO_PWD +
//     "@" +
//     process.env.MONGO_CLUSTER +
//     "/" +
//     process.env.MONGO_DB +
//     "?retryWrites=true&w=majority",
//   // "mongodb://localhost:27017/users",
//   {
//     useNewUrlParser: true, //useFindAndModify: false,
//     useUnifiedTopology: true,
//   }
// );
// .catch((error) => console.log(error));

async function getUsers(name, job) {
  const userModel = getDbConnection().model("User", UserSchema);
  let result;
  if (name === undefined && job === undefined) {
    result = await userModel.find();
  } else if (name && !job) {
    result = await findUserByName(name);
  } else if (job && !name) {
    result = await findUserByJob(job);
  } else {
    result = await findUserByNameAndJob(name, job);
  }
  return result;
}

async function findUserById(id) {
  const userModel = getDbConnection().model("User", UserSchema);
  // try {
  return await userModel.findById(id);
  // } catch (error) {
  //   console.log(error);
  //   return undefined;
  // }
}

async function addUser(user) {
  const userModel = getDbConnection().model("User", UserSchema);
  // try {
  const userToAdd = new userModel(user);
  const savedUser = await userToAdd.save();
  return savedUser;
  // } catch (error) {
  //   console.log(error);
  //   return false;
  // }
}

async function findUserByName(name) {
  const userModel = getDbConnection().model("User", UserSchema);

  return await userModel.find({ name: name });
}

async function findUserByJob(job) {
  const userModel = getDbConnection().model("User", UserSchema);

  return await userModel.find({ job: job });
}

async function findUserByNameAndJob(name, job) {
  const userModel = getDbConnection().model("User", UserSchema);

  return await userModel.find({ name: name, job: job });
}

async function deleteUser(id) {
  const userModel = getDbConnection().model("User", UserSchema);

  return await userModel.findByIdAndDelete(id);
}

// async function disconnectDB() {
//   await mongoose.connection.close();
//   await mongoose.disconnect();
// }

// exports.getUsers = getUsers;
// exports.findUserById = findUserById;
// exports.findUserByName = findUserByName;
// exports.addUser = addUser;
// exports.deleteUser = deleteUser;
// exports.disconnectDB = disconnectDB;
module.exports = {
  getUsers,
  findUserById,
  findUserByName,
  addUser,
  deleteUser,
  setConnection,
};

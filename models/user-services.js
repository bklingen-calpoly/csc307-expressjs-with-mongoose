import mongoose from "mongoose";
import UserSchema from "./user.js";
import dotenv from "dotenv";

dotenv.config();

// Uncomment the following to debug mongoose queries, etc.
// mongoose.set("debug", true);

let dbConnection;

function setDbConnection(newConn) {
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
  try {
    return await userModel.findById(id);
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

async function addUser(user) {
  const userModel = getDbConnection().model("User", UserSchema);
  try {
    const userToAdd = new userModel(user);
    const savedUser = await userToAdd.save();
    return savedUser;
  } catch (error) {
    console.log(error);
    return false;
  }
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

export default {
  addUser,
  getUsers,
  deleteUser,
  findUserById,
  findUserByName,
  findUserByJob,
  getDbConnection,
  setDbConnection,
};

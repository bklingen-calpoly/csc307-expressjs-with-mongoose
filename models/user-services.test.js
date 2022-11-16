const mongoose = require("mongoose");
const UserSchema = require("./user");
const userServices = require("./user-services");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;
let conn;
let userModel;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  conn = await mongoose.createConnection(uri, mongooseOpts);

  userModel = conn.model("User", UserSchema);

  userServices.setConnection(conn);
});

afterAll(async () => {
  await conn.dropDatabase();
  await conn.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  let dummyUser = {
    name: "Chuck Norris",
    job: "Highlander",
  };
  let result = new userModel(dummyUser);
  await result.save();

  dummyUser = {
    name: "Ted Lasso",
    job: "Football coach",
  };
  result = new userModel(dummyUser);
  await result.save();

  dummyUser = {
    name: "Ted Lasso",
    job: "Soccer coach",
  };
  result = new userModel(dummyUser);
  await result.save();

  dummyUser = {
    name: "Pepe Guardiola",
    job: "Soccer coach",
  };
  result = new userModel(dummyUser);
  await result.save();
});

afterEach(async () => {
  await userModel.deleteMany();
});

test("Fetching all users", async () => {
  const users = await userServices.getUsers();
  expect(users).toBeDefined();
  expect(users.length).toBeGreaterThan(0);
});

test("Fetching users by name", async () => {
  const userName = "Ted Lasso";
  const users = await userServices.getUsers(userName);
  expect(users).toBeDefined();
  expect(users.length).toBeGreaterThan(0);
  users.forEach((user) => expect(user.name).toBe(userName));
});

test("Fetching users by job", async () => {
  const userJob = "Soccer coach";
  const users = await userServices.getUsers(undefined, userJob);
  expect(users).toBeDefined();
  expect(users.length).toBeGreaterThan(0);
  users.forEach((user) => expect(user.job).toBe(userJob));
});

// test("Fetching users by name and job", async () => {
//   const userName = "Ted Lasso";
//   const userJob = "Soccer coach";
//   const users = await userServices.getUsers(userName, userJob);
//   expect(users).toBeDefined();
//   expect(users.length).toBeGreaterThan(0);
//   users.forEach(
//     (user) => expect(user.name).toBe(userName) && expect(user.job).toBe(userJob)
//   );
// });

test("Fetching by invalid id format", async () => {
  const anyId = "123";
  const user = await userServices.findUserById(anyId);
  expect(user).toBeUndefined();
});

test("Fetching by valid id and not finding", async () => {
  const anyId = "6132b9d47cefd0cc1916b6a9";
  const user = await userServices.findUserById(anyId);
  expect(user).toBeNull();
});

test("Fetching by valid id and finding", async () => {
  const dummyUser = {
    name: "Harry Potter",
    job: "Young wizard",
  };
  const result = new userModel(dummyUser);
  const addedUser = await result.save();
  const foundUser = await userServices.findUserById(addedUser.id);
  expect(foundUser).toBeDefined();
  expect(foundUser.id).toBe(addedUser.id);
  expect(foundUser.name).toBe(addedUser.name);
  expect(foundUser.job).toBe(addedUser.job);
});

test("Deleting a user by Id -- successful path", async () => {
  const dummyUser = {
    name: "Harry Potter",
    job: "Young wizard",
  };
  const result = new userModel(dummyUser);
  const addedUser = await result.save();
  const deleteResult = await userModel.findOneAndDelete({ _id: addedUser.id });
  expect(deleteResult).toBeTruthy();
});

test("Deleting a user by Id -- inexisting id", async () => {
  const anyId = "6132b9d47cefd0cc1916b6a9";
  const deleteResult = await userModel.findOneAndDelete({ _id: anyId });
  expect(deleteResult).toBeNull();
});

test("Adding user -- successful path", async () => {
  const dummyUser = {
    name: "Harry Potter",
    job: "Young wizard",
  };
  const result = await userServices.addUser(dummyUser);
  expect(result).toBeTruthy();
  expect(result.name).toBe(dummyUser.name);
  expect(result.job).toBe(dummyUser.job);
  expect(result).toHaveProperty("_id");
});

test("Adding user -- failure path with invalid id", async () => {
  const dummyUser = {
    _id: "123",
    name: "Harry Potter",
    job: "Young wizard",
  };
  const result = await userServices.addUser(dummyUser);
  expect(result).toBeFalsy();
});

test("Adding user -- failure path with already taken id", async () => {
  const dummyUser = {
    name: "Harry Potter",
    job: "Young wizard",
  };
  const addedUser = await userServices.addUser(dummyUser);

  const anotherDummyUser = {
    _id: addedUser.id,
    name: "Ron",
    job: "Young wizard",
  };
  const result = await userServices.addUser(anotherDummyUser);
  expect(result).toBeFalsy();
});

test("Adding user -- failure path with invalid job length", async () => {
  const dummyUser = {
    name: "Harry Potter",
    job: "Y",
  };
  const result = await userServices.addUser(dummyUser);
  expect(result).toBeFalsy();
});

test("Adding user -- failure path with no job", async () => {
  const dummyUser = {
    name: "Harry Potter",
  };
  const result = await userServices.addUser(dummyUser);
  expect(result).toBeFalsy();
});

test("Adding user -- failure path with no name", async () => {
  const dummyUser = {
    job: "Young wizard",
  };
  const result = await userServices.addUser(dummyUser);
  expect(result).toBeFalsy();
});

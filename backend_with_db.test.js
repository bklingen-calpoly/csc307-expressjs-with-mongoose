import userServices from "./models/user-services.js";
import UserSchema from "./models/user.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

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

  let newUser = userModel({
    name: "Joe",
    job: "Mailman",
  });
  await newUser.save(newUser);
  newUser = userModel({
    name: "Charlie",
    job: "Janitor",
  });
  await newUser.save(newUser);
  newUser = userModel({
    name: "Fred",
    job: "Professor",
  });
  await newUser.save(newUser);
  newUser = userModel({
    job: "Choir Director",
    name: "Shirley",
  });
  await newUser.save(newUser);
  newUser = userModel({
    name: "Mac",
    job: "Professor",
  });
  await newUser.save(newUser);
  newUser = userModel({
    name: "Dee",
    job: "Aspiring Actress",
  });
  await newUser.save(newUser);
  newUser = userModel({
    name: "Dennis",
    job: "Bartender",
  });
  await newUser.save(newUser);

  userServices.setDbConnection(conn);
});

afterAll(async () => {
  await conn.dropDatabase();
  await conn.close();
  await mongoServer.stop();
});

test("test getUsers - all", async () => {
  const result = await userServices.getUsers();

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Joe",
  //   name: "Mailman",
  // };

  // first user should be Joe the Mailman

  expect(result[0].name).toBe("Joe");
  expect(result[0].job).toBe("Mailman");
});

test("test getUsers byName  Charlie", async () => {
  const result = await userServices.getUsers("Charlie", null);

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Janitor",
  //   name: "Charlie",
  // };

  expect(result[0].name).toBe("Charlie");
  expect(result[0].job).toBe("Janitor");
});
test("test getUsers byJob Janitor", async () => {
  const result = await userServices.getUsers(null, "Janitor");

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Janitor",
  //   name: "Charlie",
  // };

  expect(result[0].name).toBe("Charlie");
  expect(result[0].job).toBe("Janitor");
});

test("test getUsers byName and byJob  Charlie, Janitor", async () => {
  const result = await userServices.getUsers("Charlie", "Janitor");

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Janitor",
  //   name: "Charlie",
  // };

  expect(result[0].name).toBe("Charlie");
  expect(result[0].job).toBe("Janitor");
});

test("test findUserById Joe Mailman", async () => {
  const getId = await userServices.getUsers("Joe", "Mailman");
  console.log("findUserById Id:", getId);
  const result = await userServices.findUserById(getId[0].id);
  // console.log("findUserById result: " + result);

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Janitor",
  //   name: "Charlie",
  // };

  expect(result.name).toBe("Joe");
  expect(result.job).toBe("Mailman");
});

test("test findUserById notfound", async () => {
  const result = await userServices.findUserById("111111111111111111111111");
  // console.log("findUserById result: " + result);

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Janitor",
  //   name: "Charlie",
  // };

  expect(result).toBe(null);
});

test("test addUser  Fred, Dancer", async () => {
  const user = { name: "Fred", job: "Dancer" };
  const add = await userServices.addUser(user);

  console.log("test addser: ", add);

  const result = await userServices.getUsers("Fred", "Dancer");

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Janitor",
  //   name: "Charlie",
  // };

  expect(result[0].name).toBe("Fred");
  expect(result[0].job).toBe("Dancer");
});

test("test deleteUser  Fred", async () => {
  const result = await userServices.getUsers("Fred", "Dancer");
  console.log("deleteUser result:" + result);
  const del = await userServices.deleteUser(result[0].id);

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Janitor",
  //   name: "Charlie",
  // };
  const after_result = await userServices.getUsers("Fred", "Dancer");

  expect(after_result).toEqual([]);
});
// afterAll(async () => {
//   await userServices.disconnectDB();
// });

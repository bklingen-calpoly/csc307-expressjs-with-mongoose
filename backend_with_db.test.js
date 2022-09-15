const userServices = require("./models/user-services");
// const mongoose = require("mongoose");
// const ObjectId = require("mongoose").Types.ObjectId;
test("test getUsers - all", async () => {
  let result = await userServices.getUsers();

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Mailman",
  //   name: "Joe",
  // };

  expect(result[0].name).toBe("Joe");
  expect(result[0].job).toBe("Mailman");
});

test("test getUsers byName  Joe", async () => {
  let result = await userServices.getUsers("Joe", null);

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Mailman",
  //   name: "Joe",
  // };

  expect(result[0].name).toBe("Joe");
  expect(result[0].job).toBe("Mailman");
});
test("test getUsers byJob  Mailman", async () => {
  let result = await userServices.getUsers(null, "Mailman");

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Mailman",
  //   name: "Joe",
  // };

  expect(result[0].name).toBe("Joe");
  expect(result[0].job).toBe("Mailman");
});

test("test getUsers byName and byJob  Joe, Mailman", async () => {
  let result = await userServices.getUsers("Joe", "Mailman");

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Mailman",
  //   name: "Joe",
  // };

  expect(result[0].name).toBe("Joe");
  expect(result[0].job).toBe("Mailman");
});

test("test findUserById Joe Mailman", async () => {
  let result = await userServices.findUserById("600f49555f2c7e977e0652c8");
  console.log("findUserById result: " + result);

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Mailman",
  //   name: "Joe",
  // };

  expect(result.name).toBe("Joe");
  expect(result.job).toBe("Mailman");
});

test("test findUserById notfound", async () => {
  let result = await userServices.findUserById("111111111111111111111111");
  console.log("findUserById result: " + result);

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Mailman",
  //   name: "Joe",
  // };

  expect(result).toBe(null);
});

test("test addUser  Fred, Dancer", async () => {
  user = { name: "Fred", job: "Dancer" };
  let add = await userServices.addUser(user);

  let result = await userServices.getUsers("Fred", "Dancer");

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Mailman",
  //   name: "Joe",
  // };

  expect(result[0].name).toBe("Fred");
  expect(result[0].job).toBe("Dancer");
});

test("test deleteUser  Fred", async () => {
  let result = await userServices.getUsers("Fred", "Dancer");
  console.log("deleteUser result:" + result);
  let del = await userServices.deleteUser(result[0].id);

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Mailman",
  //   name: "Joe",
  // };
  let after_result = await userServices.getUsers("Fred", "Dancer");

  expect(after_result).toEqual([]);
});
// afterAll(async () => {
//   await userServices.disconnectDB();
// });

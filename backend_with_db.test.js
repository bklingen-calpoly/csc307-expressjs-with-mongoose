import userServices from "./models/user-services.js";
import jest from "jest";

// const mongoose = require("mongoose");
// const ObjectId = require("mongoose").Types.ObjectId;

// beforeEach(() => {
//   jest.resetModules();
// });

test("test bad connection", async () => {
  process.env.MONGO_CLUSTER = "doesntexist";
  let result = await userServices.findUserByName("Joe");

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Mailman",
  //   name: "Joe",
  // };

  expect(result[0].name).toBe("Joe");
  expect(result[0].job).toBe("Mailman");
});

test("test db query user Joe", async () => {
  let result = await userServices.findUserByName("Joe");

  // expected = {
  //   _id: ObjectId("600f49555f2c7e977e0652c8"),
  //   job: "Mailman",
  //   name: "Joe",
  // };

  expect(result[0].name).toBe("Joe");
  expect(result[0].job).toBe("Mailman");
});

// afterAll(async () => {
//   await userServices.disconnectDB();
// });

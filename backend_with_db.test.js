const userServices = require("./models/user-services");
// const mongoose = require("mongoose");
// const ObjectId = require("mongoose").Types.ObjectId;

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

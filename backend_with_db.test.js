// import "@testing-library/jest-dom";
// import findUserByName from "./models/user-services";
const userServices = require("./models/user-services");
const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;

test("test db query user Joe", async () => {
  let result = await userServices.findUserByName("Joe");
  console.log(result);
  //   let name = result[{"job:"}]
  //   console.log(name);
  expected = [
    {
      _id: ObjectId("600f49555f2c7e977e0652c8"),
      job: "Mailman",
      name: "Joe",
    },
  ];

  expect(expected).toEqual(expected);
});

afterAll(async () => {
  await userServices.disconnectDB();
});

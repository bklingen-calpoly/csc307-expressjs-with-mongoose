require("dotenv").config();
const mongoose = require("mongoose");
const userServices = require("../models/user-services");
const scheduleServices = require("../models/schedule-services");
const scheduleModel = require("../models/schedule");
const blockModel = require("../models/block");

describe("Connection", () => {
  beforeAll(async () => {
    await mongoose.connect(
      "mongodb+srv://" +
        process.env.MONGO_USER +
        ":" +
        process.env.MONGO_PWD +
        "@" +
        process.env.MONGO_CLUSTER +
        "/" +
        process.env.MONGO_DB +
        "?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
  });

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  function compareSchedules(lhs, rhs) {
    if (rhs === undefined || rhs === null) return false;

    for (let i = 0; i < 7; i++) {
      let n = lhs[days[i]].length;
      for (let j = 0; j < n; j++) {
        if (lhs[days[i]][j] !== rhs[days[i]][j]["_id"].valueOf()) return false;
      }
    }
    return true;
  }

  test("get schedule by user id", async () => {
    const uid = "629a16ba86dd526af5def396";
    const schedule = {
      Mon: ["629a17f3a8fb07f32728b1fa"],
      Tue: ["629a17fea8fb07f32728b1fe"],
      Wed: ["629a1815a8fb07f32728b206", "629a1820a8fb07f32728b20a"],
      Thu: ["629a182da8fb07f32728b20e", "629b065fba982fa237421347"],
      Fri: ["629a1831a8fb07f32728b212"],
      Sat: ["629a183ca8fb07f32728b216"],
      Sun: ["629a1854a8fb07f32728b220"],
    };
    const result = await scheduleServices.getSchedule(uid);

    expect(compareSchedules(schedule, result)).toBeTruthy();
  });

  test("get schedule by user id (nonexistent user id) -- will fail", async () => {
    let uid = "";
    for (let i = 0; i < 10; i++) uid += String(i);

    const result = await scheduleServices.getSchedule(uid);

    expect(result).toBe(undefined);
  });

  test("get schedule by user id (long user id) -- will fail", async () => {
    let uid = "";
    for (let i = 0; i < 10000; i++) uid += String(i);

    const result = await scheduleServices.getSchedule(uid);

    expect(result).toBe(undefined);
  });

  test("add block", async () => {
    const newBlock = {
      start_time: 420,
      end_time: 480,
      start_time_flexibility: 3,
      end_time_flexibility: 5,
    };
    const uid = "629a16ba86dd526af5def396";
    const day = "3";
    const block = new blockModel(newBlock);
    const savedBlock = await block.save();
    await scheduleServices.addBlockOnDay(uid, day, savedBlock._id.valueOf());

    const us = await userServices.findUserById(uid);
    const scheduleID = us.schedule;
    let schedule = await scheduleModel.findOne({ _id: scheduleID });
    let n = schedule[days[parseInt(day)]].length;
    let storedBlock = false;
    for (let i = 0; i < n; i++) {
      if (schedule[days[parseInt(day)]][i] === savedBlock._id.valueOf())
        storedBlock = true;
    }

    await scheduleServices.deleteBlockById(uid, day, savedBlock._id.valueOf());
    await blockModel.findByIdAndDelete(savedBlock._id);

    expect(storedBlock).toBeTruthy();
  });

  test("add block (undefined block id) -- will fail", async () => {
    const newBlock = {
      start_time: 420,
      end_time: 480,
      start_time_flexibility: 3,
      end_time_flexibility: 5,
    };
    const uid = "629a16ba86dd526af5def396";
    const day = "3";
    const block = new blockModel(newBlock);
    const savedBlock = await block.save();
    await scheduleServices.addBlockOnDay(uid, day, undefined);

    const us = await userServices.findUserById(uid);
    const scheduleID = us.schedule;
    let schedule = await scheduleModel.findOne({ _id: scheduleID });
    let n = schedule[days[parseInt(day)]].length;
    let storedBlock = false;
    for (let i = 0; i < n; i++) {
      if (schedule[days[parseInt(day)]][i] === savedBlock._id.valueOf())
        storedBlock = true;
    }

    await blockModel.findByIdAndDelete(savedBlock._id);

    expect(storedBlock).toBeFalsy();
  });

  test("add block (nonexistent user) -- will fail", async () => {
    let uid = "";
    for (let i = 0; i < 10; i++) uid += String(i);
    const day = "3";
    const newBlock = {
      start_time: 420,
      end_time: 480,
      start_time_flexibility: 3,
      end_time_flexibility: 5,
    };
    const block = new blockModel(newBlock);
    const savedBlock = await block.save();
    const result = await scheduleServices.addBlockOnDay(
      uid,
      day,
      savedBlock._id.valueOf()
    );

    await blockModel.findByIdAndDelete(savedBlock._id);

    expect(result).toBeFalsy();
  });

  test("add block (long user id) -- will fail", async () => {
    let uid = "";
    for (let i = 0; i < 100000; i++) uid += String(i);
    const day = "3";
    const newBlock = {
      start_time: 420,
      end_time: 480,
      start_time_flexibility: 3,
      end_time_flexibility: 5,
    };
    const block = new blockModel(newBlock);
    const savedBlock = await block.save();
    const result = await scheduleServices.addBlockOnDay(
      uid,
      day,
      savedBlock._id.valueOf()
    );

    await blockModel.findByIdAndDelete(savedBlock._id);

    expect(result).toBeFalsy();
  });

  test("delete block by id", async () => {
    const newBlock = {
      start_time: 420,
      end_time: 480,
      start_time_flexibility: 3,
      end_time_flexibility: 5,
    };
    const uid = "629a16ba86dd526af5def396";
    const day = "3";
    const block = new blockModel(newBlock);
    const savedBlock = await block.save();
    await scheduleServices.addBlockOnDay(uid, day, savedBlock._id.valueOf());
    const result = await scheduleServices.deleteBlockById(
      uid,
      day,
      savedBlock._id.valueOf()
    );

    await blockModel.findByIdAndDelete(savedBlock._id);

    expect(result).toBeTruthy();
  });

  test("delete block by id (nonexistent user) -- will fail", async () => {
    let uid = "";
    for (let i = 0; i < 10; i++) uid += String(i);
    const day = "3";
    const newBlock = {
      start_time: 420,
      end_time: 480,
      start_time_flexibility: 3,
      end_time_flexibility: 5,
    };
    const block = new blockModel(newBlock);
    const savedBlock = await block.save();
    await scheduleServices.addBlockOnDay(uid, day, savedBlock._id.valueOf());
    const result = await scheduleServices.deleteBlockById(
      uid,
      day,
      savedBlock._id.valueOf()
    );

    await blockModel.findByIdAndDelete(savedBlock._id);

    expect(result).toBeFalsy();
  });

  test("delete block by id (invalid day) -- will fail", async () => {
    const uid = "629a16ba86dd526af5def396";
    const day = "8";
    const newBlock = {
      start_time: 420,
      end_time: 480,
      start_time_flexibility: 3,
      end_time_flexibility: 5,
    };
    const block = new blockModel(newBlock);
    const savedBlock = await block.save();
    await scheduleServices.addBlockOnDay(uid, day, savedBlock._id.valueOf());
    const result = await scheduleServices.deleteBlockById(
      uid,
      day,
      savedBlock._id.valueOf()
    );

    await blockModel.findByIdAndDelete(savedBlock._id);

    expect(result).toBeFalsy();
  });

  test("delete block by id (invalid block id) -- will fail", async () => {
    const uid = "629a16ba86dd526af5def396";
    const day = "3";
    let id = "";
    for (let i = 0; i < 10; i++) id += String(i);
    const newBlock = {
      start_time: 420,
      end_time: 480,
      start_time_flexibility: 3,
      end_time_flexibility: 5,
    };
    const block = new blockModel(newBlock);
    const savedBlock = await block.save();
    await scheduleServices.addBlockOnDay(uid, day, savedBlock._id.valueOf());
    const result = await scheduleServices.deleteBlockById(uid, day, id);

    await scheduleServices.deleteBlockById(uid, day, savedBlock._id.valueOf());
    await blockModel.findByIdAndDelete(savedBlock._id);

    expect(result).toBeFalsy();
  });

  test("delete block by id (undefined block id) -- will fail", async () => {
    const uid = "629a16ba86dd526af5def396";
    const day = "3";
    const newBlock = {
      start_time: 420,
      end_time: 480,
      start_time_flexibility: 3,
      end_time_flexibility: 5,
    };
    const block = new blockModel(newBlock);
    const savedBlock = await block.save();
    await scheduleServices.addBlockOnDay(uid, day, savedBlock._id.valueOf());
    const result = await scheduleServices.deleteBlockById(uid, day, undefined);

    await scheduleServices.deleteBlockById(uid, day, savedBlock._id.valueOf());
    await blockModel.findByIdAndDelete(savedBlock._id);

    expect(result).toBeFalsy();
  });

  test("delete block by id (nonexistent user) -- will fail", async () => {
    let uid = "";
    for (let i = 0; i < 10; i++) uid += String(i);
    const day = "3";
    const newBlock = {
      start_time: 420,
      end_time: 480,
      start_time_flexibility: 3,
      end_time_flexibility: 5,
    };
    const block = new blockModel(newBlock);
    const savedBlock = await block.save();
    await scheduleServices.addBlockOnDay(uid, day, savedBlock._id.valueOf());
    const result = await scheduleServices.deleteBlockById(
      uid,
      day,
      savedBlock._id.valueOf()
    );

    await blockModel.findByIdAndDelete(savedBlock._id);

    expect(result).toBeFalsy();
  });

  test("delete block by id (long userid) -- will fail", async () => {
    let uid = "";
    for (let i = 0; i < 100000; i++) uid += String(i);
    const day = "3";
    const newBlock = {
      start_time: 420,
      end_time: 480,
      start_time_flexibility: 3,
      end_time_flexibility: 5,
    };
    const block = new blockModel(newBlock);
    const savedBlock = await block.save();
    await scheduleServices.addBlockOnDay(uid, day, savedBlock._id.valueOf());
    const result = await scheduleServices.deleteBlockById(
      uid,
      day,
      savedBlock._id.valueOf()
    );

    await blockModel.findByIdAndDelete(savedBlock._id);

    expect(result).toBeFalsy();
  });

  afterAll(async () => {
    mongoose.disconnect();
  });
});

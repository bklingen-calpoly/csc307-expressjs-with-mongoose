const express = require("express");
const mongoose = require("mongoose");

// Add mongdb user services
const userServices = require("./models/user-services");

const app = express();
const port = 5000;

app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/users", {
    useNewUrlParser: true, //useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users", async (req, res) => {
  //res.send(users); //HTTP code 200 is set by default. See an alternative below
  //res.status(200).send(users);
  const name = req.query["name"];
  const job = req.query["job"];
  if (name === undefined && job === undefined) {
    try {
      const users_from_db = await userModel.find();
      res.send({ users_list: users_from_db });
    } catch (error) {
      res.status(500).send("An error ocurred in the server.");
    }
  } else if (name && job === undefined) {
    let result = await findUserByName(name);
    result = { users_list: result };
    res.send(result);
  } else if (job && name === undefined) {
    let result = await findUserByJob(job);
    result = { users_list: result };
    res.send(result);
  } else {
    let result = await findUserByNameAndJob(name, job);
    result = { users_list: result };
    res.send(result);
  }
});

async function findUserByName(name) {
  return await userModel.find({ name: name });
}

async function findUserByJob(job) {
  return await userModel.find({ job: job });
}

async function findUserByNameAndJob(name, job) {
  return await userModel.find({ name: name, job: job });
}

app.get("/users/:id", async (req, res) => {
  const id = req.params["id"];
  let result = await findUserById(id);
  if (result === undefined || result === null)
    res.status(404).send("Resource not found.");
  else {
    result = { users_list: result };
    res.send(result);
  }
});

async function findUserById(id) {
  try {
    return await userModel.findById(id);
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

app.delete("/users/:id", async (req, res) => {
  const id = req.params["id"];
  if (deleteUserById(id)) res.status(204).end();
  else res.status(404).send("Resource not found.");
});

async function deleteUserById(id) {
  try {
    if (await userModel.findByIdAndDelete(id)) return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

app.post("/users", async (req, res) => {
  const user = req.body;
  if (await addUser(user)) res.status(201).end();
  else res.status(500).end();
});

async function addUser(user) {
  try {
    const userToAdd = new userModel(user);
    if (await userToAdd.save()) return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

app.patch("/users/:id", async (req, res) => {
  const id = req.params["id"];
  const updatedUser = req.body;
  const result = await updateUser(id, updatedUser);
  if (result === 204) res.status(204).end();
  else if (result === 404) res.status(404).send("Resource not found.");
  else if (result === 500)
    res.status(500).send("An error ocurred in the server.");
});

async function updateUser(id, updatedUser) {
  try {
    const result = await userModel.findByIdAndUpdate(id, updatedUser);
    if (result) return 204;
    else return 404;
  } catch (error) {
    console.log(error);
    return 500;
  }
}

app.listen(process.env.PORT || port, () => {
  if (process.env.PORT)
    console.log(`REST API is listening on port: ${process.env.PORT}.`);
  else console.log(`REST API is listening on port: ${port}.`);
});

const express = require("express");
const mongoose = require("mongoose");

// Add mongdb user services
const userServices = require("./models/user-services");

const app = express();
const port = 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users", async (req, res) => {
  //res.send(users); //HTTP code 200 is set by default. See an alternative below
  //res.status(200).send(users);
  const name = req.query["name"];
  const job = req.query["job"];
  try {
    const result = await userServices.getUsers(name, job);
    res.send({ users_list: result });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error ocurred in the server.");
  }
});

app.get("/users/:id", async (req, res) => {
  const id = req.params["id"];
  let result = await userServices.findUserById(id);
  if (result === undefined || result === null)
    res.status(404).send("Resource not found.");
  else {
    result = { users_list: result };
    res.send(result);
  }
});

app.delete("/users/:id", async (req, res) => {
  const id = req.params["id"];
  if (deleteUserById(id)) res.status(204).end();
  else res.status(404).send("Resource not found.");
});

async function deleteUserById(id) {
  try {
    if (await userServices.findByIdAndDelete(id)) return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
app.post("/users", async (req, res) => {
  const user = req.body;
  const savedUser = await userServices.addUser(user);
  if (savedUser) res.status(201).send(savedUser);
  else res.status(500).end();
});

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
    const result = await userServices.findByIdAndUpdate(id, updatedUser);
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

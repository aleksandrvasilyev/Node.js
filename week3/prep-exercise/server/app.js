import express from "express";
import bcrypt from "bcrypt";
import { findUserById, findUserByUsername, storeUser } from "./users.js";
import jwt from "jsonwebtoken";

let app = express();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "randomString";
app.use(express.json());

// Serve the front-end application from the `client` folder
app.use(express.static("client"));

app.post("/auth/register", (req, res) => register(req, res));
app.post("/auth/login", (req, res) => login(req, res));
app.get("/auth/profile", (req, res) => profile(req, res));
app.post("/auth/logout", (req, res) => logout(req, res));

const register = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.status(400).send({ message: "Username and password required!" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = storeUser(username, hashedPassword);

  res.send({ id: user.id, username: user.username });
};

const login = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.status(400).send({ message: "Username and password required!" });
    return;
  }

  const user = findUserByUsername(username);
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    res.status(400).send({ message: "Invalid credentials!" });
    return;
  }

  const token = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET);
  res.status(201).send({ token });
};

const profile = (req, res) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).send({ message: "JWT token is required!" });
    return;
  }

  try {
    const token = authorization.split(" ")[1];
    const verifiedUser = jwt.verify(token, ACCESS_TOKEN_SECRET);

    if (!verifiedUser) {
      throw new Error();
    }

    const user = findUserById(verifiedUser.id);
    res.send({ message: user.username });
  } catch (error) {
    res.status(401).send({ message: "Invalid credentials!" });
    return;
  }
};

const logout = (req, res) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).send({ message: "JWT token is required!" });
    return;
  }

  try {
    const token = authorization.split(" ")[1];
    const verifiedUser = jwt.verify(token, ACCESS_TOKEN_SECRET);

    if (!verifiedUser) {
      throw new Error();
    }

    const user = findUserById(verifiedUser.id);
    res.status(204).end();
  } catch (error) {
    res.status(401).send({ message: "Invalid credentials!" });
    return;
  }
};

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

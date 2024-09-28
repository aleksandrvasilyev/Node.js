const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

const postsFolder = "./posts/";

if (!fs.existsSync(postsFolder)) {
  fs.mkdirSync(postsFolder);
}

app.post("/blogs", (req, res) => {
  const title = req.body.title;
  const content = req.body.content;

  fs.writeFileSync(postsFolder + title, content);
  res.end("ok");
});

app.put("/posts/:title", (req, res) => {
  const titleBody = req.body.title;
  const contentBody = req.body.content;
  const title = req.params.title;

  if (!titleBody || !contentBody) {
    return res.status(500).end(`title and content are required.`);
  }

  if (fs.existsSync(postsFolder + title)) {
    fs.unlinkSync(postsFolder + title);
    fs.writeFileSync(postsFolder + titleBody, contentBody);
    res.end("ok");
  } else {
    return res.status(404).end(`Post ${title} does not exist.`);
  }
});

app.delete("/posts/:title", (req, res) => {
  const title = req.params.title;

  if (fs.existsSync(postsFolder + title)) {
    fs.unlinkSync(postsFolder + title);
    res.end("ok");
  } else {
    return res.status(404).end(`Post ${title} does not exist.`);
  }
});

app.get("/blogs/:title", (req, res) => {
  const title = req.params.title;
  if (fs.existsSync(postsFolder + title)) {
    const post = fs.readFileSync(postsFolder + title);
    res.send(post);
  } else {
    return res.status(404).end(`Post ${title} does not exist.`);
  }
});

app.get("/blogs", (req, res) => {
  const posts = fs.readdirSync(postsFolder);
  const result = posts.map((post) => {
    return { title: post };
  });
  res.send(result);
});

app.listen(3000);

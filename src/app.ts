import express from "express";
import { default as ioredis } from "ioredis";
import session from "express-session";
import connect_redis from "connect-redis";

const redis_store = connect_redis(session);
const ioRedis = new ioredis();
ioRedis.on("connect", () => {
  console.log("Redis server is running");
});
const app = express();
app.use(express.json());

app.use(
  session({
    store: new redis_store({ client: ioRedis }),
    secret: "xyz",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
  })
);
app.get("/:key", async (req, res) => {
  try {
    const data = await ioRedis.hgetall(req.params.key);
    return res.status(200).json(data);
  } catch (error) {
    return res.json(error);
  }
});

app.post("/:key", async (req, res) => {
  try {
    const response = await ioRedis.hmset(req.params.key, req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.json(error);
  }
});

app.listen("7000", () => console.log("Running on port 7000"));

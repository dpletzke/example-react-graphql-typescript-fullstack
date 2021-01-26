import "reflect-metadata";
import express from "express";
import { MikroORM } from "@mikro-orm/core";

import microConfig from "./mikro-orm.config";

import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
// import { Post } from "./entities/Post";

import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { __prod__ } from "./constants";

import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  orm.getMigrator().up(); //auto-run migrations

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  // order that you add middle ware is the order that they will run
  // session middle ware will run inside of apollo so it needs to come first

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // ten years
        httpOnly: true,
        sameSite: "lax", //csrf
        secure: __prod__, //cookie only works in https
      },
      saveUninitialized: false,
      // TODO: make environment variable
      secret: "HTF%$^TYUGvjfy454TYFV",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    //provides this to all resolvers
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server is listening on port 4000");
  });
  // const post = orm.em.create(Post, {title: 'My first Post'})
  // await orm.em.persistAndFlush(post);
  // const posts = await orm.em.find(Post, {});
  // console.log(posts);
};

main().catch((err) => {
  console.error(err);
});

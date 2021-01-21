import express from "express";
import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";

import microConfig from "./mikro-orm.config";

import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
// import { Post } from "./entities/Post";

import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { __prod__ } from "./constants";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  orm.getMigrator().up(); //auto-run migrations

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    //provides this to all resolvers
    context: () => ({ em: orm.em }),
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

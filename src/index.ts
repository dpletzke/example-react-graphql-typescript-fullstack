import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from './constants';
import { Post } from "./entities/Post";

const main = async () => {
  const orm = await MikroORM.init({
    entities: [Post],
    dbName: 'lireddit',
    type: 'postgresql',
    user: 'postgres',
    password: 'postgres',
    debug: !__prod__
  });

  const post = orm.em.create(Post, {title: 'My first Post'})
  await orm.em.persistAndFlush(post);
}

main();
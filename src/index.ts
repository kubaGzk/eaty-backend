import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers/index';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { makeExecutableSchema } from 'graphql-tools';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;
const schema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: resolvers,
});

const app = express();
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  }),
);

const ws = createServer(app);

mongoose
  .connect(process.env.MONGODB! as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB Connected');
    //eslint-disable-next-line no-undef
    return ws.listen(PORT, () => {
      new SubscriptionServer(
        { execute, subscribe, schema },
        { server: ws, path: '/subscriptions' },
      );
    });
  })
  .then(() => {
    console.log(`Server running at port ${PORT}`);
  })
  .catch((err) => console.log(err));

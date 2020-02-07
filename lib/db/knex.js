const Knex = require("knex");
const process = require("process");

const connect = () => {
  const config = {
    user: process.env.DB_USER, // e.g. 'my-user'
    password: process.env.DB_PASS, // e.g. 'my-user-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
  };

  if (process.env.NODE_ENV === 'production') {
    config.host = `/cloudsql/${process.env.CLOUD_SQL_INSTANCE_NAME}`;
  }

  const knex = Knex({
    client: "pg",
    connection: config,
  });
  knex.client.pool.max = 5;
  knex.client.pool.min = 5;
  knex.client.pool.createTimeoutMillis = 30000; // 30 seconds
  knex.client.pool.idleTimeoutMillis = 600000; // 10 minutes
  knex.client.pool.createRetryIntervalMillis = 200; // 0.2 seconds
  knex.client.pool.acquireTimeoutMillis = 600000; // 10 minutes
  return knex;
};

module.exports = {
  connect:connect,
};

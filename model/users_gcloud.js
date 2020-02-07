const knex = require("../lib/db/knex.js");
const hash = require("../lib/security/hash.js").digest;

const getUserPK = async (knex, pk_value) => {
  return await knex
    .select("*")
    .from("users")
    .where("name", pk_value)
    .limit(1);
};
const createUser = async (knex, name, password, role) => {
  return await knex("users")
    .insert({
      name: name,
      password: hash(password),
      role: role,
    });
};

const updateUser = async (knex, name, password, role) => {
  return await knex("users")
    .where("name", name)
    .update({
      password: hash(password),
      role: role,
    });
};

const deleteUser = async (knex, name) => {
  return await knex("users")
    .where("name", name)
    .del();
}

// ■ find
const find = ((user_name, callback) => {
  const client = knex.connect();
  user = getUserPK(client, user_name);
  callback(null, user);
});

const create = ((user_name, password, role, callback) => {
  const client = knex.connect();
  user = createUser(client, user_name, password, role);
  callback(null, user);
});

const update = ((user_name, password, role, callback) => {
  const client = knex.connect();
  user = updateUser(client, user_name, password, role);
  callback(null, user);
});

const remove = ((user_name) => {
  const client = knex.connect();
  user = deleteUser(client, user_name);
  callback(null, user);
});

module.exports = {
  find: find,
  create: create,
  update: update,
  remove: remove,
};


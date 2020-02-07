const MAX_ITEMS_PER_PAGE = 5
const knex = require("../lib/db/knex.js");

const getKeihiPK = async (knex, id) => {
  return await knex
    .select("*")
    .from("keihi")
    .where("id_keihi", id)
};

const getKeihiAll = async knex => {
  return await knex
    .select("*")
    .from("keihi")
    .orderBy([{ column: "ym_seisan", order: "desc" }, { column: "name_shiharai", order: "asc" }, { column: "name_uketori", order: "asc" }])
};

const getKeihiLikeCount = async (knex, name, text, includeComplete) => {
  const regexp = new RegExp(/^[0-9]+(\.[0-9]+)?$/);
  const keihiQueryBuilder = knex("keihi").andWhere(function () {
    this.where("name_shiharai", "like", `%${name}%`).orWhere("name_uketori", "like", `%${name}%`)
  });
  if (!includeComplete) {
    keihiQueryBuilder.andWhere(function () {
      this.where("ymd_shiharai", null).orWhere("ymd_uketori", null)
    })
  }
  if (text) {
    keihiQueryBuilder.andWhere(function () {
      this.where("name_shiharai", "like", `%${text}%`).orWhere("name_uketori", "like", `%${text}%`)
    })
  }
  if (regexp.test(text)) {
    keihiQueryBuilder.orWhere("ym_seisan", text)
  }
  return keihiQueryBuilder.count("ym_seisan");
};

const getKeihiLike = async (knex, name, text, includeComplete, limitcount, offsetcount) => {
  const regexp = new RegExp(/^[0-9]+(\.[0-9]+)?$/);
  const keihiQueryBuilder = knex.select("*").from("keihi")
  if (!includeComplete) {
    keihiQueryBuilder.andWhere(function () {
      this.where("ymd_shiharai", null).orWhere("ymd_uketori", null)
    })
  }
  if (name) {
    keihiQueryBuilder.andWhere(function () {
      this.where("name_shiharai", "like", `%${name}%`).orWhere("name_uketori", "like", `%${name}%`)
    })
  }
  if (text) {
    keihiQueryBuilder.andWhere(function () {
      this.where("name_shiharai", "like", `%${text}%`).orWhere("name_uketori", "like", `%${text}%`)
    })
  }
  if (regexp.test(text)) {
    keihiQueryBuilder.orWhere("ym_seisan", text)
  }
  return keihiQueryBuilder.orderBy([{ column: "ym_seisan", order: "desc" }, { column: "name_shiharai", order: "asc" }, { column: "name_uketori", order: "asc" }])
    .limit(limitcount)
    .offset(offsetcount);
};

const createKeihi = async (knex, ym_seisan, name_shiharai, name_uketori) => {
  return await knex("keihi")
    .insert({
      ym_seisan: ym_seisan,
      name_shiharai: name_shiharai,
      name_uketori: name_uketori,
    });
};

const updateKeihi = async (knex, id_keihi, ym_seisan, name_shiharai, ymd_shiharai, name_uketori, ymd_uketori) => {
  return await knex("keihi")
    .where("id_keihi", id_keihi)
    .update({
      ym_seisan: ym_seisan,
      name_shiharai: name_shiharai,
      ymd_shiharai: ymd_shiharai,
      name_uketori: name_uketori,
      ymd_uketori: ymd_uketori,
    });
};

const updateKeihiShiharai = async (knex, id_keihi, ymd_shiharai) => {
  const keihiQueryBuilder = knex("keihi").where("id_keihi", id_keihi);
  if (ymd_shiharai) {
    keihiQueryBuilder.update({
      ymd_shiharai: ymd_shiharai,
    });
  } else {
    keihiQueryBuilder.update({
      ymd_shiharai: null,
    });
  }
  return keihiQueryBuilder;
};

const updateKeihiUketori = async (knex, id_keihi, ymd_uketori) => {
  const keihiQueryBuilder = knex("keihi").where("id_keihi", id_keihi);
  if (ymd_uketori) {
    keihiQueryBuilder.update({
      ymd_uketori: ymd_uketori,
    });
  } else {
    keihiQueryBuilder.update({
      ymd_uketori: null,
    });
  }
  return keihiQueryBuilder;
};

const deleteKeihi = async (knex, id_keihi) => {
  return await knex("keihi")
    .where("id_keihi", id_keihi)
    .del();
}

// ■ find
const find = ((id_keihi, callback) => {
  (async function () {
    const client = knex.connect();
    if (id_keihi) {
      let result;
      result = await getKeihiPK(client, Number(id_keihi));
      callback(null, result);
    } else {
      callback(new Error("invalid id"), null);
    }
  })();
});

// ■ findAll
const findAll = ((callback) => {
  (async function () {
    const client = knex.connect();
    let result;
    result = await getKeihiAll(client);
    callback(null, result);
  })();
});

// ■ findAllForList
const findAllForList = ((user, query_page, query_value, query_incComp, callback) => {
  (async function () {
    const client = knex.connect();
    let retObj;
    const page = query_page ? parseInt(query_page) : 1;
    const offset = (page - 1) * MAX_ITEMS_PER_PAGE;
    let search_name;
    if (user.role === 'admin') {
      search_name = '';
    } else {
      search_name = user.name;
    };
    let keihis;
    let keihiscount;
    keihis = await getKeihiLike(client, search_name, query_value, query_incComp, MAX_ITEMS_PER_PAGE, offset);
    keihiscount = await getKeihiLikeCount(client, search_name, query_value, query_incComp);
    retObj = {
      count: keihiscount[0].count, // 検索対象となっている全体件数
      value: query_value,  // 検索文字列
      keihis: keihis, // 一覧情報
      incComp: query_incComp, //完了を含む
      pagenation: {
        max: Math.ceil(keihiscount[0].count / MAX_ITEMS_PER_PAGE), // 最大ページ数
        current: page, // 現在のページ数
      },
      user: user,
    }
    callback(null, retObj);
  })();
});

// ■ create
const create = ((ym_seisan, name_shiharai, name_uketori, callback) => {
  const client = knex.connect();
  if (name_shiharai) {
    createKeihi(client, Number(ym_seisan), name_shiharai, name_uketori)
      .then((keihi) => {
        callback(null, keihi)
      })
      .catch((error) => {
        callback(error, null)
      })
    //    callback(null, keihi);
  } else {
    callback(new Error("failed create keihi"), null);
  };
});

// ■ update
const update = ((id_keihi, ym_seisan, name_shiharai, ymd_shiharai, name_uketori, ymd_uketori, callback) => {
  const client = knex.connect();
  if ((id_keihi) && (ym_seisan) && (name_shiharai) && (name_uketori)) {
    let ymd_shiharai_chg;
    let ymd_uketori_chg;
    if ((ymd_shiharai) && (isNumber(ymd_shiharai))) {
      ymd_shiharai_chg = Number(ymd_shiharai);
    } else {
      ymd_shiharai_chg = null;
    }
    if ((ymd_uketori) && (isNumber(ymd_uketori))) {
      ymd_uketori_chg = Number(ymd_uketori);
    } else {
      ymd_uketori_chg = null;
    }
    updateKeihi(client, Number(id_keihi), ym_seisan, name_shiharai, ymd_shiharai_chg, name_uketori, ymd_uketori_chg)
      .then((keihi) => {
        callback(null, keihi);
      })
      .catch((error) => {
        callback(error, null);
      })
  } else {
    callback(new Error("failed update keihi"), null);
  }
});

// ■ remove
const remove = ((id_keihi, callback) => {
  const client = knex.connect();
  if (id_keihi) {
    const keihi = deleteKeihi(client, Number(id_keihi));
    callback(null, keihi);
  } else {
    callback(new Error("failed delete keihi"), null);
  }
});

// ■ shiharai
const shiharai = ((id_keihi, callback) => {
  const client = knex.connect();
  const date = new Date();
  const yyyy = date.getFullYear().toString();
  const mm = ("0" + (date.getMonth() + 1).toString()).slice(-2);
  const dd = ("0" + (date.getDay().toString()).slice(-2));
  if (id_keihi) {
    const keihi = updateKeihiShiharai(client, Number(id_keihi), Number(yyyy + mm + dd));
    callback(null, keihi);
  } else {
    callback(new Error("failed update keihi shiharai"), null);
  }
});

// ■ shiharai_torikeshi
const shiharai_torikeshi = ((id_keihi, callback) => {
  const client = knex.connect();
  if (id_keihi) {
    const keihi = updateKeihiShiharai(client, Number(id_keihi), null);
    callback(null, keihi);
  } else {
    callback(new Error("failed update keihi shiharai_torikeshi"), null);
  }
});

// ■ uketori
const uketori = ((id_keihi, callback) => {
  const client = knex.connect();
  const date = new Date();
  const yyyy = date.getFullYear().toString();
  const mm = ("0" + (date.getMonth() + 1).toString()).slice(-2);
  const dd = ("0" + (date.getDay().toString()).slice(-2));
  if (id_keihi) {
    const keihi = updateKeihiUketori(client, Number(id_keihi), Number(yyyy + mm + dd));
    callback(null, keihi);
  } else {
    callback(new Error("failed update keihi uketori"), null);
  }
});

// ■ uketori_torikeshi
const uketori_torikeshi = ((id_keihi, callback) => {
  const client = knex.connect();
  if (id_keihi) {
    const keihi = updateKeihiUketori(client, Number(id_keihi), null);
    callback(null, keihi);
  } else {
    callback(new Error("failed update keihi uketori_torikeshi"), null);
  }
});

const isNumber = ((value) => {
  const regexp = new RegExp(/^[0-9]+(\.[0-9]+)?$/);
  return regexp.test(value);
});

module.exports = {
  findAll: findAll,
  findAllForList: findAllForList,
  find: find,
  create: create,
  update: update,
  delete: remove,
  shiharai: shiharai,
  shiharai_torikeshi: shiharai_torikeshi,
  uketori: uketori,
  uketori_torikeshi: uketori_torikeshi,
};

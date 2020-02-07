const express = require("express");
const router = express.Router();
var accountcnotrol = require("../lib/security/accountcontrol.js");
const csrf = require("csrf");
const tokens = new csrf();

const keihi = require("../model/keihi_gcloud.js");

// ログイン
router.get("/login", (req, res) => {
  res.render("./login.ejs", { message: req.flash("message") });
});
router.post("/login", accountcnotrol.authenticate());

// ログアウト
router.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

//一覧
//
//page：現在のページ数
//value：検索文字列
router.get("/", accountcnotrol.authorize(), (req, res) => {
  if (req.isAuthenticated()) {
    keihi.findAllForList(req.user, req.query.page, req.query.value, req.query.incComp, (err, retObj) => {
      if (err) {
        throw err;
      }
      // token削除
      delete req.session._csrf;
      res.clearCookie("_csrf");
      res.render("index", retObj);
    });
  } else {
    res.redirect("/login");
  }
});

//一覧より登録画面を開く
//
//page：一覧での表示していたページ数
//q：一覧での検索文字列
router.get("/keihi/touroku", accountcnotrol.authorize(), (req, res) => {
  tokens.secret((error, secret) => {
    const token = tokens.create(secret);
    req.session._csrf = secret;
    res.cookie("_csrf", token);
    res.render("keihi_form", {
      mode: "create",
      q: req.query.q,
      page: req.query.page,
      incComp: req.query.incComp,
      keihi: {}
    });
  });
});

//一覧より精算画面を開く
//
//no：精算対象のid_keihi
//page：一覧での表示していたページ数
//q：一覧での検索文字列
router.get("/keihi/seisan", accountcnotrol.authorize(), (req, res) => {
  if (req.query.id_keihi) {
    keihi.find(req.query.id_keihi, (err, retObj) => {
      if (err) {
        throw err;
      }
      tokens.secret((error, secret) => {
        if (error) {
          throw Error("create token error");
        }
        const token = tokens.create(secret);
        req.session._csrf = secret;
        res.cookie("_csrf", token);
        res.render("keihi_form", {
          mode: "seisan",
          q: req.query.q,
          page: req.query.page,
          incComp: req.query.incComp,
          keihi: retObj[0],
        });
      });
    });
  } else {
    res.redirect("/");
  }
});

//一覧より更新画面を開く
//
//no：更新対象のid_keihi
//page：一覧での表示していたページ数
//q：一覧での検索文字列
router.get("/keihi/koushin", accountcnotrol.authorize(), (req, res) => {
  if (req.query.id_keihi) {
    keihi.find(req.query.id_keihi, (err, retObj) => {
      if (err) {
        throw err;
      }
      tokens.secret((error, secret) => {
        if (error) {
          throw Error("create token error");
        }
        const token = tokens.create(secret);
        req.session._csrf = secret;
        res.cookie("_csrf", token);
        res.render("keihi_form", {
          mode: "update",
          q: req.query.q,
          page: req.query.page,
          incComp: req.query.incComp,
          keihi: retObj[0],
        });
      });
    });
  } else {
    res.redirect("/");
  }
});

//一覧より削除画面を開く
//
//no：削除対象のid_keihi
//page：一覧での表示していたページ数
//q：一覧での検索文字列
router.get("/keihi/sakujyo", accountcnotrol.authorize(), (req, res) => {
  if (req.query.id_keihi) {
    keihi.find(req.query.id_keihi, (err, retObj) => {
      if (err) {
        throw err;
      }
      tokens.secret((error, secret) => {
        if (error) {
          throw Error("create token error");
        }
        const token = tokens.create(secret);
        req.session._csrf = secret;
        res.cookie("_csrf", token);
        res.render("keihi_form", {
          mode: "delete",
          q: req.query.q,
          page: req.query.page,
          incComp: req.query.incComp,
          keihi: retObj[0],
        });
      });
    });
  } else {
    res.redirect("/");
  }
});

// 登録
router.post("/keihi/create", accountcnotrol.authorize(), (req, res) => {
  const secret = req.session._csrf;
  const token = req.cookies._csrf;
  if (!tokens.verify(secret, token)) {
    throw Error("invalid token");
  }
  const errors = validateKeihi(req.body);
  if (errors) {
    res.render("keihi_form", {
      errors: errors,
      mode: "create",
      q: req.query.q,
      page: req.query.page,
      incComp: req.query.incComp,
      keihi: req.body,
    });
  } else {
    keihi.create(req.body.ym_seisan, req.body.name_shiharai, req.body.name_uketori, (err, retObj) => {
      if (err) {
        if (err.constraint === "keihi_uk") {
          res.render("keihi_form", {
            errors: { keihi: "すでに登録されています。" },
            mode: "create",
            q: req.query.q,
            page: req.query.page,
            incComp: req.query.incComp,
            keihi: req.body,
          });
        } else {
          throw err;
        }
      } else {
        delete req.session._csrf;
        res.clearCookie("_csrf");
        res.redirect("/keihi/kanryou");
      }
    });
  }
});

// 更新
router.post("/keihi/update", accountcnotrol.authorize(), (req, res) => {
  const secret = req.session._csrf;
  const token = req.cookies._csrf;
  if (!tokens.verify(secret, token)) {
    throw Error("invalid token");
  }
  const errors = validateKeihi(req.body);
  if (errors) {
    res.render("keihi_form", {
      errors: errors,
      mode: "update",
      q: req.query.q,
      page: req.query.page,
      incComp: req.query.incComp,
      keihi: req.body,
    });
  } else {
    keihi.update(req.body.id_keihi, req.body.ym_seisan, req.body.name_shiharai, req.body.ymd_shiharai, req.body.name_uketori, req.body.ymd_uketori, (err, retObj) => {
      if (err) {
        if (err.constraint === "keihi_uk") {
          res.render("keihi_form", {
            errors: { keihi: "すでに登録されています。" },
            mode: "update",
            q: req.query.q,
            page: req.query.page,
            incComp: req.query.incComp,
            keihi: req.body,
          });
        } else {
          throw err;
        }
      } else {
        delete req.session._csrf;
        res.clearCookie("_csrf");
        res.redirect("/keihi/kanryou");
      }
    });
  }
});

// 削除
router.post("/keihi/delete", accountcnotrol.authorize(), (req, res) => {
  const secret = req.session._csrf;
  const token = req.cookies._csrf;
  if (!tokens.verify(secret, token)) {
    throw Error("invalid token");
  }
  keihi.delete(req.body.id_keihi, (err, retObj) => {
    if (err) {
      throw err;
    }
    delete req.session._csrf;
    res.clearCookie("_csrf");
    res.redirect("/keihi/kanryou");
  });
});

// 支払
router.post("/keihi/shiharai", accountcnotrol.authorize(), (req, res) => {
  const secret = req.session._csrf;
  const token = req.cookies._csrf;
  if (!tokens.verify(secret, token)) {
    throw Error("invalid token");
  }
  keihi.shiharai(req.body.id_keihi, (err, retObj) => {
    if (err) {
      throw err;
    }
    delete req.session._csrf;
    res.clearCookie("_csrf");
    res.redirect("/keihi/kanryou");
  });
});

// 支払取消
router.post("/keihi/shiharai_torikeshi", accountcnotrol.authorize(), (req, res) => {
  const secret = req.session._csrf;
  const token = req.cookies._csrf;
  if (!tokens.verify(secret, token)) {
    throw Error("invalid token");
  }
  keihi.shiharai_torikeshi(req.body.id_keihi, (err, retObj) => {
    if (err) {
      throw err;
    }
    delete req.session._csrf;
    res.clearCookie("_csrf");
    res.redirect("/keihi/kanryou");
  });
});

// 受取
router.post("/keihi/uketori", accountcnotrol.authorize(), (req, res) => {
  const secret = req.session._csrf;
  const token = req.cookies._csrf;
  if (!tokens.verify(secret, token)) {
    throw Error("invalid token");
  }
  keihi.uketori(req.body.id_keihi, (err, retObj) => {
    if (err) {
      throw err;
    }
    delete req.session._csrf;
    res.clearCookie("_csrf");
    res.redirect("/keihi/kanryou");
  });
});

// 受取取消
router.post("/keihi/uketori_torikeshi", accountcnotrol.authorize(), (req, res) => {
  const secret = req.session._csrf;
  const token = req.cookies._csrf;
  if (!tokens.verify(secret, token)) {
    throw Error("invalid token");
  }
  keihi.uketori_torikeshi(req.body.id_keihi, (err, retObj) => {
    if (err) {
      throw err;
    }
    delete req.session._csrf;
    res.clearCookie("_csrf");
    res.redirect("/keihi/kanryou");
  });
});

// 完了
router.get("/keihi/kanryou", accountcnotrol.authorize(), (req, res) => {
  res.render("keihi_complete", {});
});

const validateKeihi = (body) => {
  let isOK = true;
  let errors = {};
  const regexp = new RegExp(/^[0-9]+(\.[0-9]+)?$/);
  if (!body.ym_seisan) {
    errors.ym_seisan = "精算年月日を入力してください";
    isOK = false;
  } else {
    if (!regexp.test(body.ym_seisan)) {
      errors.ym_seisan = "精算年月日はyyyyMM形式の半角数値を入力してください";
      isOK = false;
    }
  }
  if (!body.name_shiharai) {
    errors.name_shihari = "支払者名を入力してください"
    isOK = false;
  }
  if (!body.name_uketori) {
    errors.name_uketori = "受取者名を入力してください"
    isOK = false;
  }
  if ((body.ymd_shiharai) && (!regexp.test(body.ymd_shiharai))) {
    errors.ymd_shiharai = "支払日はyyyyMM形式の半角数値を入力してください";
    isOK = false;
  }
  if ((body.ymd_uketori) && (!regexp.test(body.ymd_uketori))) {
    errors.ymd_uketori = "受取日はyyyyMM形式の半角数値を入力してください";
    isOK = false;
  }
  return isOK ? undefined : errors;
}


module.exports = router;

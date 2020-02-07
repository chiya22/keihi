const users = require("../../model/users_gcloud");
const assert = require("assert");

describe("findAllのテスト", () => {
  it("findAllが関数であること", () => {
    assert.strict.equal(typeof users.findAll, "function");
  });
  it("findallですべてのユーザ一覧が返却されること", () => {
    users.findAll((err, retObj) => {
      if (err) {
        throw err;
      }
      assert.strict.equal(retObj.rows.length, 2);
    });
  });
  it("findが関数であること", () => {
    assert.strict.equal(typeof users.find, "function");
  });
  it("findで対象のユーザ情報が返却されること", () => {
    users.find("test1", (err, retObj) => {
      if (err) {
        throw err;
      }
      assert.strict.deepEqual(retObj, { name: "test1", password: "testpassword", role: "admin" });
    });
  });
  it("findで存在しないユーザを指定した場合、情報が返却されないこと", () => {
    users.find("test3", (err, retObj) => {
      if (err) {
        assert.strict.equal(retObj, null);
      }
    });
  });

});

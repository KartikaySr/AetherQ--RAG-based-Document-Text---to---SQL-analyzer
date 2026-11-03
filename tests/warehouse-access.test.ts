import assert from "node:assert/strict";
import test from "node:test";
import { canUseWarehouse, warehouseConnectionString } from "../src/lib/server/warehouse";

test("warehouse defaults to the verified owner and denies guests and other users", () => {
  const previous = process.env.ANALYTICS_ALLOWED_USER_IDS;
  try {
    delete process.env.ANALYTICS_ALLOWED_USER_IDS;
    const owner = { id: "296a78ed-7567-4985-8867-e1388b91c65e" };
    assert.equal(canUseWarehouse(owner), true);
    assert.equal(canUseWarehouse({ ...owner, is_anonymous: true }), false);
    assert.equal(canUseWarehouse({ id: "other-user" }), false);
    process.env.ANALYTICS_ALLOWED_USER_IDS = "";
    assert.equal(canUseWarehouse(owner), false);
    process.env.ANALYTICS_ALLOWED_USER_IDS = "different-owner";
    assert.equal(canUseWarehouse(owner), false);
    assert.equal(canUseWarehouse({ id: "different-owner" }), true);
  } finally {
    if (previous === undefined) delete process.env.ANALYTICS_ALLOWED_USER_IDS;
    else process.env.ANALYTICS_ALLOWED_USER_IDS = previous;
  }
});

test("warehouse prefers its dedicated connection and supports the existing database URL", () => {
  const analytics = process.env.ANALYTICS_DATABASE_URL;
  const database = process.env.DATABASE_URL;
  try {
    process.env.DATABASE_URL = "existing";
    delete process.env.ANALYTICS_DATABASE_URL;
    assert.equal(warehouseConnectionString(), "existing");
    process.env.ANALYTICS_DATABASE_URL = "dedicated";
    assert.equal(warehouseConnectionString(), "dedicated");
  } finally {
    if (analytics === undefined) delete process.env.ANALYTICS_DATABASE_URL;
    else process.env.ANALYTICS_DATABASE_URL = analytics;
    if (database === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = database;
  }
});

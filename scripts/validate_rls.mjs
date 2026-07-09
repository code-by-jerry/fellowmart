import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SR = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !ANON || !SR)
  throw new Error("Missing SUPABASE env vars in .env.local");

const admin = createClient(URL, SR);
const anon = createClient(URL, ANON);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function attemptInsertWithFallback(client, table, payloads) {
  for (const payload of payloads) {
    const res = await client.from(table).insert(payload).select().single();
    if (!res.error) {
      return { data: res.data, payload };
    }
    const message = res.error.message || "";
    if (
      message.includes("Could not find the 'customer_email' column") ||
      message.includes("Could not find the 'order_number' column") ||
      message.includes("Could not find the 'unit_price' column") ||
      message.includes("Could not find the 'product_variant_id' column") ||
      message.includes("Could not find the 'product_id' column") ||
      message.includes("Could not find the 'store_id' column") ||
      message.includes("Could not find the 'tenant_id' column")
    ) {
      continue;
    }
    return { error: res.error };
  }
  return { error: { message: `All fallback payloads failed for ${table}` } };
}

async function run() {
  console.log("Creating test users...");
  const emailA = `owner+${Date.now()}@example.com`;
  const emailB = `customer+${Date.now()}@example.com`;
  const pwd = "Test1234!";

  const { data: userA, error: eA } = await admin.auth.admin.createUser({
    email: emailA,
    password: pwd,
    email_confirm: true,
  });
  if (eA) throw eA;

  const { data: userB, error: eB } = await admin.auth.admin.createUser({
    email: emailB,
    password: pwd,
    email_confirm: true,
  });
  if (eB) throw eB;

  console.log("Created users:", userA.user.id, userB.user.id);

  console.log("Creating tenant, membership, and store...");
  const tenantRes = await admin
    .from("tenants")
    .insert({
      name: "rls-tenant-" + Date.now(),
      slug: "rls-tenant-" + Date.now(),
      owner_id: userA.user.id,
    })
    .select()
    .single();
  if (tenantRes.error) throw tenantRes.error;
  const tenant = tenantRes.data;

  await admin
    .from("tenant_memberships")
    .insert([{ tenant_id: tenant.id, user_id: userA.user.id, role: "owner" }]);

  const storeRes = await admin
    .from("stores")
    .insert({
      owner_id: userA.user.id,
      name: "rls-store-" + Date.now(),
      slug: "rls-store-" + Date.now(),
    })
    .select()
    .single();
  if (storeRes.error) throw storeRes.error;
  const store = storeRes.data;

  console.log("Inserting product as service_role...");
  const prod = await admin
    .from("products")
    .insert({
      store_id: store.id,
      tenant_id: tenant.id,
      name: "RLSTest Product",
      slug: "rls-test-product-" + Date.now(),
      sku: "RLSTEST-" + Date.now(),
      description: "seeded for RLS test",
      price: 10.0,
      is_active: true,
    })
    .select()
    .single();
  if (prod.error) throw prod.error;
  console.log("Product id:", prod.data.id);

  console.log("Inserting product variant as service_role...");
  const variantRes = await admin
    .from("product_variants")
    .insert({
      product_id: prod.data.id,
      sku: "RLSTESTVAR-" + Date.now(),
      name: "RLSTest Variant",
      price: 10.0,
    })
    .select()
    .single();
  if (variantRes.error) throw variantRes.error;
  const variant = variantRes.data;
  console.log("Product variant id:", variant.id);

  console.log("Signing in user A (owner)");
  const signA = await anon.auth.signInWithPassword({
    email: emailA,
    password: pwd,
  });
  if (signA.error) throw signA.error;
  const tokenA = signA.data.session.access_token;

  console.log("Signing in user B (customer)");
  const signB = await anon.auth.signInWithPassword({
    email: emailB,
    password: pwd,
  });
  if (signB.error) throw signB.error;
  const tokenB = signB.data.session.access_token;

  const userClientA = createClient(URL, ANON, {
    global: { headers: { Authorization: `Bearer ${tokenA}` } },
  });
  const userClientB = createClient(URL, ANON, {
    global: { headers: { Authorization: `Bearer ${tokenB}` } },
  });

  console.log(
    "User A selecting products for tenant (should succeed if policy allows owner read)",
  );
  const selA = await userClientA
    .from("products")
    .select("*")
    .eq("tenant_id", tenant.id);
  console.log(
    "userA select:",
    selA.error ? "ERROR " + selA.error.message : selA.data.length + " rows",
  );

  console.log(
    "User B selecting products for tenant (may be allowed or denied depending on policy)",
  );
  const selB = await userClientB
    .from("products")
    .select("*")
    .eq("tenant_id", tenant.id);
  console.log(
    "userB select:",
    selB.error ? "ERROR " + selB.error.message : selB.data.length + " rows",
  );

  console.log("User A creating own cart and cart item...");
  const cartRes = await userClientA
    .from("carts")
    .insert({
      tenant_id: tenant.id,
      user_id: userA.user.id,
    })
    .select()
    .single();
  if (cartRes.error) throw cartRes.error;
  const cart = cartRes.data;
  console.log("Cart id:", cart.id);

  const cartItemRes = await userClientA
    .from("cart_items")
    .insert({
      cart_id: cart.id,
      product_variant_id: variant.id,
      quantity: 1,
    })
    .select()
    .single();
  console.log(
    "userA cart item insert:",
    cartItemRes.error ? "ERROR " + cartItemRes.error.message : "OK",
  );

  console.log(
    "User B attempting to add item to User A cart (should be denied)",
  );
  const cartItemFail = await userClientB.from("cart_items").insert({
    cart_id: cart.id,
    product_variant_id: variant.id,
    quantity: 1,
  });
  console.log(
    "userB cart item insert:",
    cartItemFail.error ? "ERROR " + cartItemFail.error.message : "OK",
  );

  console.log("User B creating order for tenant (may be blocked by live RLS)");
  const orderPayloads = [
    {
      store_id: store.id,
      tenant_id: tenant.id,
      customer_name: "Customer B",
      customer_contact: emailB,
      status: "pending",
      total_amount: 20.0,
    },
  ];
  const orderRes = await attemptInsertWithFallback(
    userClientB,
    "orders",
    orderPayloads,
  );
  let order = null;
  if (orderRes.error) {
    console.log("userB order insert:", "ERROR " + orderRes.error.message);
  } else {
    order = orderRes.data;
    console.log("Order id:", order.id);

    const orderItemPayloads = [
      {
        order_id: order.id,
        product_id: prod.data.id,
        quantity: 1,
        price: prod.data.price ?? 20.0,
      },
    ];
    const orderItemRes = await attemptInsertWithFallback(
      userClientB,
      "order_items",
      orderItemPayloads,
    );
    console.log(
      "userB order item insert:",
      orderItemRes.error ? "ERROR " + orderItemRes.error.message : "OK",
    );
  }

  console.log("User A selecting orders for tenant (should succeed)");
  const orderSelA = await userClientA
    .from("orders")
    .select("*")
    .eq("tenant_id", tenant.id);
  console.log(
    "userA order select:",
    orderSelA.error
      ? "ERROR " + orderSelA.error.message
      : orderSelA.data.length + " rows",
  );

  console.log("User A selecting order items for tenant (should succeed)");
  const orderItemsSelA = await userClientA.from("order_items").select("*");
  console.log(
    "userA order_items select:",
    orderItemsSelA.error
      ? "ERROR " + orderItemsSelA.error.message
      : orderItemsSelA.data.length + " rows",
  );

  if (order) {
    console.log(
      "User B selecting own order by order id (should succeed if insert succeeded)",
    );
    const orderSelB = await userClientB
      .from("orders")
      .select("*")
      .eq("id", order.id);
    console.log(
      "userB order select:",
      orderSelB.error
        ? "ERROR " + orderSelB.error.message
        : orderSelB.data.length + " rows",
    );
  } else {
    console.log(
      "Skipping userB own order query because order creation failed or was blocked.",
    );
  }

  console.log("User B selecting order items (should be denied by RLS)");
  const orderItemsSelB = await userClientB.from("order_items").select("*");
  console.log(
    "userB order_items select:",
    orderItemsSelB.error
      ? "ERROR " + orderItemsSelB.error.message
      : orderItemsSelB.data.length + " rows",
  );

  if (order) {
    console.log(
      "User A selecting order items for created order (should succeed)",
    );
    const orderItemsSelAByOrder = await userClientA
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    console.log(
      "userA order_items select by order:",
      orderItemsSelAByOrder.error
        ? "ERROR " + orderItemsSelAByOrder.error.message
        : orderItemsSelAByOrder.data.length + " rows",
    );
  }

  console.log("User B attempting to create product (should be denied)");
  const insB = await userClientB.from("products").insert({
    tenant_id: tenant.id,
    store_id: store.id,
    name: "Should fail",
    slug: "should-fail-" + Date.now(),
    sku: "SHOULDFAIL-" + Date.now(),
    price: 5.0,
  });
  console.log(
    "userB insert:",
    insB.error ? "ERROR " + insB.error.message : "OK",
  );

  console.log(
    "User A attempting to create product (should succeed if owner allowed)",
  );
  const insA = await userClientA.from("products").insert({
    tenant_id: tenant.id,
    store_id: store.id,
    name: "Owner created product",
    slug: "owner-created-product-" + Date.now(),
    sku: "OWNERCREATED-" + Date.now(),
    price: 15.0,
  });
  console.log(
    "userA insert:",
    insA.error ? "ERROR " + insA.error.message : "OK",
  );

  console.log("Done");
}

run().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});

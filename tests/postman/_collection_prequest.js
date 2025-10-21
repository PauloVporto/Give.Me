// Headers padrão
pm.request.headers.upsert({ key: "Accept", value: "application/json" });
if (["POST","PUT","PATCH"].includes(pm.request.method)) {
  pm.request.headers.upsert({ key: "Content-Type", value: "application/json" });
}

// Utils
function pathOf(){ try{ return pm.request.url.toString().replace(/^https?:\/\/[^/]+/i,""); } catch(e){ return ""; } }
function hasBody(){ return !!(pm.request.body && pm.request.body.mode==="raw" && (pm.request.body.raw||"").trim().length); }
const path = pathOf();

// Tokens salvos
const access  = pm.collectionVariables.get("access");
const refresh = pm.collectionVariables.get("refresh");

// Rotas do seu urls.py
const R = {
  register:      /^\/?api\/users\/register\/?$/i.test(path),
  login:         /^\/?api\/users\/login\/?$/i.test(path),
  tokenRefresh:  /^\/?api\/token\/refresh\/?$/i.test(path),
  itemsList:     /^\/?api\/items\/?$/i.test(path),
  itemDetail:    /^\/?api\/items\/\d+\/?$/i.test(path),
  itemUpdate:    /^\/?api\/item\/update\/\d+\/?$/i.test(path),
  itemDelete:    /^\/?api\/items\/delete\/\d+\/?$/i.test(path),
};

// Auth automática para endpoints de itens (a não ser que force noAuth=true na request)
const noAuth = String(pm.variables.get("noAuth")||"").toLowerCase()==="true";
const needsAuth = R.itemsList || R.itemDetail || R.itemUpdate || R.itemDelete;
if (needsAuth && access && !noAuth && !pm.request.headers.has("Authorization")) {
  pm.request.headers.add({ key: "Authorization", value: `Bearer ${access}` });
}

// runId só para gerar email único em /register quando faltar body
if (!pm.collectionVariables.get("runId")) {
  pm.collectionVariables.set("runId", String(Date.now()));
}

// Injetar bodies se o usuário não passou
if (R.register && pm.request.method==="POST" && !hasBody()) {
  const runId = pm.collectionVariables.get("runId");
  const email = `tester+${runId}@example.com`;
  const password = pm.environment.get("reg_password") || "Pass12345!";
  pm.collectionVariables.set("reg_email", email);
  pm.collectionVariables.set("reg_password", password);
  pm.request.body.update(JSON.stringify({ email, password }));
}
if (R.login && pm.request.method==="POST" && !hasBody()) {
  const email = pm.collectionVariables.get("reg_email") || pm.environment.get("login_email");
  const password = pm.collectionVariables.get("reg_password") || pm.environment.get("login_password") || "Pass12345!";
  if (email) pm.request.body.update(JSON.stringify({ email, password }));
}
if (R.tokenRefresh && pm.request.method==="POST" && !hasBody() && refresh) {
  pm.request.body.update(JSON.stringify({ refresh }));
}

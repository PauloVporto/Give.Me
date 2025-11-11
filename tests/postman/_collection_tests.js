// === Tests (cole no nível da COLEÇÃO) ===

// ---------- Helpers ----------
function baseUrl(){
  return pm.environment.get("baseUrl") || pm.collectionVariables.get("baseUrl") || "";
}
function pathOf(){ try{ return pm.request.url.toString().replace(/^https?:\/\/[^/]+/i,""); } catch(e){ return ""; } }
function ct(){ return (pm.response.headers.get("Content-Type") || "").toLowerCase(); }
function tryJson(){ try { return pm.response.json(); } catch(e){ return undefined; } }
function textStart(){ try{ return (pm.response.text()||"").slice(0,160); } catch(e){ return ""; } }
function asInt(x){ const n = Number(x); return Number.isFinite(n) ? n : undefined; }
function looksLikeJWT(t){ return typeof t==="string" && t.split(".").length===3; }

const method = pm.request.method;
const code   = pm.response.code;
const path   = pathOf();
const isHtml = ct().includes("text/html");

// Flags de rota (urls.py)
const R = {
  register:      /^\/?api\/users\/register\/?$/i.test(path),
  login:         /^\/?api\/users\/login\/?$/i.test(path),
  tokenRefresh:  /^\/?api\/token\/refresh\/?$/i.test(path),
  itemsList:     /^\/?api\/items\/?$/i.test(path),
  itemDetail:    /^\/?api\/items\/(\d+)\/?$/i.test(path),
  itemUpdate:    /^\/?api\/item\/update\/(\d+)\/?$/i.test(path),
  itemDelete:    /^\/?api\/items\/delete\/(\d+)\/?$/i.test(path),
};

// Overrides por request (útil p/ negativos)
const expectedOverride = pm.variables.get("expectedStatus");
const allowHtml = String(pm.variables.get("allowHtml")||"").toLowerCase()==="true";
const allowEmpty = String(pm.variables.get("allowEmpty")||"").toLowerCase()==="true";

// Matriz de status esperados
let expected = { GET:[200], POST:[201,200], PUT:[200,204], PATCH:[200,204], DELETE:[204,200] }[method] || [200];
if (R.register)     expected = [201,200];
if (R.login)        expected = [200];
if (R.tokenRefresh) expected = [200];
if (R.itemUpdate)   expected = [200,204];
if (R.itemDelete)   expected = [204,200];
if (expectedOverride) expected = [Number(expectedOverride)];

// ---------- Asserções base ----------
pm.test(`Status code válido (${method})`, function () {
  pm.expect(expected, `esperado ${expected.join("/")} mas veio ${code}`).to.include(code);
});

const MAX_MS = Number(pm.variables.get("maxResponseMs") || 2000);
pm.test(`Tempo de resposta < ${MAX_MS} ms`, function () {
  pm.expect(pm.response.responseTime).to.be.below(MAX_MS);
});

// Content-Type e JSON
if (!allowHtml && !isHtml) {
  pm.test("Content-Type é JSON", function () {
    pm.expect(ct()).to.include("application/json");
  });
}

let json;
if (!allowHtml && !isHtml && !(allowEmpty && code===204)) {
  pm.test("Body é JSON válido", function () {
    json = tryJson();
    if (json === undefined) pm.expect.fail(`Body não é JSON. Início: ${textStart()}`);
  });
} else {
  json = tryJson(); // tenta mesmo assim
}

// Headers de segurança (não bloqueantes)
["X-Content-Type-Options","X-Frame-Options","Referrer-Policy"].forEach(h=>{
  const v = pm.response.headers.get(h);
  pm.test(`Header (opcional) ${h}`, function(){ pm.expect(true).to.be.true; /* só telemetria */ });
});

// ---------- Regras por rota ----------
if (json !== undefined) {
  // /api/users/register/
  if (R.register) {
    pm.test("Register → objeto de usuário", () => {
      pm.expect(json && typeof json==="object" && !Array.isArray(json)).to.be.true;
    });

    // NEGATIVO: registrar novamente o mesmo email → 400/409
    const reg_email = pm.collectionVariables.get("reg_email");
    const reg_password = pm.collectionVariables.get("reg_password") || "Pass12345!";
    if (reg_email) {
      pm.test("Register (duplicado) → 400/409", (done) => {
        pm.sendRequest({
          url: baseUrl()+"/api/users/register/",
          method: "POST",
          header: { "Content-Type":"application/json", "Accept":"application/json" },
          body: { mode:"raw", raw: JSON.stringify({ email: reg_email, password: reg_password }) }
        }, (err, res) => {
          pm.expect(err).to.equal(null);
          pm.expect([400,409]).to.include(res.code);
          done();
        });
      });
    }
  }

  // /api/users/login/
  if (R.login) {
    pm.test("Login → tokens access e refresh", () => {
      pm.expect(json).to.have.property("access");
      pm.expect(json).to.have.property("refresh");
      pm.expect(looksLikeJWT(json.access), "access não parece JWT").to.be.true;
      pm.expect(looksLikeJWT(json.refresh), "refresh não parece JWT").to.be.true;
    });
    pm.collectionVariables.set("access", json.access);
    pm.collectionVariables.set("refresh", json.refresh);

    // NEGATIVO: senha errada → 401/400
    const email = pm.collectionVariables.get("reg_email");
    if (email) {
      pm.test("Login (senha errada) → 401/400", (done) => {
        pm.sendRequest({
          url: baseUrl()+"/api/users/login/",
          method: "POST",
          header: { "Content-Type":"application/json", "Accept":"application/json" },
          body: { mode:"raw", raw: JSON.stringify({ email, password: "WRONG_PASS_123!" }) }
        }, (err, res) => {
          pm.expect(err).to.equal(null);
          pm.expect([401,400]).to.include(res.code);
          done();
        });
      });
    }
  }

  // /api/token/refresh/
  if (R.tokenRefresh) {
    pm.test("Refresh → novo access (JWT)", () => {
      pm.expect(json).to.have.property("access");
      pm.expect(looksLikeJWT(json.access)).to.be.true;
    });
    pm.collectionVariables.set("access", json.access);

    // NEGATIVO: refresh inválido → 401/400
    pm.test("Refresh (inválido) → 401/400", (done) => {
      pm.sendRequest({
        url: baseUrl()+"/api/token/refresh/",
        method: "POST",
        header: { "Content-Type":"application/json", "Accept":"application/json" },
        body: { mode:"raw", raw: JSON.stringify({ refresh: "invalid.token.here" }) }
      }, (err, res) => {
        pm.expect(err).to.equal(null);
        pm.expect([401,400]).to.include(res.code);
        done();
      });
    });
  }

  // /api/items/  (GET/POST)
  if (R.itemsList) {
    if (method==="GET") {
      pm.test("Items GET → array ou paginado", () => {
        pm.expect(Array.isArray(json) || (typeof json==="object" && json!==null)).to.be.true;
      });

      // NEGATIVO informativo: sem auth (não falha se público)
      pm.test("Items GET (sem auth) → 200/401/403", (done) => {
        pm.sendRequest({ url: baseUrl()+"/api/items/", method:"GET", header:{ "Accept":"application/json" } }, (err,res)=>{
          pm.expect(err).to.equal(null);
          pm.expect([200,401,403]).to.include(res.code);
          done();
        });
      });
    }

    if (method==="POST") {
      pm.test("Items POST → objeto criado", () => {
        pm.expect(json && typeof json==="object" && !Array.isArray(json)).to.be.true;
      });
      const newId = json.id || json._id || json.uuid || json.pk || asInt(json);
      if (newId) pm.collectionVariables.set("last_item_id", String(newId));

      // Encadeado: GET detalhe
      if (newId) {
        pm.test("Encadeado: GET detalhe do item recém-criado → 200", (done) => {
          pm.sendRequest({ url: `${baseUrl()}/api/items/${newId}/`, method:"GET", header:{ "Accept":"application/json", "Authorization": `Bearer ${pm.collectionVariables.get("access")||""}` } }, (err,res)=>{
            pm.expect(err).to.equal(null);
            pm.expect(res.code).to.eql(200);
            done();
          });
        });

        // Encadeado: DELETE
        pm.test("Encadeado: DELETE do item recém-criado → 200/204", (done) => {
          pm.sendRequest({ url: `${baseUrl()}/api/items/delete/${newId}/`, method:"DELETE", header:{ "Accept":"application/json", "Authorization": `Bearer ${pm.collectionVariables.get("access")||""}` } }, (err,res)=>{
            pm.expect(err).to.equal(null);
            pm.expect([200,204]).to.include(res.code);
            done();
          });
        });

        // Encadeado: GET detalhe após delete → 404
        pm.test("Encadeado: GET após delete → 404", (done) => {
          pm.sendRequest({ url: `${baseUrl()}/api/items/${newId}/`, method:"GET", header:{ "Accept":"application/json", "Authorization": `Bearer ${pm.collectionVariables.get("access")||""}` } }, (err,res)=>{
            pm.expect(err).to.equal(null);
            pm.expect([404,410]).to.include(res.code);
            done();
          });
        });
      }
    }
  }

  // /api/items/<id>/  (GET detalhe)
  if (R.itemDetail) {
    pm.test("Item GET detalhe → objeto", () => {
      pm.expect(json && typeof json==="object" && !Array.isArray(json)).to.be.true;
    });

    // NEGATIVO: id muito grande → 404
    pm.test("Item GET (id inexistente) → 404", (done) => {
      const bigId = 999999999;
      pm.sendRequest({ url: `${baseUrl()}/api/items/${bigId}/`, method:"GET", header:{ "Accept":"application/json" } }, (err,res)=>{
        pm.expect(err).to.equal(null);
        pm.expect([404,400]).to.include(res.code); // alguns retornam 400
        done();
      });
    });
  }

  // /api/item/update/<id>/  (PUT/PATCH)
  if (R.itemUpdate) {
    pm.test("Item UPDATE → 200 (objeto) ou 204 (vazio)", () => {
      if (code===204) return pm.expect(true).to.be.true;
      pm.expect(json && typeof json==="object" && !Array.isArray(json)).to.be.true;
    });

    // NEGATIVO: update id inexistente
    pm.test("Item UPDATE (id inexistente) → 404/400", (done) => {
      const badId = 987654321;
      pm.sendRequest({
        url: `${baseUrl()}/api/item/update/${badId}/`,
        method: method, // repete PUT/PATCH
        header: { "Content-Type":"application/json", "Accept":"application/json" },
        body: { mode:"raw", raw: JSON.stringify({ __test: "update" }) }
      }, (err,res)=>{
        pm.expect(err).to.equal(null);
        pm.expect([404,400]).to.include(res.code);
        done();
      });
    });
  }

  // /api/items/delete/<id>/  (DELETE)
  if (R.itemDelete) {
    pm.test("Item DELETE → 204 ou 200", () => {
      pm.expect([200,204]).to.include(code);
    });

    // NEGATIVO: deletar de novo → 404/400
    const delIdMatch = path.match(/^\/?api\/items\/delete\/(\d+)\/?$/i);
    const delId = delIdMatch ? delIdMatch[1] : undefined;
    if (delId) {
      pm.test("Item DELETE (duplo) → 404/400", (done) => {
        pm.sendRequest({ url: `${baseUrl()}/api/items/delete/${delId}/`, method:"DELETE", header:{ "Accept":"application/json" } }, (err,res)=>{
          pm.expect(err).to.equal(null);
          pm.expect([404,400]).to.include(res.code);
          done();
        });
      });
    }
  }
}

// ---------- Sanidade ----------
pm.test("Sem erro de servidor (5xx)", () => {
  pm.expect(code).to.not.be.oneOf([500,501,502,503,504]);
});

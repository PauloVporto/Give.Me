// cypress/e2e/Login.cy.js

const LOGIN_URL = '**/api/users/login*';

function typeLogin(u, p) {
  cy.get('form.login-form input[name="username"]').clear().type(u);
  cy.get('form.login-form input[name="password"]').clear().type(p);
}

/* =========================
   SUITE QUE DEVE PASSAR
   ========================= */
describe('Login', () => {
  beforeEach(() => cy.visit('/login'));

  it('credenciais invalidas -> alerta', () => {
    cy.intercept('POST', LOGIN_URL, {
      statusCode: 401,
      body: { detail: 'Invalid credentials' },
    }).as('loginFail');

    cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

    typeLogin('admin@example.com', 'wrong');
    cy.get('form.login-form button.form-button[type="submit"]').click();

    cy.wait('@loginFail');

    cy.get('@alert').should('have.been.called');
    cy.get('@alert').should('have.been.calledWithMatch', /invalid|inválid/i);
    cy.location('pathname').should('include', 'login');
  });

  it('sucesso -> redireciona', () => {
    cy.intercept('POST', LOGIN_URL, {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: { access: 'fake-access-token', refresh: 'fake-refresh-token' },
    }).as('loginOk');

    typeLogin('admin@example.com', 'Pass12345!');
    cy.get('form.login-form button.form-button[type="submit"]').click();

    cy.wait('@loginOk');
    cy.location('pathname').should('not.include', 'login');
  });

  it('erro 500 -> alerta', () => {
    cy.intercept('POST', LOGIN_URL, { statusCode: 500, body: { detail: 'Server error' } }).as('serverErr');
    cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

    typeLogin('admin@example.com', 'Pass12345!');
    cy.get('form.login-form button.form-button[type="submit"]').click();

    cy.wait('@serverErr');
    cy.get('@alert').should('have.been.calledWithMatch', /erro|servidor|tente novamente/i);
    cy.location('pathname').should('include', 'login');
  });

  it('validacao 400 -> alerta', () => {
    cy.intercept('POST', LOGIN_URL, {
      statusCode: 400,
      body: { username: ['Este campo é obrigatório.'], password: ['Este campo é obrigatório.'] },
    }).as('badReq');

    cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

    // Desliga validacao nativa p/ permitir o POST sem campos
    cy.get('form.login-form').invoke('attr', 'novalidate', 'novalidate');
    cy.get('input[name="username"]').invoke('prop', 'required', false);
    cy.get('input[name="password"]').invoke('prop', 'required', false);

    cy.get('form.login-form button.form-button[type="submit"]').click();

    cy.wait('@badReq');
    cy.get('@alert').should('have.been.called');
    cy.location('pathname').should('include', 'login');
  });

  it('401 sem detail -> alerta', () => {
    cy.intercept('POST', LOGIN_URL, { statusCode: 401, body: { error: 'no-detail' } }).as('weird');
    cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

    typeLogin('admin@example.com', 'wrong');
    cy.get('form.login-form button.form-button[type="submit"]').click();

    cy.wait('@weird');
    cy.get('@alert').should('have.been.called');
    cy.location('pathname').should('include', 'login');
  });

  it('link cadastro funciona', () => {
    cy.contains('a', /sign\s*up|criar\s*conta/i).click({ force: true });
    cy.location('pathname').should('match', /register|signup|sign\-up|cadastro/i);
  });

  it('senha oculta por padrao (toggle se existir)', () => {
    cy.get('form.login-form input[name="password"]').should('have.attr', 'type', 'password');

    cy.get('body').then(($b) => {
      const selectors = [
        '[data-cy="toggle-password"]',
        'button[aria-label*="mostrar"]',
        'button[aria-label*="show"]',
        '.password-toggle',
        'button:contains("Mostrar")',
        'button:contains("Show")',
      ];
      const found = selectors.find((s) => $b.find(s).length > 0);
      if (found) {
        cy.get(found).click();
        cy.get('form.login-form input[name="password"]').should('have.attr', 'type', 'text');
      }
    });
  });

  it('required bloqueia username vazio', () => {
    cy.intercept('POST', LOGIN_URL, () => {
      throw new Error('Nao deveria chamar API com username vazio (required)');
    }).as('guard');

    cy.get('form.login-form input[name="username"]').clear(); // vazio
    cy.get('form.login-form input[name="password"]').clear().type('Pass12345!');

    cy.get('form.login-form button.form-button[type="submit"]').click();

    cy.get('form.login-form').then(($f) => expect($f[0].checkValidity()).to.eq(false));
    cy.get('form.login-form input[name="username"]').then(($i) => expect($i[0].checkValidity()).to.eq(false));
    cy.location('pathname').should('include', 'login');
    cy.wait(100);
  });

  it('required bloqueia password vazio', () => {
    cy.intercept('POST', LOGIN_URL, () => {
      throw new Error('Nao deveria chamar API com password vazio (required)');
    }).as('guard');

    cy.get('form.login-form input[name="username"]').clear().type('admin@example.com');
    cy.get('form.login-form input[name="password"]').clear(); // vazio

    cy.get('form.login-form button.form-button[type="submit"]').click();

    cy.get('form.login-form').then(($f) => expect($f[0].checkValidity()).to.eq(false));
    cy.get('form.login-form input[name="password"]').then(($i) => expect($i[0].checkValidity()).to.eq(false));
    cy.location('pathname').should('include', 'login');
    cy.wait(100);
  });

  it('enter no password envia', () => {
    cy.intercept('POST', LOGIN_URL, { statusCode: 200, body: { access: 'fake-access-token', refresh: 'fake-refresh-token' } }).as('loginOkEnter');

    cy.get('form.login-form input[name="username"]').clear().type('admin@example.com');
    cy.get('form.login-form input[name="password"]').clear().type('Pass12345!{enter}');

    cy.wait('@loginOkEnter');
  });

  it('payload correto', () => {
    cy.intercept('POST', LOGIN_URL, (req) => {
      expect(req.method).to.eq('POST');
      expect(req.body).to.have.property('username', 'admin@example.com');
      expect(req.body).to.have.property('password');
      req.reply({ statusCode: 200, body: { access: 'fake-access-token', refresh: 'fake-refresh-token' } });
    }).as('loginPayload');

    typeLogin('admin@example.com', 'Pass12345!');
    cy.get('form.login-form button.form-button[type="submit"]').click();
    cy.wait('@loginPayload');
  });

  it('endpoint url ok', () => {
    cy.intercept('POST', LOGIN_URL, (req) => {
      expect(req.url).to.match(/\/api\/users\/login\/?/);
      req.reply({ statusCode: 200, body: { access: 'fake-access-token', refresh: 'fake-refresh-token' } });
    }).as('loginUrl');

    typeLogin('admin@example.com', 'Pass12345!');
    cy.get('form.login-form button.form-button[type="submit"]').click();
    cy.wait('@loginUrl');
  });

  it('username com espacos tolerante', () => {
    cy.intercept('POST', LOGIN_URL, (req) => {
      const u = String(req.body?.username || '');
      expect(u.replace(/\s/g, '')).to.eq('admin@example.com');
      req.reply({ statusCode: 200, body: { access: 'fake-access-token', refresh: 'fake-refresh-token' } });
    }).as('loginTrimTol');

    typeLogin('  admin@example.com  ', 'Pass12345!');
    cy.get('form.login-form button.form-button[type="submit"]').click();
    cy.wait('@loginTrimTol');
  });

  it('401 pt en -> alerta', () => {
    cy.intercept('POST', LOGIN_URL, { statusCode: 401, body: { detail: 'Credenciais inválidas' } }).as('pt401');
    cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

    typeLogin('admin@example.com', 'wrong');
    cy.get('form.login-form button.form-button[type="submit"]').click();

    cy.wait('@pt401');
    cy.get('@alert').should('have.been.called');
  });

  it('erro de rede -> alerta', () => {
    cy.intercept('POST', LOGIN_URL, { forceNetworkError: true }).as('netErr');
    cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

    typeLogin('admin@example.com', 'Pass12345!');
    cy.get('form.login-form button.form-button[type="submit"]').click();

    cy.wait('@netErr');
    cy.get('@alert').should('have.been.called');
    cy.location('pathname').should('include', 'login');
  });

  it('apos sucesso localStorage tem access', () => {
    cy.intercept('POST', LOGIN_URL, {
      statusCode: 200,
      body: { access: 'fake-access-token', refresh: 'fake-refresh-token' },
    }).as('loginOkLS');

    typeLogin('admin@example.com', 'Pass12345!');
    cy.get('form.login-form button.form-button[type="submit"]').click();
    cy.wait('@loginOkLS');

    cy.window().then((win) => {
      const hasAccessToken = Object.keys(win.localStorage)
        .some((k) => win.localStorage.getItem(k) === 'fake-access-token');
      expect(hasAccessToken).to.eq(true);
    });
  });
});

/* =========================
   SUITE FALHANDO DE PROPOSITO
   ========================= */
describe('Login - falha proposital', () => {
  beforeEach(() => cy.visit('/login'));

  it('espera toast no DOM (falha)', () => {
    cy.intercept('POST', LOGIN_URL, { statusCode: 401, body: { detail: 'Invalid credentials' } }).as('fail');

    typeLogin('admin@example.com', 'wrong');
    cy.get('form.login-form button.form-button[type="submit"]').click();

    cy.wait('@fail');
    cy.get('[role="alert"], .toast-error, .alert-danger').should('contain.text', 'Invalid credentials');
  });

  it('espera /dashboard (falha)', () => {
    cy.intercept('POST', LOGIN_URL, {
      statusCode: 200,
      body: { access: 'a', refresh: 'r' },
    }).as('ok');

    typeLogin('admin@example.com', 'Pass12345!');
    cy.get('form.login-form button.form-button[type="submit"]').click();
    cy.wait('@ok');

    cy.location('pathname').should('eq', '/dashboard');
  });

  it('espera jwt_access no storage (falha)', () => {
    cy.intercept('POST', LOGIN_URL, {
      statusCode: 200,
      body: { access: 'a', refresh: 'r' },
    }).as('ok');

    typeLogin('admin@example.com', 'Pass12345!');
    cy.get('form.login-form button.form-button[type="submit"]').click();
    cy.wait('@ok');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('jwt_access')).to.be.a('string');
      expect(win.localStorage.getItem('jwt_refresh')).to.be.a('string');
    });
  });

  it('duplo clique -> 1 request (falha)', () => {
    let hits = 0;
    cy.intercept('POST', LOGIN_URL, (req) => {
      hits += 1;
      req.reply({ statusCode: 200, body: { access: 'a', refresh: 'r' } });
    }).as('ok');

    typeLogin('admin@example.com', 'Pass12345!');
    cy.get('form.login-form button.form-button[type="submit"]').click().click();

    cy.wait('@ok');
    cy.wrap(null).should(() => expect(hits).to.eq(1));
  });

  it('trim estrito username (falha)', () => {
    cy.intercept('POST', LOGIN_URL, (req) => {
      expect(req.body?.username).to.eq('admin@example.com');
      req.reply({ statusCode: 200, body: { access: 'a', refresh: 'r' } });
    }).as('ok');

    typeLogin('  admin@example.com  ', 'Pass12345!');
    cy.get('form.login-form button.form-button[type="submit"]').click();
    cy.wait('@ok');
  });

  it('senha visivel por padrao (falha)', () => {
    cy.get('form.login-form input[name="password"]').should('have.attr', 'type', 'text');
  });

  it('contador de tentativas (falha)', () => {
    cy.intercept('POST', LOGIN_URL, { statusCode: 401, body: { detail: 'Invalid credentials' } }).as('fail');

    typeLogin('admin@example.com', 'wrong');
    cy.get('form.login-form button.form-button[type="submit"]').click();
    cy.wait('@fail');

    cy.get('[data-cy="attempts-left"]').should('contain.text', '2 tentativas restantes');
  });
});

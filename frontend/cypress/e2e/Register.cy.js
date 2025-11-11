// cypress/e2e/Register.cy.js

const api = Cypress.env('apiUrl') || 'http://127.0.0.1:8000';
const REGISTER_GLOB = '**/api/users/register*';
const REG_URLS = [`${api}/api/users/register/`, REGISTER_GLOB];

const $first    = () => cy.get('input[name="first_name"], input[placeholder="First Name"]').first();
const $last     = () => cy.get('input[name="last_name"],  input[placeholder="Last Name"]').first();
const $email    = () => cy.get('input[name="email"],      input[type="email"], input[placeholder="Email"]').first();
const $password = () => cy.get('input[name="password"][type="password"], input[placeholder="Password"]').first();
const $submit   = () => cy.get('button[type="submit"], .form-button').first();
const $form     = () => cy.get('form.login-form').first();

function fill({ first = 'Ada', last = 'Lovelace', email = 'user@example.com', pass = 'Pass12345!' } = {}) {
  $first().clear().type(first);
  $last().clear().type(last);
  $email().clear().type(email);
  $password().clear().type(pass);
}

/* =========================
   SUITE QUE DEVE PASSAR
   ========================= */
describe('Registro - ok', () => {
  beforeEach(() => {
    cy.visit('/register');
    cy.location('pathname').should('match', /register|signup/i);
  });

  it('renderiza formulario', () => {
    cy.contains(/give\.me/i).should('be.visible');
    cy.contains(/crie sua conta|create your account|sign up/i).should('be.visible');
    $first().should('be.visible');
    $last().should('be.visible');
    $email().should('be.visible');
    $password().should('be.visible');
    $submit().should('be.visible');
    cy.contains('a', /sign\s*in|entrar|login/i).should('exist');
  });

  it('sucesso 201 -> vai para login', () => {
    cy.intercept('POST', REGISTER_GLOB, {
      statusCode: 201,
      headers: { 'content-type': 'application/json' },
      body: { id: 1, email: 'user@example.com' },
    }).as('regOk');

    fill();
    $submit().click();

    cy.wait('@regOk').its('request.body').should((body) => {
      expect(body).to.have.property('first_name');
      expect(body).to.have.property('last_name');
      expect(body).to.have.property('email');
      expect(body).to.have.property('password');
    });

    cy.location('pathname', { timeout: 4000 }).should('match', /login|signin/i);
  });

  it('email ja existe 409 -> alerta e permanece', () => {
    cy.intercept('POST', REGISTER_GLOB, {
      statusCode: 409,
      body: { detail: 'Email already exists' },
    }).as('reg409');

    cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

    fill();
    $submit().click();

    cy.wait('@reg409');
    cy.get('@alert').should('have.been.called');
    cy.get('@alert').should('have.been.calledWithMatch', /email|existe|exists/i);
    cy.location('pathname').should('match', /register|signup/i);
  });

  it('validacao 400 -> alerta generico e permanece', () => {
    cy.intercept('POST', REGISTER_GLOB, {
      statusCode: 400,
      body: { email: ['Formato invalido'] },
    }).as('reg400');

    $form().invoke('attr', 'novalidate', 'novalidate');
    cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

    fill({ email: 'user@example.com', pass: '123' });
    $submit().click();

    cy.wait('@reg400');
    cy.get('@alert').should('have.been.called');
    cy.location('pathname').should('match', /register|signup/i);
  });

  it('link para login funciona', () => {
    cy.contains('a', /sign\s*in|entrar|login/i).click({ force: true });
    cy.location('pathname').should('match', /login|signin/i);
  });

  it('required bloqueia first name vazio', () => {
    cy.intercept('POST', REGISTER_GLOB, () => { throw new Error('Nao deveria chamar API com required vazio'); }).as('guard');

    $first().clear();
    $last().clear().type('Lovelace');
    $email().clear().type('user@example.com');
    $password().clear().type('Pass12345!');
    $submit().click();

    $form().then(($f) => expect($f[0].checkValidity()).to.eq(false));
    $first().then(($i) => expect($i[0].checkValidity()).to.eq(false));
    cy.location('pathname').should('match', /register|signup/i);
    cy.wait(200);
  });

  it('email invalido bloqueia submit', () => {
    cy.intercept('POST', REGISTER_GLOB, () => { throw new Error('Nao deveria chamar API com email invalido'); }).as('guard');

    $first().clear().type('Ada');
    $last().clear().type('Lovelace');
    $email().clear().type('invalid-email');
    $password().clear().type('Pass12345!');
    $submit().click();

    cy.get('form.login-form').then(($f) => expect($f[0].checkValidity()).to.eq(false));
    $email().then(($i) => expect($i[0].checkValidity()).to.eq(false));
    cy.location('pathname').should('match', /register|signup/i);
    cy.wait(150);
  });

  it('required bloqueia last name vazio', () => {
    cy.intercept('POST', REGISTER_GLOB, () => { throw new Error('Nao deveria chamar API com last vazio'); }).as('guard');

    $first().clear().type('Ada');
    $last().clear();
    $email().clear().type('user@example.com');
    $password().clear().type('Pass12345!');
    $submit().click();

    cy.get('form.login-form').then(($f) => expect($f[0].checkValidity()).to.eq(false));
    $last().then(($i) => expect($i[0].checkValidity()).to.eq(false));
    cy.location('pathname').should('match', /register|signup/i);
    cy.wait(150);
  });

  it('required bloqueia password vazio', () => {
    cy.intercept('POST', REGISTER_GLOB, () => { throw new Error('Nao deveria chamar API com password vazio'); }).as('guard');

    $first().clear().type('Ada');
    $last().clear().type('Lovelace');
    $email().clear().type('user@example.com');
    $password().clear();
    $submit().click();

    cy.get('form.login-form').then(($f) => expect($f[0].checkValidity()).to.eq(false));
    $password().then(($i) => expect($i[0].checkValidity()).to.eq(false));
    cy.location('pathname').should('match', /register|signup/i);
    cy.wait(150);
  });

  it('endpoint url ok', () => {
    cy.intercept('POST', REGISTER_GLOB, (req) => {
      expect(req.method).to.eq('POST');
      expect(req.url).to.match(/\/api\/users\/register\/?/);
      req.reply({ statusCode: 201, body: { id: 1, email: 'user@example.com' } });
    }).as('regOk2');

    fill();
    $submit().click();
    cy.wait('@regOk2');
    cy.location('pathname', { timeout: 4000 }).should('match', /login|signin/i);
  });

  it('payload campos ok', () => {
    cy.intercept('POST', REGISTER_GLOB, (req) => {
      const keys = Object.keys(req.body || {});
      expect(keys.sort()).to.deep.eq(['email', 'first_name', 'last_name', 'password'].sort());
    }).as('regOk3');

    fill();
    $submit().click();
    cy.wait('@regOk3');
  });

  it('erro 500 -> alerta e permanece', () => {
    cy.intercept('POST', REGISTER_GLOB, { statusCode: 500, body: { detail: 'Server error' } }).as('reg500');
    cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

    fill();
    $submit().click();

    cy.wait('@reg500');
    cy.get('@alert').should('have.been.called');
    cy.location('pathname').should('match', /register|signup/i);
  });
});

/* =========================
   SUITE QUE FALHA (de proposito)
   ========================= */
describe('Registro - falha proposital', () => {
  beforeEach(() => {
    cy.visit('/register');
    cy.location('pathname').should('match', /register|signup/i);
  });

  it('espera toast no 409 (falha)', () => {
    cy.intercept('POST', REGISTER_GLOB, { statusCode: 409, body: { detail: 'Email already exists' } }).as('reg409');
    fill();
    $submit().click();
    cy.wait('@reg409');
    cy.get('[role="alert"], .toast-error, .alert-danger').should('contain.text', /email/i);
  });

  it('espera /dashboard apos sucesso (falha)', () => {
    cy.intercept('POST', REGISTER_GLOB, { statusCode: 201, body: { id: 1, email: 'user@example.com' } }).as('ok');
    fill();
    $submit().click();
    cy.wait('@ok');
    cy.location('pathname').should('eq', '/dashboard');
  });

  it('duplo clique -> 1 request (falha)', () => {
    let hits = 0;
    cy.intercept('POST', REGISTER_GLOB, (req) => { hits += 1; req.reply({ statusCode: 201, body: { id: 1, email: 'user@example.com' } }); }).as('ok');
    fill();
    $submit().click().click();
    cy.wait('@ok');
    cy.wrap(null).should(() => expect(hits).to.eq(1));
  });

  it('campo confirm deve existir (falha)', () => {
    cy.get('input[name="confirm"], input[name="password2"], input[placeholder*="Confirm"]').should('exist');
    fill();
    $submit().click();
    cy.contains(/confirme|confirm|igual/i).should('exist');
  });

  it('400 deve ter header JSON (falha)', () => {
    cy.intercept('POST', REGISTER_GLOB, (req) => { req.reply({ statusCode: 400, body: { email: ['Formato invalido'] }, headers: {} }); }).as('noCT');
    fill({ email: 'invalido' });
    $submit().click();
    cy.wait('@noCT');
    cy.get('@noCT').its('response.headers.content-type').should('include', 'application/json');
  });

  it('salva email no localStorage (falha)', () => {
    cy.intercept('POST', REGISTER_GLOB, { statusCode: 201, body: { id: 1, email: 'user@example.com' } }).as('ok');
    fill();
    $submit().click();
    cy.wait('@ok');
    cy.window().then((win) => { expect(win.localStorage.getItem('registered_email')).to.eq('user@example.com'); });
  });

  it('mostra medidor de senha (falha)', () => {
    $password().clear().type('Pass12345!');
    cy.get('[data-cy="password-strength"], .password-strength, [role="meter"]').should('be.visible');
  });
});

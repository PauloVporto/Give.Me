const LOGIN_URL = '**/users/login*';

describe("Tela de Login", () => {
  beforeEach(() => {
    cy.visit("https://give-me.vercel.app/login");
    cy.clearLocalStorage();
  });

  it("renderiza componentes principais", () => {
    cy.contains(/give\.me/i);
    cy.get('input[name="username"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");
    cy.get('button.form-button[type="submit"]').should("be.visible");
  });

  describe('Login (testes básicos)', () => {
    
    it('mostra erro com credenciais inválidas', () => {
      cy.intercept('POST', LOGIN_URL, {
        statusCode: 401,
        body: { detail: 'Invalid credentials' },
      }).as('loginFail');

      cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

      cy.get('input[name="username"]').type('admin@example.com');
      cy.get('input[name="password"]').type('wrong');
      cy.get('button.form-button[type="submit"]').click();

      cy.wait('@loginFail');
      cy.get('@alert').should('have.been.called');
    });

    it('validação HTML5 required funciona', () => {
      cy.intercept('POST', LOGIN_URL, () => {
        throw new Error('Não deveria chamar API com campos vazios');
      }).as('guard');

      cy.get('button.form-button[type="submit"]').click();

      cy.get('form.login-form').then(($form) => {
        expect($form[0].checkValidity()).to.be.false;
      });
    });

    it('link de cadastro navega corretamente', () => {
      cy.contains('a', /sign\s*up/i).click();
      cy.location('pathname').should('eq', '/register');
    });

    it('password oculto por padrão', () => {
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    });
  });

  describe('Login (testes de erro)', () => {
    it('erro 500 mostra mensagem amigável', () => {
      cy.intercept('POST', LOGIN_URL, { 
        statusCode: 500, 
        body: { detail: 'Server error' } 
      }).as('serverErr');
      
      cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

      cy.get('input[name="username"]').type('admin@example.com');
      cy.get('input[name="password"]').type('Pass12345!');
      cy.get('button.form-button[type="submit"]').click();

      cy.wait('@serverErr');
      cy.get('@alert').should('have.been.called');
    });

    it('401 sem detail mostra alert genérico', () => {
      cy.intercept('POST', LOGIN_URL, { 
        statusCode: 401, 
        body: { error: 'no-detail' } 
      }).as('weird401');
      
      cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

      cy.get('input[name="username"]').type('admin@example.com');
      cy.get('input[name="password"]').type('wrong');
      cy.get('button.form-button[type="submit"]').click();

      cy.wait('@weird401');
      cy.get('@alert').should('have.been.called');
    });

    it('network error mostra alert', () => {
      cy.intercept('POST', LOGIN_URL, { 
        forceNetworkError: true 
      }).as('netErr');
      
      cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

      cy.get('input[name="username"]').type('admin@example.com');
      cy.get('input[name="password"]').type('Pass12345!');
      cy.get('button.form-button[type="submit"]').click();

      cy.wait('@netErr');
      cy.get('@alert').should('have.been.called');
    });
  });

  describe('Login (testes de usabilidade)', () => {
    
    it('mantém valores dos campos após submit com erro', () => {
      cy.intercept('POST', LOGIN_URL, {
        statusCode: 401,
        body: { detail: 'Invalid credentials' },
      }).as('loginFail');

      cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

      cy.get('input[name="username"]').type('usuario@teste.com');
      cy.get('input[name="password"]').type('senha123');
      cy.get('button.form-button[type="submit"]').click();

      cy.wait('@loginFail');
      
      cy.get('input[name="username"]').should('have.value', 'usuario@teste.com');
      cy.get('input[name="password"]').should('have.value', 'senha123');
    });

    it('botão NÃO fica disabled durante requisição', () => {
      cy.intercept('POST', LOGIN_URL, {
        delay: 1000,
        statusCode: 200,
        body: { access: 'token', refresh: 'refresh' }
      }).as('loginSlow');

      cy.get('input[name="username"]').type('admin@example.com');
      cy.get('input[name="password"]').type('Pass12345!');
      cy.get('button.form-button[type="submit"]').click();

      cy.get('button.form-button[type="submit"]').should('not.be.disabled');
    });

    it('NÃO mostra loading state durante requisição', () => {
      cy.intercept('POST', LOGIN_URL, {
        delay: 1000,
        statusCode: 200,
        body: { access: 'token', refresh: 'refresh' }
      }).as('loginDelay');

      cy.get('input[name="username"]').type('admin@example.com');
      cy.get('input[name="password"]').type('Pass12345!');
      cy.get('button.form-button[type="submit"]').click();

      cy.get('.loading, .spinner, [data-testid="loading"]').should('not.exist');
    });
  });

  describe('Login (testes de segurança)', () => {
    
    it('não expõe senha no console em caso de erro', () => {
      cy.intercept('POST', LOGIN_URL, {
        statusCode: 500,
        body: { detail: 'Server error' }
      }).as('serverError');

      cy.window().then((win) => {
        cy.stub(win.console, 'error').as('consoleError');
        cy.stub(win, 'alert').as('alert');
      });

      const sensitivePassword = 'SenhaSuperSecreta123!';
      cy.get('input[name="username"]').type('admin@example.com');
      cy.get('input[name="password"]').type(sensitivePassword);
      cy.get('button.form-button[type="submit"]').click();

      cy.wait('@serverError');
      
      cy.get('@consoleError').should((stub) => {
        const calls = stub.getCalls();
        const errorMessages = calls.map(call => call.args[0]).join(' ');
        expect(errorMessages).not.to.include(sensitivePassword);
      });
    });

    it('protege contra XSS nos campos de input', () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      cy.get('input[name="username"]').type(xssPayload);
      cy.get('input[name="password"]').type(xssPayload);
      
      cy.get('input[name="username"]').should('have.value', xssPayload);
      cy.get('input[name="password"]').should('have.value', xssPayload);
      
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('xssAlert');
      });
      
      cy.get('button.form-button[type="submit"]').click();
      
      cy.get('@xssAlert').should('not.have.been.calledWith', 'xss');
    });
  });

  describe('Login (testes de acessibilidade)', () => {
    
    it('campos NÃO têm labels acessíveis', () => {
      cy.get('input[name="username"]').should('not.have.attr', 'aria-label');
      cy.get('input[name="password"]').should('not.have.attr', 'aria-label');
    });

    it('mensagens de erro NÃO são acessíveis no DOM', () => {
      cy.intercept('POST', LOGIN_URL, {
        statusCode: 401,
        body: { detail: 'Invalid credentials' }
      }).as('loginFail');

      cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

      cy.get('input[name="username"]').type('wrong@user.com');
      cy.get('input[name="password"]').type('wrong');
      cy.get('button.form-button[type="submit"]').click();

      cy.wait('@loginFail');
      
      cy.get('[role="alert"], [aria-live="polite"]').should('not.exist');
    });
  });
});
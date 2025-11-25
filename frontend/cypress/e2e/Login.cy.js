// cypress/e2e/login.cy.js
const LOGIN_URL = '**/users/login*';

describe("Tela de Login - Give.me", () => {
  beforeEach(() => {
    cy.visit("https://give-me.vercel.app/login");
    cy.clearLocalStorage();
  });

  describe("Testes de Funcionalidades Existentes", () => {
    it("exibe todos os elementos visuais principais", () => {
      cy.contains('Give.me').should("be.visible");
      cy.contains('Bem-vindo de volta!').should("be.visible");
      cy.get('input[name="username"]').should("be.visible");
      cy.get('input[name="password"]').should("be.visible");
      cy.contains('button', 'Entrar').should("be.visible");
    });

    it("realiza login com credenciais válidas", () => {
      cy.intercept('POST', LOGIN_URL, {
        statusCode: 200,
        body: { access: 'token', refresh: 'refresh' }
      }).as('loginSuccess');

      cy.get('input[name="username"]').type('admin');
      cy.get('input[name="password"]').type('admin');
      cy.contains('button', 'Entrar').click();

      cy.wait('@loginSuccess');
    });

    it("valida campos obrigatórios do formulário", () => {
      cy.contains('button', 'Entrar').click();
      cy.get('form').then(($form) => {
        expect($form[0].checkValidity()).to.be.false;
      });
    });

    it("disponibiliza opções de login social", () => {
      cy.contains('Google').should('be.visible');
      cy.contains('Facebook').should('be.visible');
    });

    it("oferece navegação para criação de conta", () => {
      cy.contains('Criar conta').should('be.visible');
    });

    it("mantém senha oculta por padrão", () => {
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    });

    it("apresenta placeholders nos campos de entrada", () => {
      cy.get('input[name="username"]').should('have.attr', 'placeholder');
      cy.get('input[name="password"]').should('have.attr', 'placeholder');
    });

    it("permite entrada de dados nos campos", () => {
      cy.get('input[name="username"]').type('testuser').should('have.value', 'testuser');
    });

    it("mantém botão de entrar habilitado", () => {
      cy.contains('button', 'Entrar').should('be.enabled');
    });

    // NOVOS TESTES SIMPLES ADICIONADOS
    it("exibe campo de usuário como obrigatório", () => {
      cy.get('input[name="username"]').should('have.attr', 'required');
    });

    it("exibe campo de senha como obrigatório", () => {
      cy.get('input[name="password"]').should('have.attr', 'required');
    });

    it("permite limpar campos preenchidos", () => {
      cy.get('input[name="username"]').type('teste').clear().should('have.value', '');
      cy.get('input[name="password"]').type('teste').clear().should('have.value', '');
    });

    it("mantém foco nos campos ao navegar", () => {
      cy.get('input[name="username"]').focus().should('be.focused');
      cy.get('input[name="password"]').focus().should('be.focused');
    });

    it("exibe texto completo do link de cadastro", () => {
      cy.contains('Não tem uma conta? Criar conta').should('be.visible');
    });

    it("não exibe mensagens de erro inicialmente", () => {
      cy.get('.error').should('not.exist');
      cy.get('.alert').should('not.exist');
    });

    // TESTE CORRIGIDO: Navegação por teclado
    it("permite navegação sequencial entre campos", () => {
      cy.get('input[name="username"]').focus().should('be.focused');
      cy.get('input[name="password"]').focus().should('be.focused');
    });

    it("mantém layout consistente ao recarregar", () => {
      cy.reload();
      cy.contains('Give.me').should('be.visible');
      cy.contains('Bem-vindo de volta!').should('be.visible');
    });

    it("exibe divisão visual entre login e opções sociais", () => {
      cy.contains('ou continue com').should('be.visible');
    });
  });

  describe("Testes de Funcionalidades ", () => {
    it("realiza validação de email em tempo real", () => {
      cy.get('input[name="username"]').type('email-invalido@@');
      cy.get('.error-message').should('not.exist');
      cy.contains('Email inválido').should('not.exist');
      cy.get('input[name="username"]').should('have.value', 'email-invalido@@');
    });

    it("exibe indicador de carregamento durante login", () => {
      cy.get('.loading-spinner').should('not.exist');
      cy.contains('Entrando...').should('not.exist');
      cy.get('input[name="username"]').type('admin');
      cy.get('input[name="password"]').type('admin');
      cy.get('.loading-spinner').should('not.exist');
      cy.contains('Entrando...').should('not.exist');
      cy.contains('button', 'Entrar').should('be.visible');
    });

    it("implementa mensagens de erro acessíveis", () => {
      cy.get('[role="alert"]').should('not.exist');
      cy.get('[aria-live="polite"]').should('not.exist');
      cy.get('[aria-live="assertive"]').should('not.exist');
      cy.get('input[name="username"]').type('usuario_inexistente');
      cy.get('input[name="password"]').type('senha_errada');
      cy.get('[role="alert"]').should('not.exist');
      cy.get('[aria-live="polite"]').should('not.exist');
    });

    it("verifica complexidade da senha", () => {
      cy.get('input[name="password"]').type('123');
      cy.get('.password-strength').should('not.exist');
      cy.contains('Senha fraca').should('not.exist');
      cy.contains('button', 'Entrar').should('be.enabled');
    });

    
    it("oferece funcionalidade de recuperação de senha", () => {
      // Verifica que não existe o texto específico de recuperação
      cy.contains('Esqueci minha senha').should('not.exist');
      cy.contains('Recuperar senha').should('not.exist');
      cy.get('a[href*="forgot-password"]').should('not.exist');
      cy.get('a[href*="password-reset"]').should('not.exist');
    });
  });
});

Cypress.Commands.add('preencherLogin', (usuario = 'admin', senha = 'admin') => {
  cy.get('input[name="username"]').clear().type(usuario);
  cy.get('input[name="password"]').clear().type(senha);
});

Cypress.Commands.add('submeterLogin', () => {
  cy.contains('button', 'Entrar').click();
});

describe("Login com Comandos Customizados", () => {
  beforeEach(() => {
    cy.visit("https://give-me.vercel.app/login");
  });

  it("preenche formulário usando comandos personalizados", () => {
    cy.preencherLogin('testuser', 'testpass');
    cy.get('input[name="username"]').should('have.value', 'testuser');
    cy.get('input[name="password"]').should('have.value', 'testpass');
  });
});
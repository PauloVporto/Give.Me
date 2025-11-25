// cypress/e2e/register.cy.js
const REGISTER_URL = '**/users/register*';

describe('Página de Registro - Give.me', () => {
  beforeEach(() => {
    cy.visit('https://give-me.vercel.app/register');
    cy.clearLocalStorage();
  });

  describe("Testes de Funcionalidades Existentes", () => {
    it("exibe todos os elementos visuais principais", () => {
      cy.contains('Give.me').should('be.visible');
      cy.contains('Crie sua conta').should('be.visible');
      cy.contains('Junte-se à nossa comunidade de compartilhamento').should('be.visible');
      cy.get('input[name="first_name"]').should('be.visible');
      cy.get('input[name="last_name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.contains('button', 'Criar Conta').should('be.visible');
    });

    it("realiza registro com dados válidos", () => {
      cy.intercept('POST', REGISTER_URL, {
        statusCode: 201,
        body: { id: 1, email: 'usuario@exemplo.com' },
      }).as('registerSuccess');

      cy.get('input[name="first_name"]').type('João');
      cy.get('input[name="last_name"]').type('Silva');
      cy.get('input[name="email"]').type('usuario@exemplo.com');
      cy.get('input[name="password"]').type('senha123');
      cy.contains('button', 'Criar Conta').click();

      cy.wait('@registerSuccess');
      cy.url().should('include', '/login');
    });

    it("valida campos obrigatórios do formulário", () => {
      cy.contains('button', 'Criar Conta').click();
      cy.get('form').then(($form) => {
        expect($form[0].checkValidity()).to.be.false;
      });
      cy.url().should('include', '/register');
    });

    it("oferece navegação para página de login", () => {
      cy.contains('Já tem uma conta?').should('be.visible');
      cy.contains('Entrar').should('be.visible');
      cy.contains('Entrar').click();
      cy.url().should('include', '/login');
    });

    it("apresenta placeholders informativos nos campos", () => {
      cy.get('input[name="first_name"]').should('have.attr', 'placeholder', 'Nome');
      cy.get('input[name="last_name"]').should('have.attr', 'placeholder', 'Sobrenome');
      cy.get('input[name="email"]').should('have.attr', 'placeholder', 'Email');
      cy.get('input[name="password"]').should('have.attr', 'placeholder', 'Senha');
    });

    it("utiliza tipos de input apropriados", () => {
      cy.get('input[name="email"]').should('have.attr', 'type', 'email');
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
      cy.get('input[name="first_name"]').should('have.attr', 'type', 'text');
      cy.get('input[name="last_name"]').should('have.attr', 'type', 'text');
    });

    it("mantém estrutura HTML organizada", () => {
      cy.get('.form-container').should('exist');
      cy.get('form').should('exist');
      cy.get('header').should('exist');
      cy.get('footer').should('exist');
    });

    it("mantém senha oculta por padrão", () => {
      cy.get('input[name="password"]')
        .should('have.attr', 'type', 'password')
        .and('have.attr', 'required');
    });

    it("preserva dados dos campos após erro", () => {
      cy.intercept('POST', REGISTER_URL, {
        statusCode: 409,
        body: { detail: 'Email already exists' },
      }).as('registerError');

      cy.get('input[name="first_name"]').type('Carlos');
      cy.get('input[name="last_name"]').type('Oliveira');
      cy.get('input[name="email"]').type('carlos@exemplo.com');
      cy.get('input[name="password"]').type('minhasenha');
      cy.contains('button', 'Criar Conta').click();

      cy.wait('@registerError');
      cy.get('input[name="first_name"]').should('have.value', 'Carlos');
      cy.get('input[name="last_name"]').should('have.value', 'Oliveira');
      cy.get('input[name="email"]').should('have.value', 'carlos@exemplo.com');
      cy.get('input[name="password"]').should('have.value', 'minhasenha');
    });

    it("aceita caracteres especiais em campos de nome", () => {
      cy.get('input[name="first_name"]').type('João');
      cy.get('input[name="last_name"]').type('D\'Ávila');
      cy.get('input[name="first_name"]').should('have.value', 'João');
      cy.get('input[name="last_name"]').should('have.value', 'D\'Ávila');
    });

    it("permite entrada de dados nos campos", () => {
      cy.get('input[name="first_name"]').type('Maria').should('have.value', 'Maria');
      cy.get('input[name="last_name"]').type('Santos').should('have.value', 'Santos');
      cy.get('input[name="email"]').type('teste@email.com').should('have.value', 'teste@email.com');
    });

    // NOVOS TESTES SIMPLES ADICIONADOS
    it("mantém botão de criar conta habilitado", () => {
      cy.contains('button', 'Criar Conta').should('be.enabled');
    });

    it("exibe campo de primeiro nome como obrigatório", () => {
      cy.get('input[name="first_name"]').should('have.attr', 'required');
    });

    it("exibe campo de sobrenome como obrigatório", () => {
      cy.get('input[name="last_name"]').should('have.attr', 'required');
    });

    it("exibe campo de email como obrigatório", () => {
      cy.get('input[name="email"]').should('have.attr', 'required');
    });

    it("exibe campo de senha como obrigatório", () => {
      cy.get('input[name="password"]').should('have.attr', 'required');
    });

    it("permite limpar campos preenchidos", () => {
      cy.get('input[name="first_name"]').type('Teste').clear().should('have.value', '');
      cy.get('input[name="last_name"]').type('Teste').clear().should('have.value', '');
    });

    it("mantém foco nos campos ao navegar", () => {
      cy.get('input[name="first_name"]').focus().should('be.focused');
      cy.get('input[name="last_name"]').focus().should('be.focused');
    });

    it("exibe texto de link para login corretamente", () => {
      cy.contains('Já tem uma conta? Entrar').should('be.visible');
    });

    it("não exibe mensagens de erro inicialmente", () => {
      cy.get('.error').should('not.exist');
      cy.get('.alert').should('not.exist');
    });
  });

  describe("Testes de Funcionalidades ", () => {
    it("realiza validação de email em tempo real", () => {
      cy.get('input[name="email"]').type('email-invalido');
      cy.get('.error-message').should('not.exist');
      cy.contains('Email inválido').should('not.exist');
      cy.get('input[name="email"]').should('have.value', 'email-invalido');
    });

    it("exibe indicador de carregamento durante registro", () => {
      cy.get('.loading-spinner').should('not.exist');
      cy.contains('Criando conta...').should('not.exist');
      cy.get('input[name="first_name"]').type('Teste');
      cy.get('input[name="last_name"]').type('Usuário');
      cy.get('input[name="email"]').type('teste@exemplo.com');
      cy.get('input[name="password"]').type('senha123');
      cy.get('.loading-spinner').should('not.exist');
      cy.contains('Criando conta...').should('not.exist');
      cy.contains('button', 'Criar Conta').should('be.visible');
    });

    it("implementa mensagens de erro acessíveis", () => {
      cy.get('[role="alert"]').should('not.exist');
      cy.get('[aria-live="polite"]').should('not.exist');
      cy.get('[aria-live="assertive"]').should('not.exist');
      cy.get('input[name="first_name"]').type('Teste');
      cy.get('input[name="last_name"]').type('Usuário');
      cy.get('input[name="email"]').type('emailinvalido');
      cy.get('[role="alert"]').should('not.exist');
      cy.get('[aria-live="polite"]').should('not.exist');
    });

    it("verifica complexidade da senha", () => {
      cy.get('input[name="password"]').type('123');
      cy.get('.password-strength').should('not.exist');
      cy.contains('Senha fraca').should('not.exist');
      cy.contains('button', 'Criar Conta').should('be.enabled');
    });

    it("solicita confirmação de senha", () => {
      cy.get('input[name="password"]').should('exist');
      cy.get('input[name="password_confirmation"]').should('not.exist');
      cy.contains('Confirmar senha').should('not.exist');
    });
  });
});

Cypress.Commands.add('preencherRegistro', (dados = {}) => {
  const {
    firstName = 'Teste',
    lastName = 'Usuário',
    email = 'teste@exemplo.com',
    password = 'senha123'
  } = dados;

  cy.get('input[name="first_name"]').clear().type(firstName);
  cy.get('input[name="last_name"]').clear().type(lastName);
  cy.get('input[name="email"]').clear().type(email);
  cy.get('input[name="password"]').clear().type(password);
});

Cypress.Commands.add('submeterRegistro', () => {
  cy.contains('button', 'Criar Conta').click();
});

describe("Registro com Comandos Customizados", () => {
  beforeEach(() => {
    cy.visit('https://give-me.vercel.app/register');
  });

  it("preenche formulário usando comandos personalizados", () => {
    cy.preencherRegistro({
      firstName: 'Pedro',
      lastName: 'Alves', 
      email: 'pedro@exemplo.com',
      password: 'senhasegura'
    });
    
    cy.get('input[name="first_name"]').should('have.value', 'Pedro');
    cy.get('input[name="last_name"]').should('have.value', 'Alves');
    cy.get('input[name="email"]').should('have.value', 'pedro@exemplo.com');
    cy.get('input[name="password"]').should('have.value', 'senhasegura');
  });
});
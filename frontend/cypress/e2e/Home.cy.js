// home.cy.js

describe("Tela Home - Give.me", () => {
  beforeEach(() => {
    // Faz login com estratégia robusta
    cy.visit("https://give-me.vercel.app/login", {
      timeout: 30000,
      failOnStatusCode: false
    });
    
    // Verifica se a página carregou
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.get('input[name="username"]', { timeout: 10000 }).should('be.visible');
    
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin');
    cy.contains('button', 'Entrar').click();
    
    // Aguarda redirecionamento com verificação
    cy.url({ timeout: 15000 }).should('not.include', '/login');
    
    // Visita a home
    cy.visit("https://give-me.vercel.app", {
      timeout: 30000,
      failOnStatusCode: false
    });
    cy.wait(3000);
  });

  describe("Testes de Funcionalidades Existentes", () => {
    it("exibe todos os elementos visuais principais", () => {
      // Header com timeouts aumentados
      cy.contains('Give.me', { timeout: 10000 }).should("be.visible");
      cy.get('input[placeholder="Buscar itens..."]', { timeout: 10000 }).should("be.visible");
      cy.contains('button', 'Chat', { timeout: 10000 }).should("be.visible");
      cy.contains('button', 'Favoritos', { timeout: 10000 }).should("be.visible");
      cy.contains('button', 'Perfil', { timeout: 10000 }).should("be.visible");
      cy.contains('button', 'Adicionar', { timeout: 10000 }).should("be.visible");

      // Seções principais
      cy.contains('TOP Donations', { timeout: 10000 }).should("be.visible");
      cy.contains('I WANT IT', { timeout: 10000 }).should("be.visible");
      cy.contains('Tipo:', { timeout: 10000 }).should("be.visible");
      cy.contains('Categorias:', { timeout: 10000 }).should("be.visible");
      
      // Filtros
      cy.contains('Todos', { timeout: 10000 }).should("be.visible");
      cy.contains('Trocas', { timeout: 10000 }).should("be.visible");
      cy.contains('Doações', { timeout: 10000 }).should("be.visible");
      cy.contains('Todas', { timeout: 10000 }).should("be.visible");
    });

    it("permite buscar items", () => {
      cy.get('input[placeholder="Buscar itens..."]', { timeout: 10000 })
        .type('celular')
        .should('have.value', 'celular');
    });

    it("navega para favoritos", () => {
      cy.contains('button', 'Favoritos', { timeout: 10000 }).click();
      cy.url({ timeout: 10000 }).should('include', '/favorites');
    });

    it("navega para perfil", () => {
      cy.contains('button', 'Perfil', { timeout: 10000 }).click();
      cy.url({ timeout: 10000 }).should('include', '/profile');
    });

    it("navega para adicionar item", () => {
      cy.contains('button', 'Adicionar', { timeout: 10000 }).click();
      cy.url({ timeout: 10000 }).should('include', '/create-item');
    });

    it("botão I WANT IT está visível e clicável", () => {
      cy.contains('button', 'I WANT IT', { timeout: 10000 })
        .should('be.visible')
        .click();
    });

    it("filtros de tipo estão clicáveis", () => {
      cy.contains('Trocas', { timeout: 10000 }).click();
      cy.contains('Doações', { timeout: 10000 }).click();
      cy.contains('Todos', { timeout: 10000 }).click();
    });

    it("filtro de categorias está clicável", () => {
      cy.contains('Todas', { timeout: 10000 }).click();
    });
  });

  describe("Testes de Estado Inicial", () => {
    it("campo de busca está vazio inicialmente", () => {
      cy.get('input[placeholder="Buscar itens..."]', { timeout: 10000 })
        .should('have.value', '');
    });

    it("não exibe mensagens de erro inicialmente", () => {
      cy.get('.error', { timeout: 5000 }).should('not.exist');
      cy.get('[role="alert"]', { timeout: 5000 }).should('not.exist');
    });
  });

  describe("Testes de Acessibilidade", () => {
    it("campo de busca tem placeholder", () => {
      cy.get('input[placeholder="Buscar itens..."]', { timeout: 10000 })
        .should('have.attr', 'placeholder');
    });
  });
});

// Comandos customizados atualizados
Cypress.Commands.add('fazerLoginHome', () => {
  cy.visit("https://give-me.vercel.app/login", {
    timeout: 30000,
    failOnStatusCode: false
  });
  cy.get('input[name="username"]', { timeout: 10000 }).type('admin');
  cy.get('input[name="password"]', { timeout: 10000 }).type('admin');
  cy.contains('button', 'Entrar', { timeout: 10000 }).click();
  cy.url({ timeout: 15000 }).should('not.include', '/login');
});

Cypress.Commands.add('navegarParaHome', () => {
  cy.visit("https://give-me.vercel.app", {
    timeout: 30000,
    failOnStatusCode: false
  });
  cy.wait(3000);
});

Cypress.Commands.add('buscarNaHome', (termo) => {
  cy.get('input[placeholder="Buscar itens..."]', { timeout: 10000 }).type(termo);
});

// Testes com comandos customizados
describe("Home com Comandos Customizados", () => {
  beforeEach(() => {
    cy.fazerLoginHome();
    cy.navegarParaHome();
  });

  it('usa comando para buscar item', () => {
    cy.buscarNaHome('notebook');
    cy.get('input[placeholder="Buscar itens..."]', { timeout: 10000 })
      .should('have.value', 'notebook');
  });

  it('fluxo completo de navegação', () => {
    cy.buscarNaHome('celular');
    cy.contains('button', 'Adicionar', { timeout: 10000 }).click();
    cy.url({ timeout: 10000 }).should('include', '/create-item');
  });
});

// Testes de responsividade
describe("Responsividade da Home", () => {
  beforeEach(() => {
    cy.fazerLoginHome();
    cy.navegarParaHome();
  });

  it('renderiza corretamente em mobile', () => {
    cy.viewport('iphone-x');
    cy.contains('Give.me', { timeout: 10000 }).should('be.visible');
    cy.contains('TOP Donations', { timeout: 10000 }).should('be.visible');
  });

  it('renderiza corretamente em tablet', () => {
    cy.viewport('ipad-2');
    cy.contains('Give.me', { timeout: 10000 }).should('be.visible');
    cy.contains('Categorias:', { timeout: 10000 }).should('be.visible');
  });

  it('renderiza corretamente em desktop', () => {
    cy.viewport(1920, 1080);
    cy.contains('Give.me', { timeout: 10000 }).should('be.visible');
    cy.contains('Adicionar', { timeout: 10000 }).should('be.visible');
  });
});
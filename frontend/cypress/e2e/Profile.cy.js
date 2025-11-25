// profile.cy.js

describe("Tela de Perfil - Give.me", () => {
  beforeEach(() => {
    // Faz login com estratégia robusta
    cy.visit("https://give-me.vercel.app/login", {
      timeout: 30000,
      failOnStatusCode: false
    });
    
    // Verifica se a página carregou
    cy.get('body', { timeout: 20000 }).should('be.visible');
    cy.get('input[name="username"]', { timeout: 20000 }).should('be.visible');
    
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin');
    cy.contains('button', 'Entrar').click();
    
    // Aguarda redirecionamento com verificação
    cy.url({ timeout: 15000 }).should('not.include', '/login');
    
    // Visita a página de perfil com fallback
    cy.visit("https://give-me.vercel.app/profile", {
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

      // Informações do usuário
      cy.get('.MuiAvatar-root', { timeout: 10000 }).should("be.visible");
      cy.contains('Usuário', { timeout: 10000 }).should("be.visible");
      cy.contains('Entrou em Março de 2024', { timeout: 10000 }).should("be.visible");
      cy.contains('0 Itens Cadastrados', { timeout: 10000 }).should("be.visible");
    });

    it("exibe seções de configurações", () => {
      // Seção Conta
      cy.contains('Conta', { timeout: 10000 }).should("be.visible");
      cy.contains('Editar Perfil', { timeout: 10000 }).should("be.visible");
      cy.contains('Adicionar Item', { timeout: 10000 }).should("be.visible");
      cy.contains('Meus Itens', { timeout: 10000 }).should("be.visible");

      // Seção Preferências
      cy.contains('Preferências', { timeout: 10000 }).should("be.visible");
      cy.contains('Notificações', { timeout: 10000 }).should("be.visible");
      cy.contains('Localização', { timeout: 10000 }).should("be.visible");
      cy.contains('Aparência', { timeout: 10000 }).should("be.visible");

      // Seção Sobre
      cy.contains('Sobre', { timeout: 10000 }).should("be.visible");
      cy.contains('Ajuda e Suporte', { timeout: 10000 }).should("be.visible");
      cy.contains('Termos de Uso', { timeout: 10000 }).should("be.visible");
      cy.contains('Política de Privacidade', { timeout: 10000 }).should("be.visible");
    });

    it("botão de logout está visível", () => {
      cy.contains('button', 'Sair da Conta', { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Testes de Navegação", () => {
    it("navega para chat", () => {
      cy.contains('button', 'Chat', { timeout: 10000 }).click();
      cy.url({ timeout: 10000 }).should('include', '/chat');
    });

    it("navega para favoritos", () => {
      cy.contains('button', 'Favoritos', { timeout: 10000 }).click();
      cy.url({ timeout: 10000 }).should('include', '/favorites');
    });

    it("navega para adicionar item", () => {
      cy.contains('button', 'Adicionar', { timeout: 10000 }).click();
      cy.url({ timeout: 10000 }).should('include', '/create-item');
    });

    it("volta para home ao clicar no logo", () => {
      cy.contains('Give.me', { timeout: 10000 }).click();
      cy.url({ timeout: 10000 }).should('eq', 'https://give-me.vercel.app/');
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

    it("exibe informações corretas do usuário", () => {
      cy.contains('Usuário', { timeout: 10000 }).should('be.visible');
      cy.contains('0 Itens Cadastrados', { timeout: 10000 }).should('be.visible');
    });
  });

  describe("Testes de Acessibilidade", () => {
    it("campo de busca tem placeholder", () => {
      cy.get('input[placeholder="Buscar itens..."]', { timeout: 10000 })
        .should('have.attr', 'placeholder');
    });

    it("botões de navegação são clicáveis", () => {
      cy.contains('button', 'Chat', { timeout: 10000 }).should('be.enabled');
      cy.contains('button', 'Favoritos', { timeout: 10000 }).should('be.enabled');
      cy.contains('button', 'Adicionar', { timeout: 10000 }).should('be.enabled');
    });

    
  });
});

// Comandos customizados atualizados
Cypress.Commands.add('fazerLoginPerfil', () => {
  cy.visit("https://give-me.vercel.app/login", {
    timeout: 30000,
    failOnStatusCode: false
  });
  cy.get('input[name="username"]', { timeout: 10000 }).type('admin');
  cy.get('input[name="password"]', { timeout: 10000 }).type('admin');
  cy.contains('button', 'Entrar', { timeout: 10000 }).click();
  cy.url({ timeout: 15000 }).should('not.include', '/login');
});

Cypress.Commands.add('navegarParaPerfil', () => {
  cy.visit("https://give-me.vercel.app/profile", {
    timeout: 30000,
    failOnStatusCode: false
  });
  cy.wait(3000);
});

// Testes com comandos customizados
describe("Perfil com Comandos Customizados", () => {
  beforeEach(() => {
    cy.fazerLoginPerfil();
    cy.navegarParaPerfil();
  });

  it('usa comando para navegar para perfil', () => {
    cy.contains('Usuário', { timeout: 10000 }).should('be.visible');
    cy.contains('0 Itens Cadastrados', { timeout: 10000 }).should('be.visible');
  });

  it('fluxo completo de navegação', () => {
    cy.contains('Adicionar Item', { timeout: 10000 }).click();
    cy.url({ timeout: 10000 }).should('include', '/create-item');
  });
});

// Testes de responsividade
describe("Responsividade do Perfil", () => {
  beforeEach(() => {
    cy.fazerLoginPerfil();
    cy.navegarParaPerfil();
  });

  it('renderiza corretamente em mobile', () => {
    cy.viewport('iphone-x');
    cy.contains('Usuário', { timeout: 10000 }).should('be.visible');
    cy.contains('Conta', { timeout: 10000 }).should('be.visible');
  });

  it('renderiza corretamente em tablet', () => {
    cy.viewport('ipad-2');
    cy.contains('Give.me', { timeout: 10000 }).should('be.visible');
    cy.contains('Preferências', { timeout: 10000 }).should('be.visible');
  });

  it('renderiza corretamente em desktop', () => {
    cy.viewport(1920, 1080);
    cy.contains('Usuário', { timeout: 10000 }).should('be.visible');
    cy.contains('Sair da Conta', { timeout: 10000 }).should('be.visible');
  });
});
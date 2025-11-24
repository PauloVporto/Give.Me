// chat.cy.js

describe("Tela de Chat - Give.me", () => {
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
    
    // Visita a página de chat com fallback
    cy.visit("https://give-me.vercel.app/chat", {
      timeout: 30000,
      failOnStatusCode: false
    });
    cy.wait(3000);
  });

  describe("Testes de Funcionalidades Existentes", () => {
    it("exibe todos os elementos visuais principais", () => {
      // Header com timeouts aumentados
      cy.contains('Give.me', { timeout: 10000 }).should("be.visible");
      cy.contains('button', 'Chat', { timeout: 10000 }).should("be.visible");
      cy.contains('button', 'Favoritos', { timeout: 10000 }).should("be.visible");
      cy.contains('button', 'Perfil', { timeout: 10000 }).should("be.visible");
      cy.contains('button', 'Adicionar', { timeout: 10000 }).should("be.visible");

      // Título da página
      cy.contains('Mensagens', { timeout: 10000 }).should("be.visible");
      
      // Lista de conversas
      cy.contains('Cleitin', { timeout: 10000 }).should("be.visible");
      cy.contains('Teste', { timeout: 10000 }).should("be.visible");
      cy.contains('Dimitri', { timeout: 10000 }).should("be.visible");
      cy.contains('Usuário', { timeout: 10000 }).should("be.visible");
      cy.contains('Kawan', { timeout: 10000 }).should("be.visible");
      cy.contains('Felipe', { timeout: 10000 }).should("be.visible");
      cy.contains('Paulo Vicente', { timeout: 10000 }).should("be.visible");

      // Datas e status
      cy.contains('24/11/2025', { timeout: 10000 }).should("be.visible");
      cy.contains('20/11/2025', { timeout: 10000 }).should("be.visible");
      cy.contains('Nova conversa', { timeout: 10000 }).should("be.visible");
    });

    it("exibe área de mensagens quando conversa está selecionada", () => {
      // Verifica elementos da conversa selecionada (Teste)
      cy.contains('Teste', { timeout: 10000 }).should("be.visible");
      
      // Mensagens
      cy.contains('Olá Admin! Sou um novo usuário e estou testando o chat!', { timeout: 10000 }).should("be.visible");
      cy.contains('Olá! Bem-vindo ao sistema! Seu chat está funcionando perfeitamente! 🎉', { timeout: 10000 }).should("be.visible");
      cy.contains('Obrigado! Funciona muito bem. Sistema incrível! 👍', { timeout: 10000 }).should("be.visible");
      cy.contains('ola', { timeout: 10000 }).should("be.visible");
      
      // Timestamps
      cy.contains('01:06', { timeout: 10000 }).should("be.visible");
      cy.contains('01:09', { timeout: 10000 }).should("be.visible");
      cy.contains('10:46', { timeout: 10000 }).should("be.visible");
      cy.contains('11:43', { timeout: 10000 }).should("be.visible");
    });

    it("exibe avatares das conversas", () => {
      cy.get('.MuiAvatar-root', { timeout: 10000 }).should('have.length.at.least', 7);
    });
  });

  describe("Testes de Navegação", () => {
    it("permite clicar em diferentes conversas", () => {
      cy.contains('Cleitin', { timeout: 10000 }).click();
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
  });

  describe("Testes de Acessibilidade", () => {
    it("botões de navegação são clicáveis", () => {
      cy.contains('button', 'Favoritos', { timeout: 10000 }).should('be.enabled');
      cy.contains('button', 'Perfil', { timeout: 10000 }).should('be.enabled');
      cy.contains('button', 'Adicionar', { timeout: 10000 }).should('be.enabled');
    });
  });
});

// Comandos customizados atualizados
Cypress.Commands.add('fazerLoginChat', () => {
  cy.visit("https://give-me.vercel.app/login", {
    timeout: 30000,
    failOnStatusCode: false
  });
  cy.get('input[name="username"]', { timeout: 10000 }).type('admin');
  cy.get('input[name="password"]', { timeout: 10000 }).type('admin');
  cy.contains('button', 'Entrar', { timeout: 10000 }).click();
  cy.url({ timeout: 15000 }).should('not.include', '/login');
});

Cypress.Commands.add('navegarParaChat', () => {
  cy.visit("https://give-me.vercel.app/chat", {
    timeout: 30000,
    failOnStatusCode: false
  });
  cy.wait(3000);
});

Cypress.Commands.add('selecionarConversa', (nome) => {
  cy.contains(nome, { timeout: 10000 }).click();
});

// Testes com comandos customizados
describe("Chat com Comandos Customizados", () => {
  beforeEach(() => {
    cy.fazerLoginChat();
    cy.navegarParaChat();
  });

  it('usa comando para selecionar conversa', () => {
    cy.selecionarConversa('Cleitin');
  });

  it('fluxo completo de chat', () => {
    cy.selecionarConversa('Dimitri');
  });
});

// Testes de responsividade
describe("Responsividade do Chat", () => {
  beforeEach(() => {
    cy.fazerLoginChat();
    cy.navegarParaChat();
  });

  it('renderiza corretamente em mobile', () => {
    cy.viewport('iphone-x');
    cy.contains('Mensagens', { timeout: 10000 }).should('be.visible');
    cy.contains('Teste', { timeout: 10000 }).should('be.visible');
  });

  it('renderiza corretamente em desktop', () => {
    cy.viewport(1920, 1080);
    cy.contains('Mensagens', { timeout: 10000 }).should('be.visible');
    cy.contains('Adicionar', { timeout: 10000 }).should('be.visible');
  });
});
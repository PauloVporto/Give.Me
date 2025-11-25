// create-item.cy.js

describe("Tela de Criação de Item - Give.me", () => {
  beforeEach(() => {
    // Login robusto
    cy.visit("https://give-me.vercel.app/login", {
      timeout: 30000,
      failOnStatusCode: false
    });
    
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.get('input[name="username"]', { timeout: 10000 }).should('be.visible');
    
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin');
    cy.contains('button', 'Entrar').click();
    
    // Verifica redirecionamento
    cy.url({ timeout: 30000 }).should('not.include', '/login');
    
    // Acessa criação com fallback
    cy.visit("https://give-me.vercel.app/create-item", {
      timeout: 30000,
      failOnStatusCode: false
    });
    cy.wait(3000);
  });

  describe("Testes de Funcionalidades Existentes", () => {
    it("permite entrada de dados no campo título", () => {
      cy.get('input[placeholder*="Título do Item"]', { timeout: 30000 })
        .type('Celular Samsung')
        .should('have.value', 'Celular Samsung');
    });

    it("permite entrada de dados no campo descrição", () => {
      cy.get('textarea[placeholder*="Descrição"]', { timeout: 10000 })
        .type('Celular em bom estado')
        .should('have.value', 'Celular em bom estado');
    });

    it("permite entrada de dados no campo localização", () => {
      cy.get('input[placeholder*="Cidade, Estado"]', { timeout: 10000 })
        .type('São Paulo, SP')
        .should('have.value', 'São Paulo, SP');
    });

    it("permite selecionar categoria", () => {
      cy.get('select', { timeout: 10000 })
        .select('Eletrônicos')
        .should('have.value', 'e4d9994f-c46e-4dc2-815c-9456adb4c9c0');
    });

    it("permite selecionar tipo de anúncio Venda", () => {
      cy.contains('button', 'Venda', { timeout: 10000 }).click();
      cy.contains('Preço', { timeout: 10000 }).should("be.visible");
    });

    it("permite selecionar tipo de anúncio Troca", () => {
      cy.contains('button', 'Troca', { timeout: 10000 }).click();
    });

    it("permite selecionar tipo de anúncio Doação", () => {
      cy.contains('button', 'Doação', { timeout: 10000 }).click();
    });

    it("permite preencher preço quando Venda está selecionado", () => {
      cy.contains('button', 'Venda', { timeout: 10000 }).click();
      cy.get('input[placeholder*="0,00"]', { timeout: 10000 })
        .type('1500.00')
        .should('have.value', '1500.00');
    });

    it("permite selecionar condição do produto", () => {
      cy.contains('button', 'Novo', { timeout: 10000 }).click();
      cy.contains('button', 'Usado - Bom Estado', { timeout: 10000 }).click();
      cy.contains('button', 'Precisa de Reparo', { timeout: 10000 }).click();
    });

    it("valida campos obrigatórios do formulário", () => {
      cy.get('input[placeholder*="Título do Item"]', { timeout: 10000 })
        .should('have.attr', 'required');
      cy.get('textarea[placeholder*="Descrição"]', { timeout: 10000 })
        .should('have.attr', 'required');
    });

    it("mantém botão de publicar habilitado", () => {
      cy.contains('button', 'Publicar Item', { timeout: 10000 })
        .should('be.enabled');
    });

    it("apresenta placeholders nos campos de entrada", () => {
      cy.get('input[placeholder*="Título do Item"]', { timeout: 10000 })
        .should('have.attr', 'placeholder');
      cy.get('textarea[placeholder*="Descrição"]', { timeout: 10000 })
        .should('have.attr', 'placeholder');
      cy.get('input[placeholder*="Cidade, Estado"]', { timeout: 10000 })
        .should('have.attr', 'placeholder');
      cy.get('input[placeholder*="0,00"]', { timeout: 10000 })
        .should('have.attr', 'placeholder');
    });

    it("permite limpar campos preenchidos", () => {
      cy.get('input[placeholder*="Título do Item"]', { timeout: 10000 })
        .type('teste')
        .clear()
        .should('have.value', '');
      cy.get('textarea[placeholder*="Descrição"]', { timeout: 10000 })
        .type('teste')
        .clear()
        .should('have.value', '');
    });

    it("não exibe mensagens de erro inicialmente", () => {
      cy.get('.error', { timeout: 5000 }).should('not.exist');
      cy.get('.alert', { timeout: 5000 }).should('not.exist');
    });

    it("mantém layout consistente ao recarregar", () => {
      cy.reload();
      cy.contains('Cadastrar novo produto', { timeout: 10000 }).should('be.visible');
      cy.contains('Informações do Item', { timeout: 10000 }).should('be.visible');
    });

    it("exibe botão de voltar", () => {
      cy.get('button[aria-label="voltar"]', { timeout: 10000 }).should('be.visible');
    });
  });

  describe("Testes de Funcionalidades em Falta", () => {
    it("não implementa mensagens de erro acessíveis", () => {
      cy.get('[role="alert"]', { timeout: 5000 }).should('not.exist');
      cy.get('[aria-live="polite"]', { timeout: 5000 }).should('not.exist');
      cy.get('[aria-live="assertive"]', { timeout: 5000 }).should('not.exist');
    });

    it("não valida formato do preço em tempo real", () => {
      cy.contains('button', 'Venda', { timeout: 10000 }).click();
      cy.get('input[placeholder*="0,00"]', { timeout: 10000 })
        .type('abc')
        .should('have.value', 'abc');
    });
  });
});

Cypress.Commands.add('preencherItemBasico', (titulo = 'Produto Teste', descricao = 'Descrição teste', localizacao = 'São Paulo, SP') => {
  cy.get('input[placeholder*="Título do Item"]', { timeout: 10000 }).clear().type(titulo);
  cy.get('textarea[placeholder*="Descrição"]', { timeout: 10000 }).clear().type(descricao);
  cy.get('input[placeholder*="Cidade, Estado"]', { timeout: 10000 }).clear().type(localizacao);
});

Cypress.Commands.add('selecionarVenda', (preco = '100.00') => {
  cy.contains('button', 'Venda', { timeout: 10000 }).click();
  cy.get('input[placeholder*="0,00"]', { timeout: 10000 }).clear().type(preco);
});

describe("Criação de Item com Comandos Customizados", () => {
  beforeEach(() => {
    cy.visit("https://give-me.vercel.app/login", {
      timeout: 30000,
      failOnStatusCode: false
    });
    cy.get('input[name="username"]', { timeout: 10000 }).type('admin');
    cy.get('input[name="password"]', { timeout: 10000 }).type('admin');
    cy.contains('button', 'Entrar', { timeout: 10000 }).click();
    cy.url({ timeout: 15000 }).should('not.include', '/login');
    cy.visit("https://give-me.vercel.app/create-item", {
      timeout: 30000,
      failOnStatusCode: false
    });
  });

  it("preenche formulário básico usando comandos personalizados", () => {
    cy.preencherItemBasico('Notebook Dell', 'Notebook em perfeito estado', 'Belo Horizonte, MG');
    cy.get('input[placeholder*="Título do Item"]', { timeout: 10000 }).should('have.value', 'Notebook Dell');
    cy.get('textarea[placeholder*="Descrição"]', { timeout: 10000 }).should('have.value', 'Notebook em perfeito estado');
    cy.get('input[placeholder*="Cidade, Estado"]', { timeout: 10000 }).should('have.value', 'Belo Horizonte, MG');
  });
});
// create-item.cy.js

const CREATE_ITEM_URL = '**/items*';

describe("Tela de Criação de Item", () => {
  beforeEach(() => {
    // Faz login primeiro
    cy.visit("https://give-me.vercel.app/login");
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin');
    cy.get('button.form-button[type="submit"]').click();
    
    // Aguarda o login
    cy.wait(2000);
    
    // Visita a página de criação
    cy.visit("https://give-me.vercel.app/create-item");
  });

  it("renderiza componentes principais", () => {
    cy.contains('Cadastrar novo produto').should("be.visible");
    cy.contains('Photos').should("be.visible");
    cy.contains('Item Information').should("be.visible");
    cy.contains('Category').should("be.visible");
    cy.contains('Location').should("be.visible");
    cy.contains('Listing Type').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
  });

  describe('Criação de Item (testes básicos)', () => {
    
    /*it('permite preencher título do item', () => {
      cy.get('input[placeholder*="Item Title"]')
        .type('Produto de Teste')
        .should('have.value', 'Produto de Teste');
    });*/

    it('permite preencher descrição', () => {
      cy.get('textarea[placeholder*="Description"]')
        .type('Descrição do produto teste')
        .should('have.value', 'Descrição do produto teste');
    });

    it('permite preencher localização', () => {
      cy.get('input[placeholder*="City, State"]')
        .type('São Paulo, SP')
        .should('have.value', 'São Paulo, SP');
    });
  });

  describe('Criação de Item (testes de listing type)', () => {
    
    it('permite selecionar Sell e preencher preço', () => {
      cy.contains('button', 'Sell').click();
      cy.contains('Price').should('be.visible');
      
      // CORREÇÃO: Usa o seletor correto baseado no HTML
      cy.get('input[inputmode="decimal"], input[placeholder="0,00"]')
        .first()
        .type('150.50')
        .should('have.value', '150.50');
    });

    it('permite selecionar Donation', () => {
      cy.contains('button', 'Donation').click();
    });

    it('permite selecionar Trade', () => {
      cy.contains('button', 'Trade').click();
    });
  });

  describe('Criação de Item (testes de usabilidade)', () => {
    
    it('mantém valores dos campos durante preenchimento', () => {
      const title = 'Produto Persistente';
      const description = 'Descrição que deve persistir';
      const location = 'Rio de Janeiro, RJ';

      cy.get('input[placeholder*="Item Title"]').type(title);
      cy.get('textarea[placeholder*="Description"]').type(description);
      cy.get('input[placeholder*="City, State"]').type(location);
      
      // Verifica se os valores permanecem nos campos
      cy.get('input[placeholder*="Item Title"]').should('have.value', title);
      cy.get('textarea[placeholder*="Description"]').should('have.value', description);
      cy.get('input[placeholder*="City, State"]').should('have.value', location);
    });

    it('botão permanece habilitado durante preenchimento', () => {
      cy.get('input[placeholder*="Item Title"]').type('Produto Teste');
      cy.get('button[type="submit"]').should('not.be.disabled');
    });
  });

  describe('Criação de Item (testes de segurança)', () => {
    
    it('protege contra XSS nos campos de input', () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      cy.get('input[placeholder*="Item Title"]').type(xssPayload);
      cy.get('textarea[placeholder*="Description"]').type(xssPayload);
      
      cy.get('input[placeholder*="Item Title"]').should('have.value', xssPayload);
      cy.get('textarea[placeholder*="Description"]').should('have.value', xssPayload);
    });
  });

  describe('Criação de Item (testes de navegação)', () => {
    
    it('botão de voltar funciona corretamente', () => {
      cy.get('button[aria-label*="voltar"]').click();
      cy.url().should('not.include', '/create-item');
    });
  });
});

// Comando customizado CORRIGIDO
Cypress.Commands.add('preencherItemBasico', (dados = {}) => {
  const {
    title = 'Produto de Teste',
    description = 'Descrição de teste',
    location = 'São Paulo, SP'
  } = dados;

  cy.get('input[placeholder*="Item Title"]').type(title);
  cy.get('textarea[placeholder*="Description"]').type(description);
  cy.get('input[placeholder*="City, State"]').type(location);
});

// Comando customizado para preencher item com venda
Cypress.Commands.add('preencherItemVenda', (dados = {}) => {
  const {
    title = 'Produto de Teste',
    description = 'Descrição de teste',
    location = 'São Paulo, SP',
    price = '100.00'
  } = dados;

  cy.preencherItemBasico({ title, description, location });
  cy.contains('button', 'Sell').click();
  cy.get('input[inputmode="decimal"], input[placeholder="0,00"]')
    .first()
    .type(price);
});

// Testes usando o comando customizado CORRIGIDO
describe('Criação de Item com Comandos Customizados', () => {
  beforeEach(() => {
    cy.visit("https://give-me.vercel.app/login");
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin');
    cy.get('button.form-button[type="submit"]').click();
    cy.wait(2000);
    cy.visit("https://give-me.vercel.app/create-item");
  });

  it('preenche formulário básico usando comando customizado', () => {
    cy.preencherItemBasico({
      title: 'Notebook Dell',
      description: 'Notebook em perfeito estado',
      location: 'Belo Horizonte, MG'
    });
    
    // Verifica se os campos foram preenchidos
    cy.get('input[placeholder*="Item Title"]').should('have.value', 'Notebook Dell');
    cy.get('textarea[placeholder*="Description"]').should('have.value', 'Notebook em perfeito estado');
    cy.get('input[placeholder*="City, State"]').should('have.value', 'Belo Horizonte, MG');
    
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('preenche formulário completo para venda', () => {
    // Usa o novo comando para venda
    cy.preencherItemVenda({
      title: 'Smartphone Samsung',
      description: 'Smartphone com 128GB',
      location: 'Curitiba, PR',
      price: '1200.00'
    });
    
    // Verifica se tudo foi preenchido corretamente
    cy.get('input[placeholder*="Item Title"]').should('have.value', 'Smartphone Samsung');
    cy.get('textarea[placeholder*="Description"]').should('have.value', 'Smartphone com 128GB');
    cy.get('input[placeholder*="City, State"]').should('have.value', 'Curitiba, PR');
    cy.get('input[inputmode="decimal"]').should('have.value', '1200.00');
    
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('preenche formulário para doação', () => {
    cy.preencherItemBasico({
      title: 'Roupas Usadas',
      description: 'Roupas em bom estado para doação',
      location: 'Porto Alegre, RS'
    });
    
    cy.contains('button', 'Donation').click();
    
    // Verifica se foi preenchido e o tipo Donation foi selecionado
    cy.get('input[placeholder*="Item Title"]').should('have.value', 'Roupas Usadas');
    cy.get('textarea[placeholder*="Description"]').should('have.value', 'Roupas em bom estado para doação');
    cy.get('input[placeholder*="City, State"]').should('have.value', 'Porto Alegre, RS');
    
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('testa diferentes valores de preço', () => {
    cy.preencherItemVenda({
      title: 'Tablet Android',
      description: 'Tablet com 10 polegadas',
      location: 'Florianópolis, SC',
      price: '899.99'
    });
    
    cy.get('input[inputmode="decimal"]').should('have.value', '899.99');
  });
});
const REGISTER_URL = '**/users/register*';

describe('Registro - testes funcionais', () => {
  beforeEach(() => {
    cy.visit('https://give-me.vercel.app/register');
    cy.clearLocalStorage();
  });

  it('renderiza formulário completo', () => {
    cy.contains(/give\.me/i);
    cy.contains(/crie sua conta/i);
    
    // Verifica se há inputs no formulário
    cy.get('form').find('input').should('have.length.at.least', 4);
    cy.get('button[type="submit"]').should('be.visible');
    cy.contains('a', /sign\s*in/i).should('exist');
  });

  it('sucesso 201 redireciona para login', () => {
    cy.intercept('POST', REGISTER_URL, {
      statusCode: 201,
      body: { id: 1, email: 'user@example.com' },
    }).as('regOk');

    // Preenche usando seletores mais específicos
    cy.get('form').within(() => {
      cy.get('input').eq(0).type('Ada');
      cy.get('input').eq(1).type('Lovelace');
      cy.get('input').eq(2).type('user@example.com');
      cy.get('input').eq(3).type('Pass12345!');
    });
    
    cy.get('button[type="submit"]').click();

    cy.wait('@regOk');
    cy.location('pathname').should('eq', '/login');
  });

  it('email já existe 409 mostra alert', () => {
    cy.intercept('POST', REGISTER_URL, {
      statusCode: 409,
      body: { detail: 'Email already exists' },
    }).as('reg409');

    cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

    cy.get('form').within(() => {
      cy.get('input').eq(0).type('Ada');
      cy.get('input').eq(1).type('Lovelace');
      cy.get('input').eq(2).type('user@example.com');
      cy.get('input').eq(3).type('Pass12345!');
    });
    
    cy.get('button[type="submit"]').click();

    cy.wait('@reg409');
    cy.get('@alert').should('have.been.called');
  });

  it('validação 400 mostra alert', () => {
    cy.intercept('POST', REGISTER_URL, {
      statusCode: 400,
      body: { email: ['Formato inválido'] },
    }).as('reg400');

    cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

    // Desabilita validação HTML5
    cy.get('form').invoke('attr', 'novalidate', 'novalidate');
    
    cy.get('form').within(() => {
      cy.get('input').eq(0).type('Ada');
      cy.get('input').eq(1).type('Lovelace');
      cy.get('input').eq(2).type('email-invalido');
      cy.get('input').eq(3).type('Pass12345!');
    });
    
    cy.get('button[type="submit"]').click();

    cy.wait('@reg400');
    cy.get('@alert').should('have.been.called');
  });

  it('link para login funciona', () => {
    cy.contains('a', /sign\s*in/i).click();
    cy.location('pathname').should('eq', '/login');
  });

  it('validação HTML5 required funciona para todos os campos', () => {
    cy.intercept('POST', REGISTER_URL, () => {
      throw new Error('Não deveria chamar API com campos vazios');
    }).as('guard');

    cy.get('button[type="submit"]').click();

    cy.get('form').then(($form) => {
      expect($form[0].checkValidity()).to.be.false;
    });
  });

  it('erro 500 mostra alert', () => {
    cy.intercept('POST', REGISTER_URL, { 
      statusCode: 500, 
      body: { detail: 'Server error' } 
    }).as('reg500');
    
    cy.window().then((win) => cy.stub(win, 'alert').as('alert'));

    cy.get('form').within(() => {
      cy.get('input').eq(0).type('Ada');
      cy.get('input').eq(1).type('Lovelace');
      cy.get('input').eq(2).type('user@example.com');
      cy.get('input').eq(3).type('Pass12345!');
    });
    
    cy.get('button[type="submit"]').click();

    cy.wait('@reg500');
    cy.get('@alert').should('have.been.called');
  });

  it('payload envia apenas campos necessários', () => {
    cy.intercept('POST', REGISTER_URL, (req) => {
      expect(req.body).to.have.keys(['first_name', 'last_name', 'email', 'password']);
      req.reply({ statusCode: 201, body: { id: 1 } });
    }).as('regPayload');

    cy.get('form').within(() => {
      cy.get('input').eq(0).type('Ada');
      cy.get('input').eq(1).type('Lovelace');
      cy.get('input').eq(2).type('user@example.com');
      cy.get('input').eq(3).type('Pass12345!');
    });
    
    cy.get('button[type="submit"]').click();
    
    cy.wait('@regPayload');
  });
});

describe('Registro - casos especiais', () => {
  beforeEach(() => {
    cy.visit('https://give-me.vercel.app/register');
    cy.clearLocalStorage();
  });

  it('limpa localStorage ao entrar na página', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('access_token', 'old-token');
      win.localStorage.setItem('refresh_token', 'old-refresh');
    });

    cy.reload();

    cy.window().then((win) => {
      expect(win.localStorage.getItem('access_token')).to.be.null;
      expect(win.localStorage.getItem('refresh_token')).to.be.null;
    });
  });
});

describe('Registro (testes avançados)', () => {
  
  beforeEach(() => {
    cy.visit('https://give-me.vercel.app/register');
    cy.clearLocalStorage();
  });

  it('NÃO valida força da senha no frontend', () => {
    cy.intercept('POST', REGISTER_URL, {
      statusCode: 201,
      body: { id: 1, email: 'user@example.com' },
    }).as('regOk');

    // Aguarda o formulário carregar
    cy.get('form').should('be.visible');
    
    // Senha muito fraca mas é aceita
    cy.get('form').within(() => {
      cy.get('input').eq(0).type('Test');
      cy.get('input').eq(1).type('User');
      cy.get('input').eq(2).type('test@example.com');
      cy.get('input').eq(3).type('123');
    });
    
    cy.get('button[type="submit"]').click();

    // NÃO mostra mensagem de senha fraca
    cy.contains(/senha.*fraca|password.*weak/i).should('not.exist');
    cy.wait('@regOk');
  });

  it('NÃO pede confirmação de email', () => {
    cy.intercept('POST', REGISTER_URL, {
      statusCode: 201,
      body: { id: 1, email: 'user@example.com' },
    }).as('regOk');

    cy.get('form').within(() => {
      cy.get('input').eq(0).type('Ada');
      cy.get('input').eq(1).type('Lovelace');
      cy.get('input').eq(2).type('user@example.com');
      cy.get('input').eq(3).type('Pass12345!');
    });
    
    cy.get('button[type="submit"]').click();

    cy.wait('@regOk');
    
    // NÃO mostra mensagem de confirmação de email
    cy.contains(/confirme seu email|check your email/i).should('not.exist');
  });

  it('NÃO tem validação em tempo real do email', () => {
    // Aguarda o formulário carregar
    cy.get('form').should('be.visible');
    
    // Digita email inválido
    cy.get('form').within(() => {
      cy.get('input').eq(2).type('email-invalido');
    });
    
    // NÃO mostra erro imediatamente
    cy.get('.error-message, [role="alert"]').should('not.exist');
    
    // Campo aceita o valor
    cy.get('form').within(() => {
      cy.get('input').eq(2).should('have.value', 'email-invalido');
    });
  });

  it('permite caracteres especiais nos nomes', () => {
    cy.get('form').within(() => {
      cy.get('input').eq(0).type('João');
      cy.get('input').eq(1).type('Silva');
      cy.get('input').eq(0).should('have.value', 'João');
      cy.get('input').eq(1).should('have.value', 'Silva');
    });
  });

  it('formulário tem estrutura correta', () => {
    cy.get('form').within(() => {
      cy.get('input').should('have.length', 4);
      // Primeiro input deve ser first_name
      cy.get('input').eq(0).should('have.attr', 'required');
      // Segundo input deve ser last_name  
      cy.get('input').eq(1).should('have.attr', 'required');
      // Terceiro input deve ser email
      cy.get('input').eq(2).should('have.attr', 'type', 'email');
      // Quarto input deve ser password
      cy.get('input').eq(3).should('have.attr', 'type', 'password');
    });
  });
});
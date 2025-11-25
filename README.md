# GIVE.ME 🔄

## Descrição

**Give.Me** é uma plataforma moderna de economia circular que conecta pessoas para **doar**, **trocar** ou **vender** itens usados de forma simples, segura e sustentável. 

A aplicação resolve o problema de dispersão de anúncios em múltiplas plataformas genéricas, oferecendo uma experiência focada em consumo consciente, economia local e redução de desperdício.

### ✨ Principais Funcionalidades

- **Filtros Inteligentes por Tipo**: Doação, Troca ou Venda
- **Categorização Visual**: Eletrônicos, Móveis, Livros, Esportes, Casa e Decoração, etc.
- **Sistema de Favoritos**: Salve e organize itens de interesse
- **Chat Integrado**: Negociação rápida e segura sem expor dados pessoais
- **Busca Avançada**: Por título, descrição e localização
- **Autenticação Completa**: JWT com refresh tokens
- **Upload de Múltiplas Fotos**: Até 5 imagens por anúncio
- **Sistema de Localização**: Filtro por cidade e estado
- **Perfil de Usuário**: Gerenciamento de anúncios e favoritos
- **Design Responsivo**: Interface moderna e intuitiva

## 🚀 Tecnologias Utilizadas

### Frontend

- **React 18** - Biblioteca JavaScript para interfaces
- **React Router v6** - Navegação SPA
- **Material-UI v5** - Componentes e design system
- **Vite** - Build tool e dev server
- **Axios** - Cliente HTTP
- **JWT Decode** - Gerenciamento de tokens
- **React Icons** - Ícones personalizados

### Backend

- **Python 3.11+**
- **Django 4.2** - Framework web
- **Django REST Framework** - API RESTful
- **PostgreSQL** - Banco de dados relacional
- **Pillow** - Processamento de imagens
- **CORS Headers** - Configuração de CORS
- **JWT Authentication** - Autenticação stateless

### Infraestrutura

- **Docker & Docker Compose** - Containerização
- **Nginx** - Servidor web (produção)
- **WhiteNoise** - Servir arquivos estáticos

### Testes

- **Pytest** - Testes unitários e de integração (backend)
- **Django Test** - Testes de modelos e views
- **Cypress** - Testes E2E (frontend)
- **Postman/Newman** - Testes de API

## 📋 Pré-requisitos

- **Docker** e **Docker Compose** instalados
- **Node.js 18+** e **npm** (para desenvolvimento frontend local)
- **Python 3.11+** (para desenvolvimento backend local)
- **PostgreSQL 14+** (se não usar Docker)

## 🔧 Instalação e Configuração

### Opção 1: Docker (Recomendado)

1. **Clone o repositório**
```bash
git clone https://github.com/PauloVporto/Give.Me.git
cd Give.Me
```

2. **Inicie os containers**
```bash
docker-compose up -d
```

3. **Execute as migrações**
```bash
docker-compose exec backend python manage.py migrate
```

4. **Crie um superusuário (opcional)**
```bash
docker-compose exec backend python manage.py createsuperuser
```

5. **Popule as categorias**
```bash
docker-compose exec backend python populate_categories.py
```

6. **Acesse a aplicação**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Admin: http://localhost:8000/admin

### Opção 2: Desenvolvimento Local

#### Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Executar migrações
python manage.py migrate

# Popular categorias
python populate_categories.py

# Iniciar servidor
python manage.py runserver
```

#### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🎯 Estrutura do Projeto

```
Give.Me/
├── backend/
│   ├── api/                    # App principal da API
│   │   ├── models.py          # Modelos do banco de dados
│   │   ├── serializers.py     # Serializers DRF
│   │   ├── views.py           # Views/Endpoints
│   │   ├── urls.py            # Rotas da API
│   │   └── migrations/        # Migrações do banco
│   ├── backend/               # Configurações Django
│   ├── chat/                  # App de chat
│   ├── media/                 # Upload de arquivos
│   ├── manage.py              # CLI Django
│   └── requirements.txt       # Dependências Python
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── styles/            # Arquivos CSS
│   │   ├── api.js             # Cliente Axios
│   │   ├── constants.js       # Constantes globais
│   │   └── App.jsx            # Componente raiz
│   ├── public/                # Arquivos estáticos
│   └── package.json           # Dependências Node
├── docs/
│   ├── openapi.yml            # Documentação OpenAPI
│   └── README_tests.md        # Documentação de testes
├── docker-compose.yml         # Orquestração Docker
└── README.md                  # Este arquivo
```

## 🔑 Variáveis de Ambiente

### Backend (.env)

```env
SECRET_KEY=sua-chave-secreta-django
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=giveme_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60  # minutos
JWT_REFRESH_TOKEN_LIFETIME=1440  # minutos (1 dia)
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

## 📱 Funcionalidades Principais

### Para Usuários

1. **Navegação Pública**
   - Visualizar todos os anúncios sem login
   - Filtrar por tipo (Doação/Troca/Venda)
   - Filtrar por categoria
   - Buscar por título/descrição

2. **Conta de Usuário**
   - Registro com email/senha
   - Login com JWT
   - Perfil personalizável
   - Gerenciar anúncios próprios

3. **Gerenciar Itens**
   - Criar anúncios (até 5 fotos)
   - Editar informações
   - Excluir anúncios
   - Marcar como disponível/negociado

4. **Interações**
   - Favoritar itens
   - Chat com anunciantes
   - Visualizar histórico

### Tipos de Transação

- **Doação**: Item gratuito, apenas retirada
- **Troca**: Especificar interesses de troca
- **Venda**: Definir preço em reais

## 🧪 Testes

### Backend

```bash
# Testes unitários com Pytest
cd backend
pytest

# Testes com cobertura
pytest --cov=api

# Testes específicos
pytest api/tests/test_models.py
```

### Frontend

```bash
# Testes E2E com Cypress
cd frontend
npm run cypress:open

# Testes headless
npm run cypress:run
```

### API

```bash
# Testes com Newman (Postman CLI)
newman run tests/postman/postman_local.json
```

## 🚀 Deploy

### Produção com Docker

```bash
# Build das imagens
docker-compose -f docker-compose.prod.yml build

# Subir containers
docker-compose -f docker-compose.prod.yml up -d

# Coletar arquivos estáticos
docker-compose exec backend python manage.py collectstatic --noinput
```

### Variáveis de Produção

- Alterar `DEBUG=False`
- Configurar `ALLOWED_HOSTS` adequadamente
- Usar banco de dados PostgreSQL em servidor dedicado
- Configurar HTTPS com certificado SSL
- Configurar storage S3 para media files

## 📊 Modelo de Dados

### Item
- `title`: Título do anúncio
- `description`: Descrição detalhada
- `category`: Categoria (FK)
- `type`: Doação/Troca/Venda
- `price`: Preço (apenas para Venda)
- `trade_interest`: Interesses (apenas para Troca)
- `status`: Novo/Usado
- `city`: Localização (FK)
- `user`: Proprietário (FK)
- `photos`: Múltiplas imagens

### User
- Campos padrão Django User
- `UserProfile`: Bio, foto, cidade, notificações

### Category
- `name`: Nome da categoria
- `slug`: URL amigável

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Frontend**: Felipe
- **Backend**: [Contribuidores]
- **Design**: [Contribuidores]

## 📞 Contato

- Email: suporte@giveme.com
- GitHub: [@PauloVporto](https://github.com/PauloVporto)

## 🎯 Roadmap

### Versão 2.0 (Próxima Release)
- [ ] Sistema de chat em tempo real (WebSockets)
- [ ] Notificações push
- [ ] Sistema de avaliações de usuários
- [ ] Compartilhamento em redes sociais
- [ ] Integração com mapas para localização

### Versão 3.0 (Futuro)
- [ ] App mobile (React Native)
- [ ] Sistema de pagamentos integrado
- [ ] IA para sugestões personalizadas
- [ ] Verificação de identidade
- [ ] Sistema de reputação gamificado

---

**Desenvolvido com ❤️ para promover economia circular e consumo consciente.**

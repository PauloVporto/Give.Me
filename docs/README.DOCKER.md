# 🐳 Guia de Dockerização - GIVE.ME com Supabase

## 📋 Pré-requisitos

- Docker instalado ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose instalado (já vem com Docker Desktop)
- Conta no Supabase com projeto criado

---

## ⚙️ Configuração

### 1️⃣ Obter credenciais do Supabase

Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com):

1. Vá em **Settings** > **Database**
2. Role até **Connection String** > **URI**
3. Copie as informações:
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **User**: `postgres.xxxxxxxxxxxxx` (ou apenas `postgres`)
   - **Password**: Sua senha do projeto
   - **Database**: `postgres` (padrão)
   - **Port**: `5432`

### 2️⃣ Configurar variáveis de ambiente

Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha com suas credenciais do Supabase:

```env
# SUPABASE DATABASE
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_NAME=postgres
DB_PWD=sua_senha_do_supabase

# DJANGO
DEBUG=True
SECRET_KEY=django-insecure-ia33j3j(x)i$9#s9kpti!k0#+8t3u=^4^9fd3!1$ytm1iv3wtc

# FRONTEND
VITE_API_URL=http://localhost:8000/
```

⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env` no Git!

---

## 🚀 Como Executar

### Primeira vez (build + up):

```bash
docker-compose up --build
```

### Execuções seguintes:

```bash
docker-compose up
```

### Rodar em background:

```bash
docker-compose up -d
```

---

## 🔍 Verificar se está funcionando

Após executar `docker-compose up`, você verá:

✅ **Backend**: http://localhost:8000  
✅ **Frontend**: http://localhost:3000
✅ **Admin Django**: http://localhost:8000/admin

Para verificar a conexão com Supabase:
```bash
docker-compose logs backend
```

Se conectou corretamente, você verá:
```
giveme_backend | Applying migrations...
giveme_backend | Operations to perform:
giveme_backend | Starting development server at http://0.0.0.0:8000/
```

---

## 📝 Comandos Úteis

### Gerenciar containers:

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver logs apenas do backend
docker-compose logs -f backend

# Parar containers
docker-compose down

# Reiniciar um serviço específico
docker-compose restart backend
```

### Executar comandos Django:

```bash
# Criar superusuário
docker-compose exec backend python manage.py createsuperuser

# Executar migrations
docker-compose exec backend python manage.py migrate

# Criar uma nova migration
docker-compose exec backend python manage.py makemigrations

# Shell do Django
docker-compose exec backend python manage.py shell

# Acessar o container
docker-compose exec backend sh
```

### Executar comandos no Frontend:

```bash
# Instalar um pacote npm
docker-compose exec frontend npm install <pacote>

# Rodar testes Cypress
docker-compose exec frontend npm run cy:run

# Acessar o container
docker-compose exec frontend sh
```

---

## 🔧 Troubleshooting

### ❌ Erro: "could not connect to server"

**Problema**: Django não consegue conectar ao Supabase

**Solução**:
1. Verifique se as credenciais no `.env` estão corretas
2. Confirme que o IP do seu container tem acesso ao Supabase:
   - No Supabase Dashboard: **Settings** > **Database** > **Connection Pooling**
   - Adicione `0.0.0.0/0` em **Allowed IP addresses** (apenas para desenvolvimento)
3. Verifique se `DB_HOST` não tem `http://` ou `https://`

```bash
# Teste a conexão
docker-compose exec backend python manage.py check --database default
```

### ❌ Erro: "SSL connection required"

**Problema**: Supabase exige SSL, mas está desabilitado

**Solução**: O `settings.py` já está configurado com `"sslmode": "require"`. Não precisa alterar.

### ❌ Frontend não conecta ao backend

**Problema**: CORS ou URL incorreta

**Solução**:
1. Verifique `VITE_API_URL` no `.env`
2. O CORS já está configurado em `settings.py` com `CORS_ALLOW_ALL_ORIGINS = True`
3. Reconstrua o frontend: `docker-compose up --build frontend`

### ❌ Mudanças no código não aparecem

**Problema**: Hot reload não está funcionando

**Solução**: Os volumes já estão configurados para hot-reload. Se não funcionar:
```bash
docker-compose down
docker-compose up --build
```

### ❌ Porta já está em uso

**Problema**: Outra aplicação usando porta 8000 ou 5173

**Solução**: Pare a aplicação que está usando a porta ou modifique no `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Usa porta 8001 no host
```

---

## 🗃️ Arquivos de Mídia (uploads)

Os arquivos enviados pelos usuários são salvos em um volume Docker chamado `media_files`.

Para acessar os arquivos:
```bash
# Listar arquivos
docker-compose exec backend ls -la /app/media

# Copiar arquivos para sua máquina
docker cp giveme_backend:/app/media ./backup_media
```

---

## 🧹 Limpeza

```bash
# Parar e remover containers
docker-compose down

# Remover containers, redes E volumes (⚠️ apaga mídia local)
docker-compose down -v

# Remover imagens não utilizadas
docker image prune -a
```

---

## 🎯 Diferenças entre Docker e Execução Local

| Aspecto | Local | Docker |
|---------|-------|--------|
| **PostgreSQL** | Supabase (nuvem) | Supabase (nuvem) |
| **Python/Node** | Instalado no sistema | Container isolado |
| **Dependências** | pip/npm local | Gerenciado pelo Docker |
| **Porta Backend** | 8000 | 8000 |
| **Porta Frontend** | 3000 | 3000 |
| **Hot Reload** | ✅ | ✅ |

---

## 📚 Próximos Passos

- [ ] Configurar ambiente de produção com `docker-compose.prod.yml`
- [ ] Adicionar Nginx como reverse proxy
- [ ] Configurar CI/CD com Docker
- [ ] Implementar backup automático do volume de mídia

---

## 🆘 Ajuda

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs -f`
2. Teste a conexão com Supabase manualmente
3. Reconstrua as imagens: `docker-compose build --no-cache`
4. Consulte a [documentação do Docker](https://docs.docker.com/)

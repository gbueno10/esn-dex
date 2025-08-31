# Admin API Usage Examples

## Configuração

Primeiro, configure sua chave de admin no arquivo `.env.local`:

```bash
ADMIN_API_KEY=your-super-secret-admin-key-here
```

## Endpoints Disponíveis

### 1. Verificar Status e Estatísticas

```bash
# Verificar acesso admin e estatísticas atuais
curl -H "x-admin-key: your-admin-key" \
     http://localhost:3000/api/admin/cleanup

# Estatísticas detalhadas
curl -H "x-admin-key: your-admin-key" \
     http://localhost:3000/api/admin/stats
```

### 2. Limpeza de Participants Inativos

Remove participants que não desbloquearam nenhum ESNer:

```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -H "x-admin-key: your-admin-key" \
     -d '{"action": "cleanup_anonymous_users"}' \
     http://localhost:3000/api/admin/cleanup
```

### 3. Limpeza de ESNers Vazios

Remove ESNers que não preencheram nenhuma informação do perfil:

```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -H "x-admin-key: your-admin-key" \
     -d '{"action": "cleanup_empty_esners"}' \
     http://localhost:3000/api/admin/cleanup
```

### 4. Limpeza Total (PERIGOSO!)

Remove todos os dados de teste, preservando apenas emails específicos:

```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -H "x-admin-key: your-admin-key" \
     -d '{"action": "cleanup_all_test_data"}' \
     http://localhost:3000/api/admin/cleanup
```

### 5. Operações com Usuários Específicos

```bash
# Detalhes de um usuário específico
curl -X POST \
     -H "Content-Type: application/json" \
     -H "x-admin-key: your-admin-key" \
     -d '{"action": "get_user_details", "target_uid": "user-id-here"}' \
     http://localhost:3000/api/admin/stats

# Deletar usuário específico
curl -X POST \
     -H "Content-Type: application/json" \
     -H "x-admin-key: your-admin-key" \
     -d '{"action": "delete_user", "target_uid": "user-id-here"}' \
     http://localhost:3000/api/admin/stats
```

## Script Utilitário

Você também pode usar o script `admin-util.js`:

```bash
# Configure a chave de admin
export ADMIN_API_KEY="your-admin-key"

# Execute comandos
node admin-util.js stats
node admin-util.js cleanup-anonymous
node admin-util.js cleanup-esners
node admin-util.js user-details "user-id"
node admin-util.js delete-user "user-id"
```

## Critérios de Limpeza

### Participants Inativos
- Usuários com role "participant"
- Campo `unlockedProfiles` vazio ou inexistente
- Não desbloquearam nenhum perfil de ESNer

### ESNers Vazios
- Usuários com role "esnner"
- Não preencheram NENHUMA das seguintes informações:
  - Nome (`name`)
  - Bio (`bio`)
  - Foto (`photoURL`)
  - Nacionalidade (`nationality`)
  - Conversation starters (`starters`)
  - Interesses (`interests`)
  - Redes sociais (`socials`)

## Segurança

- Todos os endpoints requerem a chave `x-admin-key` no header
- Fallback para autenticação via token JWT com role "admin"
- Logs detalhados de todas as operações
- Operações são irreversíveis - use com cuidado!

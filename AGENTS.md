# AI Context

Consulte a documentação em `./.docs` antes de implementar qualquer funcionalidade. Caso seja necessário alterar algum contrato, regra ou decisão documentada, pergunte ou sugira a modificação antes.

## Prioridade

1. requirements.md
2. domain-model.md
3. database-design.md
4. api-spec.md
5. architecture-backend.md
6. architecture-frontend.md

## Documentos

### requirements.md

Define o que o sistema deve fazer.
(Regras de negócio, fluxos, permissões e requisitos.)

### domain-model.md

Define como o negócio é modelado.
(Entidades, relacionamentos, agregados e enums.)

### database-design.md

Define como os dados são persistidos.
(Tabelas, colunas, constraints e relacionamentos.)

### api-spec.md

Define o contrato entre frontend e backend.
(Endpoints, requests, responses e autenticação.)

### architecture-backend.md

Define a arquitetura do backend.
(Estrutura de pastas, camadas e responsabilidades.)

### architecture-frontend.md (vai ser criado futuramente)

Define a arquitetura do frontend.
(Estrutura de páginas, componentes, rotas e organização.)

## Regras

- Não inventar regras de negócio.
- Não criar entidades fora do domínio documentado.
- Não alterar contratos sem atualizar a documentação.
- Em caso de conflito, seguir a ordem de prioridade acima.
# JSON Component Validator

O **JSON Component Validator** é um serviço REST API de alta confiabilidade projetado para verificar de forma rigorosa e determinística a conformidade de componentes de software representados em JSON com seus respectivos **JSON Schemas** e arquivos de templates estruturais baseline (`.template.json`).

O sistema faz parte de uma arquitetura inovadora na qual informações clínicas (como prontuários e planos de cuidados de saúde digital - mHealth) são processadas por geradores semi-estruturados (como LLMs ou geradores baseados em IA) e precisam de uma **camada determinística de validação de segurança e conformidade** antes de serem consumidas por dispositivos móveis ou aplicações de saúde.

---

## 🎯 Por que o projeto foi criado?

O desenvolvimento deste validador foi motivado pela necessidade de garantir **técnica e clinicamente** que componentes estruturais complexos gerados dinamicamente estejam em total conformidade com as regras de negócio e de segurança de saúde digital.

### Principais Fundamentos:
1. **Isolamento de Camada de Inferência (LLMs/IA):** Modelos de linguagem de larga escala são propensos a gerar conteúdos com variações estruturais ("alucinações"). Este validador atua como um barramento rigoroso que intercepta e avalia o JSON antes de sua entrega, garantindo conformidade total.
2. **Abordagem Fail-Safe (Default-Deny):** Qualquer componente que não corresponda de forma idêntica à assinatura do seu schema e template baseline é rejeitado por padrão.
3. **Spec-Driven Development (SDD):** O projeto foi concebido e implementado utilizando a metodologia SDD apoiada pelo **Spec-Kit** e **Gemini CLI**, garantindo 100% de clareza arquitetural, rastreabilidade técnica e eliminação de ambiguidades através de testes automatizados sistemáticos.

---

## 🚀 Principais Funcionalidades

* **Validação de Schema Avançada (AJV):** Utiliza a biblioteca altamente otimizada `AJV` para validar tipos de dados primitivos, formatos, intervalos de valores e a presença de parâmetros essenciais do sistema (ex: `id`, `status`).
* **Validação de Boilerplate (Recursive Matcher):** Um algoritmo de varredura recursiva analisa o payload contra um template baseline (`.template.json`), assegurando que propriedades estáticas mandatórias de infraestrutura (como `formatVersion` e `category`) permaneçam inalteradas e corretas.
* **Rastreabilidade Ponta a Ponta (Correlation IDs):** Implementação robusta baseada em `AsyncLocalStorage` nativo do Node.js, gerando e injetando um ID de correlação unificado para garantir que logs, fluxos internos e respostas HTTP estejam vinculados para fácil auditoria.
* **Segurança Integrada (Anti-Path-Traversal):** Bloqueio fail-safe contra ataques de travessia de caminho de diretórios ao buscar dinamicamente schemas e templates locais.

---

## 🛠️ Tecnologias Utilizadas

* **Runtime:** Node.js (v18+)
* **Linguagem:** TypeScript 5.x
* **Framework Web:** Express
* **Validador JSON Schema:** AJV (Another JSON Schema Validator)
* **Testes Automatizados:** Jest & Supertest
* **Segurança & IDs:** UUID v4, Path-Traversal Protection
* **Linter/Formatter:** ESLint, Prettier

---

## 📂 Estrutura de Diretórios

```text
Primeiro_Projeto/
├── .eslintignore
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── RELATO.MD                 # Relatório de desenvolvimento e resultados do projeto
├── package.json              # Configurações do projeto e scripts npm
├── tsconfig.json             # Configuração do TypeScript compiler
├── specs/                    # Documentos de especificação do Spec-Kit (SDD)
│   ├── 001-mhealth-component-validator/
│   └── 002-json-component-validator/
├── src/                      # Código Fonte Principal
│   ├── app.ts                # Inicialização do Express, middlewares e rotas
│   ├── server.ts             # Bootstrapping do servidor HTTP
│   ├── controllers/          # Controladores HTTP (HTTP handlers)
│   │   └── validator.controller.ts
│   ├── schemas/              # Schemas JSON e Templates de base por componente
│   │   ├── quiz.schema.json
│   │   └── quiz.template.json
│   ├── services/             # Lógica de negócio de carregamento e validação
│   │   ├── schema-loader.service.ts
│   │   ├── template-match.service.ts
│   │   └── validation.service.ts
│   ├── types/                # Definições de tipos TypeScript unificadas
│   └── utils/                # Utilitários globais (Logger estruturado em JSON, etc.)
└── tests/                    # Suíte de Testes Automatizados (Jest)
    ├── integration/          # Testes de integração de API (E2E)
    └── unit/                 # Testes unitários de serviços isolados
```

---

## 📥 Instalação e Execução

### Pré-requisitos
* **Node.js** versão `18.x` ou superior instalado.
* Gerenciador de pacotes **npm** instalado.

### 1. Clonar e Instalar as Dependências
Instale todos os pacotes de runtime e desenvolvimento configurados no projeto:
```bash
npm install
```

### 2. Rodar em Ambiente de Desenvolvimento
Inicie o servidor localmente com suporte a Hot Reload (atualização em tempo real na alteração de arquivos):
```bash
npm run dev
```
O servidor estará disponível por padrão em: `http://localhost:3000` (ou na porta configurada).

### 3. Executar a Suíte de Testes
Para garantir que toda a cobertura de segurança, validação de schema e templates esteja 100% íntegra:
```bash
npm run test
```

### 4. Compilar e Rodar em Produção
Gere o build de produção compilado em JavaScript nativo puro e inicialize o serviço:
```bash
npm run build
npm run start
```

---

## 📖 Como Utilizar (API Reference)

O validador expõe um endpoint principal para requisições de validação e um endpoint básico para monitoramento de integridade.

### 1. Health Check
Verifica se o barramento de validação está saudável e ativo.

* **Método:** `GET`
* **Endpoint:** `/health`
* **Exemplo de Resposta (Status 200 OK):**
```json
{
  "status": "UP",
  "timestamp": "2026-09-22T14:30:00.123Z"
}
```

---

### 2. Validar Componente
Submete um payload de componente clínico (`componentPayload`) do tipo informado (`componentType`) para passar pelas validações acumuladas de Schema e Template Baseline.

* **Método:** `POST`
* **Endpoint:** `/api/v1/validate`
* **Headers Recomendados:**
  * `Content-Type: application/json`
  * `X-Correlation-ID: <opcional-uuid-para-rastreabilidade>`

#### Exemplo de Requisição (Validando um Componente `quiz`):
```json
{
  "componentType": "quiz",
  "componentPayload": {
    "formatVersion": "1.0.0",
    "category": "clinical-device",
    "parameters": {
      "id": "quiz-ansiedade-01",
      "status": "active",
      "description": "Questionário clínico diário de ansiedade e batimento cardíaco"
    }
  }
}
```

#### Exemplo de Resposta de Sucesso (Validação Aprovada - Status 200 OK):
```json
{
  "isValid": true,
  "errors": [],
  "correlationId": "48f1fbd9-4df1-430c-99d9-bbdbe646739d",
  "timestamp": "2026-09-22T14:32:10.450Z"
}
```

#### Exemplo de Resposta de Falha (Validação de Atributos ou Template Rejeitada - Status 200 OK):
Caso as chaves obrigatórias faltem ou os metadados estáticos do template (como `category` ou `formatVersion`) difiram do baseline, o validador retorna as causas exatas:
```json
{
  "isValid": false,
  "errors": [
    {
      "path": "category",
      "code": "PREFILLED_FIELD_MISMATCH",
      "message": "Template baseline mismatch: expected 'clinical-device', got 'invalid-category'"
    },
    {
      "path": "parameters.status",
      "code": "SCHEMA_VALIDATION_ERROR",
      "message": "must have required property 'status'"
    }
  ],
  "correlationId": "48f1fbd9-4df1-430c-99d9-bbdbe646739d",
  "timestamp": "2026-09-22T14:33:15.110Z"
}
```

---

## 📈 Resultados de Qualidade do Projeto

* **Casos de Teste Ativos:** 18 testes automatizados abrangentes.
* **Taxa de Sucesso:** 100% de aprovação na suíte de testes.
* **Segurança:** Defesas robustas contra Path Traversal integradas na busca dinâmica dos arquivos de configuração em disco.
* **Rastreabilidade:** Logs ricos unificados em formato JSON gerados estruturadamente no Console para facilidade de acoplamento com agregadores de telemetria.

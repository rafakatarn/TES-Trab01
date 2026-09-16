# Desenvolvimento do JSON Component Validator com Spec-Driven Development

## 1. Contexto e objetivo

O trabalho teve como objetivo desenvolver o **JSON Component Validator**, um sistema responsável por verificar, de forma determinística, a conformidade de componentes de software representados em JSON com seus respectivos **JSON Schemas** e arquivos de templates baselines.

O sistema faz parte de uma arquitetura na qual informações clínicas, como prontuários e planos de cuidados, são processadas para gerar componentes de software destinados a aplicações de saúde digital (mHealth).

## 2. Aplicação do Spec-Driven Development

O desenvolvimento foi conduzido utilizando o **Spec-Kit**, seguindo o processo de **Spec-Driven Development (SDD)**.

A geração das especificações e o apoio ao desenvolvimento foram realizados utilizando o **Gemini CLI**, com custo total de **R$ 19,12**.

As principais etapas realizadas foram:

* **Constitution:** aderência aos princípios fundamentais do projeto, com destaque para determinismo (Princípio I), validação baseada em schema à prova de falhas ("default-deny" - Princípio II), rastreabilidade ponta a ponta com Correlation IDs (Princípio III), reprodutibilidade de compilação (Princípio IV), manutenibilidade isolada em camadas (Princípio V) e extensibilidade dinâmica (Princípio VI).
* **Specify:** definição dos requisitos funcionais (FR-001 a FR-010) e cenários de aceitação detalhados usando Given/When/Then.
* **Clarify:** identificação de ambiguidades, resolvendo o canal de interface como API REST e consolidando a validação de boilerplate por meio de comparação com arquivos de templates estruturais (`.template.json`).
* **Plan:** definição da arquitetura de diretórios desacoplada em TypeScript/Node.js, utilizando bibliotecas maduras compatíveis com JSON Schema.
* **Tasks:** decomposição do plano em 23 tarefas atômicas distribuídas em 6 fases de entrega incremental, orientadas de forma modular.
* **Implement:** desenvolvimento sistemático focado em TDD (Test-Driven Development), escrevendo e validando os testes de aceitação unitários e de integração antes do código funcional.

## 3. Solução desenvolvida

O validador recebe uma requisição HTTP contendo o tipo do componente e seu payload JSON. Ele injeta e rastreia um Correlation ID unificado na requisição e nos logs em formato JSON, utilizando a API nativa do Node.js `AsyncLocalStorage`.

O fluxo de validação carrega dinamicamente de forma segura (com proteção contra ataques de travessia de arquivos) o JSON Schema e o template baseline associados ao tipo do componente. A validação estrutural é feita em duas etapas acumulativas:
1. **Validação de Schema (AJV):** verifica tipos de dados, intervalos e presença de parâmetros obrigatórios (`id`, `status`).
2. **Validação de Boilerplate (Recursive Matcher):** percorre recursivamente o template baseline (`.template.json`) garantindo que todos os metadados estáticos obrigatórios (`formatVersion`, `category`) estejam idênticos no payload.

**Tecnologias utilizadas:** TypeScript 5.x, Node.js (v18+), **AJV (Another JSON Schema Validator)**, **Express** (como framework de roteamento), **Jest & Supertest** (para asserções em memória).

## 4. Resultados

O desenvolvimento foi finalizado com sucesso, atingindo todas as metas operacionais e metas de governança estabelecidas:

* **Componentes e schemas implementados:** Estrutura inicial padrão configurada para o componente `quiz` (`quiz.schema.json` e `quiz.template.json`), servindo de modelo base para prontuários clínicos e questionários de acompanhamento mHealth.
* **Quantidade de casos de teste:** **18 casos de teste automatizados** (13 testes unitários e 5 testes de integração de rota E2E).
* **Percentual de testes aprovados:** **100% de aprovação (18/18 testes passando)** com cobertura total de caminhos de erro e fluxos de segurança.
* **Principais cenários de validação testados:**
  * Validação de payloads válidos e íntegros.
  * Captura e acumulação de parâmetros obrigatórios ausentes.
  * Validação de incompatibilidade de tipos primitivos (ex: strings enviadas como números).
  * Detecção recursiva precisa de divergência ou ausência em campos pré-preenchidos do template (`PREFILLED_FIELD_MISMATCH`) retornando JSON Paths exatos.
  * Proteção fail-safe ("default-deny") contra arquivos corrompidos, schemas ausentes e ataques de path traversal.
* **Benefícios do processo SDD:** O processo SDD garantiu que nenhuma linha de código fosse escrita com ambiguidades. A especificação orientou diretamente os contratos de testes que, por sua vez, garantiram a corretude arquitetural, reduzindo o risco de retrabalho a zero.

## 5. Contribuição para a pesquisa

O software desenvolvido constitui um componente estável e determinístico da arquitetura da pesquisa de mestrado, atuando como um barramento rigoroso de conformidade estrutural e de segurança entre a geração semi-estruturada dos componentes mHealth e sua subsequente renderização e consumo por dispositivos móveis.

A principal contribuição é isolar a camada de inferência (que pode carregar inconsistências inerentes a LLMs ou geradores baseados em IA) de uma **etapa determinística de validação**, assegurando conformidade de contrato técnica e clínica rígida antes do consumo final do dado.

Como trabalhos futuros, pretende-se estender o validador para suportar o pipeline de geração de prontuários em tempo real e integrar logs unificados a uma base centralizada de telemetria.

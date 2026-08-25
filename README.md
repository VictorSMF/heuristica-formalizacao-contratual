# Heurística e Conformidade de Formalização Contratual

Engine de auditoria automatizada para minutas contratuais e instrução processual. O sistema utilizará uma abordagem híbrida que combinará validação determinística (Regex e regras diretas) com fallback para LLM local (Ollama), focado em identificar não conformidades ou pontos de atenção antes da formalização do contrato.

## Arquitetura e Funcionamento

- **Validação Híbrida:** O motor determinístico irá rodar primeiro, por ser rápido e sem custo computacional significativo. A IA será acionada apenas quando regras específicas apontam ambiguidades ou omissões. A proposta atual para o projeto é de execução local via ollama para o modelo LLM.
- **Ponto Único de Verdade:** Nenhuma regra fica chumbada na lógica do motor. Todas as políticas, penalidades e gatilhos ficam em `config/regras_dominio.js`.
- **Segmentação Semântica:** O documento de input (previsto ser a minuta de edital) será fatiado em blocos. Quando o fallback da IA é necessário, apenas o segmento relevante é enviado ao modelo, reduzindo o uso de janela de contexto e consumo de RAM.

## Estrutura do Projeto

```text
config/         Regras de negócio (SSOT) e setup do ambiente
data/           Documentos de entrada (.pdf, .md)
docs/adr/       Registros de decisão de arquitetura
src/
  engine/       Motores determinístico, subjetivo e pipeline
  parsers/      Extração de PDF e Markdown
  segmenters/   Divisão semântica por blocos
  utils/        Higienização de texto e heurística fuzzy
index.js        Ponto de entrada da aplicação
Configuração e Execução
Instale as dependências e configure o ambiente:

Bash
npm install

Para rodar a auditoria:

Bash
npm start
Padronização de Código
O projeto utiliza ESLint e Prettier para manter a consistência do código:

Bash
npm run format # Formata os arquivos com Prettier
npm run lint   # Executa a verificação do ESLint
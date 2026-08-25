# ADR 003: Orquestração Desacoplada e Parametrização Dinâmica do LLM

## Status

Aceito

## Contexto

Diferente do sistema anterior de reconciliação de planilhas (onde a temperatura da IA era `0` para forçar respostas determinísticas e estruturadas), a análise de minutas exige uma leve margem de interpretação de linguagem natural por parte da IA. Além disso, o modelo utilizado e seus parâmetros precisam ser facilmente ajustáveis.

## Decisão

O cliente de comunicação com a IA (Ollama/Qwen) será isolado em um módulo dedicado em `src/engine/`. Parâmetros como `model`, `temperature`, `top_p` e `max_tokens` não residirão no código-fonte, mas serão lidos estritamente do arquivo `.env`.
A temperatura padrão iniciará maior que zero (ex: `0.1` ou `0.2`) para permitir melhor compreensão contextual da semântica jurídica, mas sem perder a capacidade de retornar análises estruturadas (JSON).

## Consequências

- **Positivas:** Permite que o sistema seja calibrado dinamicamente para diferentes tipos de contratos sem _commits_ no repositório. O isolamento também facilita a eventual substituição do Ollama por outra API no futuro.
- **Negativas:** O ajuste de temperatura para `> 0` aumenta ligeiramente a necessidade de defesas no código contra formatações inesperadas na resposta da IA (_JSON parsing robusto_).

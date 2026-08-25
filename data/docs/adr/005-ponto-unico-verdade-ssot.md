# ADR 005: Ponto Único de Verdade (SSOT) para Configurações e Regras de Domínio

## Status

Aceito

## Contexto

O sistema lida com diferentes parâmetros operacionais: expressões regulares de validação, termos proibidos, penalidades de pontuação, limiares de decisão (_Aprovado_, _Atenção_, _Crítico_) e gatilhos de fatiamento de texto. Permitir que essas definições fiquem espalhadas ou _hardcoded_ nos arquivos de execução (./src/engine/) causaria acoplamento rígido e risco de divergência nas avaliações.

## Decisão

Estabelecer o arquivo `config/regras_dominio.js` como o **Ponto Único de Verdade (Single Source of Truth - SSOT)** de todo o sistema. Os motores de execução atuarão estritamente como processadores genéricos, consumindo e aplicando as regras injetadas a partir deste arquivo centralizador.

## Consequências

- **Positivas:** Mudanças em legislações, tabelas de pontos, novos termos proibidos ou demais regras de negócio ou domínio são feitas em um único ponto, sem a necessidade de alterar a lógica do motor de código. Facilita a auditoria do comportamento do sistema.
- **Negativas:** Exige rigor no desenvolvimento para evitar que regras condicionais de negócio vazem para os módulos de processamento.

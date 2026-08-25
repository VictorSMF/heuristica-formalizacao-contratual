# ADR 001: Separação entre Mecanismo de Avaliação e Política de Negócio (Regras Injetáveis)

## Status

Aceito

## Contexto

O sistema precisa analisar documentos de instrução contratual (Termos de Referência, Mapas de Riscos e Minutas) para gerar um _score_ de conformidade. No entanto, as regras de negócio exatas, os pesos de penalização e os critérios de aceite da gerência ainda não estão mapeados e estão sujeitos a mudanças normativas futuras.

## Decisão

Implementaremos o padrão de arquitetura de **Separação entre Mecanismo e Política**.
O núcleo do sistema ("o Motor") será estritamente agnóstico em relação ao domínio. Ele orquestrará a entrada de texto e aplicará funções genéricas de `match`, `regex` e requisições LLM, dentre outras. Todas as regras institucionais, palavras-chave, padrões de CNPJ e pesos de pontuação serão parametrizados em arquivos de configuração externos (ex: `config/regras_dominio.js`) que serão "injetados" no motor durante o tempo de execução.

## Consequências

- **Positivas:** Permite o início imediato do desenvolvimento sem depender das reuniões com a gerência. Facilita a manutenção futura, pois mudanças na legislação ou nas regras da Unicamp exigirão apenas a alteração de um arquivo JSON/JS, sem tocar no código central.
- **Negativas:** Exige maior abstração no desenvolvimento inicial, tornando o fluxo de dados (`pipeline`) ligeiramente mais complexo do que se as regras estivessem _hardcoded_.

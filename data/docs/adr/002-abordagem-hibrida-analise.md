# ADR 002: Abordagem Híbrida de Análise (Determinística + Subjetiva)

## Status

Aceito

## Contexto

A validação de minutas contratuais envolve tanto dados objetivos (ex: presença de CNPJ válido, cláusula de foro, prazo numérico) quanto dados subjetivos (ex: clareza na redação sobre critérios de recebimento do material, ambiguidades nas sanções). Utilizar apenas Regex é insuficiente, mas utilizar IA para tudo é lento, custoso computacionalmente e sujeito a alucinações.

## Decisão

O pipeline de avaliação seguirá uma arquitetura de duas camadas sequenciais:

1. **Camada Determinística (Rápida/Exata):** Executa primeiro. Aplica heurísticas de busca de padrões (Regex) e contagem de termos obrigatórios/proibidos baseados no arquivo de configuração.
2. **Camada Subjetiva/IA (Lenta/Contextual):** Executa apenas para blocos de texto específicos que demandam interpretação semântica. O motor invocará o LLM local para responder perguntas específicas injetadas pelo arquivo de regras (ex: "A cláusula X está ambígua?").

## Consequências

- **Positivas:** Otimiza o uso de hardware local (IA só processa o estritamente necessário). Garante 100% de precisão para regras engessadas da lei, deixando a IA focar apenas no que a máquina tradicional não entende.
- **Negativas:** Exigirá um módulo de segmentação robusto que saiba recortar os trechos exatos do texto do documento antes de enviá-los para a IA (para não estourar o limite de _tokens_).

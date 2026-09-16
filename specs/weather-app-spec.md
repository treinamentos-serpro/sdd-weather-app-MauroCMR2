# Weather App — Especificação de Produto

## Overview

O Weather App é uma aplicação web mobile-first para consultas rápidas de condições meteorológicas. O usuário pesquisa uma cidade, escolhe o local correto quando houver homônimos, visualiza o clima atual e consulta uma previsão diária de cinco períodos: hoje e os quatro dias seguintes.

O produto atende principalmente dois cenários: decidir a rotina do dia e planejar deslocamentos ou compromissos próximos. A interface será apresentada em pt-BR, usará Celsius como unidade padrão e permitirá alternância para Fahrenheit.

A fonte de dados definida é a Open-Meteo, sem API key. A primeira versão não terá autenticação nem persistência de dados em servidor.

### Product Constraints

- **Geocoding:** usar `https://geocoding-api.open-meteo.com/v1/search` com o parâmetro `name` normalizado, `count=10`, `language=pt` e `format=json`.
- **Previsão:** usar `https://api.open-meteo.com/v1/forecast` com as coordenadas selecionadas, `current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code`, `daily=weather_code,temperature_2m_min,temperature_2m_max`, `forecast_days=5`, `timezone=auto`, `temperature_unit=celsius` ou `fahrenheit` e `wind_speed_unit=kmh`.
- **Entrada:** remover espaços nas extremidades e normalizar sequências internas de espaços; aceitar letras Unicode, acentos, números, espaços, hífens, apóstrofos e pontos; rejeitar vazio, controle e entrada com mais de 100 caracteres.
- **Timeout:** cada requisição terá limite de 10 segundos. O sistema fará no máximo uma nova tentativa manual por acionamento do usuário; não haverá retry automático no MVP.
- **Fuso horário:** “hoje” e as quatro datas seguintes serão calculados com o `timezone` retornado para as coordenadas selecionadas.
- **Previsão completa:** uma resposta só entra no estado de sucesso se contiver cinco datas únicas, consecutivas, e temperatura mínima e máxima para cada data. Campos complementares podem estar ausentes.
- **Dados meteorológicos:** códigos WMO serão convertidos para textos em pt-BR por uma tabela definida no plano técnico; ícones nunca serão a única forma de comunicar a condição.

## Functional Requirements

### RF1 — Buscar cidade

O sistema deve permitir que o usuário informe o nome de uma cidade e inicie uma busca por meio de uma ação explícita ou do envio do formulário. O botão de busca e o envio por teclado devem executar a mesma operação.

A busca deve consultar o serviço de geocoding da Open-Meteo somente após a validação da entrada e manter o termo normalizado disponível para recuperação em caso de falha. Enquanto a requisição estiver em andamento, novos envios devem ser ignorados ou a requisição anterior deve ser cancelada.

### RF2 — Desambiguar resultados

Quando a busca retornar mais de uma cidade compatível, o sistema deve apresentar uma lista de resultados distinguíveis por nome, país e, quando disponível, estado ou região.

O usuário deve selecionar um resultado antes que o sistema consulte e exiba o clima daquele local quando houver dois ou mais resultados. Um resultado único pode ser selecionado automaticamente, desde que sua identificação seja apresentada ao usuário.

### RF3 — Exibir clima atual

Após a seleção de uma cidade válida, o sistema deve exibir o clima atual do local escolhido, incluindo no mínimo:

- nome e localização selecionada;
- temperatura atual;
- condição climática em texto compreensível;
- umidade, vento e precipitação quando fornecidos pela fonte;
- indicação do momento ou referência temporal dos dados, quando fornecida pela fonte.

Dados ausentes não devem aparecer como valores inventados. O sistema deve indicar quando uma informação não estiver disponível ou omiti-la sem quebrar o restante da tela.

### RF4 — Exibir previsão de cinco dias

O sistema deve exibir uma previsão diária com exatamente cinco períodos: o dia atual e os quatro dias seguintes.

Cada período deve apresentar a data, a condição climática e as temperaturas mínima e máxima. A ordem deve ser cronológica, as datas devem seguir o locale pt-BR e a condição deve ser derivada do código WMO.

### RF5 — Alternar unidade de temperatura

O sistema deve permitir alternar entre Celsius e Fahrenheit. Celsius deve ser a unidade inicial.

Ao trocar a unidade, todas as temperaturas renderizadas do clima atual e da previsão devem ser atualizadas de forma consistente. A unidade aplicada deve estar identificada junto dos valores. A conversão deve usar $F = C \times 9/5 + 32$ e $C = (F - 32) \times 5/9$; os valores exibidos devem ser arredondados para o inteiro mais próximo.

### RF6 — Informar estados da consulta

O sistema deve comunicar os estados de carregamento, sucesso, resultado vazio e erro para a busca de cidade e para a consulta meteorológica. Cada estado deve ter uma mensagem em pt-BR e, quando houver ação disponível, um controle com nome acessível.

O estado de carregamento deve ser apresentado em até 100 ms após o início da consulta. O estado vazio deve orientar o usuário quando nenhum resultado for encontrado. O estado de erro deve explicar que a consulta não foi concluída e oferecer “Tentar novamente” quando a operação puder ser repetida.

### RF7 — Recuperar falhas

Quando uma busca ou consulta meteorológica falhar por rede, indisponibilidade do serviço ou resposta inválida, o sistema deve oferecer uma ação de tentar novamente.

A nova tentativa deve reutilizar o contexto disponível da operação anterior, especialmente o termo de busca ou a cidade selecionada, sem exigir que o usuário reinicie todo o fluxo.

## User Stories

### US1 — Buscar a cidade da rotina

Como uma pessoa que decide a rotina, quero pesquisar o nome da minha cidade, para consultar rapidamente as condições do dia.

Relacionada a: RF1.

### US2 — Escolher a cidade correta

Como uma pessoa que planeja deslocamentos, quero diferenciar cidades com o mesmo nome por país, estado ou região, para consultar a previsão do destino correto.

Relacionada a: RF2.

### US3 — Verificar o clima atual

Como uma pessoa que decide a rotina, quero visualizar a temperatura e a condição climática atuais da cidade escolhida, para decidir roupa, transporte ou atividades.

Relacionada a: RF3.

### US4 — Planejar os próximos dias

Como uma pessoa que planeja deslocamentos, quero consultar a previsão de hoje e dos quatro dias seguintes, para organizar viagens e compromissos.

Relacionada a: RF4.

### US5 — Interpretar a temperatura na unidade preferida

Como uma pessoa que planeja deslocamentos, quero alternar entre Celsius e Fahrenheit, para interpretar as temperaturas sem fazer conversões manualmente.

Relacionada a: RF5.

### US6 — Recuperar uma consulta com falha

Como uma pessoa que decide a rotina, quero receber uma mensagem clara e tentar novamente quando a consulta falhar, para concluir a busca sem reiniciar todo o fluxo.

Relacionada a: RF6 e RF7.

## Acceptance Criteria

Os critérios abaixo devem ser verificáveis por testes funcionais ou por inspeção da interface. Cada cenário segue o formato `Given / When / Then`.

### RF1 — Buscar cidade

**AC-RF1.1**

- **Given** que o usuário está na tela principal;
- **When** informa um nome de cidade e envia a busca;
- **Then** o sistema inicia uma consulta de geocoding e exibe o estado de carregamento.

**AC-RF1.2**

- **Given** que o usuário iniciou uma busca válida;
- **When** a resposta contém pelo menos um local com nome e coordenadas válidas;
- **Then** o sistema disponibiliza os resultados de cidade para seleção e não inicia a consulta meteorológica antes da seleção quando houver mais de um resultado.

**AC-RF1.3**

- **Given** que o campo de cidade está vazio, contém apenas espaços ou excede 100 caracteres;
- **When** o usuário tenta enviar a busca;
- **Then** o sistema exibe uma mensagem de validação em pt-BR, não faz chamada à API e mantém o foco no campo.

**AC-RF1.4**

- **Given** que o usuário informa uma cidade com acentos, hífens ou apóstrofos;
- **When** envia a busca;
- **Then** o sistema preserva os caracteres válidos, normaliza espaços excedentes e consulta o termo normalizado.

### RF2 — Desambiguar resultados

**AC-RF2.1**

- **Given** que a busca retorna duas ou mais cidades com o mesmo nome;
- **When** os resultados são exibidos;
- **Then** cada opção mostra nome, país e estado ou região quando disponível.

**AC-RF2.2**

- **Given** que existem múltiplos resultados;
- **When** o usuário ainda não selecionou uma opção;
- **Then** o sistema não exibe o clima de uma cidade arbitrária.

**AC-RF2.3**

- **Given** que o usuário selecionou uma cidade;
- **When** a seleção é confirmada;
- **Then** o sistema consulta as coordenadas do local escolhido e identifica esse local na tela.

**AC-RF2.4**

- **Given** que a busca retorna exatamente um local com nome e coordenadas válidas;
- **When** a resposta é recebida;
- **Then** o sistema pode selecionar o local automaticamente, identifica-o na tela e inicia a consulta meteorológica uma única vez.

### RF3 — Exibir clima atual

**AC-RF3.1**

- **Given** que a consulta meteorológica retorna localização, temperatura atual, código climático e horário válidos;
- **When** o estado de sucesso é apresentado;
- **Then** a tela mostra a cidade selecionada, a temperatura atual e a condição climática.

**AC-RF3.2**

- **Given** que a resposta fornece umidade, vento ou precipitação;
- **When** o clima atual é exibido;
- **Then** cada dado disponível aparece com seu rótulo e unidade correspondente.

**AC-RF3.3**

- **Given** que um campo complementar não é fornecido pela fonte;
- **When** o clima atual é exibido;
- **Then** o sistema não apresenta um valor inventado e a interface continua utilizável.

**AC-RF3.4**

- **Given** que a resposta não contém localização, temperatura atual, código climático ou horário válido;
- **When** o sistema valida a resposta;
- **Then** o sistema não apresenta o clima como sucesso, exibe erro em pt-BR e oferece “Tentar novamente”.

### RF4 — Exibir previsão de cinco dias

**AC-RF4.1**

- **Given** que a consulta meteorológica retorna cinco datas únicas e consecutivas com mínima e máxima para cada data;
- **When** o resultado é exibido;
- **Then** existem exatamente cinco períodos em ordem cronológica, começando em hoje e terminando quatro dias depois.

**AC-RF4.2**

- **Given** que um período da previsão está visível;
- **When** o usuário consulta esse período;
- **Then** a data, a condição climática, a temperatura mínima e a temperatura máxima estão identificadas.

**AC-RF4.3**

- **Given** que a resposta contém menos de cinco datas, datas duplicadas ou uma mínima/máxima ausente;
- **When** o sistema valida a resposta;
- **Then** a previsão não é apresentada como completa, o estado de erro é exibido e a ação “Tentar novamente” fica disponível.

### RF5 — Alternar unidade de temperatura

**AC-RF5.1**

- **Given** que o resultado está visível pela primeira vez e nenhuma unidade foi escolhida;
- **When** as temperaturas são renderizadas;
- **Then** todos os valores são exibidos em Celsius e a unidade está identificada.

**AC-RF5.2**

- **Given** que o resultado contém temperaturas em Celsius;
- **When** o usuário seleciona Fahrenheit;
- **Then** todas as temperaturas visíveis do clima atual e da previsão são convertidas e identificadas como Fahrenheit.

**AC-RF5.3**

- **Given** que o resultado contém temperaturas em Fahrenheit;
- **When** o usuário seleciona Celsius;
- **Then** todas as temperaturas visíveis do clima atual e da previsão são convertidas e identificadas como Celsius.

**AC-RF5.4**

- **Given** que uma temperatura Celsius possui valor conhecido;
- **When** a unidade Fahrenheit é selecionada;
- **Then** o valor exibido corresponde a $F = C \times 9/5 + 32$, arredondado para o inteiro mais próximo; a conversão inversa segue $C = (F - 32) \times 5/9$.

### RF6 — Informar estados da consulta

**AC-RF6.1**

- **Given** que uma consulta foi iniciada;
- **When** a resposta ainda não chegou;
- **Then** a interface exibe um indicador acessível de carregamento em até 100 ms e não apresenta a consulta como concluída.

**AC-RF6.2**

- **Given** que a busca não encontra locais compatíveis;
- **When** a resposta vazia é recebida;
- **Then** a interface informa que nenhum resultado foi encontrado e orienta uma nova busca.

**AC-RF6.3**

- **Given** que uma consulta falhou;
- **When** o erro é recebido;
- **Then** a interface exibe uma mensagem em pt-BR, identifica a operação que falhou e oferece “Tentar novamente” quando houver contexto para repetir a operação.

**AC-RF6.4**

- **Given** que uma resposta HTTP é de erro, está malformada ou não contém os campos obrigatórios;
- **When** o sistema processa a resposta;
- **Then** o sistema exibe o estado de erro, não renderiza dados como sucesso e preserva o contexto para nova tentativa.

### RF7 — Recuperar falhas

**AC-RF7.1**

- **Given** que uma busca ou consulta meteorológica falhou;
- **When** o usuário aciona “Tentar novamente”;
- **Then** o sistema inicia uma nova consulta usando o termo ou a cidade da operação anterior.

**AC-RF7.2**

- **Given** que a nova tentativa foi iniciada;
- **When** a consulta ainda está em andamento;
- **Then** o estado de carregamento aparece novamente e o erro anterior não bloqueia o fluxo.

**AC-RF7.3**

- **Given** que uma requisição está em andamento;
- **When** o usuário inicia uma nova busca;
- **Then** a resposta da busca anterior não pode substituir os resultados da busca mais recente.

**AC-RF7.4**

- **Given** que uma requisição excedeu 10 segundos sem resposta;
- **When** o limite é atingido;
- **Then** o sistema encerra o carregamento, exibe uma mensagem de timeout em pt-BR e oferece “Tentar novamente”.

## Traceability Matrix

| User Story | Acceptance Criteria | Requisitos não funcionais relevantes |
| --- | --- | --- |
| **US1 — Buscar a cidade da rotina** | AC-RF1.1, AC-RF1.2, AC-RF1.3, AC-RF1.4 | RNF1 Responsividade; RNF2 Usabilidade; RNF3 Acessibilidade; RNF4 Performance; RNF7 Localização; RNF8 Segurança |
| **US2 — Escolher a cidade correta** | AC-RF2.1, AC-RF2.2, AC-RF2.3, AC-RF2.4 | RNF1 Responsividade; RNF2 Usabilidade; RNF3 Acessibilidade; RNF5 Resiliência; RNF7 Localização |
| **US3 — Verificar o clima atual** | AC-RF3.1, AC-RF3.2, AC-RF3.3, AC-RF3.4 | RNF1 Responsividade; RNF2 Usabilidade; RNF3 Acessibilidade; RNF5 Resiliência; RNF7 Localização |
| **US4 — Planejar os próximos dias** | AC-RF4.1, AC-RF4.2, AC-RF4.3 | RNF1 Responsividade; RNF2 Usabilidade; RNF3 Acessibilidade; RNF5 Resiliência; RNF7 Localização |
| **US5 — Interpretar a temperatura na unidade preferida** | AC-RF5.1, AC-RF5.2, AC-RF5.3, AC-RF5.4 | RNF2 Usabilidade; RNF3 Acessibilidade; RNF5 Resiliência; RNF7 Localização |
| **US6 — Recuperar uma consulta com falha** | AC-RF6.1, AC-RF6.2, AC-RF6.3, AC-RF6.4, AC-RF7.1, AC-RF7.2, AC-RF7.3, AC-RF7.4 | RNF2 Usabilidade; RNF3 Acessibilidade; RNF4 Performance; RNF5 Resiliência; RNF7 Localização |

### Uso da matriz

- Cada tarefa de implementação deve referenciar pelo menos uma User Story e seus critérios de aceite.
- Cada teste deve validar um ou mais critérios de aceite; os RNFs devem ser verificados em testes de acessibilidade, responsividade, performance, compatibilidade ou segurança conforme aplicável.
- Uma User Story só poderá ser considerada concluída quando todos os seus critérios de aceite estiverem atendidos e os RNFs relacionados tiverem sido verificados.

## Non-Functional Requirements

### RNF1 — Responsividade

A interface deve ser utilizável em dispositivos móveis e desktops, incluindo larguras de 320 px, 768 px e 1440 px em orientação retrato e paisagem. O conteúdo não pode exigir rolagem horizontal nem ocultar controles essenciais.

### RNF2 — Usabilidade

O usuário deve conseguir iniciar uma busca pela tela principal sem navegação complexa e identificar o clima atual após a conclusão da consulta. A hierarquia visual deve separar cidade, clima atual e previsão.

### RNF3 — Acessibilidade

Os fluxos principais devem funcionar por teclado. Campos, botões, opções de cidade, estados de carregamento e mensagens de erro devem ter nomes acessíveis, foco visível e estrutura semântica. O contraste deve atender à WCAG 2.2 nível AA para texto e controles aplicáveis ao MVP.

### RNF4 — Performance

A aplicação deve fornecer feedback visual em até 100 ms após uma consulta ser iniciada, evitar chamadas duplicadas e concluir a renderização do resultado em até 3 segundos após uma resposta válida recebida, desconsiderando o tempo de rede.

### RNF5 — Resiliência

Falhas de rede, indisponibilidade da Open-Meteo, respostas inválidas e dados incompletos não devem quebrar a interface. O usuário deve receber orientação sobre o estado e a recuperação possível.

### RNF6 — Compatibilidade

A aplicação deve funcionar nas duas versões estáveis mais recentes de Chrome, Firefox, Safari e Edge, em dispositivos móveis e desktop, e nos viewports definidos em RNF1.

### RNF7 — Localização

Textos, datas e números devem usar pt-BR. Celsius deve ser a unidade inicial, sem impedir a alternância para Fahrenheit.

### RNF8 — Segurança

Nenhuma chave, credencial ou segredo deve ser necessário ou exposto no código executado no navegador. A aplicação não deve coletar dados pessoais além do necessário para a consulta meteorológica.

## Edge Cases

- A busca é enviada vazia ou contém apenas espaços: o sistema deve solicitar um nome de cidade válido sem iniciar uma chamada desnecessária.
- O nome pesquisado não possui resultados: o sistema deve mostrar o estado vazio e permitir nova busca.
- O nome pesquisado retorna muitos resultados: o sistema deve permitir diferenciação e seleção sem escolher um local arbitrariamente.
- A Open-Meteo retorna coordenadas sem algum campo de identificação regional: o sistema deve exibir os dados disponíveis sem inventar país, estado ou região.
- A cidade selecionada não possui dados meteorológicos atuais: o sistema deve comunicar indisponibilidade parcial ou total e oferecer recuperação quando possível.
- A previsão diária contém um valor ausente: o período deve permanecer identificável e o campo ausente deve ser sinalizado ou omitido.
- A temperatura é negativa, zero, decimal ou muito alta: a exibição e a conversão de unidade devem permanecer corretas e legíveis.
- A resposta demora ou a conexão cai durante a consulta: o estado de carregamento ou erro deve permanecer compreensível e oferecer nova tentativa.
- O usuário troca a unidade durante uma consulta: a unidade deve ser aplicada ao resultado recebido sem misturar Celsius e Fahrenheit.
- O usuário usa teclado para navegar: todos os controles principais devem ser alcançáveis, ter foco visível e operar sem mouse.
- O viewport é estreito ou está em paisagem: os cartões e controles não devem se sobrepor nem exigir rolagem horizontal.
- A entrada está vazia, contém apenas espaços ou caracteres inválidos: o sistema deve exibir uma validação em pt-BR, não iniciar uma chamada e manter o campo disponível para correção.
- A entrada contém acentos, hífens ou outros caracteres comuns em nomes de cidades: o sistema deve preservar o texto válido, normalizar espaços excedentes e consultar o termo sem quebrar a interface.
- A consulta excede o tempo limite definido: o sistema deve encerrar o loading, informar que a consulta demorou além do esperado e oferecer nova tentativa.
- A Open-Meteo retorna erro HTTP, resposta malformada ou indisponibilidade: o sistema deve exibir erro, preservar o contexto da operação e oferecer nova tentativa.
- Uma resposta meteorológica contém menos de cinco períodos ou não contém campos essenciais: o sistema deve tratar a resposta como parcial, sinalizar a indisponibilidade e não apresentar o resultado como uma previsão completa.
- Uma nova busca é iniciada antes da resposta anterior: o sistema deve cancelar a consulta anterior ou ignorar sua resposta quando ela chegar, exibindo apenas o resultado da busca mais recente.
- A data local do dispositivo difere da data da cidade consultada: o sistema deve usar o fuso horário fornecido para definir “hoje” e ordenar a previsão.

## Assumptions

- O usuário terá acesso à internet na maior parte das consultas.
- A Open-Meteo fornecerá geocoding e dados suficientes para clima atual e previsão diária de cinco períodos nas regiões prioritárias.
- A busca será feita pelo nome de uma cidade, com apoio de coordenadas e dados regionais para desambiguação.
- A aplicação será acessada por navegadores modernos.
- A interface inicial será disponibilizada em pt-BR.
- Celsius será a unidade padrão e Fahrenheit permanecerá disponível como alternativa.
- A primeira versão não exigirá autenticação, conta de usuário ou persistência em servidor.
- Não haverá favoritos, histórico ou sincronização entre dispositivos no MVP.
- A previsão de cinco dias significa hoje mais quatro dias seguintes.

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Indisponibilidade ou limitação da Open-Meteo | Média | Alto | Tratar erros, limitar requisições, permitir nova tentativa e avaliar cache ou fonte alternativa posteriormente. |
| Dados imprecisos, incompletos ou desatualizados | Média | Alto | Validar respostas, apresentar referência temporal quando disponível e comunicar dados ausentes. |
| Usuário consultar a cidade errada | Alta | Alto | Exibir país, estado ou região e exigir seleção explícita em resultados ambíguos. |
| Latência elevada ou falha de conexão | Média | Médio/Alto | Exibir loading imediato, preservar o contexto da consulta e oferecer recuperação. |
| Layout inadequado em telas pequenas | Média | Alto | Validar mobile-first em viewports representativos, incluindo retrato e paisagem. |
| Barreiras de acessibilidade | Média | Alto | Testar teclado, foco, leitor de tela, semântica e contraste conforme WCAG AA. |
| Conversão incorreta de unidades | Baixa | Alto | Centralizar a regra de conversão e cobrir valores normais, extremos e decimais. |
| Crescimento indevido do escopo | Alta | Alto | Manter fora do MVP autenticação, favoritos, histórico, geolocalização automática e previsão horária. |
| Falta de observabilidade após publicação | Média | Médio | Definir registro de erros e latência sem dados sensíveis antes da operação. |

## Out of Scope

- Autenticação, contas, perfis e administração de usuários.
- Favoritos, histórico de cidades e sincronização entre dispositivos.
- Persistência de dados em servidor.
- Geolocalização automática do dispositivo.
- Previsão detalhada por hora.
- Alertas meteorológicos, notificações push e avisos personalizados.
- Modo offline garantido, instalação como PWA e cache persistente.
- Integração com calendários, transporte, mapas ou recomendações de atividades.
- Suporte multilíngue além de pt-BR.
- Painel administrativo ou edição manual dos dados meteorológicos.

## Implementation Notes

- Os campos obrigatórios da resposta meteorológica são localização, temperatura atual, código climático, fuso horário e cinco datas diárias com temperaturas mínima e máxima.
- Umidade, vento, precipitação e horário da observação são opcionais; quando ausentes, devem ser omitidos ou marcados como indisponíveis sem substituir a previsão completa por um valor fictício.
- Uma requisição nova deve invalidar a anterior. Apenas a resposta associada à busca mais recente pode alterar a tela.
- O cache persistente, favoritos, histórico e fallback para outro provedor não fazem parte do MVP. Cache em memória só poderá ser usado se não alterar os estados e os critérios definidos.
- O plano técnico deve fornecer a tabela de códigos WMO em pt-BR e os testes dos limites de temperatura, conversão, datas e respostas incompletas.

## Open Questions

1. Qual público deve ser priorizado no primeiro ciclo: consulta rápida da rotina ou planejamento de deslocamentos?
2. Qual disponibilidade operacional é esperada para o serviço e quem será responsável por monitoramento e resposta a incidentes?
3. Quais métricas de produto definirão sucesso, como buscas concluídas, tempo até o clima atual e uso recorrente?
4. A aplicação deverá evoluir para PWA, suporte offline ou cache persistente em uma versão posterior?
5. Será necessária uma fonte meteorológica alternativa caso a cobertura ou os limites da Open-Meteo não atendam às regiões prioritárias?

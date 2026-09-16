# Weather App — Backlog Técnico

As tarefas consomem [plans/weather-app-plan.md](../plans/weather-app-plan.md). A ordem é explícita: tipos → funções puras → services → hook → componentes → integração → testes → hardening. Cada tarefa é uma unidade testável e declara suas dependências.

## Entrega 1 — Tipos

### T-01 — Definir tipos de domínio
- **ID:** T-01
- **Título:** Definir tipos de domínio
- **Descrição:** Criar contratos internos para cidade, clima atual, previsão, unidade, status assíncrono e erro.
- **Critérios de aceite:** Existem `TemperatureUnit`, `QueryStatus`, `Location`, `CurrentWeather`, `DailyForecast`, `WeatherResult`, `AsyncState` e `AppError`; `TemperatureUnit` aceita somente `celsius`/`fahrenheit`; `QueryStatus` aceita somente `idle`, `loading`, `success`, `empty` e `error`.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data

### T-02 — Definir DTOs da Open-Meteo
- **ID:** T-02
- **Título:** Definir DTOs da Open-Meteo
- **Descrição:** Modelar os campos consumidos das respostas de geocoding e forecast.
- **Critérios de aceite:** Existem interfaces para `results`, `timezone`, `current` e `daily`; campos potencialmente ausentes são opcionais; não há `any` nos DTOs; `pnpm build` termina com código 0.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/openMeteo.ts`.
- **Tipo:** Data

### T-03 — Criar entrada mínima da aplicação
- **ID:** T-03
- **Título:** Criar entrada mínima da aplicação
- **Descrição:** Configurar a montagem React e o CSS global sem implementar o fluxo meteorológico.
- **Critérios de aceite:** `src/main.tsx` monta `App` em `#root`; `src/index.css` contém as diretivas Tailwind; a aplicação inicia sem erro de montagem.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`, `src/index.css`.
- **Tipo:** Infra

## Entrega 2 — Funções puras

### T-04 — Normalizar e validar entrada
- **ID:** T-04
- **Título:** Normalizar e validar entrada
- **Descrição:** Criar funções puras para espaços, Unicode, caracteres de controle e limite de 100 caracteres.
- **Critérios de aceite:** Remove espaços externos; reduz espaços internos; aceita acentos, hífens, apóstrofos e pontos; rejeita vazio, controle e mais de 100 caracteres; não acessa DOM ou rede.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/input.ts`.
- **Tipo:** Data

### T-05 — Implementar conversão de temperatura
- **ID:** T-05
- **Título:** Implementar conversão de temperatura
- **Descrição:** Converter Celsius/Fahrenheit e arredondar para o inteiro mais próximo.
- **Critérios de aceite:** Aplica ambas as fórmulas; cobre zero, negativos, decimais e mesma unidade; retorna número inteiro arredondado.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data

### T-06 — Implementar mapeamento WMO
- **ID:** T-06
- **Título:** Implementar mapeamento WMO
- **Descrição:** Mapear códigos meteorológicos para descrições acessíveis em pt-BR.
- **Critérios de aceite:** Os códigos WMO previstos no plano retornam texto em pt-BR; código desconhecido retorna `Condição desconhecida`.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data

### T-07 — Implementar regras de datas
- **ID:** T-07
- **Título:** Implementar regras de datas
- **Descrição:** Validar cinco datas únicas e consecutivas e formatá-las no timezone da cidade.
- **Critérios de aceite:** Rejeita duplicadas, lacunas e quantidade diferente de cinco; usa timezone recebido e locale `pt-BR`; não depende do timezone do dispositivo.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/date.ts`.
- **Tipo:** Data

## Entrega 3 — Services

### T-08 — Implementar cliente HTTP
- **ID:** T-08
- **Título:** Implementar cliente HTTP
- **Descrição:** Criar wrapper `fetch` com timeout de 10 segundos e erros tipados.
- **Critérios de aceite:** Usa `AbortController`; timeout ocorre em 10.000 ms; HTTP não-2xx produz erro `http`; falha de rede produz `network`; timer é limpo em sucesso e erro.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/services/httpClient.ts`.
- **Tipo:** Data

### T-09 — Implementar parser de geocoding
- **ID:** T-09
- **Título:** Implementar parser de geocoding
- **Descrição:** Transformar resultados externos válidos em `Location`.
- **Critérios de aceite:** Mapeia id, nome, país, região, latitude, longitude e timezone; descarta itens sem id, nome, latitude ou longitude válidos; suporta lista vazia.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/services/weatherParser.ts`.
- **Tipo:** Data

### T-10 — Implementar service de geocoding
- **ID:** T-10
- **Título:** Implementar service de geocoding
- **Descrição:** Montar a chamada Open-Meteo de geocoding e usar o cliente HTTP e parser.
- **Critérios de aceite:** Envia `name`, `count=10`, `language=pt` e `format=json`; retorna `Location[]`; lista vazia não é convertida em erro.
- **Dependências:** T-04, T-08, T-09.
- **Arquivos prováveis:** `src/services/openMeteoClient.ts`.
- **Tipo:** Data

### T-11 — Implementar parser de forecast
- **ID:** T-11
- **Título:** Implementar parser de forecast
- **Descrição:** Transformar `current` e `daily` em `WeatherResult` validado.
- **Critérios de aceite:** Exige timezone, temperatura/código atuais e cinco datas consecutivas com mínima/máxima; combina arrays por índice; mapeia códigos WMO; campos complementares ausentes permanecem opcionais.
- **Dependências:** T-01, T-05, T-06, T-07, T-09.
- **Arquivos prováveis:** `src/services/weatherParser.ts`.
- **Tipo:** Data

### T-12 — Implementar service de forecast
- **ID:** T-12
- **Título:** Implementar service de forecast
- **Descrição:** Montar a chamada de previsão usando cidade, unidade e parser.
- **Critérios de aceite:** Envia coordenadas, `current`, `daily`, `forecast_days=5`, `timezone=auto`, `temperature_unit` e `wind_speed_unit=kmh`; retorna somente `WeatherResult` validado.
- **Dependências:** T-05, T-08, T-11.
- **Arquivos prováveis:** `src/services/openMeteoClient.ts`.
- **Tipo:** Data

## Entrega 4 — Hook e estado

### T-13 — Implementar estado base do hook
- **ID:** T-13
- **Título:** Implementar estado base do hook
- **Descrição:** Criar `useWeatherSearch` com estado independente de geocoding e forecast.
- **Critérios de aceite:** Expõe status `idle/loading/success/empty/error`; mantém query, cidade selecionada e unidade; unidade inicial é Celsius.
- **Dependências:** T-10, T-12.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`.
- **Tipo:** Data

### T-14 — Implementar seleção e retry
- **ID:** T-14
- **Título:** Implementar seleção e retry
- **Descrição:** Orquestrar resultado único, múltiplos resultados, seleção e retry manual.
- **Critérios de aceite:** Um resultado inicia exatamente uma consulta de forecast; múltiplos resultados iniciam zero consultas até seleção; retry reutiliza termo ou coordenadas e passa por `loading`.
- **Dependências:** T-13.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`.
- **Tipo:** Data

### T-15 — Implementar concorrência e unidade derivada
- **ID:** T-15
- **Título:** Implementar concorrência e unidade derivada
- **Descrição:** Invalidar respostas obsoletas e converter temperaturas na renderização.
- **Critérios de aceite:** Nova busca impede resposta anterior de atualizar o estado; Celsius/Fahrenheit atualiza valores sem nova chamada de forecast; requestId ou AbortController é usado.
- **Dependências:** T-05, T-13.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`.
- **Tipo:** Data

## Entrega 5 — Componentes

### T-16 — Implementar formulário de busca
- **ID:** T-16
- **Título:** Implementar formulário de busca
- **Descrição:** Criar input, label, envio por botão/teclado e validação acessível.
- **Critérios de aceite:** Input é encontrado por label acessível; entrada inválida não chama busca; foco permanece no campo; loading bloqueia envio duplicado.
- **Dependências:** T-04, T-13.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`.
- **Tipo:** UI

### T-17 — Implementar estados visuais
- **ID:** T-17
- **Título:** Implementar estados visuais
- **Descrição:** Renderizar idle, loading, empty e error com mensagens pt-BR e retry.
- **Critérios de aceite:** Loading renderiza `role=status`; erro renderiza `role=alert`; empty orienta nova busca; erro retryável exibe botão “Tentar novamente”.
- **Dependências:** T-13, T-16.
- **Arquivos prováveis:** `src/components/QueryStatus.tsx`.
- **Tipo:** UI

### T-18 — Implementar resultados de cidade
- **ID:** T-18
- **Título:** Implementar resultados de cidade
- **Descrição:** Exibir nome, país e região e permitir seleção por teclado ou mouse.
- **Critérios de aceite:** Cada opção tem nome acessível; múltiplos resultados não exibem clima antes da seleção; seleção chama callback uma vez.
- **Dependências:** T-14.
- **Arquivos prováveis:** `src/components/LocationResults.tsx`.
- **Tipo:** UI

### T-19 — Implementar clima atual
- **ID:** T-19
- **Título:** Implementar clima atual
- **Descrição:** Renderizar localização, temperatura, condição e dados opcionais.
- **Critérios de aceite:** Mostra cidade, temperatura e condição textual; identifica unidades; não inventa valores ausentes.
- **Dependências:** T-11, T-15.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI

### T-20 — Implementar previsão diária
- **ID:** T-20
- **Título:** Implementar previsão diária
- **Descrição:** Renderizar os cinco dias com data, condição, mínima e máxima.
- **Critérios de aceite:** Exibe exatamente cinco itens; datas estão em pt-BR e ordem cronológica; cada item contém os quatro campos exigidos.
- **Dependências:** T-07, T-11, T-15.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.
- **Tipo:** UI

### T-21 — Implementar controle de unidade
- **ID:** T-21
- **Título:** Implementar controle de unidade
- **Descrição:** Criar controle acessível Celsius/Fahrenheit conectado ao estado derivado.
- **Critérios de aceite:** Celsius é inicial; opção ativa usa `aria-pressed`; troca atualiza clima atual e previsão sem request.
- **Dependências:** T-05, T-15, T-19, T-20.
- **Arquivos prováveis:** `src/components/TemperatureUnitToggle.tsx`.
- **Tipo:** UI

## Entrega 6 — Integração

### T-22 — Integrar componentes em App
- **ID:** T-22
- **Título:** Integrar componentes em App
- **Descrição:** Compor formulário, status, resultados, clima, previsão e unidade na tela principal.
- **Critérios de aceite:** Tela inicial permite iniciar busca; seleção chega ao clima atual; estados não se sobrepõem; callbacks do hook chegam aos componentes corretos.
- **Dependências:** T-16, T-17, T-18, T-19, T-20, T-21.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI

### T-23 — Aplicar layout responsivo e acessível
- **ID:** T-23
- **Título:** Aplicar layout responsivo e acessível
- **Descrição:** Ajustar Tailwind, foco, contraste e grid mobile-first.
- **Critérios de aceite:** Viewports 320, 768 e 1440 px não têm rolagem horizontal; controles têm foco visível; clima e previsão permanecem legíveis.
- **Dependências:** T-22.
- **Arquivos prováveis:** `src/App.tsx`, `src/index.css`.
- **Tipo:** UI

## Entrega 7 — Testes

### T-24 — Testar funções puras gerais
- **ID:** T-24
- **Título:** Testar funções puras gerais
- **Descrição:** Cobrir validação de entrada, códigos WMO e regras de datas com Vitest.
- **Critérios de aceite:** Testa Unicode, espaços, limite, códigos conhecidos/desconhecidos, cinco datas, lacunas, duplicatas e timezone.
- **Dependências:** T-04, T-06, T-07.
- **Arquivos prováveis:** `tests/unit/input.test.ts`, `tests/unit/weatherCodes.test.ts`, `tests/unit/date.test.ts`.
- **Tipo:** Test

### T-25 — Testar conversão de unidade
- **ID:** T-25
- **Título:** Testar conversão de unidade
- **Descrição:** Cobrir exclusivamente a conversão Celsius/Fahrenheit com Vitest.
- **Critérios de aceite:** Testa Celsius → Fahrenheit, Fahrenheit → Celsius, zero, valores negativos, decimais, mesma unidade e arredondamento; todos os testes passam sem rede ou DOM.
- **Dependências:** T-05.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test

### T-26 — Testar services com fetch mockado
- **ID:** T-26
- **Título:** Testar services com fetch mockado
- **Descrição:** Testar geocoding, forecast e parsing usando `fetch` mockado, sem acessar a Open-Meteo real.
- **Critérios de aceite:** Verifica URL e parâmetros; cobre sucesso, vazio, HTTP 4xx/5xx, falha de rede, timeout, JSON inválido e resposta parcial; confirma zero chamadas externas.
- **Dependências:** T-10, T-12.
- **Arquivos prováveis:** `tests/unit/openMeteoClient.test.ts`, `tests/unit/weatherParser.test.ts`, `tests/fixtures/openMeteo.ts`.
- **Tipo:** Test

### T-27 — Testar hook e transições
- **ID:** T-27
- **Título:** Testar hook e transições
- **Descrição:** Testar estados, seleção, retry, concorrência e unidade com services mockados.
- **Critérios de aceite:** Cobre `idle`, `loading`, `success`, `empty` e `error`; retry preserva contexto; resposta antiga é ignorada; troca de unidade não faz request.
- **Dependências:** T-13, T-14, T-15.
- **Arquivos prováveis:** `tests/unit/useWeatherSearch.test.ts`.
- **Tipo:** Test

### T-28 — Testar componentes nos estados de consulta
- **ID:** T-28
- **Título:** Testar componentes nos estados de consulta
- **Descrição:** Testar componentes com Testing Library, isolando loading, erro, vazio e sucesso.
- **Critérios de aceite:** Loading renderiza `role=status`; erro renderiza `role=alert` e retry; vazio orienta nova busca; sucesso mostra clima atual e previsão; queries usam `getByRole`/`getByLabelText`.
- **Dependências:** T-16, T-17, T-19, T-20.
- **Arquivos prováveis:** `tests/components/QueryStatus.test.tsx`, `tests/components/CurrentWeather.test.tsx`, `tests/components/ForecastList.test.tsx`, `tests/setup.ts`.
- **Tipo:** Test

### T-29 — Criar fixtures e rotas E2E
- **ID:** T-29
- **Título:** Criar fixtures e rotas E2E
- **Descrição:** Preparar fixtures determinísticas e helpers `page.route` para Open-Meteo.
- **Critérios de aceite:** Todas as chamadas Open-Meteo são interceptadas; fixtures cobrem resultado único, múltiplos resultados e forecast válido; nenhuma requisição externa ocorre.
- **Dependências:** T-23.
- **Arquivos prováveis:** `tests/e2e/fixtures.ts`, `tests/e2e/helpers.ts`.
- **Tipo:** Test

### T-30 — Testar fluxo E2E principal em desktop e mobile
- **ID:** T-30
- **Título:** Testar fluxo E2E principal em desktop e mobile
- **Descrição:** Testar busca, seleção, clima atual, cinco dias e troca de unidade em desktop e viewport mobile.
- **Critérios de aceite:** Cidade única e múltiplas cidades funcionam; cinco dias são exibidos; troca de unidade não gera nova chamada; o mesmo fluxo passa em viewport de 320 px sem `scrollWidth > innerWidth`.
- **Dependências:** T-22, T-23, T-29.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`.
- **Tipo:** Test

### T-31 — Testar falhas E2E
- **ID:** T-31
- **Título:** Testar falhas E2E
- **Descrição:** Testar input inválido, vazio, sem resultados, API indisponível, timeout, resposta parcial, retry e concorrência.
- **Critérios de aceite:** Input inválido não gera request; empty/error exibem orientação; timeout/parcial não exibem sucesso; retry preserva contexto; resposta antiga não substitui a mais recente.
- **Dependências:** T-22, T-29, T-30.
- **Arquivos prováveis:** `tests/e2e/weather-app-errors.spec.ts`.
- **Tipo:** Test

## Entrega 8 — Hardening

### T-32 — Executar quality gate
- **ID:** T-32
- **Título:** Executar quality gate
- **Descrição:** Executar validações completas e corrigir falhas do MVP.
- **Critérios de aceite:** `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` terminam com código 0; não há erros TypeScript ou Biome.
- **Dependências:** T-24, T-25, T-26, T-27, T-28, T-31.
- **Arquivos prováveis:** `src/`, `tests/`.
- **Tipo:** Infra

### T-33 — Revisar resiliência e acessibilidade
- **ID:** T-33
- **Título:** Revisar resiliência e acessibilidade
- **Descrição:** Fazer revisão final contra respostas obsoletas, mensagens, foco, contraste e limites de viewport.
- **Critérios de aceite:** Nenhuma resposta obsoleta atualiza a UI; mensagens têm `role` apropriado; fluxo por teclado funciona; 320 px não tem rolagem horizontal.
- **Dependências:** T-30, T-31, T-32.
- **Arquivos prováveis:** `src/`, `tests/`.
- **Tipo:** Infra

## Rastreabilidade

| Entrega | Requisitos cobertos |
| --- | --- |
| Tipos | Contratos de RF1–RF7 e RNF5, RNF7, RNF8 |
| Funções puras | RF1, RF4, RF5 e RNF7 |
| Services | RF1–RF4, RF6, RF7 e RNF4, RNF5, RNF8 |
| Hook e estado | RF1–RF7, especialmente AC-RF6.1–AC-RF7.4 |
| Componentes | US1–US6, RF1–RF7 e RNF1–RNF3, RNF7 |
| Integração | Fluxo completo e RNF1–RNF3 |
| Testes | AC-RF1.1–AC-RF7.4 e RNF1–RNF8 |
| Hardening | RNF1–RNF8 e riscos de concorrência, API e acessibilidade |

## Prioridade e tamanho

**P0** é obrigatório para demonstrar e entregar o MVP. **P1** é importante, mas pode ser entregue após a primeira fatia funcional. **P2** fica para pós-MVP; não há tarefas P2 neste backlog porque o escopo atual contém somente itens do MVP. `S`, `M` e `G` indicam esforço relativo, considerando implementação e validação da própria tarefa.

| Tarefa | Prioridade | Tamanho | Motivo resumido |
| --- | --- | --- | --- |
| T-01 | P0 | S | Contrato interno necessário para todas as camadas. |
| T-02 | P0 | S | Define o formato das respostas externas. |
| T-03 | P0 | S | Permite executar e visualizar a aplicação. |
| T-04 | P0 | S | Bloqueia qualquer busca válida. |
| T-05 | P1 | S | Necessário para a troca de unidade, mas posterior à primeira consulta em Celsius. |
| T-06 | P0 | S | Condição textual acessível para o clima. |
| T-07 | P0 | M | Define a janela hoje + quatro dias e o timezone. |
| T-08 | P0 | M | Centraliza rede, timeout e erros. |
| T-09 | P0 | S | Converte resultados para o modelo interno. |
| T-10 | P0 | M | Habilita busca e desambiguação reais. |
| T-11 | P0 | M | Valida e transforma a previsão completa. |
| T-12 | P0 | M | Habilita clima atual e previsão. |
| T-13 | P0 | M | Orquestra os estados e os services. |
| T-14 | P0 | M | Implementa seleção e recuperação do fluxo. |
| T-15 | P1 | M | Trata concorrência e unidade derivada; unidade pode ser adiada após Celsius. |
| T-16 | P0 | S | Entrada principal do usuário. |
| T-17 | P0 | S | Torna loading, vazio e erro visíveis. |
| T-18 | P0 | S | Permite desambiguar cidades homônimas. |
| T-19 | P0 | M | Exibe o valor central do produto. |
| T-20 | P0 | M | Exibe a previsão de cinco dias. |
| T-21 | P1 | S | Adiciona alternância de unidade sem novo request. |
| T-22 | P0 | M | Conecta o fluxo vertical completo. |
| T-23 | P0 | M | Garante uso mobile e acessível. |
| T-24 | P0 | M | Protege regras puras que sustentam o fluxo. |
| T-25 | P1 | S | Testa conversão antes da entrega de Fahrenheit. |
| T-26 | P0 | M | Protege a integração externa e seus erros. |
| T-27 | P0 | M | Protege estados e concorrência do hook. |
| T-28 | P0 | M | Verifica loading, erro, vazio e sucesso na UI. |
| T-29 | P0 | S | Torna os E2E determinísticos. |
| T-30 | P0 | M | Valida o fluxo principal em desktop e mobile. |
| T-31 | P1 | M | Endurece falhas e cenários de recuperação. |
| T-32 | P0 | M | Gate mínimo para considerar a entrega utilizável. |
| T-33 | P1 | M | Revisão final de resiliência e acessibilidade. |

## Sequência de fatias verticais

As fatias abaixo entregam valor observável progressivamente. Dentro de cada fatia, respeitar as dependências declaradas nas tarefas.

### Fatia 0 — Aplicação executável

**Objetivo visível:** abrir a aplicação com shell vazio e base de estilos.

T-01 → T-02 → T-03.

### Fatia 1 — Busca e desambiguação

**Objetivo visível:** informar uma cidade, ver resultados da Open-Meteo e selecionar o local correto.

T-04 → T-08 → T-09 → T-10 → T-13 → T-16 → T-17 → T-18 → T-22.

Essa fatia exige implementar também o caminho mínimo do hook e integrar a tela antes de adicionar a previsão completa. Se a dependência de T-13 em T-12 bloquear o trabalho, dividir T-13 em um estado de geocoding e um estado de forecast.

### Fatia 2 — Clima atual

**Objetivo visível:** selecionar uma cidade e visualizar temperatura, condição e dados atuais.

T-06 → T-11 → T-12 → T-14 → T-19 → T-22.

### Fatia 3 — Previsão de cinco dias

**Objetivo visível:** exibir hoje + quatro dias, em ordem e no timezone da cidade.

T-07 → T-20 → T-23.

### Fatia 4 — Unidade e qualidade de interação

**Objetivo visível:** alternar Celsius/Fahrenheit sem nova chamada e validar o comportamento principal.

T-05 → T-15 → T-21 → T-25 → T-30.

### Fatia 5 — Resiliência e hardening

**Objetivo visível:** lidar com vazio, erro, timeout, resposta parcial, retry, teclado e viewport mobile.

T-24 → T-26 → T-27 → T-28 → T-29 → T-31 → T-32 → T-33.

### Matriz de requisitos funcionais

| Requisito funcional | Tarefas que implementam | Tarefas que validam |
| --- | --- | --- |
| **RF1 — Buscar cidade** | T-04 normaliza/valida entrada; T-10 monta geocoding; T-13–T-15 orquestram busca, retry e concorrência; T-16 integra o formulário | T-24 testa validação; T-26 testa service; T-27 testa hook; T-28 testa formulário; T-30 testa fluxo feliz; T-31 testa input inválido e concorrência |
| **RF2 — Desambiguar resultados** | T-09/T-10 transformam e consultam locais; T-14 controla seleção; T-18 renderiza resultados; T-22 integra o fluxo | T-26 testa parser/service; T-27 testa seleção no hook; T-30 testa resultado único e múltiplo; T-31 testa falhas relacionadas |
| **RF3 — Exibir clima atual** | T-11/T-12 fazem parsing e forecast; T-19 renderiza o clima atual; T-22 integra a tela | T-26 testa respostas e campos opcionais; T-27 testa estados do hook; T-28 testa sucesso e dados ausentes; T-30 testa o fluxo completo |
| **RF4 — Exibir previsão de cinco dias** | T-06/T-07 definem códigos e datas; T-11/T-12 validam e consultam cinco períodos; T-20 renderiza a previsão; T-22 integra | T-24 testa regras de datas; T-26 testa parsing/service; T-28 testa cinco itens; T-30 testa a previsão no E2E |
| **RF5 — Alternar unidade** | T-05 implementa conversão; T-15 mantém unidade derivada; T-21 implementa o controle de UI | T-25 testa conversão unitária; T-27 testa troca sem novo request no hook; T-30 testa alternância no E2E |
| **RF6 — Informar estados da consulta** | T-08/T-10/T-12 produzem estados de resposta; T-13–T-15 expõem estados no hook; T-17 renderiza loading, empty e error; T-22 integra | T-26 testa erros dos services; T-27 testa todas as transições; T-28 testa roles e mensagens; T-31 testa estados de falha no E2E |
| **RF7 — Recuperar falhas** | T-08 implementa erros/timeout; T-14 implementa retry; T-15 preserva contexto e invalida respostas antigas; T-17 expõe ação de retry; T-22 integra | T-26 testa retry nos services; T-27 testa retry no hook; T-28 testa botão e estados; T-31 testa retry, timeout e concorrência |

### Requisitos sem tarefa correspondente

Nenhum requisito funcional da spec está sem tarefa correspondente. RF1–RF7 possuem pelo menos uma tarefa de implementação e uma tarefa de validação. Os requisitos não funcionais são tratados principalmente por T-23, T-28, T-30, T-31, T-32 e T-33.
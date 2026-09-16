# Discovery de Requisitos

## Contexto

A empresa necessita de uma aplicação web de previsão do tempo para consultas rápidas. O usuário deve buscar uma cidade, visualizar o clima atual, consultar a previsão de cinco dias e alternar entre Celsius e Fahrenheit. Como o briefing destaca o uso em dispositivos móveis, a experiência deve ser mobile-first, sem impedir o uso em desktop.

Os principais perfis esperados são:

- **Pessoa que decide a rotina:** consulta rapidamente o clima atual para escolher roupa, transporte ou atividades.
- **Pessoa que planeja deslocamentos:** consulta a previsão dos próximos dias para organizar viagens e compromissos.

## Requisitos Funcionais

- **RF1 — Buscar cidade:** permitir pesquisar uma cidade por nome.
- **RF2 — Desambiguar resultados:** apresentar país, estado ou região para diferenciar cidades com o mesmo nome.
- **RF3 — Exibir clima atual:** mostrar a temperatura e a condição climática atuais, além de dados complementares disponíveis, como umidade, vento e precipitação.
- **RF4 — Exibir previsão:** apresentar a previsão de cinco dias, incluindo data, condição climática e temperaturas mínima e máxima.
- **RF5 — Alternar unidade:** permitir alternar entre Celsius e Fahrenheit e atualizar todos os valores de temperatura exibidos.
- **RF6 — Informar estados da consulta:** exibir estados de carregamento, sucesso, vazio e erro de forma compreensível.
- **RF7 — Recuperar falhas:** oferecer uma ação para tentar novamente quando a busca ou a consulta meteorológica falhar.

## Requisitos Não-Funcionais

- **RNF1 — Responsividade:** a interface deve ser utilizável em dispositivos móveis e desktops, com suporte a diferentes tamanhos de tela.
- **RNF2 — Usabilidade:** o usuário deve conseguir iniciar uma busca e identificar o clima atual sem navegação complexa.
- **RNF3 — Acessibilidade:** os fluxos principais devem funcionar por teclado, usar labels e roles semânticos e manter contraste adequado conforme o nível básico da WCAG AA.
- **RNF4 — Performance:** a aplicação deve fornecer feedback visual imediato durante consultas e apresentar os resultados em tempo adequado para uma conexão comum.
- **RNF5 — Resiliência:** falhas de rede, indisponibilidade do serviço ou dados incompletos não devem quebrar a interface; o sistema deve orientar o usuário sobre a recuperação.
- **RNF6 — Compatibilidade:** a aplicação deve funcionar nos principais navegadores modernos em dispositivos móveis e desktop.
- **RNF7 — Localização:** textos, datas e números devem ser apresentados em pt-BR, salvo decisão posterior em contrário.
- **RNF8 — Segurança:** chaves, credenciais ou outros segredos não devem ser expostos no código executado no navegador.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Indisponibilidade ou limitação da fonte de dados meteorológicos | Média | Alto | Definir tratamento de erro, exibir mensagem clara, limitar requisições e avaliar cache ou fallback. |
| Dados meteorológicos imprecisos, incompletos ou desatualizados | Média | Alto | Exibir horário da última atualização, validar respostas e comunicar limitações dos dados ao usuário. |
| Resultado incorreto por cidade ambígua | Alta | Alto | Exibir país e região nos resultados e exigir seleção explícita quando houver homônimos. |
| Cobertura insuficiente da fonte para regiões prioritárias | Média | Alto | Validar a cobertura antes da escolha da API e definir uma fonte alternativa ou restrição de escopo. |
| Falha ou instabilidade da conexão do usuário | Média | Alto | Implementar estados de erro, preservar a busca, oferecer tentativa novamente e considerar cache local. |
| Latência elevada na busca ou na consulta | Média | Médio | Exibir loading imediatamente, reduzir chamadas, medir tempos e avaliar cache apropriado. |
| Excesso de escopo no MVP | Alta | Alto | Definir cenários prioritários, critérios de aceite e uma lista explícita do que ficará fora da primeira versão. |
| Baixa adoção por não atender ao fluxo principal do usuário | Média | Alto | Validar protótipos com usuários, medir buscas concluídas e priorizar consulta rápida do clima atual. |
| Layout inadequado ou conteúdo ilegível em telas pequenas | Média | Alto | Adotar mobile-first, testar larguras representativas e validar orientação portrait e landscape. |
| Barreiras de acessibilidade impedem o uso | Média | Alto | Adotar critérios WCAG definidos, testar teclado e leitor de tela e incluir nomes acessíveis nos controles. |
| Conversão incorreta entre Celsius e Fahrenheit | Baixa | Alto | Centralizar a regra de conversão e cobri-la com testes unitários para valores normais e extremos. |
| Exposição de credenciais ou dados pessoais | Baixa | Alto | Não incluir segredos no cliente, revisar configuração de deploy e coletar apenas dados necessários com consentimento. |
| Falta de monitoramento após a publicação | Média | Médio | Registrar erros e latência sem dados sensíveis, configurar alertas e definir responsável pela operação. |
| Incompatibilidade com navegadores ou dispositivos prioritários | Média | Médio | Definir matriz de suporte e executar testes em navegadores e viewports representativos antes da entrega. |

## Perguntas em Aberto

1. **Quem é o público prioritário e em quais cenários usará o app?** Impacto: sem essa definição, não é possível priorizar funcionalidades, densidade de informação ou decisões de UX.
2. **Qual problema principal o produto deve resolver: consulta rápida, planejamento de viagem ou acompanhamento recorrente?** Impacto: objetivos diferentes alteram o conteúdo da tela inicial e o nível de detalhe da previsão.
3. **Qual fonte de dados meteorológicos será utilizada?** Impacto: define contrato de integração, custo, limites de uso, cobertura geográfica e necessidade de credenciais.
4. **A fonte fornece dados confiáveis para todas as regiões e idiomas necessários?** Impacto: pode restringir o público atendido ou exigir uma segunda fonte e tratamento de dados incompletos.
5. **A previsão de cinco dias inclui o dia atual?** Impacto: altera a interpretação do requisito e a quantidade de dias futuros exibidos.
6. **A previsão será diária ou também terá detalhamento por hora?** Impacto: muda o modelo de dados, o layout, o volume de informações e a complexidade da consulta.
7. **Quais informações fazem parte do clima atual e da previsão?** Impacto: sem um conjunto mínimo definido, a implementação e os critérios de aceite ficam subjetivos.
8. **Como condições meteorológicas, alertas e precipitação serão representados?** Impacto: influencia ícones, textos, acessibilidade e a compreensão de fenômenos diferentes.
9. **Com que frequência os dados devem ser atualizados?** Impacto: determina cache, número de requisições, atualidade percebida e risco de exceder limites da API.
10. **A aplicação deve solicitar geolocalização automática?** Impacto: envolve permissões, privacidade, tratamento de recusa e um fluxo adicional de experiência do usuário.
11. **A busca aceitará somente cidades ou também bairros, regiões, países e coordenadas?** Impacto: define o serviço de geocoding, a validação da entrada e a forma de desambiguar resultados.
12. **Como o sistema deve se comportar quando existem várias cidades com o mesmo nome?** Impacto: uma decisão ausente pode levar o usuário a consultar o local errado.
13. **Qual unidade deve ser usada por padrão e a preferência deve ser persistida?** Impacto: define a primeira experiência e se a escolha será mantida entre sessões.
14. **Quais idiomas e formatos regionais precisam ser suportados?** Impacto: influencia textos, datas, números, unidades, acessibilidade e a necessidade de internacionalização.
15. **O usuário poderá salvar cidades, favoritos ou histórico?** Impacto: pode exigir armazenamento local, autenticação, backend e regras de privacidade.
16. **É necessário suporte offline ou cache persistente?** Impacto: altera a arquitetura e o comportamento quando não houver conexão ou a API estiver indisponível.
17. **A aplicação deve funcionar apenas em navegadores ou também ser instalável como PWA?** Impacto: define requisitos de manifesto, service worker, instalação e suporte offline.
18. **Quais tamanhos de tela, sistemas operacionais e navegadores são prioritários?** Impacto: orienta testes, layout responsivo e compatibilidade mínima.
19. **Quais requisitos de acessibilidade devem ser atendidos e qual versão da WCAG será adotada?** Impacto: sem um nível definido, não há critério objetivo para validar teclado, leitores de tela e contraste.
20. **Qual é o tempo máximo aceitável para carregar a aplicação e retornar uma consulta?** Impacto: transforma “rápido” em critério mensurável de performance e orienta otimizações.
21. **Qual disponibilidade é esperada e existe uma janela de manutenção?** Impacto: influencia hospedagem, monitoramento, fallback e critérios de operação.
22. **Como o usuário será informado sobre dados desatualizados, falhas ou indisponibilidade parcial?** Impacto: evita que informações antigas sejam interpretadas como atuais e define os estados de erro.
23. **Existe uma meta de uso, retenção ou conversão para medir o sucesso do produto?** Impacto: sem métricas, não será possível validar se a solução atende ao objetivo de negócio.
24. **Quais dados de uso ou localização serão coletados e por quanto tempo serão retidos?** Impacto: determina consentimento, política de privacidade, armazenamento e obrigações legais.
25. **Existe necessidade de autenticação, perfis ou administração?** Impacto: altera significativamente escopo, segurança, persistência e custos de desenvolvimento.
26. **Quem será responsável por operar, monitorar e atualizar a aplicação?** Impacto: define observabilidade, alertas, suporte e o processo de resposta a incidentes.
27. **Há restrições de orçamento, prazo ou infraestrutura?** Impacto: limita a escolha de APIs, hospedagem, funcionalidades e nível de qualidade possível na primeira versão.
28. **Quais cenários devem ser priorizados no MVP e quais ficam fora de escopo?** Impacto: sem limites explícitos, o produto pode crescer sem controle e atrasar a entrega.

## Decisões

- **Fonte de dados: Open-Meteo, sem API key.** A aplicação usará a Open-Meteo para geocoding e dados meteorológicos. Essa decisão resolve as perguntas 3 e 4 ao definir o provedor, evitar o gerenciamento de credenciais no cliente e estabelecer a necessidade de validar cobertura e qualidade dos dados.
- **Interpretação de “5 dias”: hoje + 4 dias.** A previsão exibirá o dia atual e os quatro dias seguintes. Essa decisão resolve a pergunta 5 e fixa a quantidade de períodos apresentados no requisito RF4.
- **Unidade padrão: Celsius.** As temperaturas serão exibidas inicialmente em Celsius, mantendo a possibilidade de alternância para Fahrenheit prevista no RF5. Essa decisão resolve a pergunta 13 quanto à experiência inicial e à unidade padrão.
- **Sem autenticação e sem persistência de servidor.** A primeira versão não terá contas, perfis, favoritos ou histórico armazenado em backend. Essa decisão resolve as perguntas 15 e 25 e mantém o MVP focado em consultas pontuais, sem dados pessoais ou infraestrutura de usuários.
- **Idioma da interface: pt-BR.** Textos, datas e números seguirão o locale pt-BR. Essa decisão resolve a pergunta 14 para a primeira versão e concretiza o RNF7.

## Suposições

- O usuário terá acesso à internet na maior parte das consultas.
- A primeira versão não exigirá autenticação ou conta de usuário.
- A aplicação será acessada por navegadores modernos.
- A busca será feita pelo nome de uma cidade, com apoio de dados de localização para desambiguação.
- A fonte escolhida fornecerá dados suficientes para clima atual e previsão de cinco dias.
- A interface inicial será disponibilizada em pt-BR.
- A unidade Fahrenheit continuará disponível como alternativa à unidade padrão Celsius.

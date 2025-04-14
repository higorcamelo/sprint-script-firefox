# Projeto ScriptSprint - README

Este repositório contém o código-fonte da extensão **ScriptSprint** para o navegador Firefox.

## Descrição do Projeto

O **ScriptSprint** é uma extensão para o navegador Firefox projetada para automatizar a inserção de texto e facilitar a navegação em campos de texto, como formulários e editores, substituindo atalhos definidos pelo usuário por frases completas ou comandos. A extensão permite otimizar tarefas repetitivas, melhorar a eficiência e proporcionar uma experiência de navegação mais fluída e personalizada.

## Funcionalidades Atuais

- **Criação de Atalhos Personalizados**: Os usuários podem definir seus próprios atalhos de texto, associando um comando curto a uma frase ou comando completo.
- **Confirmação de Substituição**: Quando um atalho é detectado, a extensão solicita uma confirmação antes de substituir o texto, garantindo o controle sobre o processo.
- **Interface de Gerenciamento Simples**: Interface de configuração intuitiva para adicionar, editar e remover atalhos, permitindo total personalização.
- **Suporte a Campos de Texto e Editáveis**: Funciona em campos `input`, `textarea` e elementos com `contenteditable`, como editores de texto.
- **Armazenamento Local**: Os atalhos são armazenados no armazenamento local do navegador, sem necessidade de servidores externos.

## Funcionalidades Planejadas para Versões Futuras

- **Sincronização de Atalhos**: Implementação de sincronização de atalhos entre diferentes dispositivos através de uma conta de usuário, permitindo usar os mesmos atalhos em qualquer lugar.
- **Suporte a Múltiplos Idiomas**: Adição de suporte para diferentes idiomas, permitindo que a extensão seja utilizada globalmente.
- **Filtros de Contexto**: Implementação de filtros que permitam definir os atalhos dependendo do tipo de campo ou da página em que o atalho será ativado, garantindo maior flexibilidade.
- **Atalhos Condicionais**: Suporte a atalhos condicionais baseados no conteúdo ou em ações específicas da página, como substituir o texto apenas se um campo de formulário estiver vazio ou se uma página de login estiver aberta.
- **Visualização e Edição de Atalhos em Tempo Real**: Interface aprimorada para visualizar todos os atalhos criados, com a possibilidade de editar ou excluir atalhos diretamente da interface.
- **Testes Automatizados e de Estresse**: Implementação de testes para validar a funcionalidade da extensão e garantir que ela seja robusta em diferentes cenários de uso (incluindo situações de sobrecarga de atalhos).
- **Análises de Uso**: Coleta de dados de uso (com o devido consentimento) para entender como os usuários estão interagindo com a extensão e quais funcionalidades mais estão utilizando.

## Estrutura do Projeto

- **popup.html**: Arquivo HTML responsável pela interface pop-up da extensão, onde o usuário pode criar e gerenciar seus atalhos personalizados.
- **popup.css**: Arquivo CSS para estilizar a interface pop-up.
- **popup.js**: Script JavaScript que controla a lógica de exibição e interação na interface pop-up.
- **content.js**: Script que detecta e substitui os atalhos nos campos de texto das páginas web. Gerencia a lógica de substituição de texto e exibição de confirmações.
- **background.js**: Arquivo JavaScript de plano de fundo que gerencia tarefas em segundo plano e possíveis integrações futuras.
- **manifest.json**: Arquivo de manifesto da extensão, contendo as permissões e os detalhes da extensão.
  
## Como Usar

1. **Instalação**
   - Baixe e extraia o repositório.
   - Abra o Firefox e vá para `about:debugging`.
   - Clique em "Carregar extensão temporária" e selecione o diretório do projeto.

2. **Adicionar Atalhos**
   - Clique no ícone da extensão na barra de ferramentas do Firefox.
   - Use a interface para criar novos atalhos, definindo o atalho e o texto correspondente.
   - Salve os atalhos para que possam ser usados em qualquer página web.

3. **Usar Atalhos**
   - Ao digitar um atalho em um campo de texto ou conteúdo editável, a extensão irá detectar automaticamente e pedir confirmação para substituir o atalho pelo texto associado.

## Próximos Passos

- [ ] **Sincronização de Atalhos**: Implementar a sincronização de atalhos entre dispositivos utilizando uma conta de usuário.
- [ ] **Suporte a Múltiplos Idiomas**: Adicionar traduções e opções de idioma para ampliar o alcance da extensão.
- [ ] **Melhorias na Interface de Usuário**: Refinar a interface de gerenciamento de atalhos, permitindo uma visualização mais interativa e melhor experiência de edição.
- [ ] **Testes Automatizados e de Estresse**: Criar uma suíte de testes para validar o comportamento da extensão em cenários reais e com múltiplos atalhos.
- [ ] **Análises de Uso e Feedback**: Implementar ferramentas para coletar feedback dos usuários e analisar como os atalhos estão sendo utilizados.
- [ ] **Atalhos Condicionais e Filtros de Contexto**: Implementar filtros para atalhos que são ativados dependendo do tipo de campo ou da situação da página.

## Contribuições

Se você deseja contribuir para o projeto, fique à vontade para abrir uma *issue* ou enviar um *pull request*. Todas as contribuições são bem-vindas! Verifique o arquivo `CONTRIBUTING.md` para mais informações sobre como contribuir.

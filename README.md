# Projeto ScriptSprint - README

Este repositório contém o código-fonte da extensão ScriptSprint para o navegador Firefox.

## Descrição do Projeto

O ScriptSprint é uma extensão focada em facilitar a criação, armazenamento e execução de comandos personalizados no navegador Firefox. A extensão oferece uma interface simples para criar e gerenciar comandos personalizados que podem ser utilizados para automatizar tarefas específicas durante a navegação.

## Estrutura do Projeto

- **popup.html:** Arquivo HTML responsável por estruturar a interface pop-up da extensão. Contém seções para boas-vindas, criação de comandos e exibição da lista de comandos salvos.

- **popup.css:** Estilos CSS para estilizar a interface do pop-up.

- **popup.js:** Script JavaScript que controla a lógica de exibição e interação na interface pop-up.

- **background.js:** Arquivo JavaScript de plano de fundo. Atualmente vazio, pode ser utilizado para incluir lógica de fundo da extensão.

- **manifest.json:** Arquivo de manifesto da extensão que especifica detalhes como nome, versão, permissões e arquivos associados.

## Problemas Conhecidos

Atualmente, a extensão enfrenta problemas ao se conectar remotamente ao Firefox. O erro "Can't find profile directory" pode ocorrer durante a execução. Caso esse problema persista, considere consultar as [questões abertas](https://github.com/mozilla/web-ext/issues) no repositório oficial do `web-ext` para possíveis soluções.

## Próximos Passos

- [ ] Resolver problemas de conexão remota com o Firefox.
- [ ] Implementar lógica de fundo na `background.js`.
- [ ] Melhorar o design e a experiência do usuário na interface pop-up.
- [ ] Adicionar suporte a idiomas internacionais.

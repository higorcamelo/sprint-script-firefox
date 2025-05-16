# 🧩 ScriptSprint — Extensão para Firefox

[![Firefox](https://img.shields.io/badge/Firefox-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)](https://addons.mozilla.org/pt-BR/firefox/addon/sprintscript/)

Este é o README principal para a versão em português da extensão **ScriptSprint**. Se preferir consultar o README em inglês, clique na bandeira abaixo:

##### 🇬🇧 [English version of this README](./README.en.md)
---

**ScriptSprint** é uma extensão para Firefox que permite a substituição automática de atalhos de texto personalizados por frases completas, diretamente em campos de texto e áreas editáveis. Projetada para acelerar a escrita e eliminar tarefas repetitivas, a extensão oferece controle e flexibilidade ao usuário final.

---

## ✨ Visão Geral

ScriptSprint é ideal para quem trabalha com preenchimento de formulários, suporte, desenvolvimento, criação de conteúdo ou qualquer tarefa que envolva repetição de frases. O usuário define um atalho e, ao digitá-lo, a extensão sugere a substituição automática com confirmação — garantindo precisão e controle.

---

## 🔧 Funcionalidades

- **Atalhos personalizados** — Associe comandos curtos a frases ou blocos de texto completos.
- **Confirmação antes da substituição** — Para evitar substituições acidentais.
- **Suporte a `input`, `textarea` e áreas `contenteditable`** — Funciona até em chats como WhatsApp Web e Instagram.
- **Suporte a quebras de linha** — Crie textos com estrutura e formatação.
- **Interface intuitiva** — Gerencie facilmente seus atalhos.
- **Internacionalização (i18n)** — Interface em português e inglês.
- **Armazenamento local** — Nenhum dado sai do seu navegador.
- **Extensão 100% open source** — Transparente, leve e personalizável.

---

## 🗂 Estrutura dos Arquivos

```bash
├── index.js                 # Arquivo principal que conecta todos os módulos
│   ├── i18n.js              # Lógica de tradução e idioma
│   ├── substitutions.js     # Carrega os atalhos, aplica substituições e escuta digitação
│   ├── tooltip.js           # Criação, exibição e comportamento do tooltip de confirmação
│   ├── replace.js           # Funções para substituir texto nos campos
│   ├── observer.js          # Observa mudanças na página e adiciona listeners
│   └── utils.js             # Funções auxiliares como truncar texto, etc.
├── popup.html              # Interface do usuário para gerenciamento de atalhos
├── popup.css               # Estilos da interface
├── popup.js                # Lógica de interação no popup
├── manifest.json           # Configurações da extensão
├── locales/                # Arquivos de tradução (i18n)

```
---


## 🚀 Como Instalar (Modo Temporário)

1. Clone ou baixe este repositório.
2. No Firefox, acesse `about:debugging`.
3. Clique em “Carregar extensão temporária” e selecione o manifesto do projeto.

---

## 📝 Como Usar

1. Clique no ícone da extensão.
2. Adicione um novo atalho com um nome curto e seu texto correspondente.
3. Em qualquer página web, digite o atalho e confirme a substituição.

---

## 🌱 Sobre o Futuro

ScriptSprint é um projeto em constante evolução. Novas ideias estão sendo exploradas para expandir a extensão com recursos mais avançados, melhor desempenho e uma experiência de usuário ainda mais refinada. Fique à vontade para acompanhar o repositório e sugerir melhorias.

---

## 🤝 Contribuindo

Pull requests são muito bem-vindos! Para sugestões, melhorias ou correções, abra uma *issue* ou envie um *PR*. Sinta-se à vontade para adaptar a extensão às suas necessidades e contribuir com o crescimento do projeto.

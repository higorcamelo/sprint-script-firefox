# 🧩 ScriptSprint — Extensão para Firefox

[![Firefox](https://img.shields.io/badge/Firefox-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)](https://addons.mozilla.org/pt-BR/firefox/addon/sprintscript/)

**ScriptSprint** é uma extensão para Firefox que permite a substituição automática de atalhos de texto personalizados por frases completas, diretamente em campos de texto e áreas editáveis. Projetada para acelerar a escrita e eliminar tarefas repetitivas, a extensão oferece controle e flexibilidade ao usuário final.

---

## ✨ Visão Geral

ScriptSprint é ideal para quem trabalha com preenchimento de formulários, suporte, desenvolvimento, criação de conteúdo ou qualquer tarefa que envolva repetição de frases. O usuário define um atalho e, ao digitá-lo, a extensão sugere a substituição automática com confirmação — garantindo precisão e controle.

---

## 🔧 Funcionalidades

- **Atalhos personalizados** — Associe comandos curtos a frases ou blocos de texto completos.
- **Confirmação antes da substituição** — Para evitar substituições acidentais.
- **Interface leve e intuitiva** — Gerencie facilmente seus atalhos.
- **Compatível com campos `input`, `textarea` e `contenteditable`** — Funciona em diversos tipos de páginas.
- **Armazenamento local** — Os dados são salvos no navegador, sem uso de servidores externos.
- **Internacionalização (i18n)** — Suporte a múltiplos idiomas (atualmente: português e inglês).
- **Suporte a quebras de linha** — Crie textos com estrutura e formatação.

---

## 🗂 Estrutura dos Arquivos

- `popup.html` — Interface de gerenciamento dos atalhos
- `popup.css` — Estilo da interface
- `popup.js` — Lógica de interação com o usuário
- `content.js` — Substituição de texto em páginas e confirmação
- `background.js` — Ações em segundo plano (base para futuras integrações)
- `manifest.json` — Arquivo de configuração da extensão
- `locales/` — Arquivos de tradução para i18n

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

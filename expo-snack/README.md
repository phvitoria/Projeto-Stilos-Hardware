# Stilos Hardware - Versão Mobile para Expo Snack 📱

Este diretório contém a versão mobile nativa e de alta fidelidade do aplicativo **Stilos Hardware**, totalmente estruturada e pronta para ser importada ou copiada diretamente no **[snack.expo.io](https://snack.expo.io)**.

Como o Expo funciona em ecossistemas de App nativos (iOS/Android), criamos um código dedicado utilizando elementos visuais otimizados do React Native, preservando 100% da identidade visual Bento, das cores de destaque customizáveis, das regras de login e do simulador de telemetria!

---

## ⚡ Como Rodar no Expo Snack

Há duas maneiras extremamente simples de testar seu aplicativo mobile:

### Opção 1: Copiar o Código no Painel do Snack (Mais Rápido 🚀)

1. Abra o arquivo `/expo-snack/App.tsx` neste projeto e copie todo o seu conteúdo (`Ctrl+A` e `Ctrl+C`).
2. Acesse o site **[https://snack.expo.io](https://snack.expo.io)**.
3. No painel esquerdo do Snack, clique no arquivo principal `App.js` ou `App.tsx` (caso queira criar um arquivo TypeScript).
4. Substitua todo o conteúdo desse arquivo colando o código copiado do nosso `App.tsx`.
5. No painel direito, adicione a dependência `@react-native-async-storage/async-storage` caso o simulador solicite (o Snack geralmente instala dependências automaticamente a partir das importações!).
6. Pronto! O emulador do lado direito exibirá instantaneamente a tela de login do **Stilos Hardware**!

---

### Opção 2: Importar via Estrutura de Arquivos

Você também pode baixar os arquivos `App.tsx` e `package.json` deste diretório e arrastá-los diretamente para a barra de arquivos da plataforma Expo Snack.

---

## 🛠️ Recursos Mobile Implementados

- 🔒 **Login e Cadastro de Operador**: Autenticação com persistência offline direta utilizando `AsyncStorage` (nada de dados fictícios voláteis).
- 🎨 **Ajustes de Branding e Accent Color**: Seletor dinâmico que atualiza globalmente a cor do tema (Esmeralda, Cyber Cyan, Azure Blue, Alerta Âmbar, Carbon Purple e Perigo Vermelho) em tempo real, inclusive nos ícones ativos e barras de progresso.
- 📦 **Painel Bento de Inventário**: Grid fluido com cards contendo foto, tags de estoque reais, valores formatados e detalhes de alta fidelidade.
- 🚀 **Registrar Peça**: Formulário completo para cadastro com gerador de especificações dinâmico que permite adicionar linhas personalizadas como novos atributos.
- 🎛️ **Simulador de Telemetria Interativo**: Sliders nativos que ajustam dinamicamente a frequência de clock, temperatura de núcleo e cargas virtuais com segurança.

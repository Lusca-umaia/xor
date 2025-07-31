# 🧠 XOR — Sistema de Progressão de Curso da UFC

**XOR** é uma aplicação web robusta, criada para otimizar a jornada acadêmica de estudantes da Universidade Federal do Ceará (UFC). Com **XOR**, você pode acompanhar sua **progressão acadêmica**, aprimorar sua organização com a técnica **Pomodoro**, interagir com um **chat inteligente com IA** para tirar dúvidas, e praticar com uma **lista de questões interativas**.

---

## 🚀 Funcionalidades Principais

- **Progressão de Curso**: Visualize sua grade curricular de forma dinâmica, acompanhando facilmente as disciplinas ativas, concluídas e pendentes.
- **Pomodoro**: Um temporizador configurável para aumentar seu foco nos estudos, com estatísticas de uso detalhadas e registro de dias consecutivos.
- **Chat com IA**: Um assistente inteligente integrado, pronto para ajudar com dúvidas acadêmicas ou dicas de produtividade.
- **Lista de Questões**: Crie, responda e gerencie seus próprios questionários, uma ferramenta ideal para revisar conteúdos e se preparar para provas.

---

## 🧩 Estrutura do Projeto

```bash
src/
├── app/                        # Rotas da aplicação (públicas e privadas)
│   ├── (private)/              # Rotas que exigem autenticação
│   │   ├── chat/               # Página do chat com IA
│   │   ├── courseProgression/  # Página de progressão de curso
│   │   ├── pomodoro/           # Página do Pomodoro
│   │   └── questoes/           # Criação, listagem e resposta de questionários
│   ├── (public)/               # Rotas de acesso público (login e registro)
│   ├── api/                    # Endpoints da API (ex: chat IA)
├── components/                 # Componentes de UI reutilizáveis
├── context/                    # Contextos globais (ex: autenticação, React Query)
├── services/                   # Camada de requisições a APIs externas (autenticação, curso, grades)
├── utils/                      # Utilitários, helpers, tipos e constantes
├── helpers/
├── @types/
```

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias:

- **Next.js**: Framework React fullstack para desenvolvimento ágil e performático.
- **TypeScript**: Garante tipagem estática robusta, melhorando a manutenibilidade e a detecção de erros.
- **Tailwind CSS**: Framework CSS para estilização rápida e responsiva.
- **React Context + React Query**: Gerenciamento de estado global e cache de dados de forma eficiente.
- **OpenAI API**: Integração com inteligência artificial para o chatbot.
- **Husky + Prettier + ESLint**: Ferramentas para padronização do código e garantia de qualidade.

---

## 📦 Instalação e Execução

Para configurar e rodar o projeto localmente, siga os passos abaixo:

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

- **Node.js**: Versão 18 ou superior.
- **npm**: Gerenciadores de pacotes.

### Passos

1.  **Instale as dependências:**

    ```bash
    npm install
    ```

2.  **Crie um arquivo `.env` na raiz do projeto** e configure suas variáveis de ambiente, como sua chave da OpenAI API:

    ```
    TOGETHER_API_KEY=sua_chave_aqui
    NEXT_PUBLIC_API_BASE_URL=rota_do_back
    ```

3.  **Execute o projeto em modo de desenvolvimento:**

    ```bash
    npm run dev
    ```

    O site estará disponível em `http://localhost:3000`.

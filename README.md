# 🎓 Retrospectiva Medcof 2025

Uma retrospectiva estilo "Spotify Wrapped" para estudantes de medicina, com integração à API do QBank e exportação para Instagram Stories.

![Preview](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Preview](https://img.shields.io/badge/API-QBank-green?style=for-the-badge)
![Preview](https://img.shields.io/badge/Instagram-Stories-E4405F?style=for-the-badge&logo=instagram)

## ✨ Funcionalidades

- 📊 **Estatísticas de questões** - Total resolvido, acertos, erros, taxa de acerto
- 🔥 **Métricas de dedicação** - Dias de estudo, maior sequência, média diária
- 🏆 **Top 5 especialidades** - Áreas onde você mais praticou
- 🧠 **Personalidade de estudo** - Determinada pelos seus hábitos
- 💡 **Fun Facts** - Dados curiosos sobre seu desempenho
- 📱 **Export para Instagram** - Imagens otimizadas para Stories (1080x1920)
- 🎨 **Design moderno** - Animações fluidas com Framer Motion

## 🚀 Quick Start

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### 3. Usar a aplicação

1. Faça login no QBank
2. Obtenha seu token JWT (ver instruções abaixo)
3. Cole o token no campo e clique em "Ver Retrospectiva"

Ou acesse [http://localhost:3000?demo=true](http://localhost:3000?demo=true) para ver uma demonstração.

## 🔑 Como obter seu token JWT

1. Faça login no [QBank](https://qbank.medcof.com.br)
2. Abra as ferramentas de desenvolvedor (F12)
3. Vá na aba **Network** (Rede)
4. Faça qualquer requisição (ex: clique em algum menu)
5. Encontre uma requisição para a API
6. Nos headers da requisição, copie o valor de **Authorization**
7. Cole na aplicação (sem o "Bearer ")

## 📡 APIs Utilizadas

A aplicação consome os seguintes endpoints da API do QBank:

| Endpoint | Descrição |
|----------|-----------|
| `GET /v3/reports/questions/answered/daily` | Questões respondidas por dia |
| `GET /v3/reports/questions/answered` | Resumo total de questões |
| `GET /v3/reports/questions/ever-answered-wrong` | Questões que mais errou |
| `GET /v3/reports/graph/right-answers-evolution` | Evolução da taxa de acerto |

Todas as requisições usam o período de **1 de janeiro a 31 de dezembro de 2025**.

## 🎨 Slides da Retrospectiva

| Slide | Descrição |
|-------|-----------|
| 1. Intro | Apresentação personalizada "SEU 2025 em Medicina" |
| 2. Questões | Total resolvido, acertos, taxa de acerto |
| 3. Dedicação | Dias de estudo, sequência, média diária |
| 4. Top 5 | Especialidades mais praticadas |
| 5. Personalidade | Tipo de estudante + fun fact |
| 6. Resumo | Resumo final com métricas-chave |

## 🧠 Tipos de Personalidade

- **O Estrategista** - Alta consistência e taxa de acerto
- **O Maratonista** - Alto volume de questões
- **O Consistente** - Estuda todos os dias
- **O Intenso** - Sessões de estudo intensas
- **O Preciso** - Alta taxa de acerto
- **O Dedicado** - Presente na maioria dos dias
- **O Equilibrado** - Ritmo saudável de estudos

## 📱 Exportação para Instagram

As imagens são geradas no formato ideal para Instagram Stories:
- **Resolução**: 1080x1920 pixels
- **Formato**: PNG de alta qualidade
- **Retina-ready**: 2x pixel ratio

### Botões de exportação:
- **Baixar Slide**: Exporta apenas o slide atual
- **Baixar Tudo**: Exporta todos os 6 slides em sequência

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   └── retrospective/
│   │       └── route.ts       # API proxy para QBank
│   ├── globals.css            # Estilos globais
│   ├── layout.tsx             # Layout principal
│   └── page.tsx               # Página principal com form JWT
├── components/
│   ├── Carousel.tsx           # Carrossel principal
│   └── slides/
│       ├── IntroSlide.tsx     # Slide de introdução
│       ├── StatsSlide.tsx     # Slide de estatísticas
│       ├── TopListSlide.tsx   # Slide de ranking
│       ├── PersonalitySlide.tsx # Slide de personalidade
│       └── SummarySlide.tsx   # Slide de resumo
├── lib/
│   └── api-client.ts          # Cliente para API QBank
└── types/
    └── api.ts                 # Tipos TypeScript
```

## 🛠️ Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **html-to-image** - Exportação de imagens
- **Lucide React** - Ícones

## 🔒 Segurança

- O token JWT é enviado apenas para a API do QBank
- Nenhum dado é armazenado no servidor
- O token fica apenas no navegador do usuário

## 📄 Licença

MIT © Medcof

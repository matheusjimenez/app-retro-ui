# 🎓 Retrospectiva Medcof 2024

Uma retrospectiva estilo "Spotify Wrapped" para estudantes de medicina, com conexão ao MongoDB para estatísticas reais e exportação para Instagram Stories.

![Preview](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Preview](https://img.shields.io/badge/MongoDB-Ready-green?style=for-the-badge&logo=mongodb)
![Preview](https://img.shields.io/badge/Instagram-Stories-E4405F?style=for-the-badge&logo=instagram)

## ✨ Funcionalidades

- 📊 **Estatísticas completas** - Questões, flashcards, vídeos, tempo de estudo
- 🎯 **Top 5 especialidades** - Baseado no tempo de estudo
- 🦉 **Personalidade de estudo** - Determinada pelos hábitos do aluno
- 💡 **Fun Facts** - Dados curiosos sobre o comportamento de estudo
- 📱 **Export para Instagram** - Imagens otimizadas para Stories (1080x1920)
- 🎨 **Design moderno** - Animações fluidas com Framer Motion

## 🚀 Quick Start

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
MONGODB_URI=mongodb://localhost:27017/medcof
```

Ou conecte ao seu MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/medcof
```

### 3. Rodar o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### 4. Testar com dados demo

Acesse [http://localhost:3000?demo=true](http://localhost:3000?demo=true) para ver uma demonstração com dados fictícios.

## 📦 Collections MongoDB Necessárias

O projeto se conecta às seguintes collections do MongoDB:

### `qbank_test_interactions`

Interações do aluno com questões do QBank.

```javascript
{
  userId: Number,           // ID do usuário
  questionId: ObjectId,     // ID da questão
  answerId: ObjectId,       // ID da resposta
  wasRight: Boolean,        // Se acertou
  wasNulledQuestion: Boolean,
  testMode: "study" | "test" | "ranked",
  isRankedTest: Boolean,
  deleted: { isDeleted: Boolean, deletedAt: Date },
  createdAt: Date,
  updatedAt: Date
}
```

### `userflashcardinteractions`

Interações do aluno com flashcards.

```javascript
{
  userId: Number | ObjectId,
  flashCardId: ObjectId,
  flashCardStackId: ObjectId,
  score: Number,            // 0-3 (não lembrei, difícil, bom, fácil)
  timeInSeconds: Number,
  ease: Number,
  repetition: Number,
  intervalInMinutes: Number,
  intervalDate: Date,
  deleted: { isDeleted: Boolean, deletedAt: Date },
  createdAt: Date,
  updatedAt: Date
}
```

### `video_daily_tracker`

Tracking diário de vídeos assistidos.

```javascript
{
  userId: Number,
  date: Date,
  trackers: [{
    videoId: ObjectId,
    aqfmId: Number,
    productId: Number,
    blockNumber: Number,
    progress: [[Number, Number]],  // [segundoInicio, segundoFim]
    totalSecondsWatched: Number,
    videoTotalSeconds: Number,
    wasFinished: Boolean,
    pings: Number,
    lastSeenAt: Date,
    ips: [String],
    tags: [{
      tagId: ObjectId,
      tagName: String,
      rootParentTagId: ObjectId,
      rootParentTagName: String
    }]
  }],
  dailyTotalSecondsWatched: Number,
  videosWatched: Number,
  videosFinished: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Slides da Retrospectiva

| Slide | Descrição |
|-------|-----------|
| 1. Intro | Apresentação personalizada com o ano |
| 2. Estatísticas | Horas de estudo, questões, taxa de acerto |
| 3. Mais conquistas | Flashcards e vídeos assistidos |
| 4. Top 5 | Especialidades mais estudadas |
| 5. Personalidade | Tipo de estudante + fun fact |
| 6. Resumo | Resumo final com métricas-chave |

## 🧠 Tipos de Personalidade

- **O Estrategista** - Alta consistência e taxa de acerto
- **O Maratonista** - Alto volume de questões
- **A Coruja Noturna** - Estuda depois das 22h
- **O Madrugador** - Estuda entre 5h e 8h
- **O Memorizador** - Foco em flashcards
- **O Visual** - Foco em vídeos
- **O Equilibrado** - Usa todas as ferramentas

## 📱 Exportação para Instagram

As imagens são geradas no formato ideal para Instagram Stories:
- **Resolução**: 1080x1920 pixels
- **Formato**: PNG de alta qualidade
- **Retina-ready**: 2x pixel ratio

### Botões de exportação:
- **Baixar Slide**: Exporta apenas o slide atual
- **Baixar Tudo**: Exporta todos os 6 slides em sequência

## 🔧 API Routes

### GET `/api/retrospective`

Busca estatísticas de um usuário.

**Query params:**
- `userId` (required) - ID numérico do usuário
- `year` (optional) - Ano da retrospectiva (default: ano atual)
- `demo` (optional) - Se `true`, retorna dados de demonstração

**Exemplo:**
```bash
curl "http://localhost:3000/api/retrospective?userId=12345&year=2024"
```

## 🛠️ Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **MongoDB + Mongoose** - Banco de dados
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **html-to-image** - Exportação de imagens
- **Lucide React** - Ícones

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   └── retrospective/
│   │       └── route.ts       # API de estatísticas
│   ├── globals.css            # Estilos globais
│   ├── layout.tsx             # Layout principal
│   └── page.tsx               # Página principal
├── components/
│   ├── Carousel.tsx           # Carrossel principal
│   └── slides/
│       ├── IntroSlide.tsx     # Slide de introdução
│       ├── StatsSlide.tsx     # Slide de estatísticas
│       ├── TopListSlide.tsx   # Slide de ranking
│       ├── PersonalitySlide.tsx # Slide de personalidade
│       └── SummarySlide.tsx   # Slide de resumo
├── lib/
│   ├── mongodb.ts             # Conexão MongoDB
│   └── statistics.ts          # Funções de agregação
└── models/
    ├── QBankTestInteraction.ts
    ├── UserFlashCardInteraction.ts
    └── VideoDailyTracker.ts
```

## 📄 Licença

MIT © Medcof

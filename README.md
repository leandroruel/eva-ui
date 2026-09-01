# eva-ui — EVA NERV HUD Theme

<p align="center">
  <strong>Um design system operacional para interfaces de centro de comando — built para parecer que sempre esteve lá.</strong><br/>
  <em>A estética analógica da NERV, reconstruída como primitives React tipadas, testáveis e publicáveis.</em>
</p>

<p align="center">
  <a href="https://github.com/leandroruel/eva-ui"><img src="https://img.shields.io/github/stars/leandroruel/eva-ui?style=flat-square" alt="stars" /></a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TS" />
  <img src="https://img.shields.io/badge/oxlint-%E2%9C%94-00D492?style=flat-square" alt="oxlint" />
  <img src="https://img.shields.io/badge/oxfmt-%E2%9C%94-00D492?style=flat-square" alt="oxfmt" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT" />
</p>

> **Conceito:** o eva-ui nasceu da engenharia reversa de um HUD wireframe de Evangelion — preto absoluto, molduras em _bracket_ com dois cantos chanfrados, traço de 1.5px na cor de estado, faixas _hazard_ diagonais e tipografia bilíngue (kanji + en). Cada detalhe foi isolado em um componente com contrato explícito: `EvaButton` muda de tema só com `variant`, `EvaText` expõe a escala tipográfica da NERV, `Chamfer` e `HazardStrip` encapsulam a geometria. Tokens em `oklch`, cantos via `corner-shape: bevel` com fallback `clip-path` e `@property --sync` para animação sem JS. O monolito original (`EvangelionNERVDashboard.jsx`, 1072 linhas) está preservado em `EvangelionNERVDashboard.legacy.jsx` como registro do ponto de partida — o theme é a evolução.

---

## ✨ Features

- **Theme puro CSS** — sem dependência de UI lib, tokens `oklch`, `corner-shape`/`clip-path`, scanlines CRT
- **Primitives atomizados** — cada detalhe é componente (`EvaButton`, `EvaText`, `Chamfer`, `HazardStrip`, `EvaEyebrow`, `EvaBadge`, `HexBadge`...)
- **Composables** — `StatusStack`, `SyncRatio`, `PilotField`, `Notification`, `SystemControl`, `TargetBox` + `NervDashboard` layout 3 colunas (`@container`)
- **Type-safe** — TypeScript strict, hooks `useSyncEqualizer` / `useAnimatedNumber`
- **Qualidade** — `oxlint` + `oxfmt` + `tsc --noEmit` no `npm run check`
- **Dual build** — app (`dist/index.html`) e lib (`dist/eva-ui.{js,css,umd.cjs}`) para publicar como pacote

## 🚀 Quick start

```bash
git clone https://github.com/leandroruel/eva-ui.git
cd eva-ui
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # app → dist/index.html
npm run build:lib  # lib → dist/eva-ui.{js,css,umd.cjs}
npm run preview    # preview do build
```

```bash
npm run check      # typecheck + oxlint + oxfmt --check
npm run lint:fix   # oxlint --fix
npm run fmt        # oxfmt
```

## 📦 Uso como lib

```ts
import { NervDashboard } from "eva-ui";
import "eva-ui/dist/eva-ui.css";

// granular
import {
  EvaButton,
  EvaText,
  StatusStack,
  SyncRatio,
  PilotStack,
  Chamfer,
  HazardStrip,
} from "eva-ui";
import "eva-ui/src/theme/index.css";
```

```tsx
// botão temático via prop variant
<EvaButton variant="warning" active={status === "warning"} onClick={() => setStatus("warning")}>
  <EvaText variant="kanji">警告</EvaText>
  <EvaText variant="en">WARNING</EvaText>
</EvaButton>

// texto atomizado
<EvaText variant="caption" tone="success">EVA-01 · ACTIVE / LOCKED / SYNCED / OK</EvaText>
<EvaEyebrow left={<EvaText variant="eyebrowStrong">パイロットID</EvaText>} right="PILOT ID · NERV" />

// wrapper chamfer + hazard
<Chamfer color="yellow" size="10px" active={isActive}>
  <HazardStrip color="pilot" />
  <HexBadge status="success" />
</Chamfer>
```

**Cores disponíveis:** `orange | red | green | yellow | cyan | gray | dim | black` + semânticos `warning→yellow | error→red | success→green` — centralizados em `src/theme/colors.ts:1` via `resolveEvaColor()`.

## 🗂️ Estrutura

```
src/
├── theme/
│   ├── tokens.css        # --eva-* oklch + @property --sync
│   ├── base.css          # .nerv-root + scanlines
│   ├── chamfer.css       # .chamfer / .chamfer-sm
│   ├── colors.ts         # EVA_COLORS + resolveEvaColor (single source)
│   └── index.css
├── hooks/
│   ├── useSyncEqualizer.ts
│   └── useAnimatedNumber.ts
├── components/
│   ├── EvaButton/        # botão HUD variant prop
│   ├── EvaText/          # primitive tipográfica (kanji, en, caption, eyebrow, title, sub, pilotLabel...)
│   ├── Chamfer/          # wrapper bracket
│   ├── HazardStrip/      # faixa listrada
│   ├── EvaEyebrow/       # header nerv-eyebrow
│   ├── EvaBadge/         # badge retangular
│   ├── HexBadge/         # hexágono !/✓ piloto
│   ├── HexIcon/          # hex outline
│   ├── StatusStack/      # 3× EvaButton
│   ├── SyncRatio/        # SyncBars + SyncTrack + SyncReadout + LimitRow/Line
│   ├── Notification/     # Flag + Timer + EvaText
│   ├── PilotField/       # Chamfer + EvaText + HexBadge + HazardStrip
│   ├── TargetBox/
│   └── SystemControl/ + SystemRow/
├── layouts/NervDashboard/ # grid 3 colunas (@container) → 1 coluna
├── App.tsx
├── main.tsx
└── index.ts              # barrel lib
```

## 🎨 Theme

Tokens em `src/theme/tokens.css:1` — `oklch` + `@property --sync`. Chamfer usa `corner-shape: bevel` com `@supports not (corner-shape: bevel)` fallback em `clip-path`. Scanlines em `base.css:17`.

Para novo projeto, importe só `src/theme/index.css` e componha com `Chamfer`/`EvaText`/`EvaButton`.

## 🤝 Contribuindo

Este projeto é **open source** e contribuições são muito bem-vindas!

1. **Fork** o repositório
2. Crie uma branch: `git checkout -b feat/minha-feature`
3. Instale e rode os checks:

   ```bash
   npm install
   npm run check   # typecheck + lint + fmt
   ```

4. Commite com [Conventional Commits](https://www.conventionalcommits.org/): `feat: adiciona variante cyan ao EvaButton`
5. Abra um **Pull Request** — descreva o que mudou e por quê, inclua screenshots se for visual

### Diretrizes

- Mantenha componentes **pequenos e com CSS próprio** (um detalhe = um componente, textos via `EvaText`)
- Use `resolveEvaColor()` para cores — não duplique `colorMap`
- Rode `npm run lint:fix && npm run fmt` antes do PR
- Adicione exemplos no `NervDashboard` ou crie stories se for novo primitive

### Issues

Abra uma issue para bugs, ideias ou dúvidas. Use labels `bug`, `enhancement`, `good first issue`. Respostas em até 48h.

### Código de conduta

Seja respeitoso. Discussões técnicas objetivas, sem ruído. Seguimos o [Contributor Covenant](https://www.contributor-covenant.org/).

## 📄 Licença

MIT © [Leandro Ruel](https://github.com/leandroruel) — veja `LICENSE`. Uso livre para projetos pessoais e comerciais, mantenha o aviso de licença.

## 🙏 Créditos

- Design original: HUD de Neon Genesis Evangelion / NERV
- Reconstrução fiel ao print de referência — wireframe, bracket aberto, hazard stripes

---

<p align="center">Feito com evangelion e oklch. PRs bem-vindos!</p>

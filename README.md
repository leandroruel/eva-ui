# eva-ui — EVA NERV Theme

Design system extraído de `EvangelionNERVDashboard.jsx` (1072 linhas, monolito original preservado em `EvangelionNERVDashboard.legacy.jsx`).

> **Stack:** Vite + React 19 + TypeScript · CSS puro (oklch + `corner-shape`/`clip-path` + `@property`)

## Estrutura

```
src/
├── theme/
│   ├── tokens.css        # --eva-* + @property --sync
│   ├── base.css          # .nerv-root + scanlines CRT
│   ├── chamfer.css       # .chamfer / .chamfer-sm (bracket HUD)
│   └── index.css         # barrel CSS
├── hooks/
│   ├── useSyncEqualizer.ts      # EvangelionNERVDashboard.jsx:40
│   └── useAnimatedNumber.ts     # EvangelionNERVDashboard.jsx:71
├── components/
│   ├── HexIcon/           # EvangelionNERVDashboard.jsx:100
│   ├── SystemRow/         # :114 (usa HexIcon)
│   ├── Notification/      # :145 (ENTRY_FLASH_MS, fases entering/active)
│   ├── StatusStack/       # 3 botões WARNING/ERROR/SUCCESS (911-941)
│   ├── SyncRatio/         # barras + trilha + readout (944-962)
│   ├── PilotField/        # PilotField + PilotStack + getPilotStatus (983-1022)
│   ├── TargetBox/         # (1027)
│   └── SystemControl/     # SystemRow ×3 + MAGI footer (1032-1067)
├── layouts/
│   └── NervDashboard/
│       ├── NervDashboard.tsx  # orquestra todo o estado (200-1072)
│       └── NervDashboard.css  # .nerv-grid / .nerv-col (@container)
├── App.tsx               # <NervDashboard />
├── main.tsx
└── index.ts              # barrel para publish como lib
```

## Uso

### Dev (dashboard)

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build app → dist/index.html
npm run preview
```

### Lib (theme)

```bash
npm run build:lib  # → dist/eva-ui.{js,css,umd.cjs}
```

Import no consumidor:

```ts
import { NervDashboard } from "eva-ui";
import "eva-ui/dist/eva-ui.css";
// ou granular:
import { StatusStack, SyncRatio, PilotStack } from "eva-ui";
import "eva-ui/src/theme/index.css";
```

### Compatibilidade legada

```ts
// ainda funciona (shim em ./EvangelionNERVDashboard.jsx):
import NervDashboard from "./EvangelionNERVDashboard";
// prefira:
import NervDashboard from "./src/layouts/NervDashboard/NervDashboard";
```

## Inventário do monolito

| Bloco                                     | Linhas   | Extraído para                                  |
| ----------------------------------------- | -------- | ---------------------------------------------- |
| `useSyncEqualizer`                        | 40-66    | `src/hooks/useSyncEqualizer.ts`                |
| `useAnimatedNumber`                       | 71-93    | `src/hooks/useAnimatedNumber.ts`               |
| `HexIcon`                                 | 100-109  | `src/components/HexIcon/`                      |
| `SystemRow`                               | 114-132  | `src/components/SystemRow/`                    |
| `Notification`                            | 145-189  | `src/components/Notification/`                 |
| `EvangelionNERVDashboard` (estado + grid) | 200-1072 | `src/layouts/NervDashboard/`                   |
| `<style>` tokens/base                     | 313-400  | `src/theme/`                                   |
| `.chamfer` / `.chamfer-sm`                | 419-483  | `src/theme/chamfer.css`                        |
| `.status-stack` / `.btn-status`           | 494-535  | `src/components/StatusStack/`                  |
| `.sync-*`                                 | 541-605  | `src/components/SyncRatio/`                    |
| `.notif-*`                                | 616-727  | `src/components/Notification/`                 |
| `.pilot-*`                                | 737-808  | `src/components/PilotField/`                   |
| `.target-box`                             | 814-824  | `src/components/TargetBox/`                    |
| `.system-*` / `.hex-icon`                 | 829-903  | `src/components/SystemRow/` + `SystemControl/` |

CSS: ~590 linhas inline foram fatiadas sem reescrever valores (oklch, `corner-shape: bevel` com fallback `clip-path`, `@property --sync` preservados).

## Próximos passos sugeridos

1. Decidir se publica como `eva-ui` no npm ou mantém interno.
2. Adicionar Storybook / exemplos por componente.
3. Migrar CSS para CSS Modules se precisar isolar (hoje é global, como no original).
4. Remover `EvangelionNERVDashboard.legacy.jsx` quando não precisar mais de referência.

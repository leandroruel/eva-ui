import React, { useState, useEffect, useRef, useCallback } from "react";

/**
 * ============================================================================
 * EvangelionNERVDashboard
 * ----------------------------------------------------------------------------
 * Reconstrução fiel ao print de referência: HUD "wireframe" sobre preto puro.
 * Nada de painéis preenchidos tipo card SaaS — cada bloco é um contorno fino
 * (1-2px) na cor de estado, com dois cantos opostos cortados (chanfro) e os
 * outros dois retos.
 *
 * NOTA SOBRE AS PROPRIEDADES CSS EXPERIMENTAIS:
 *
 * - 'corner-shape' (CSS Corner Shape, atras de flag em navegadores Chromium)
 *   troca a GEOMETRIA de cada canto (bevel = chanfro reto, square = reto,
 *   scoop, notch, squircle...). O 'border-radius' continua controlando o
 *   TAMANHO do corte; 'corner-shape' controla o FORMATO. Os dois cantos
 *   chanfrados do print (ex.: topo-esquerdo e baixo-direito) sao meio quase
 *   perfeito para 'corner-shape: bevel'.
 *
 * - 'border-shape' recortaria o CONTORNO INTEIRO com uma forma nomeada, nao
 *   canto a canto. Por isso NUNCA aparece junto de 'corner-shape' no mesmo
 *   elemento — eles competem pelo controle da borda. Aqui nao usamos
 *   'border-shape' porque nenhum motor realmente o implementa ainda; o
 *   equivalente pratico e o 'clip-path: polygon(...)' usado como fallback
 *   (e, neste componente, como a fonte-da-verdade visual, já que precisa
 *   funcionar em qualquer navegador hoje).
 *
 * - Todo elemento com 'corner-shape' tem um bloco '@supports not
 *   (corner-shape: bevel)' logo abaixo, reaplicando o mesmo corte via
 *   'clip-path' + borda 1px solida.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// Equalizador do SYNC RATIO — barras verticais tipo analisador de espectro
// ----------------------------------------------------------------------------
const BAR_COUNT = 20;

function useSyncEqualizer(target, active) {
  const [bars, setBars] = useState(() => Array(BAR_COUNT).fill(6));
  const rafRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    function tick() {
      frame++;
      setBars((prev) =>
        prev.map((_, i) => {
          const envelope = 1 - Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2);
          const jitter = active
            ? Math.sin(frame / 4 + i * 1.3) * 8 + Math.random() * 6
            : Math.random() * 2;
          const base = active ? target : 8;
          const value = base * (0.4 + envelope * 0.6) + jitter;
          return Math.max(4, Math.min(100, value));
        }),
      );
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, active]);

  return bars;
}

// ----------------------------------------------------------------------------
// Anima um numero (sync ratio %) suavemente ate um alvo
// ----------------------------------------------------------------------------
function useAnimatedNumber(target, durationMs = 1600) {
  const [value, setValue] = useState(target);
  const startRef = useRef(null);
  const fromRef = useRef(value);

  useEffect(() => {
    fromRef.current = value;
    startRef.current = null;
    let raf;
    function step(ts) {
      if (startRef.current === null) startRef.current = ts;
      const t = Math.min(1, (ts - startRef.current) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(fromRef.current + (target - fromRef.current) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

// ----------------------------------------------------------------------------
// Icone hexagonal em anel (outline), feito com dois clip-path aninhados —
// nao existe "border" nativa para poligonos recortados, entao a borda e
// simulada com uma copia menor preta por cima.
// ----------------------------------------------------------------------------
function HexIcon({ on, color }) {
  return (
    <span
      className={`hex-icon ${on ? "is-on" : ""}`}
      style={{ "--hex-color": `var(--eva-${color})` }}
    >
      <span className="hex-icon-inner" />
    </span>
  );
}

// ----------------------------------------------------------------------------
// Linha de controle de sistema (A.T. FIELD / N2 MINE / SELF-DESTRUCT)
// ----------------------------------------------------------------------------
function SystemRow({ jp, en, on, onClick, color, badgeOn, badgeOff }) {
  return (
    <button
      className={`system-row ${on ? "is-on" : ""}`}
      style={{ "--row-color": `var(--eva-${color})` }}
      onClick={onClick}
      aria-pressed={on}
    >
      <HexIcon on={on} color={color} />
      <span className="system-row-text">
        <span className="system-row-jp">{jp}</span>
        <span className="system-row-en">{en}</span>
      </span>
      <span className={`system-badge ${on ? "is-on" : ""}`}>{on ? badgeOn : badgeOff}</span>
    </button>
  );
}

// ----------------------------------------------------------------------------
// Notificacao NERV — 2 fases:
//   1. "entering"  — pisca o fundo (cor <-> preto) 2x, sem barra de progresso
//   2. "active"    — fundo assentado (chamfer normal/is-on) + barra de
//                    progresso decrescente no rodape ("inner border" que
//                    encolhe, nao cresce), sincronizada com o auto-dismiss
// ENTRY_FLASH_MS e a duracao do "piscar" de entrada; DURATION (prop) e o
// tempo ate o auto-dismiss — os dois sao livres pra ajustar por notificacao.
// ----------------------------------------------------------------------------
const ENTRY_FLASH_MS = 640; // 2 piscadas de 320ms cada

function Notification({ id, color, hazard, filled, icon, title, sub, duration, onDismiss }) {
  const [phase, setPhase] = useState("entering"); // entering -> active
  const [barShrunk, setBarShrunk] = useState(false);

  // fase 1 -> 2: depois do "piscar" de entrada, libera o estado normal
  useEffect(() => {
    const t = setTimeout(() => setPhase("active"), ENTRY_FLASH_MS);
    return () => clearTimeout(t);
  }, []);

  // fase 2: dispara a barra de progresso (encolhe de 100% a 0% ao longo de
  // `duration`) e o auto-dismiss real, os dois cronometrados juntos — a
  // barra e so o reflexo visual do mesmo timeout que fecha a notificacao.
  useEffect(() => {
    if (phase !== "active" || !duration) return;
    const raf = requestAnimationFrame(() => setBarShrunk(true));
    const dismissTimer = setTimeout(() => onDismiss(id), duration);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(dismissTimer);
    };
  }, [phase, duration, id, onDismiss]);

  return (
    <div
      className={`notif-card chamfer ${filled ? "is-on" : ""} ${phase === "entering" ? "is-entering" : ""}`}
      style={{ "--n-color": color }}
    >
      <span className={`notif-flag ${hazard ? "is-hazard" : ""}`}>
        <span className="notif-flag-icon">{icon}</span>
      </span>
      <span className="notif-text">
        <span className="notif-title">{title}</span>
        <span className="notif-sub">{sub}</span>
      </span>
      <button className="notif-close" onClick={() => onDismiss(id)} aria-label="dismiss">
        ×
      </button>
      {phase === "active" && duration > 0 && (
        <div
          className={`notif-timer ${barShrunk ? "is-shrunk" : ""}`}
          style={{ "--notif-duration": `${duration}ms` }}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Componente principal
// ----------------------------------------------------------------------------
const PILOT_ROSTER = [
  { eva: "EVA-01", name: "SHINJI", validId: "IKARI-S-0083" },
  { eva: "EVA-00", name: "REI", validId: "AYANAMI-R-0001" },
  { eva: "EVA-02", name: "ASUKA", validId: "SORYU-A-0002" },
];

export default function EvangelionNERVDashboard() {
  // 3 botoes independentes e mutuamente exclusivos (estilo radio-group):
  // WARNING (amarelo) / ERROR (vermelho) / SUCCESS (verde). So o SUCCESS
  // representa a ativacao real do EVA-01 e alimenta o resto do dashboard
  // (sync ratio, relogio de energia). Os outros dois so acendem o proprio
  // estado — sao indicadores de status, como no video de referencia.
  const [status, setStatus] = useState("idle"); // idle | warning | error | success
  const activated = status === "success";

  // Valores iniciais escolhidos pra ja nascer com os 3 estados visiveis:
  // EVA-01 valida certo (success/verde), EVA-00 vazio (warning/amarelo),
  // EVA-02 preenchido errado (error/vermelho).
  const [pilotValues, setPilotValues] = useState(["IKARI-S-0083", "", "WRONG-ID"]);
  const [toggles, setToggles] = useState([true, true, false]);
  const [powerClock, setPowerClock] = useState(299); // 04:59
  const [dismissed, setDismissed] = useState({});

  const syncTarget = activated ? 85 : 23;
  const syncValue = useAnimatedNumber(syncTarget);
  const bars = useSyncEqualizer(syncValue, activated);
  const toggleCount = toggles.filter(Boolean).length;
  // 3 estados por campo PILOT ID (um por piloto), mesma logica de cor dos
  // botoes de status: vazio = warning (aguardando digitacao), preenchido
  // errado = error, preenchido certo = success.
  const pilotStatusOf = (value, validId) =>
    value.trim() === "" ? "warning" : value.trim().toUpperCase() === validId ? "success" : "error";

  const setPilotValue = useCallback((idx, value) => {
    setPilotValues((prev) => prev.map((v, i) => (i === idx ? value : v)));
  }, []);

  useEffect(() => {
    if (!activated) return;
    const id = setInterval(() => {
      setPowerClock((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [activated]);

  const mm = String(Math.floor(powerClock / 60)).padStart(2, "0");
  const ss = String(powerClock % 60).padStart(2, "0");

  // Clicar no botao ja selecionado desliga (volta pra idle); clicar em
  // outro troca a selecao — so um dos 3 fica preenchido por vez.
  const selectStatus = useCallback((next) => {
    setStatus((current) => (current === next ? "idle" : next));
  }, []);

  const flipToggle = useCallback((idx) => {
    setToggles((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  }, []);

  // Fecha uma notificacao — usada tanto pelo clique manual no "×" quanto
  // pelo auto-dismiss quando a barra de progresso zera.
  const dismissNotification = useCallback((id) => {
    setDismissed((prev) => ({ ...prev, [id]: true }));
  }, []);

  // Config das 4 notificacoes. `duration` (ms) e o tempo ate o auto-dismiss
  // de cada uma — ajuste aqui pra controlar quanto tempo cada card fica na
  // tela; `duration: 0` desativa o auto-dismiss (fica ate fechar manual).
  // `hazard: true` = faixa com listras diagonais animadas (alerta/status);
  // `hazard: false` = faixa solida (tipo informativo, sem urgencia).
  const NOTIFICATIONS = [
    {
      id: "success",
      color: "var(--eva-green)",
      hazard: true,
      filled: false,
      icon: "✓",
      title: "初号機 起動完了",
      sub: "EVA-01 ACTIVATED",
      duration: 8000,
    },
    {
      id: "power",
      color: "var(--eva-orange)",
      hazard: true,
      filled: false,
      icon: "!",
      title: `内部電源 残り${mm}:${ss}`,
      sub: `INTERNAL POWER · ${mm}:${ss} LEFT`,
      duration: 12000,
    },
    {
      id: "angel",
      color: "var(--eva-red)",
      hazard: true,
      filled: true,
      icon: "!",
      title: "第4使徒 接近",
      sub: "ANGEL APPROACHING · PATTERN BLUE",
      duration: 15000,
    },
    {
      id: "sync-info",
      color: "var(--eva-cyan)",
      hazard: false,
      filled: false,
      icon: "i",
      title: `シンクロ率 ${syncValue.toFixed(1)}%`,
      sub: "SYNC RATIO UPDATED",
      duration: 10000,
    },
  ];

  return (
    <div className={`nerv-root ${activated ? "is-activated" : ""}`}>
      <style>{`
        /* ===================================================================
           TOKENS
           =================================================================== */
        .nerv-root {
          --eva-black:  oklch(0% 0 0);
          --eva-orange: oklch(75% 0.19 55);
          --eva-red:    oklch(65% 0.24 25);
          --eva-green:  oklch(89% 0.29 130);
          --eva-yellow: oklch(85% 0.16 95);
          --eva-cyan:   oklch(88% 0.14 200);
          --eva-gray:   oklch(75% 0 0);
          --eva-dim:    oklch(38% 0 0);

          /* --sync tipado via @property permite ao motor interpolar o valor
             (usado no preenchimento da trilha) sem recalculo manual em JS a
             cada frame. */
          --sync: 23;
        }
        @property --sync {
          syntax: '<number>';
          inherits: true;
          initial-value: 23;
        }

        .nerv-root {
          background: var(--eva-black);
          color: var(--eva-gray);
          font-family: "JetBrains Mono", "Noto Sans Mono", ui-monospace, monospace;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          padding: clamp(20px, 4vw, 56px) clamp(20px, 5vw, 64px);
          container-type: inline-size;
          container-name: nerv;
        }

        /* Scanlines discretas de CRT — decorativas, nao capturam clique */
        .nerv-root::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          mix-blend-mode: overlay;
          opacity: 0.35;
          background-image: repeating-linear-gradient(
            to bottom,
            oklch(100% 0 0 / 0.04) 0px,
            oklch(100% 0 0 / 0.04) 1px,
            transparent 2px,
            transparent 4px
          );
        }

        /* ===================================================================
           GRID — 3 colunas com espacamento generoso, cada uma com 2 blocos
           empilhados e bastante respiro entre eles (como no print).
           @container reorganiza para 1 coluna em telas estreitas.
           =================================================================== */
        .nerv-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr 1fr;
          gap: clamp(28px, 6vw, 90px);
          position: relative;
          z-index: 1;
        }
        @container nerv (max-width: 820px) {
          .nerv-grid { grid-template-columns: 1fr; }
        }
        .nerv-col {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: clamp(48px, 9vw, 120px);
        }

        .nerv-eyebrow {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: var(--eva-gray);
          opacity: 0.65;
          margin-bottom: 8px;
          letter-spacing: 0.2em;
        }
        .nerv-eyebrow b { color: inherit; opacity: 1; font-weight: 700; }

        /* ===================================================================
           CHANFRO — canto FECHADO no topo-esquerdo e base-direita; canto
           ABERTO (sem nenhuma linha, so um vao) no topo-direito e na
           base-esquerda. E o "selo" visual do HUD: moldura tipo bracket,
           nunca um retangulo cheio com 4 cantos fechados.
           
           Um corner-shape (bevel/scoop/...) SEMPRE fecha a geometria do
           canto — ele nao consegue expressar um vao aberto sem nenhum
           traço. Por isso o estado ocioso (contorno) usa dois
           pseudo-elementos, cada um formando um "L" (2 lados), que juntos
           deixam os outros 2 cantos sem nenhuma linha os conectando —
           exatamente o "chanfro sem linha" do print de referencia.
           
           Ja o estado preenchido (.is-on) tem contorno fechado por
           natureza (a propria cor de fundo desenha a aresta = "chanfro
           com linha"): esse sim usa corner-shape de verdade, com
           clip-path como fallback via @supports.
           =================================================================== */
        .chamfer {
          --chamfer: 16px;
          position: relative;
          background: var(--eva-black);
        }
        .chamfer::before,
        .chamfer::after {
          content: "";
          position: absolute;
          /* IMPORTANTE: sem isso, esses pseudo-elementos (absolutos, por
             cima do conteudo normal na ordem de empilhamento) roubam
             clique/foco de qualquer <input>, <button> etc. que esteja
             dentro do elemento .chamfer — foi o que travava o campo
             PILOT ID. pointer-events:none deixa so a MOLDURA visual,
             o clique atravessa direto pro conteudo real. */
          pointer-events: none;
          border: 1.5px solid var(--chamfer-color, var(--eva-orange));
          transition: border-color 200ms ease, opacity 150ms ease;
        }
        /* "L" superior-esquerdo: fecha o canto topo-esquerda */
        .chamfer::before {
          top: 0; left: 0;
          width: calc(100% - var(--chamfer));
          height: calc(100% - var(--chamfer));
          border-right: none;
          border-bottom: none;
        }
        /* "L" inferior-direito: fecha o canto base-direita */
        .chamfer::after {
          right: 0; bottom: 0;
          width: calc(100% - var(--chamfer));
          height: calc(100% - var(--chamfer));
          border-left: none;
          border-top: none;
        }
        .chamfer.is-on {
          background: var(--chamfer-color);
          border-radius: 0 var(--chamfer) 0 var(--chamfer);
          corner-shape: square bevel square bevel;
          clip-path: polygon(
            0 0, calc(100% - var(--chamfer)) 0, 100% var(--chamfer),
            100% 100%, var(--chamfer) 100%, 0 calc(100% - var(--chamfer))
          );
        }
        @supports (corner-shape: bevel) {
          .chamfer.is-on { clip-path: none; }
        }
        .chamfer.is-on::before,
        .chamfer.is-on::after { opacity: 0; }

        /* Versao pequena (badges) — canto sempre fechado (nao e um bracket
           aberto), so muda o tamanho do corte. Mesma logica de direcao:
           corte no topo-direito e na base-esquerda. */
        .chamfer-sm {
          border-radius: 0 6px 0 6px;
          corner-shape: square bevel square bevel;
        }
        @supports not (corner-shape: bevel) {
          .chamfer-sm {
            border-radius: 0;
            clip-path: polygon(
              0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px)
            );
          }
        }

        /* ===================================================================
           BOTAO ACTIVATE
           =================================================================== */
        /* ===================================================================
           STACK DE STATUS — 3 botoes empilhados, cada um com identidade de
           cor FIXA (nao e o mesmo botao mudando de cor): WARNING (amarelo),
           ERROR (vermelho), SUCCESS (verde). So um fica preenchido por vez.
           SUCCESS e o unico que aciona a ativacao real do EVA-01.
           =================================================================== */
        .status-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .btn-status {
          --chamfer-color: var(--status-color);
          --chamfer: 12px;
          appearance: none;
          cursor: pointer;
          width: 100%;
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 14px;
          padding: 14px 18px;
          color: var(--status-color);
          font-family: inherit;
          transition: background-color 150ms ease, color 150ms ease;
        }
        .btn-status.warning { --status-color: var(--eva-yellow); }
        .btn-status.error   { --status-color: var(--eva-red); }
        .btn-status.success { --status-color: var(--eva-green); }
        /* preenchido: fundo solido na cor do botao, texto preto (contraste) */
        .btn-status.is-on { color: black; }
        .btn-status:hover:not(.is-on) {
          background: color-mix(in oklch, var(--status-color) 12%, black);
        }
        .btn-status .kanji { font-size: clamp(15px, 1.6vw, 19px); font-weight: 700; }
        .btn-status .en { font-size: clamp(10px, 1vw, 12px); font-weight: 600; letter-spacing: 0.16em; }

        .activate-caption {
          margin-top: 10px;
          font-size: 10px;
          letter-spacing: 0.15em;
          color: var(--eva-orange);
          opacity: 0.55;
        }
        .activate-caption.is-warning { color: var(--eva-yellow); opacity: 0.9; }
        .activate-caption.is-error   { color: var(--eva-red); opacity: 0.9; }
        .activate-caption.is-success { color: var(--eva-green); opacity: 0.75; }

        /* ===================================================================
           SYNC RATIO — linha limite, barras, trilha com marcador triangular
           =================================================================== */
        .sync-limit-row {
          display: flex;
          justify-content: flex-end;
          font-size: 9.5px;
          color: var(--eva-red);
          letter-spacing: 0.15em;
          margin-bottom: 6px;
        }
        .sync-limit-line {
          height: 2px;
          background: color-mix(in oklch, var(--eva-red) 70%, transparent);
          box-shadow: 0 0 6px color-mix(in oklch, var(--eva-red) 70%, transparent);
          margin-bottom: 18px;
        }
        .sync-bars {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 78px;
        }
        .sync-bar {
          flex: 1;
          min-width: 3px;
          background: var(--eva-orange);
          box-shadow: 0 0 5px color-mix(in oklch, var(--eva-orange) 55%, transparent);
          transition: height 110ms linear;
        }
        .sync-track {
          position: relative;
          height: 12px;
          border: 1px solid color-mix(in oklch, var(--eva-gray) 45%, transparent);
          margin-top: 16px;
        }
        .sync-track-fill {
          position: absolute;
          inset: 0 auto 0 0;
          background: var(--eva-orange);
          width: var(--fill, 30%);
          transition: width 200ms ease;
        }
        .sync-track-marker {
          position: absolute;
          top: -8px;
          left: var(--fill, 30%);
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 9px solid var(--eva-orange);
          filter: drop-shadow(0 0 3px color-mix(in oklch, var(--eva-orange) 70%, transparent));
          transition: left 200ms ease;
        }
        .sync-readout {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-top: 18px;
        }
        .sync-readout-label { font-size: 11px; letter-spacing: 0.15em; }
        .sync-readout-value {
          font-size: clamp(26px, 3.2vw, 38px);
          font-weight: 700;
          color: var(--eva-yellow);
          text-shadow: 0 0 10px color-mix(in oklch, var(--eva-yellow) 60%, transparent);
        }
        .sync-readout-value small { font-size: 0.5em; margin-left: 2px; }

        /* ===================================================================
           NOTIFICACOES — cada card usa a MESMA moldura .chamfer dos botoes
           (bracket aberto/sem linha quando so contorno, fechado/com linha
           quando preenchido) + uma faixa de identificacao ("flag") colada
           no canto esquerdo, ocupando 100% da altura, com corte SO no
           canto inferior-esquerdo (acompanhando o mesmo corte do card —
           o superior-esquerdo fica reto). Para o tipo critico (hazard) a
           faixa ganha as listras diagonais animadas; nos demais tipos ela
           e um bloco solido na cor do card.
           =================================================================== */
        .notif-stack {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .notif-card {
          --chamfer-color: var(--n-color);
          --chamfer: 14px;
          --flag-width: 46px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px 12px 60px;
          color: var(--n-color);
        }
        /* estado preenchido (critico): fundo solido + texto preto — reaproveita
           .chamfer.is-on, so precisamos inverter a cor do texto aqui */
        .notif-card.is-on { color: black; }

        /* ANIMACAO DE ENTRADA — pisca fundo<->cor 2x (steps discretos, nao
           fade) e devolve pro estado "sem cor de fundo" (preto) antes da
           fase "active" assumir o visual definitivo (outline ou is-on) e
           liberar a barra de progresso. Duracao vem de ENTRY_FLASH_MS (JS),
           interpolada aqui pra nunca dessincronizar dos timers reais. */
        @keyframes notif-entry-flash {
          0%, 24%  { background: var(--eva-black); color: var(--n-color); }
          25%, 49% { background: var(--n-color);   color: black; }
          50%, 74% { background: var(--eva-black); color: var(--n-color); }
          75%, 99% { background: var(--n-color);   color: black; }
          100%     { background: var(--eva-black); color: var(--n-color); }
        }
        .notif-card.is-entering {
          animation: notif-entry-flash ${ENTRY_FLASH_MS}ms linear 1;
        }
        /* durante o piscar, o bracket aberto (::before/::after) e a barra
           ainda nao fazem sentido — escondidos ate a fase "active" */
        .notif-card.is-entering::before,
        .notif-card.is-entering::after { opacity: 0; }

        /* faixa/flag esquerda: SEMPRE solida (ou listrada), independente do
           card estar preenchido ou nao — e um elemento real (nao pseudo),
           porque os 2 pseudo-elementos do .chamfer ja estao ocupados pelo
           bracket. pointer-events:none pra nao repetir o bug do input. */
        .notif-flag {
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: var(--flag-width);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--n-color);
          pointer-events: none;
          border-radius: 0 0 0 var(--chamfer, 14px);
          corner-shape: square square square bevel;
        }
        @supports not (corner-shape: bevel) {
          .notif-flag {
            border-radius: 0;
            clip-path: polygon(
              0 0, 100% 0, 100% 100%, var(--chamfer, 14px) 100%, 0 calc(100% - var(--chamfer, 14px))
            );
          }
        }
        /* listras diagonais animadas — so no tipo critico/hazard */
        .notif-flag.is-hazard {
          background-image: repeating-linear-gradient(
            45deg,
            var(--n-color) 0 10px,
            black 10px 20px
          );
          animation: notif-hazard-march 0.9s linear infinite;
        }
        @keyframes notif-hazard-march {
          to { background-position: 28px 0; }
        }
        .notif-flag-icon {
          width: 22px; height: 22px;
          clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
          background: black;
          color: var(--n-color);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 900;
          text-transform: none; /* senao o uppercase global vira o "i" em "I" */
        }
        .notif-flag.is-hazard .notif-flag-icon { color: white; }

        .notif-text { flex: 1; line-height: 1.35; }
        .notif-title { font-size: 12.5px; font-weight: 800; display: block; }
        .notif-sub { font-size: 9.5px; font-weight: 600; opacity: 0.8; display: block; letter-spacing: 0.1em; }
        .notif-close {
          appearance: none; background: none; border: none; cursor: pointer;
          color: inherit; font-size: 13px; opacity: 0.7; padding: 4px;
          font-family: inherit;
        }
        .notif-close:hover { opacity: 1; }

        /* BARRA DE PROGRESSO — "inner border" no rodape que ENCOLHE (nao
           cresce): comeca na ponta direita da faixa listrada (nao debaixo
           dela) e anima ate 0 ao longo de --notif-duration, linear, pra
           virar um timer visual 1:1 com o auto-dismiss real. */
        .notif-timer {
          position: absolute;
          left: var(--flag-width);
          bottom: 0;
          height: 3px;
          width: calc(100% - var(--flag-width));
          background: var(--n-color);
          box-shadow: 0 0 6px color-mix(in oklch, var(--n-color) 70%, transparent);
          transition: width var(--notif-duration, 6000ms) linear;
        }
        .notif-timer.is-shrunk { width: 0; }

        /* ===================================================================
           PILOT ID — 3 campos empilhados (um por piloto/EVA), cada um com
           seu proprio estado (mesma paleta dos botoes de status): vazio =
           WARNING (amarelo, aguardando), preenchido errado = ERROR
           (vermelho), preenchido certo = SUCCESS (verde). --pilot-color
           mora no wrapper (pilot-wrap) pra ser herdada tanto pelo campo
           quanto pelo rodape, que sao irmãos no DOM (custom property so
           herda de ancestral pra descendente, nao entre irmãos).
           =================================================================== */
        .pilot-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pilot-wrap {
          --pilot-color: var(--eva-yellow);
        }
        .pilot-wrap.is-error   { --pilot-color: var(--eva-red); }
        .pilot-wrap.is-success { --pilot-color: var(--eva-green); }

        .pilot-box {
          --chamfer-color: var(--pilot-color);
          --chamfer: 10px;
          padding: 0;
        }
        .pilot-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
        }
        .pilot-input-row label {
          color: var(--pilot-color);
          font-size: 11px;
          font-weight: 700;
          flex: 0 0 auto;
          transition: color 200ms ease;
        }
        .pilot-input {
          flex: 1;
          min-width: 0;
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.1em;
          caret-color: var(--pilot-color);
        }
        .pilot-input::placeholder { color: color-mix(in oklch, white 35%, transparent); }
        .pilot-warn {
          flex: 0 0 auto;
          width: 18px; height: 18px;
          display: flex; align-items: center; justify-content: center;
          clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
          background: var(--pilot-color);
          color: black;
          font-size: 10px;
          font-weight: 900;
          transition: background-color 200ms ease;
        }
        .pilot-hazard-strip {
          height: 5px;
          background-image: repeating-linear-gradient(
            45deg,
            var(--pilot-color) 0 6px,
            black 6px 12px
          );
          transition: background-image 200ms ease;
        }
        .pilot-footer {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          letter-spacing: 0.1em;
          margin-top: 6px;
        }
        .pilot-footer .status { color: var(--pilot-color, var(--eva-yellow)); font-weight: 700; }
        .pilot-footer .detail { color: var(--eva-gray); opacity: 0.7; }

        /* ===================================================================
           TARGET (ANGEL) — retangulo simples, sem chanfro (confirmado no
           print de referencia: 4 cantos retos, nao usa a moldura .chamfer).
           =================================================================== */
        .target-box {
          border: 1.5px solid var(--eva-orange);
          background: var(--eva-black);
          padding: 20px 24px;
          text-align: center;
        }
        .target-box strong {
          font-size: clamp(15px, 1.6vw, 19px);
          color: var(--eva-orange);
          letter-spacing: 0.14em;
        }

        /* ===================================================================
           SYSTEM CONTROL — linhas com icone hexagonal + badge
           =================================================================== */
        .system-list {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .system-row {
          appearance: none;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 14px;
          font-family: inherit;
          color: var(--eva-dim);
          text-align: left;
        }
        .system-row.is-on { color: var(--row-color); }

        /* Icone hexagonal em anel: dois clip-path polygon aninhados formam
           o "outline" (o de fora e colorido, o de dentro e preto, deixando
           so uma borda visivel). Preenche totalmente quando ativo. */
        .hex-icon {
          width: 24px; height: 24px; flex: 0 0 auto;
          position: relative;
          background: var(--eva-dim);
          clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
          transition: background-color 200ms ease;
        }
        .hex-icon.is-on { background: var(--hex-color); box-shadow: 0 0 8px var(--hex-color); }
        .hex-icon-inner {
          position: absolute;
          inset: 2.5px;
          background: black;
          clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
        }

        .system-row-text { display: flex; flex-direction: column; line-height: 1.35; flex: 1; }
        .system-row-jp { font-size: 13px; font-weight: 700; }
        .system-row-en { font-size: 9px; opacity: 0.75; letter-spacing: 0.1em; }

        .system-badge {
          flex: 0 0 auto;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 10px;
          border: 1px solid var(--eva-dim);
          color: var(--eva-dim);
          border-radius: 4px 0 4px 0;
          corner-shape: bevel square square bevel;
          transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease, corner-shape 200ms ease;
        }
        @supports not (corner-shape: bevel) {
          .system-badge {
            border-radius: 0;
            clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
          }
        }
        .system-badge.is-on {
          background: var(--row-color);
          color: black;
          border-color: var(--row-color);
        }

        .system-footer {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          letter-spacing: 0.12em;
          margin-top: 26px;
        }
        .system-footer .count { color: var(--eva-gray); }
        .system-footer .magi { font-weight: 800; color: var(--eva-dim); }
        .system-footer .magi.is-approved { color: var(--eva-orange); text-shadow: 0 0 8px color-mix(in oklch, var(--eva-orange) 60%, transparent); }
      `}</style>

      <div className="nerv-grid">
        {/* ================================================= COLUNA ESQUERDA */}
        <div className="nerv-col">
          <div>
            <div className="status-stack">
              <button
                className={`btn-status chamfer warning ${status === "warning" ? "is-on" : ""}`}
                onClick={() => selectStatus("warning")}
                aria-pressed={status === "warning"}
              >
                <span className="kanji">警告</span>
                <span className="en">WARNING</span>
              </button>
              <button
                className={`btn-status chamfer error ${status === "error" ? "is-on" : ""}`}
                onClick={() => selectStatus("error")}
                aria-pressed={status === "error"}
              >
                <span className="kanji">異常</span>
                <span className="en">ERROR</span>
              </button>
              <button
                className={`btn-status chamfer success ${status === "success" ? "is-on" : ""}`}
                onClick={() => selectStatus("success")}
                aria-pressed={status === "success"}
              >
                <span className="kanji">{activated ? "起動完了" : "起動"}</span>
                <span className="en">{activated ? "ACTIVATED" : "SUCCESS"}</span>
              </button>
            </div>
            <div className={`activate-caption ${status !== "idle" ? `is-${status}` : ""}`}>
              {status === "warning" && "EVA-01 · STATUS / WARNING"}
              {status === "error" && "EVA-01 · STATUS / ERROR"}
              {status === "success" && "EVA-01 · ACTIVE / LOCKED / SYNCED / OK"}
              {status === "idle" && "EVA-01 · IDLE / HOVER / PRESS / OK"}
            </div>
          </div>

          <div>
            <div className="sync-limit-row">絶対境界線 ABSOLUTE BORDERLINE</div>
            <div className="sync-limit-line" />
            <div className="sync-bars">
              {bars.map((h, i) => (
                <div key={i} className="sync-bar" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="sync-track" style={{ "--fill": `${syncValue}%` }}>
              <div className="sync-track-fill" />
              <div className="sync-track-marker" />
            </div>
            <div className="sync-readout">
              <span className="sync-readout-label">SYNC RATIO シンクロ率</span>
              <span className="sync-readout-value">
                {syncValue.toFixed(1)}
                <small>%</small>
              </span>
            </div>
          </div>
        </div>

        {/* ================================================== COLUNA CENTRO */}
        <div className="nerv-col">
          <div>
            <div className="nerv-eyebrow" style={{ justifyContent: "flex-end" }}>
              <b>NERV · 通知 NOTIFICATIONS</b>
            </div>
            <div className="notif-stack">
              {NOTIFICATIONS.filter((n) => !dismissed[n.id]).map((n) => (
                <Notification key={n.id} {...n} onDismiss={dismissNotification} />
              ))}
            </div>
          </div>

          <div>
            <div className="nerv-eyebrow">
              <b>パイロットID</b>
              <span>PILOT ID · NERV</span>
            </div>
            <div className="pilot-stack">
              {PILOT_ROSTER.map((pilot, idx) => {
                const value = pilotValues[idx];
                const pilotStatus = pilotStatusOf(value, pilot.validId);
                return (
                  <div key={pilot.eva} className={`pilot-wrap is-${pilotStatus}`}>
                    <div className="pilot-box chamfer">
                      <div className="pilot-input-row">
                        <label htmlFor={`pilot-id-${idx}`}>{pilot.eva}:</label>
                        <input
                          id={`pilot-id-${idx}`}
                          className="pilot-input"
                          value={value}
                          onChange={(e) => setPilotValue(idx, e.target.value.toUpperCase())}
                          placeholder={pilot.name}
                          spellCheck={false}
                        />
                        <span className="pilot-warn">{pilotStatus === "success" ? "✓" : "!"}</span>
                      </div>
                      <div className="pilot-hazard-strip" />
                    </div>
                    <div className="pilot-footer">
                      <span className="status">
                        {pilotStatus === "warning" && "待機"}
                        {pilotStatus === "error" && "警告・認証失敗"}
                        {pilotStatus === "success" && "認証確認 · VERIFIED"}
                      </span>
                      <span className="detail">
                        {pilotStatus === "warning" && "PRESS TO EDIT"}
                        {pilotStatus === "error" && "INVALID PILOT ID"}
                        {pilotStatus === "success" && "PILOT VERIFIED"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =================================================== COLUNA DIREITA */}
        <div className="nerv-col">
          <div className="target-box">
            <strong>第4使徒 · ANGEL</strong>
          </div>

          <div>
            <div className="system-list">
              <SystemRow
                jp="A.T.フィールド 展開"
                en="DEPLOY A.T. FIELD"
                on={toggles[0]}
                color="green"
                badgeOn="許可"
                badgeOff="未設定"
                onClick={() => flipToggle(0)}
              />
              <SystemRow
                jp="N²爆雷 使用許可"
                en="AUTHORIZE N² MINE"
                on={toggles[1]}
                color="orange"
                badgeOn="許可"
                badgeOff="未設定"
                onClick={() => flipToggle(1)}
              />
              <SystemRow
                jp="自爆装置 起動"
                en="ARM SELF-DESTRUCT"
                on={toggles[2]}
                color="red"
                badgeOn="許可"
                badgeOff="未設定"
                onClick={() => flipToggle(2)}
              />
            </div>
            <div className="system-footer">
              <span className="count">{toggleCount}/3 SELECTED</span>
              <span className={`magi ${toggleCount === 3 ? "is-approved" : ""}`}>
                MAGI {toggleCount === 3 ? "可決" : "審議中"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

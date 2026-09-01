/**
 * @deprecated — shim de compatibilidade
 * O monolito foi extraído para `src/layouts/NervDashboard/NervDashboard.tsx`
 * e demais módulos em `src/components/*` + `src/theme/*`.
 * Este arquivo existe apenas para não quebrar imports legados:
 *   import Dashboard from "./EvangelionNERVDashboard"
 * Novos códigos devem importar de:
 *   import NervDashboard from "./src/layouts/NervDashboard/NervDashboard"
 *   ou
 *   import { NervDashboard } from "./src"
 */
export { default } from "./src/layouts/NervDashboard/NervDashboard";
export * from "./src/layouts/NervDashboard/NervDashboard";

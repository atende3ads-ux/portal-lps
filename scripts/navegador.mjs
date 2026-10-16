// Chrome instalado na máquina, controlado pelo Playwright (sem baixar navegador).
import { chromium } from 'playwright-core';

// Guarda a promessa (e não o navegador) para chamadas em paralelo reusarem o mesmo Chrome.
let instancia;
export function navegador() {
  instancia ??= chromium.launch({ channel: 'chrome' });
  return instancia;
}
export async function fecharNavegador() {
  if (instancia) await (await instancia).close();
  instancia = undefined;
}

export const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
export const CELULAR = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

// Rola a página inteira para disparar lazy-load e animações de entrada, depois volta ao topo.
export async function rolar(page, { passo = 500, pausa = 140, limite = 40000 } = {}) {
  await page.evaluate(async ({ passo, pausa, limite }) => {
    const espera = (ms) => new Promise((r) => setTimeout(r, ms));
    // Rolagem instantânea: com scroll-behavior: smooth, a volta ao topo ainda estaria no meio na hora da foto.
    const ir = (top) => window.scrollTo({ top, behavior: 'instant' });
    let y = 0;
    while (y < Math.min(document.documentElement.scrollHeight, limite)) {
      ir(y);
      await espera(pausa);
      y += passo;
    }
    ir(document.documentElement.scrollHeight);
    await espera(400);
    ir(0);
    await espera(300);
  }, { passo, pausa, limite }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
}

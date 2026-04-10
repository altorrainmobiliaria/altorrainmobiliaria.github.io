/**
 * simulador-hipotecario.js — Simulador de crédito hipotecario colombiano
 * Altorra Inmobiliaria
 *
 * Calcula la cuota mensual estimada usando amortización francesa (cuota fija).
 * Fórmula: C = PV × i / (1 − (1+i)^−n)
 *
 * Parámetros:
 *   - Precio de la propiedad (COP)
 *   - Cuota inicial (% o monto)
 *   - Plazo (años: 5-30)
 *   - Tasa de interés efectiva anual (%)
 *   - Tipo de financiación: VIS / no-VIS
 *
 * Tasas de referencia Colombia (2026, orientativas):
 *   - VIS:     11.0% E.A. (Banco Agrario / Fondo Nacional del Ahorro)
 *   - No-VIS:  13.5% E.A. (promedio bancos privados)
 *
 * Renderiza tabla de amortización + resumen de costos.
 * Genera lead tipo solicitud_credito al hacer "Solicitar asesoría".
 *
 * API pública: window.SimuladorHipotecario
 */

(function () {
  'use strict';

  /* ─── Constantes ─────────────────────────────────────────── */
  const VIS_MAX_PRECIO = 335_000_000; // COP — valor máximo vivienda VIS 2026 (aprox.)
  const TASAS_REF = { vis: 11.0, noVis: 13.5 };

  /* ─── Cálculos financieros ──────────────────────────────── */

  // Convierte tasa efectiva anual a mensual
  function tasaMensual(tea) {
    return Math.pow(1 + tea / 100, 1 / 12) - 1;
  }

  // Cuota fija mensual (amortización francesa)
  function cuotaMensual(pv, i, n) {
    if (i === 0) return pv / n;
    return pv * i / (1 - Math.pow(1 + i, -n));
  }

  // Genera tabla de amortización (solo devuelve resumen por año para no sobrecargar)
  function calcularAmortizacion(pv, i, n) {
    const C    = cuotaMensual(pv, i, n);
    const rows = [];
    let saldo  = pv;

    for (let mes = 1; mes <= n; mes++) {
      const intereses = saldo * i;
      const capital   = C - intereses;
      saldo          -= capital;

      // Solo guardar filas de fin de año
      if (mes % 12 === 0 || mes === n) {
        rows.push({
          mes,
          anio:         Math.ceil(mes / 12),
          cuota:        C,
          capital,
          intereses,
          saldo:        Math.max(saldo, 0),
        });
      }
    }

    return { cuota: C, rows, totalPago: C * n, totalIntereses: C * n - pv };
  }

  /* ─── Formateo ──────────────────────────────────────────── */
  function fmtCOP(n) {
    return '$ ' + Math.round(n).toLocaleString('es-CO');
  }

  function fmtPct(n) {
    return n.toFixed(2) + '%';
  }

  /* ─── Renderizar resultado ──────────────────────────────── */
  function renderResultado(container, resultado, params) {
    const { cuota, totalPago, totalIntereses, rows } = resultado;
    const { precio, cuotaInicial, monto, tea, anos, vis } = params;

    container.innerHTML = `
      <div class="sim-resultado">

        <!-- Resumen principal -->
        <div class="sim-cuota-box">
          <p class="sim-cuota-label">Cuota mensual estimada</p>
          <p class="sim-cuota-valor">${fmtCOP(cuota)}</p>
          <p class="sim-cuota-sub">Amortización francesa · Tasa ${fmtPct(tea)} E.A.</p>
        </div>

        <!-- Resumen financiero -->
        <div class="sim-resumen-grid">
          <div class="sim-resumen-item">
            <span>Valor propiedad</span>
            <strong>${fmtCOP(precio)}</strong>
          </div>
          <div class="sim-resumen-item">
            <span>Cuota inicial (${Math.round(cuotaInicial / precio * 100)}%)</span>
            <strong>${fmtCOP(cuotaInicial)}</strong>
          </div>
          <div class="sim-resumen-item">
            <span>Monto financiado</span>
            <strong>${fmtCOP(monto)}</strong>
          </div>
          <div class="sim-resumen-item">
            <span>Plazo</span>
            <strong>${anos} años (${anos * 12} cuotas)</strong>
          </div>
          <div class="sim-resumen-item">
            <span>Total intereses</span>
            <strong style="color:#ef4444">${fmtCOP(totalIntereses)}</strong>
          </div>
          <div class="sim-resumen-item">
            <span>Total a pagar</span>
            <strong>${fmtCOP(totalPago + cuotaInicial)}</strong>
          </div>
        </div>

        ${vis ? '<p class="sim-vis-badge">✅ Aplica como Vivienda de Interés Social (VIS)</p>' : ''}

        <!-- Tabla por año -->
        <details class="sim-tabla-wrap">
          <summary>Ver tabla de amortización por año</summary>
          <div style="overflow-x:auto;margin-top:12px">
            <table class="sim-tabla">
              <thead>
                <tr><th>Año</th><th>Cuota mensual</th><th>Capital pagado</th><th>Intereses</th><th>Saldo</th></tr>
              </thead>
              <tbody>
                ${rows.map(r => `
                <tr>
                  <td>${r.anio}</td>
                  <td>${fmtCOP(r.cuota)}</td>
                  <td>${fmtCOP(r.capital * Math.min(12, r.mes))}</td>
                  <td>${fmtCOP(r.intereses * Math.min(12, r.mes))}</td>
                  <td>${fmtCOP(r.saldo)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </details>

        <p class="sim-disclaimer">
          ⚠️ Este simulador es orientativo. Las tasas reales pueden variar según el banco,
          tu perfil crediticio y el momento de la solicitud.
          <strong>Consulta con un asesor Altorra para un estudio personalizado.</strong>
        </p>

        <button class="sim-cta-btn" id="simSolicitarBtn">
          Solicitar asesoría crediticia gratuita →
        </button>
      </div>`;

    // CTA → lead
    document.getElementById('simSolicitarBtn')?.addEventListener('click', () => {
      openAsesoriaForm(params);
    });
  }

  /* ─── Formulario de solicitud de asesoría ───────────────── */
  function openAsesoriaForm(simParams) {
    // Redirigir a contacto con datos prellenados
    const msg = `Hola Altorra, necesito asesoría para crédito hipotecario.\n` +
      `Propiedad: ${ fmtCOP(simParams.precio) } · Plazo: ${simParams.anos} años · Cuota estimada: ${fmtCOP(simParams.cuota || 0)}`;
    const waUrl = `https://wa.me/573002439810?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener');

    // También registrar como lead si Firebase está disponible
    if (window.db) {
      import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js').then(
        ({ collection, addDoc, serverTimestamp }) => {
          addDoc(collection(window.db, 'solicitudes'), {
            tipo:      'solicitud_credito',
            origen:    'simulador-hipotecario',
            estado:    'pendiente',
            datosExtra: {
              precio:      simParams.precio,
              monto:       simParams.monto,
              anos:        simParams.anos,
              tea:         simParams.tea,
              cuotaEstimada: simParams.cuota,
            },
            createdAt: serverTimestamp(),
            emailSent: false,
          }).catch(() => {});
        }
      );
    }

    // Analytics
    window.AltorraAnalytics?.track?.('simulador_asesoria_click', { precio: simParams.precio });
  }

  /* ─── Inicializar formulario en un contenedor ───────────── */
  function init(selector) {
    const root = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!root) return;

    injectStyles();

    root.innerHTML = `
      <div class="sim-form-wrap">
        <h2 class="sim-titulo">Simulador de crédito hipotecario</h2>
        <p class="sim-subtitulo">Calcula tu cuota mensual estimada en segundos</p>

        <form class="sim-form" id="simForm" novalidate>

          <div class="sim-grid">
            <label class="sim-label">
              Precio de la propiedad (COP)
              <div class="sim-input-wrap">
                <span class="sim-prefix">$</span>
                <input type="number" id="simPrecio" name="precio" min="50000000" max="50000000000"
                       step="1000000" value="500000000" required/>
              </div>
            </label>

            <label class="sim-label">
              Cuota inicial
              <div style="display:flex;gap:8px;align-items:center">
                <input type="range" id="simPctSlider" min="10" max="50" step="1" value="30"
                       style="flex:1;accent-color:var(--gold,#d4af37)"/>
                <span id="simPctDisplay" style="font-weight:800;color:var(--gold,#d4af37);min-width:42px">30%</span>
              </div>
              <div class="sim-cuota-inicial-monto" id="simCuotaInicialMonto" style="font-size:.85rem;color:var(--muted,#6b7280)">$ 150.000.000</div>
            </label>

            <label class="sim-label">
              Plazo (años)
              <div style="display:flex;gap:8px;align-items:center">
                <input type="range" id="simAnosSlider" min="5" max="30" step="5" value="15"
                       style="flex:1;accent-color:var(--gold,#d4af37)"/>
                <span id="simAnosDisplay" style="font-weight:800;color:var(--gold,#d4af37);min-width:52px">15 años</span>
              </div>
            </label>

            <label class="sim-label">
              Tasa de interés (% E.A.)
              <div style="display:flex;gap:8px;align-items:center">
                <input type="range" id="simTasaSlider" min="8" max="24" step="0.5" value="13.5"
                       style="flex:1;accent-color:var(--gold,#d4af37)"/>
                <span id="simTasaDisplay" style="font-weight:800;color:var(--gold,#d4af37);min-width:52px">13.5%</span>
              </div>
              <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
                <button type="button" class="sim-preset-btn" data-tasa="11.0">VIS ${TASAS_REF.vis}%</button>
                <button type="button" class="sim-preset-btn" data-tasa="13.5">No-VIS ${TASAS_REF.noVis}%</button>
              </div>
            </label>
          </div>

          <button type="submit" class="sim-btn">Calcular cuota</button>
        </form>

        <div id="simResultado" style="margin-top:28px"></div>
      </div>`;

    // ── Event listeners ──────────────────────────────────────
    const precioEl   = root.querySelector('#simPrecio');
    const pctSlider  = root.querySelector('#simPctSlider');
    const pctDisplay = root.querySelector('#simPctDisplay');
    const montoEl    = root.querySelector('#simCuotaInicialMonto');
    const anosSlider = root.querySelector('#simAnosSlider');
    const anosDisplay= root.querySelector('#simAnosDisplay');
    const tasaSlider = root.querySelector('#simTasaSlider');
    const tasaDisplay= root.querySelector('#simTasaDisplay');

    function updateMonto() {
      const p = parseFloat(precioEl.value) || 0;
      const pct = parseFloat(pctSlider.value) || 30;
      const m = p * pct / 100;
      pctDisplay.textContent = pct + '%';
      if (montoEl) montoEl.textContent = fmtCOP(m);
    }

    precioEl.addEventListener('input', updateMonto);
    pctSlider.addEventListener('input', updateMonto);

    anosSlider.addEventListener('input', () => {
      anosDisplay.textContent = anosSlider.value + ' años';
    });

    tasaSlider.addEventListener('input', () => {
      tasaDisplay.textContent = parseFloat(tasaSlider.value).toFixed(1) + '%';
    });

    root.querySelectorAll('.sim-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tasaSlider.value = btn.dataset.tasa;
        tasaDisplay.textContent = parseFloat(btn.dataset.tasa).toFixed(1) + '%';
      });
    });

    root.querySelector('#simForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const precio      = parseFloat(precioEl.value) || 0;
      const pct         = parseFloat(pctSlider.value) || 30;
      const cuotaInicial= precio * pct / 100;
      const monto       = precio - cuotaInicial;
      const anos        = parseInt(anosSlider.value) || 15;
      const tea         = parseFloat(tasaSlider.value) || 13.5;
      const vis         = precio <= VIS_MAX_PRECIO;
      const n           = anos * 12;
      const i           = tasaMensual(tea);

      const resultado   = calcularAmortizacion(monto, i, n);
      const params      = { precio, cuotaInicial, monto, tea, anos, vis, cuota: resultado.cuota };

      const resultadoContainer = root.querySelector('#simResultado');
      renderResultado(resultadoContainer, resultado, params);
      resultadoContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      window.AltorraAnalytics?.track?.('simulador_calculo', { precio, anos, tea });
    });

    updateMonto();
  }

  /* ─── Estilos ───────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('sim-styles')) return;
    const s = document.createElement('style');
    s.id = 'sim-styles';
    s.textContent = `
      .sim-form-wrap { max-width: 740px; margin: 0 auto; }
      .sim-titulo    { font-size: 1.8rem; font-weight: 800; color: var(--text,#111827); margin: 0 0 6px; }
      .sim-subtitulo { color: var(--muted,#6b7280); margin: 0 0 28px; }
      .sim-grid      { display: grid; gap: 20px; grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 620px) { .sim-grid { grid-template-columns: 1fr; } }
      .sim-label { display: flex; flex-direction: column; gap: 8px; font-weight: 600; font-size: .95rem; }
      .sim-input-wrap { position: relative; display: flex; align-items: center; }
      .sim-prefix { position: absolute; left: 12px; font-weight: 700; color: var(--muted,#6b7280); }
      .sim-input-wrap input { padding: 10px 12px 10px 28px; border: 1.5px solid rgba(17,24,39,.15);
        border-radius: 10px; font-size: .95rem; font-family: inherit; width: 100%;
        transition: border-color .15s; }
      .sim-input-wrap input:focus { outline: none; border-color: var(--gold,#d4af37); }
      .sim-preset-btn { padding: 5px 12px; border: 1.5px solid rgba(17,24,39,.15); border-radius: 8px;
        background: #fff; font-size: .82rem; font-weight: 700; cursor: pointer; transition: all .15s; }
      .sim-preset-btn:hover { background: var(--gold,#d4af37); border-color: var(--gold,#d4af37); color: #111; }
      .sim-btn { margin-top: 24px; padding: 14px 32px; border-radius: 14px; border: none;
        background: linear-gradient(90deg, var(--accent,#ffb400), #ffd95e); color: #111;
        font-weight: 800; font-size: 1rem; cursor: pointer; transition: transform .15s, box-shadow .15s; }
      .sim-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(212,175,55,.3); }

      /* Resultado */
      .sim-resultado { }
      .sim-cuota-box { background: linear-gradient(135deg,var(--gold,#d4af37),#ffb400);
        border-radius: 18px; padding: 28px; text-align: center; color: #111; margin-bottom: 20px; }
      .sim-cuota-label { font-size: 1rem; font-weight: 600; margin: 0 0 6px; opacity: .8; }
      .sim-cuota-valor { font-size: 2.8rem; font-weight: 800; margin: 0; }
      .sim-cuota-sub   { font-size: .85rem; margin: 6px 0 0; opacity: .75; }
      .sim-resumen-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
      @media (max-width: 560px) { .sim-resumen-grid { grid-template-columns: 1fr 1fr; } }
      .sim-resumen-item { background: #f9fafb; border-radius: 12px; padding: 14px;
        display: flex; flex-direction: column; gap: 4px; }
      .sim-resumen-item span { font-size: .8rem; color: var(--muted,#6b7280); }
      .sim-resumen-item strong { font-size: .95rem; }
      .sim-vis-badge { background: #dcfce7; color: #166534; border-radius: 8px;
        padding: 8px 14px; font-size: .85rem; font-weight: 700; margin: 8px 0; display: inline-block; }
      .sim-tabla-wrap { border: 1px solid rgba(17,24,39,.08); border-radius: 12px; padding: 14px;
        margin: 16px 0; }
      .sim-tabla-wrap summary { cursor: pointer; font-weight: 700; color: var(--gold,#d4af37); }
      .sim-tabla { width: 100%; border-collapse: collapse; font-size: .85rem; }
      .sim-tabla th { background: #f3f4f6; padding: 8px 10px; text-align: right; font-weight: 700; }
      .sim-tabla th:first-child { text-align: left; }
      .sim-tabla td { padding: 7px 10px; text-align: right; border-bottom: 1px solid #f3f4f6; }
      .sim-tabla td:first-child { text-align: left; font-weight: 700; }
      .sim-disclaimer { font-size: .82rem; color: var(--muted,#6b7280); background: #fffbeb;
        border-left: 3px solid var(--gold,#d4af37); padding: 10px 14px; border-radius: 0 8px 8px 0;
        margin: 16px 0; }
      .sim-cta-btn { padding: 14px 28px; border-radius: 14px; border: none;
        background: #111; color: #fff; font-weight: 800; font-size: 1rem; cursor: pointer;
        transition: transform .15s, box-shadow .15s; }
      .sim-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,.2); }
    `;
    document.head.appendChild(s);
  }

  /* ─── API pública ───────────────────────────────────────── */
  window.SimuladorHipotecario = { init, cuotaMensual, calcularAmortizacion };

})();

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

  /* ─── Gráfica Canvas ─────────────────────────────────────── */
  function renderChart(canvas, resultado, params) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const pad = { top: 20, right: 20, bottom: 30, left: 70 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    const rows = resultado.rows;
    if (!rows.length) return;

    const n = rows.length;
    const maxVal = params.monto;
    const barW = Math.max(4, Math.floor(cw / n) - 4);

    ctx.font = '11px Poppins, system-ui, sans-serif';
    ctx.textBaseline = 'middle';

    // Y axis labels
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'right';
    for (var yi = 0; yi <= 4; yi++) {
      var yVal = maxVal * yi / 4;
      var yPos = pad.top + ch - (ch * yi / 4);
      ctx.fillText(fmtShort(yVal), pad.left - 8, yPos);
      ctx.strokeStyle = '#f3f4f6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, yPos);
      ctx.lineTo(W - pad.right, yPos);
      ctx.stroke();
    }

    // Accumulate per-year capital and interest
    var cuota = resultado.cuota;
    var saldoStart = params.monto;
    var i = tasaMensual(params.tea);

    var yearCapital = [];
    var yearInterest = [];
    var yearSaldo = [];
    var runSaldo = params.monto;

    for (var yr = 0; yr < rows.length; yr++) {
      var months = yr === 0 ? rows[0].mes : rows[yr].mes - rows[yr - 1].mes;
      var capAcc = 0, intAcc = 0;
      for (var m = 0; m < months; m++) {
        var intM = runSaldo * i;
        var capM = cuota - intM;
        capAcc += capM;
        intAcc += intM;
        runSaldo -= capM;
      }
      yearCapital.push(capAcc);
      yearInterest.push(intAcc);
      yearSaldo.push(Math.max(runSaldo, 0));
    }

    // Draw saldo line
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var bi = 0; bi < n; bi++) {
      var bx = pad.left + (bi + 0.5) * (cw / n);
      var by = pad.top + ch - (ch * yearSaldo[bi] / maxVal);
      if (bi === 0) ctx.moveTo(bx, by); else ctx.lineTo(bx, by);
    }
    ctx.stroke();

    // Draw stacked bars (capital + interest)
    for (var bi = 0; bi < n; bi++) {
      var bx = pad.left + bi * (cw / n) + (cw / n - barW) / 2;
      var totalBar = yearCapital[bi] + yearInterest[bi];
      var capH = ch * yearCapital[bi] / maxVal;
      var intH = ch * yearInterest[bi] / maxVal;

      // Interest (red) bottom
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(bx, pad.top + ch - intH - capH, barW, intH);

      // Capital (gold) top
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(bx, pad.top + ch - capH, barW, capH);
    }

    // X axis labels (every few years)
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    var step = n <= 10 ? 1 : n <= 20 ? 2 : 5;
    for (var bi = 0; bi < n; bi += step) {
      var bx = pad.left + (bi + 0.5) * (cw / n);
      ctx.fillText('Año ' + rows[bi].anio, bx, H - 8);
    }
  }

  function fmtShort(n) {
    if (n >= 1e9) return '$ ' + (n / 1e9).toFixed(0) + 'B';
    if (n >= 1e6) return '$ ' + (n / 1e6).toFixed(0) + 'M';
    if (n >= 1e3) return '$ ' + (n / 1e3).toFixed(0) + 'K';
    return '$ ' + n;
  }

  /* ─── Export PDF (print-based) ──────────────────────────── */
  function exportPDF(resultado, params) {
    var win = window.open('', '_blank');
    if (!win) { alert('Permite ventanas emergentes para exportar.'); return; }

    var rows = resultado.rows;
    var tableRows = rows.map(function(r) {
      return '<tr><td>' + r.anio + '</td><td>' + fmtCOP(r.cuota) + '</td><td>' + fmtCOP(r.saldo) + '</td></tr>';
    }).join('');

    win.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"/>'
      + '<title>Simulación Hipotecaria — Altorra Inmobiliaria</title>'
      + '<style>'
      + 'body{font-family:Poppins,system-ui,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;color:#111827}'
      + 'h1{font-size:1.5rem;color:#d4af37}h2{font-size:1.1rem;margin-top:28px}'
      + '.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0}'
      + '.item{background:#f9fafb;padding:10px;border-radius:8px}'
      + '.item span{font-size:.8rem;color:#6b7280;display:block}.item strong{font-size:.95rem}'
      + 'table{width:100%;border-collapse:collapse;font-size:.85rem;margin-top:12px}'
      + 'th{background:#f3f4f6;padding:8px;text-align:right;font-weight:700}th:first-child{text-align:left}'
      + 'td{padding:7px 8px;text-align:right;border-bottom:1px solid #f3f4f6}td:first-child{text-align:left;font-weight:600}'
      + '.footer{margin-top:32px;font-size:.8rem;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:12px}'
      + '@media print{body{margin:0}}'
      + '</style></head><body>'
      + '<h1>Simulación de Crédito Hipotecario</h1>'
      + '<p style="color:#6b7280">Altorra Inmobiliaria · altorrainmobiliaria.co · ' + new Date().toLocaleDateString('es-CO') + '</p>'
      + '<div class="grid">'
      + '<div class="item"><span>Valor propiedad</span><strong>' + fmtCOP(params.precio) + '</strong></div>'
      + '<div class="item"><span>Cuota inicial (' + Math.round(params.cuotaInicial / params.precio * 100) + '%)</span><strong>' + fmtCOP(params.cuotaInicial) + '</strong></div>'
      + '<div class="item"><span>Monto financiado</span><strong>' + fmtCOP(params.monto) + '</strong></div>'
      + '<div class="item"><span>Plazo</span><strong>' + params.anos + ' años</strong></div>'
      + '<div class="item"><span>Tasa</span><strong>' + fmtPct(params.tea) + ' E.A.</strong></div>'
      + '<div class="item"><span>Cuota mensual</span><strong>' + fmtCOP(resultado.cuota) + '</strong></div>'
      + '<div class="item"><span>Total intereses</span><strong style="color:#ef4444">' + fmtCOP(resultado.totalIntereses) + '</strong></div>'
      + '<div class="item"><span>Total a pagar</span><strong>' + fmtCOP(resultado.totalPago + params.cuotaInicial) + '</strong></div>'
      + '</div>'
      + '<h2>Tabla de amortización por año</h2>'
      + '<table><thead><tr><th>Año</th><th>Cuota mensual</th><th>Saldo</th></tr></thead><tbody>' + tableRows + '</tbody></table>'
      + '<div class="footer">Este documento es orientativo. Las tasas reales dependen de la entidad financiera y tu perfil crediticio. Consulta con un asesor Altorra para un estudio personalizado.</div>'
      + '</body></html>');
    win.document.close();
    setTimeout(function() { win.print(); }, 300);
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

        <!-- Gráfica de amortización -->
        <div class="sim-chart-wrap">
          <h4 style="font-size:.95rem;font-weight:700;margin:0 0 10px">Evolución del crédito</h4>
          <canvas id="simChart" width="680" height="280" style="width:100%;height:auto;max-height:280px"></canvas>
          <div class="sim-chart-legend">
            <span><span class="sim-dot" style="background:var(--gold,#d4af37)"></span> Capital</span>
            <span><span class="sim-dot" style="background:#ef4444"></span> Intereses</span>
            <span><span class="sim-dot" style="background:#e5e7eb"></span> Saldo</span>
          </div>
        </div>

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

        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <button class="sim-cta-btn" id="simSolicitarBtn">
            Solicitar asesoría crediticia gratuita →
          </button>
          <button class="sim-export-btn" id="simExportPdf" type="button">
            📄 Exportar PDF
          </button>
        </div>
      </div>`;

    // Chart
    renderChart(container.querySelector('#simChart'), resultado, params);

    // Export PDF
    document.getElementById('simExportPdf')?.addEventListener('click', () => {
      exportPDF(resultado, params);
    });

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
      .sim-export-btn { padding: 14px 20px; border-radius: 14px; border: 2px solid rgba(17,24,39,.15);
        background: #fff; color: var(--text,#111827); font-weight: 700; font-size: .92rem;
        cursor: pointer; transition: all .15s; }
      .sim-export-btn:hover { border-color: var(--gold,#d4af37); background: rgba(212,175,55,.06); }
      .sim-chart-wrap { background: #fff; border: 1px solid rgba(17,24,39,.08); border-radius: 14px;
        padding: 18px; margin: 20px 0; }
      .sim-chart-legend { display: flex; gap: 16px; margin-top: 10px; font-size: .82rem; color: var(--muted,#6b7280); }
      .sim-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
    `;
    document.head.appendChild(s);
  }

  /* ─── API pública ───────────────────────────────────────── */
  window.SimuladorHipotecario = { init, cuotaMensual, calcularAmortizacion };

})();

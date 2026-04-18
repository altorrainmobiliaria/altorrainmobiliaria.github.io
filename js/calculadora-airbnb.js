(function () {
  'use strict';

  const ID = 'airbnb-calc-modal';
  let modal = null;

  const GASTOS_DEFAULT = {
    administracion: 350000,
    servicios:      250000,
    limpieza:       80000,
    plataforma:     3,
    mantenimiento:  150000,
    impuestos:      0.5
  };

  function fmt(n) {
    return '$ ' + Math.round(n).toLocaleString('es-CO');
  }

  function calcular(params) {
    const { precioPropiedad, tarifaNoche, ocupacion, gastosAdmin,
            gastosServicios, gastosLimpieza, comisionPlataforma,
            gastosMantenimiento, impuestosPct } = params;

    const diasOcupados = Math.round(30 * ocupacion / 100);
    const ingresoBrutoMes = tarifaNoche * diasOcupados;
    const ingresoBrutoAnual = ingresoBrutoMes * 12;

    const comisionMes = ingresoBrutoMes * comisionPlataforma / 100;
    const impuestosMes = ingresoBrutoMes * impuestosPct / 100;
    const limpiezaMes = gastosLimpieza * diasOcupados;

    const totalGastosMes = gastosAdmin + gastosServicios + limpiezaMes
                         + comisionMes + gastosMantenimiento + impuestosMes;
    const totalGastosAnual = totalGastosMes * 12;

    const netoMes = ingresoBrutoMes - totalGastosMes;
    const netoAnual = netoMes * 12;
    const roiAnual = precioPropiedad > 0 ? (netoAnual / precioPropiedad) * 100 : 0;
    const paybackAnios = netoAnual > 0 ? precioPropiedad / netoAnual : Infinity;

    return {
      diasOcupados, ingresoBrutoMes, ingresoBrutoAnual,
      comisionMes, impuestosMes, limpiezaMes,
      totalGastosMes, totalGastosAnual,
      netoMes, netoAnual, roiAnual, paybackAnios
    };
  }

  function renderChart(canvas, result) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const data = [
      { label: 'Ingreso bruto', value: result.ingresoBrutoMes, color: '#d4af37' },
      { label: 'Gastos', value: result.totalGastosMes, color: '#ef4444' },
      { label: 'Ingreso neto', value: Math.max(result.netoMes, 0), color: '#22c55e' },
    ];

    const maxVal = Math.max(...data.map(d => d.value), 1);
    const barH = 36;
    const gap = 20;
    const labelW = 120;
    const chartW = W - labelW - 80;
    const startY = (H - (data.length * (barH + gap) - gap)) / 2;

    ctx.font = '13px Poppins, system-ui, sans-serif';
    ctx.textBaseline = 'middle';

    data.forEach((d, i) => {
      const y = startY + i * (barH + gap);
      const bw = Math.max(4, (d.value / maxVal) * chartW);

      ctx.fillStyle = '#6b7280';
      ctx.textAlign = 'right';
      ctx.fillText(d.label, labelW - 10, y + barH / 2);

      ctx.fillStyle = '#f3f4f6';
      ctx.beginPath();
      ctx.roundRect(labelW, y, chartW, barH, 6);
      ctx.fill();

      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.roundRect(labelW, y, bw, barH, 6);
      ctx.fill();

      ctx.fillStyle = '#111827';
      ctx.textAlign = 'left';
      ctx.fillText(fmt(d.value) + '/mes', labelW + bw + 8, y + barH / 2);
    });
  }

  function injectCSS() {
    if (document.getElementById('airbnb-calc-css')) return;
    const s = document.createElement('style');
    s.id = 'airbnb-calc-css';
    s.textContent = `
      .abc-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .25s}
      .abc-overlay.show{opacity:1}
      .abc-modal{background:#fff;border-radius:18px;width:100%;max-width:640px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.18);transform:translateY(16px);transition:transform .25s}
      .abc-overlay.show .abc-modal{transform:translateY(0)}
      .abc-head{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #f3f4f6}
      .abc-head h2{font-size:1.15rem;font-weight:800;margin:0}
      .abc-close{background:none;border:none;font-size:1.5rem;cursor:pointer;color:#6b7280;padding:4px}
      .abc-body{padding:24px}
      .abc-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      @media(max-width:540px){.abc-grid{grid-template-columns:1fr}}
      .abc-field label{display:block;font-size:.82rem;color:#6b7280;margin-bottom:4px;font-weight:500}
      .abc-field input,.abc-field select{width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;font-size:.95rem;font-family:inherit;outline:none;transition:border-color .15s}
      .abc-field input:focus{border-color:#d4af37}
      .abc-field.full{grid-column:1/-1}
      .abc-sep{border:none;border-top:1px solid #f3f4f6;margin:20px 0}
      .abc-calc-btn{width:100%;padding:14px;background:linear-gradient(135deg,#d4af37,#ffb400);color:#000;font-weight:700;font-size:1rem;border:none;border-radius:12px;cursor:pointer;font-family:inherit;transition:transform .12s}
      .abc-calc-btn:hover{transform:scale(1.01)}
      .abc-results{margin-top:20px}
      .abc-result-card{background:#f9fafb;border-radius:14px;padding:20px;margin-bottom:14px}
      .abc-result-row{display:flex;justify-content:space-between;padding:6px 0;font-size:.9rem;border-bottom:1px solid #f0f0f0}
      .abc-result-row:last-child{border-bottom:none}
      .abc-result-row .val{font-weight:700}
      .abc-result-row .val.gold{color:#d4af37}
      .abc-result-row .val.green{color:#22c55e}
      .abc-result-row .val.red{color:#ef4444}
      .abc-roi-box{text-align:center;padding:24px;background:linear-gradient(135deg,#0b0b0b,#1a1a2e);border-radius:14px;color:#fff;margin-top:14px}
      .abc-roi-big{font-size:2.4rem;font-weight:800;color:#d4af37}
      .abc-roi-label{font-size:.85rem;color:rgba(255,255,255,.6);margin-top:4px}
      .abc-payback{font-size:1rem;color:rgba(255,255,255,.8);margin-top:8px}
      .abc-chart-wrap{margin-top:14px}
      .abc-chart-wrap canvas{width:100%;height:auto}
      .abc-lead-btn{width:100%;padding:12px;margin-top:14px;background:#25d366;color:#fff;font-weight:700;border:none;border-radius:12px;cursor:pointer;font-size:.95rem;font-family:inherit}
    `;
    document.head.appendChild(s);
  }

  function buildModal() {
    injectCSS();
    const overlay = document.createElement('div');
    overlay.className = 'abc-overlay';
    overlay.id = ID;
    overlay.innerHTML = `
      <div class="abc-modal">
        <div class="abc-head">
          <h2>Calculadora Rentabilidad Airbnb</h2>
          <button class="abc-close" aria-label="Cerrar">&times;</button>
        </div>
        <div class="abc-body">
          <div class="abc-grid">
            <div class="abc-field full">
              <label>Precio de la propiedad (COP)</label>
              <input type="text" id="abc-precio" value="500.000.000" inputmode="numeric">
            </div>
            <div class="abc-field">
              <label>Tarifa por noche (COP)</label>
              <input type="text" id="abc-tarifa" value="400.000" inputmode="numeric">
            </div>
            <div class="abc-field">
              <label>Ocupación mensual (%)</label>
              <input type="number" id="abc-ocupacion" value="65" min="0" max="100" step="1">
            </div>
            <div class="abc-field">
              <label>Administración / mes</label>
              <input type="text" id="abc-admin" value="350.000" inputmode="numeric">
            </div>
            <div class="abc-field">
              <label>Servicios / mes</label>
              <input type="text" id="abc-servicios" value="250.000" inputmode="numeric">
            </div>
            <div class="abc-field">
              <label>Limpieza / check-out</label>
              <input type="text" id="abc-limpieza" value="80.000" inputmode="numeric">
            </div>
            <div class="abc-field">
              <label>Comisión plataforma (%)</label>
              <input type="number" id="abc-comision" value="3" min="0" max="30" step="0.5">
            </div>
            <div class="abc-field">
              <label>Mantenimiento / mes</label>
              <input type="text" id="abc-mantenimiento" value="150.000" inputmode="numeric">
            </div>
            <div class="abc-field">
              <label>Impuestos (%)</label>
              <input type="number" id="abc-impuestos" value="0.5" min="0" max="20" step="0.1">
            </div>
          </div>
          <hr class="abc-sep">
          <button class="abc-calc-btn" id="abc-calcular">Calcular rentabilidad</button>
          <div class="abc-results" id="abc-results" style="display:none">
            <div class="abc-result-card" id="abc-ingresos"></div>
            <div class="abc-result-card" id="abc-gastos"></div>
            <div class="abc-roi-box" id="abc-roi"></div>
            <div class="abc-chart-wrap">
              <canvas id="abc-chart" width="580" height="180"></canvas>
            </div>
            <button class="abc-lead-btn" id="abc-whatsapp">Hablar con un asesor por WhatsApp</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.abc-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    overlay.querySelectorAll('input[inputmode="numeric"]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const raw = inp.value.replace(/\D/g, '');
        inp.value = raw ? Number(raw).toLocaleString('es-CO') : '';
      });
    });

    overlay.querySelector('#abc-calcular').addEventListener('click', runCalc);

    overlay.querySelector('#abc-whatsapp').addEventListener('click', function () {
      var precio = parseCOP(overlay.querySelector('#abc-precio').value);
      var tarifa = parseCOP(overlay.querySelector('#abc-tarifa').value);
      var ocu = parseFloat(overlay.querySelector('#abc-ocupacion').value) || 0;
      var msg = 'Hola Altorra, hice la calculadora Airbnb. ' +
                'Propiedad: ' + fmt(precio) + ', Tarifa/noche: ' + fmt(tarifa) +
                ', Ocupación: ' + ocu + '%. Me interesa asesoría.';
      window.open('https://wa.me/573002439810?text=' + encodeURIComponent(msg), '_blank');
    });

    modal = overlay;
    return overlay;
  }

  function parseCOP(str) {
    return parseInt((str || '').replace(/\D/g, ''), 10) || 0;
  }

  function runCalc() {
    var el = function (id) { return document.getElementById(id); };
    var params = {
      precioPropiedad:    parseCOP(el('abc-precio').value),
      tarifaNoche:        parseCOP(el('abc-tarifa').value),
      ocupacion:          parseFloat(el('abc-ocupacion').value) || 0,
      gastosAdmin:        parseCOP(el('abc-admin').value),
      gastosServicios:    parseCOP(el('abc-servicios').value),
      gastosLimpieza:     parseCOP(el('abc-limpieza').value),
      comisionPlataforma: parseFloat(el('abc-comision').value) || 0,
      gastosMantenimiento:parseCOP(el('abc-mantenimiento').value),
      impuestosPct:       parseFloat(el('abc-impuestos').value) || 0
    };

    var r = calcular(params);
    var results = el('abc-results');
    results.style.display = '';

    el('abc-ingresos').innerHTML =
      '<div style="font-weight:700;margin-bottom:8px">Ingresos</div>' +
      row('Días ocupados / mes', r.diasOcupados + ' días') +
      row('Ingreso bruto / mes', fmt(r.ingresoBrutoMes), 'gold') +
      row('Ingreso bruto / año', fmt(r.ingresoBrutoAnual), 'gold');

    el('abc-gastos').innerHTML =
      '<div style="font-weight:700;margin-bottom:8px">Gastos mensuales</div>' +
      row('Administración', fmt(params.gastosAdmin)) +
      row('Servicios', fmt(params.gastosServicios)) +
      row('Limpieza (' + r.diasOcupados + ' check-outs)', fmt(r.limpiezaMes)) +
      row('Comisión plataforma (' + params.comisionPlataforma + '%)', fmt(r.comisionMes)) +
      row('Mantenimiento', fmt(params.gastosMantenimiento)) +
      row('Impuestos (' + params.impuestosPct + '%)', fmt(r.impuestosMes)) +
      row('Total gastos / mes', fmt(r.totalGastosMes), 'red');

    var paybackText = r.paybackAnios < 100
      ? r.paybackAnios.toFixed(1) + ' años para recuperar inversión'
      : 'No se recupera con estos parámetros';

    el('abc-roi').innerHTML =
      '<div class="abc-roi-big">' + r.roiAnual.toFixed(1) + '% anual</div>' +
      '<div class="abc-roi-label">Retorno sobre la inversión</div>' +
      '<div style="margin-top:12px;font-size:1.1rem;font-weight:700;color:#22c55e">' +
        fmt(r.netoMes) + ' / mes neto</div>' +
      '<div class="abc-payback">' + paybackText + '</div>';

    renderChart(el('abc-chart'), r);
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function row(label, value, cls) {
    return '<div class="abc-result-row"><span>' + label + '</span>' +
           '<span class="val' + (cls ? ' ' + cls : '') + '">' + value + '</span></div>';
  }

  function open(opts) {
    var overlay = document.getElementById(ID) || buildModal();
    if (opts && opts.precio) {
      var inp = overlay.querySelector('#abc-precio');
      inp.value = Number(opts.precio).toLocaleString('es-CO');
    }
    if (opts && opts.tarifa) {
      var inp = overlay.querySelector('#abc-tarifa');
      inp.value = Number(opts.tarifa).toLocaleString('es-CO');
    }
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      overlay.classList.add('show');
    });
  }

  function close() {
    var overlay = document.getElementById(ID);
    if (!overlay) return;
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

  window.CalculadoraAirbnb = { open: open, close: close };
})();

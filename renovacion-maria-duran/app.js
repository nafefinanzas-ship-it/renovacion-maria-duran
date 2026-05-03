/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakText, TweakNumber, TweakColor */

const { useState, useMemo } = React;

const TWEAK_DEFAULTS = {
  clientName: "María Durán",
  clientHandle: "@mariadurancontent",
  clientDescriptor: "Content Marketing · 157k seguidores",
  monthsDoneA: "Febrero",
  monthsDoneB: "Marzo",
  monthsDoneC: "Abril",
  monthsLockedA: "Mayo",
  monthsLockedB: "Junio",
  monthsLockedC: "Julio",
  year: "2026",
  conversations: "49.002",
  visits: "50.356",
  storiesPerMonth: 84,
  storiesTotal: 65,
  ctaUrl: "https://buy.stripe.com/9B6dR80Pceo6eAmdTLebu0o",
  price: "3.000€ · 3 meses",
  accentColor: "#2f3a2c",
  warmColor: "#c8765a",
  bgColor: "#f3efe8"
};

// ---------- Atoms ----------
const VerifiedDot = () => React.createElement('svg', {
  className: 'verified', viewBox: '0 0 24 24', fill: 'none'
},
  React.createElement('path', {
    d: 'M12 1.5l2.4 2.1 3.2-.4.8 3.1 2.7 1.7-1.2 3 1.2 3-2.7 1.7-.8 3.1-3.2-.4L12 22.5l-2.4-2.1-3.2.4-.8-3.1-2.7-1.7 1.2-3-1.2-3 2.7-1.7.8-3.1 3.2.4L12 1.5z',
    fill: '#0095f6'
  }),
  React.createElement('path', {
    d: 'M8 12l3 3 5-5.5',
    stroke: '#fff', strokeWidth: '1.8', fill: 'none',
    strokeLinecap: 'round', strokeLinejoin: 'round'
  })
);

const LockSvg = () => React.createElement('svg', {
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.4'
},
  React.createElement('rect', { x: '5', y: '11', width: '14', height: '9', rx: '1.5' }),
  React.createElement('path', { d: 'M8 11V8a4 4 0 0 1 8 0v3' }),
  React.createElement('circle', { cx: '12', cy: '15.5', r: '1.2', fill: 'currentColor' })
);

// ---------- Calendar ----------
const TILE_COUNT = 16;
const tilePath = (i) => `assets/tile-${(i % TILE_COUNT + TILE_COUNT) % TILE_COUNT}.png`;

function makeMonthDays({ year, month, locked, storyDensity, seed }) {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push({ empty: true });
  const rand = mulberry32(seed);
  for (let d = 1; d <= daysInMonth; d++) {
    const hasStory = !locked && rand() < storyDensity;
    const tileIdx = Math.floor(rand() * 1000);
    cells.push({ day: d, hasStory, tileIdx });
  }
  while (cells.length % 7 !== 0) cells.push({ empty: true });
  return cells;
}

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function Calendar({ monthName, year, locked, monthIdx, imageSrc }) {
  const cells = useMemo(
    () => makeMonthDays({
      year: parseInt(year, 10) || 2026,
      month: monthIdx,
      locked,
      storyDensity: 0.78,
      seed: monthIdx * 1234 + 7
    }),
    [year, monthIdx, locked]
  );
  const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const head = React.createElement('div', { className: 'cal-head' },
    React.createElement('div', null,
      React.createElement('div', { className: 'cal-month' }, monthName),
      React.createElement('div', { className: 'cal-year' }, year)
    ),
    React.createElement('div', { className: `cal-status ${locked ? 'locked' : 'done'}` },
      locked ? 'Bloqueado' : 'Completado'
    )
  );

  const weekdaysRow = React.createElement('div', { className: 'cal-weekdays' },
    weekdays.map((w, i) => React.createElement('div', { key: i }, w))
  );

  let body;
  if (!locked && imageSrc) {
    body = React.createElement(React.Fragment, null,
      weekdaysRow,
      React.createElement('div', { className: 'cal-image' },
        React.createElement('img', { src: imageSrc, alt: `${monthName} ${year}` })
      )
    );
  } else {
    body = React.createElement(React.Fragment, null,
      weekdaysRow,
      React.createElement('div', { className: 'cal-days' },
        cells.map((c, i) => {
          if (c.empty) return React.createElement('div', { key: i, className: 'day empty' });
          if (c.hasStory) return React.createElement('div', {
            key: i, className: 'day has-story',
            style: { backgroundImage: `url(${tilePath(c.tileIdx)})` }
          }, React.createElement('span', { className: 'num' }, c.day));
          return React.createElement('div', { key: i, className: 'day' },
            React.createElement('span', { className: 'num' }, c.day)
          );
        })
      )
    );
  }

  const lockOverlay = locked ? React.createElement('div', { className: 'lock-overlay' },
    React.createElement('div', { className: 'lock-icon' }, React.createElement(LockSvg))
  ) : null;

  const foot = React.createElement('div', { className: 'cal-foot' },
    React.createElement('div', { className: 'count' },
      locked
        ? React.createElement('span', null, '· · ·')
        : React.createElement('span', { dangerouslySetInnerHTML: { __html: '&nbsp;' } })
    ),
    React.createElement('div', null, locked ? '—' : '✓')
  );

  return React.createElement('div', { className: `cal ${locked ? 'locked' : ''}` },
    head, body, lockOverlay, foot
  );
}

// ---------- Sections ----------
function Hero({ t }) {
  return React.createElement('header', { className: 'hero', 'data-screen-label': '01 Hero' },
    React.createElement('div', { className: 'hero-grid' },
      React.createElement('div', null,
        React.createElement('div', { className: 'eyebrow' }, 'Renovación · 3 meses · Servicio de historias'),
        React.createElement('h1', { className: 'title' },
          'Tres meses', React.createElement('br'),
          'de trabajo', React.createElement('br'),
          'constante,', React.createElement('br'),
          React.createElement('em', null, 'visibles.')
        ),
        React.createElement('p', { className: 'hero-sub' },
          'Esto es lo que hemos construido juntos en Febrero, Marzo y Abril. Y lo que está esperando del otro lado.'
        )
      ),
      React.createElement('div', { className: 'client-card' },
        React.createElement('img', { src: 'assets/profile.png', alt: t.clientName }),
        React.createElement('div', { className: 'meta' },
          React.createElement('div', { className: 'handle' },
            t.clientHandle, ' ', React.createElement(VerifiedDot)
          ),
          React.createElement('div', { className: 'name' }, t.clientDescriptor)
        )
      )
    )
  );
}

function CalendarsDone({ t }) {
  return React.createElement('section', { className: 'calendars', 'data-screen-label': '02 Calendarios completados' },
    React.createElement('div', { className: 'section-head' },
      React.createElement('div', null,
        React.createElement('div', { className: 'label' }, '01 — Lo construido'),
        React.createElement('h2', null,
          'Tres meses de ', React.createElement('em', null, 'presencia diaria'),
          ', sin que tuvieras que pensar en ello.'
        )
      )
    ),
    React.createElement('div', { className: 'cal-grid' },
      React.createElement(Calendar, { monthName: t.monthsDoneA, year: t.year, locked: false, monthIdx: 1, imageSrc: 'assets/cal-febrero-grid.png' }),
      React.createElement(Calendar, { monthName: t.monthsDoneB, year: t.year, locked: false, monthIdx: 2, imageSrc: 'assets/cal-marzo-grid.png' }),
      React.createElement(Calendar, { monthName: t.monthsDoneC, year: t.year, locked: false, monthIdx: 3, imageSrc: 'assets/cal-abril-grid.png' })
    )
  );
}

function Results({ t }) {
  return React.createElement('section', { className: 'results', 'data-screen-label': '03 Resultados' },
    React.createElement('div', { className: 'section-head' },
      React.createElement('div', null,
        React.createElement('div', { className: 'label' }, '02 — Resultados'),
        React.createElement('h2', null,
          'Los números que dejó ', React.createElement('em', null, 'este trimestre.')
        )
      )
    ),
    React.createElement('div', { className: 'results-grid' },
      React.createElement('div', { className: 'stat-card feature' },
        React.createElement('div', { className: 'stat-label' }, 'Conversaciones generadas'),
        React.createElement('div', null,
          React.createElement('div', { className: 'stat-num' },
            React.createElement('span', { className: 'plus' }, '+'), t.conversations
          ),
          React.createElement('div', { className: 'stat-sub' },
            'Mensajes directos, respuestas a stickers, cuestionarios, links y reacciones que llegaron a tu bandeja.'
          )
        )
      ),
      React.createElement('div', { className: 'stat-card' },
        React.createElement('div', { className: 'stat-label' }, 'Récord de visitas'),
        React.createElement('div', null,
          React.createElement('div', { className: 'stat-num' }, t.visits),
          React.createElement('div', { className: 'stat-record' }, 'Mejor mes histórico'),
          React.createElement('div', { className: 'stat-sub', style: { marginTop: 12 } },
            'Pico de impresiones alcanzado durante el trimestre, batiendo el récord anterior de tu cuenta.'
          )
        )
      ),
      React.createElement('div', { className: 'stat-card' },
        React.createElement('div', { className: 'stat-label' }, 'SECUENCIAS PUBLICADAS'),
        React.createElement('div', null,
          React.createElement('div', { className: 'stat-num' }, t.storiesTotal),
          React.createElement('div', { className: 'stat-sub', style: { marginTop: 12 } },
            'Piezas estratégicas durante 90 días — guion, edición, copy y publicación incluidos.'
          )
        )
      ),
      React.createElement('div', { className: 'time-saved' },
        React.createElement('div', { className: 'quote-mark' }, '+'),
        React.createElement('div', null,
          React.createElement('p', null,
            'Mucho ', React.createElement('em', null, 'tiempo ahorrado'),
            ' en pensar estrategia, escribir guiones, editar y publicar.'
          ),
          React.createElement('div', { className: 'small' }, 'Tú solo envías el contenido. Nosotros hacemos el resto.')
        )
      )
    )
  );
}

function Testimonial() {
  return React.createElement('section', { className: 'testimonial', 'data-screen-label': '04 Testimonio' },
    React.createElement('div', { className: 'section-head' },
      React.createElement('div', null,
        React.createElement('div', { className: 'label' }, '03 — En tus palabras'),
        React.createElement('h2', null,
          'No te lo decimos nosotros. Lo dijiste ', React.createElement('em', null, 'tú.')
        )
      )
    ),
    React.createElement('div', { className: 'testi-grid' },
      React.createElement('div', { className: 'testi-quote' },
        React.createElement('blockquote', null,
          '"Lo que más nos costaba con las historias era ser ',
          React.createElement('em', null, 'constantes'),
          ' y encontrar ángulos nuevos para vender nuestros productos — y nos han ayudado muchísimo. Obviamente, gracias a eso, las ventas por historias también ',
          React.createElement('em', null, 'han aumentado.'),
          '"'
        ),
        React.createElement('div', { className: 'attr' },
          React.createElement('span', { className: 'line' }),
          React.createElement('strong', null, 'Sebastian'),
          ' · Equipo @mariadurancontent'
        )
      ),
      React.createElement('div', { className: 'wa-card' },
        React.createElement('div', { className: 'wa-head' },
          React.createElement('div', { className: 'wa-avatar' }, 'SM'),
          React.createElement('div', { className: 'wa-name' },
            'Stories María x Nafe',
            React.createElement('span', null, 'Sebastian, hace unos meses')
          )
        ),
        React.createElement('div', { style: { marginTop: 14 } },
          React.createElement('div', { className: 'wa-sender' }, 'Sebastian'),
          React.createElement('div', { className: 'wa-msg' },
            React.createElement('div', { className: 'quoted' },
              React.createElement('strong', null, 'Tú'),
              React.createElement('em', null, 'Equipo, lo que estamos consiguiendo no es normal.')
            ),
            'sin duda ha sido un gran trabajo! lo que más nos costaba con las historias era ser constantes y encontrar ángulos nuevos para vender nuestros productos y nos han ayudado muchísimo y obviamente gracias a eso las ventas por historias también han aumentado',
            React.createElement('div', { className: 'wa-time' }, '16:47 ✓✓')
          )
        )
      )
    )
  );
}

function CalendarsLocked({ t }) {
  return React.createElement('section', { className: 'calendars', 'data-screen-label': '05 Calendarios bloqueados' },
    React.createElement('div', { className: 'section-head' },
      React.createElement('div', null,
        React.createElement('div', { className: 'label' }, '04 — Lo que viene'),
        React.createElement('h2', null,
          'Tres meses ya ', React.createElement('em', null, 'preparados.'), ' Esperando luz verde.'
        )
      )
    ),
    React.createElement('div', { className: 'cal-grid' },
      React.createElement(Calendar, { monthName: t.monthsLockedA, year: t.year, locked: true, monthIdx: 4 }),
      React.createElement(Calendar, { monthName: t.monthsLockedB, year: t.year, locked: true, monthIdx: 5 }),
      React.createElement(Calendar, { monthName: t.monthsLockedC, year: t.year, locked: true, monthIdx: 6 })
    )
  );
}

function Tension() {
  return React.createElement('section', { className: 'tension', 'data-screen-label': '06 Tensión' },
    React.createElement('h2', null,
      '¿Quieres ', React.createElement('em', null, 'desbloquear'), ' los próximos tres meses?'
    ),
    React.createElement('p', null, 'El ritmo está montado. La estrategia funciona. Solo queda no soltar la cuerda.')
  );
}

function CTA({ t }) {
  return React.createElement('section', { className: 'cta', 'data-screen-label': '07 CTA' },
    React.createElement('div', { className: 'cta-card' },
      React.createElement('div', { className: 'cta-eyebrow' }, `Renovación · ${t.price}`),
      React.createElement('h3', null,
        'Desbloquear los próximos', React.createElement('br'),
        React.createElement('em', null, 'tres meses.')
      ),
      React.createElement('p', { className: 'cta-sub' },
        'Mismo equipo, misma estrategia, mismo cuidado. Empezamos en Mayo en cuanto confirmes.'
      ),
      React.createElement('a', { className: 'cta-btn', href: t.ctaUrl },
        'Desbloquear ahora',
        React.createElement('span', { className: 'arrow' }, '→')
      ),
      React.createElement('div', { className: 'cta-meta' },
        React.createElement('span', null, 'Sin permanencia'),
        React.createElement('span', null, 'Pago seguro'),
        React.createElement('span', null, 'Empezamos en 48h')
      )
    )
  );
}

function Footer() {
  return React.createElement('footer', null,
    React.createElement('div', null, '© 2026 · Stories María × Nafe'),
    React.createElement('div', null, 'Documento privado · Sólo para @mariadurancontent')
  );
}

// ---------- App ----------
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const styleOverride = {
    '--accent': t.accentColor,
    '--warm': t.warmColor,
    '--bg': t.bgColor
  };

  return React.createElement('div', { style: styleOverride },
    React.createElement('div', { className: 'topbar wrap' },
      React.createElement('div', null,
        React.createElement('span', { className: 'dot' }),
        'Documento confidencial'
      ),
      React.createElement('div', null)
    ),
    React.createElement('div', { className: 'wrap' },
      React.createElement(Hero, { t }),
      React.createElement(CalendarsDone, { t }),
      React.createElement(Results, { t }),
      React.createElement(Testimonial),
      React.createElement(CalendarsLocked, { t }),
      React.createElement(Tension),
      React.createElement(CTA, { t }),
      React.createElement(Footer)
    ),
    React.createElement(TweaksPanel, { title: 'Tweaks' },
      React.createElement(TweakSection, { label: 'Cliente' },
        React.createElement(TweakText, { label: 'Nombre', value: t.clientName, onChange: (v) => setTweak('clientName', v) }),
        React.createElement(TweakText, { label: 'Handle IG', value: t.clientHandle, onChange: (v) => setTweak('clientHandle', v) }),
        React.createElement(TweakText, { label: 'Descriptor', value: t.clientDescriptor, onChange: (v) => setTweak('clientDescriptor', v) })
      ),
      React.createElement(TweakSection, { label: 'Meses' },
        React.createElement(TweakText, { label: 'Año', value: t.year, onChange: (v) => setTweak('year', v) }),
        React.createElement(TweakText, { label: 'Mes 1 (hecho)', value: t.monthsDoneA, onChange: (v) => setTweak('monthsDoneA', v) }),
        React.createElement(TweakText, { label: 'Mes 2 (hecho)', value: t.monthsDoneB, onChange: (v) => setTweak('monthsDoneB', v) }),
        React.createElement(TweakText, { label: 'Mes 3 (hecho)', value: t.monthsDoneC, onChange: (v) => setTweak('monthsDoneC', v) }),
        React.createElement(TweakText, { label: 'Mes 4 (bloqueado)', value: t.monthsLockedA, onChange: (v) => setTweak('monthsLockedA', v) }),
        React.createElement(TweakText, { label: 'Mes 5 (bloqueado)', value: t.monthsLockedB, onChange: (v) => setTweak('monthsLockedB', v) }),
        React.createElement(TweakText, { label: 'Mes 6 (bloqueado)', value: t.monthsLockedC, onChange: (v) => setTweak('monthsLockedC', v) })
      ),
      React.createElement(TweakSection, { label: 'Métricas' },
        React.createElement(TweakText, { label: 'Conversaciones', value: t.conversations, onChange: (v) => setTweak('conversations', v) }),
        React.createElement(TweakText, { label: 'Récord visitas', value: t.visits, onChange: (v) => setTweak('visits', v) }),
        React.createElement(TweakNumber, { label: 'Historias / mes', value: t.storiesPerMonth, onChange: (v) => setTweak('storiesPerMonth', v), min: 20, max: 150 }),
        React.createElement(TweakNumber, { label: 'Secuencias total', value: t.storiesTotal, onChange: (v) => setTweak('storiesTotal', v), min: 1, max: 500 })
      ),
      React.createElement(TweakSection, { label: 'Oferta & CTA' },
        React.createElement(TweakText, { label: 'Precio / duración', value: t.price, onChange: (v) => setTweak('price', v) }),
        React.createElement(TweakText, { label: 'URL del CTA', value: t.ctaUrl, onChange: (v) => setTweak('ctaUrl', v) })
      ),
      React.createElement(TweakSection, { label: 'Colores' },
        React.createElement(TweakColor, { label: 'Acento (oliva)', value: t.accentColor, onChange: (v) => setTweak('accentColor', v) }),
        React.createElement(TweakColor, { label: 'Cálido (coral)', value: t.warmColor, onChange: (v) => setTweak('warmColor', v) }),
        React.createElement(TweakColor, { label: 'Fondo', value: t.bgColor, onChange: (v) => setTweak('bgColor', v) })
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(React.createElement(App));

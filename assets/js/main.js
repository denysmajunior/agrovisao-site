/* AgroVisão — scripts compartilhados */
(function () {
  const WPP = '5591982064340';

  // Menu mobile
  const menu = document.querySelector('.menu');
  const ham = document.querySelector('.hamburguer');
  if (ham && menu) {
    ham.addEventListener('click', () => {
      const aberto = menu.classList.toggle('aberto');
      ham.setAttribute('aria-expanded', aberto);
      ham.textContent = aberto ? '✕' : '☰';
    });
  }

  // Modal "Solicite um Atendimento"
  const modal = document.getElementById('modal');
  document.querySelectorAll('[data-modal]').forEach(b =>
    b.addEventListener('click', e => { e.preventDefault(); modal.classList.add('aberto'); })
  );
  if (modal) {
    modal.querySelector('.fechar').addEventListener('click', () => modal.classList.remove('aberto'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('aberto'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('aberto'); });
  }

  // Envio dos formulários: abre o WhatsApp com os dados preenchidos
  document.querySelectorAll('form.form-atendimento').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const msg = form.querySelector('.msg');
      try {
        const d = Object.fromEntries(new FormData(form));
        const linhas = [
          'Olá! Gostaria de solicitar um atendimento.',
          `*Nome:* ${d.nome}`,
          `*Empresa:* ${d.empresa || '-'}`,
          `*Contato:* ${d.contato}`,
          `*E-mail:* ${d.email}`,
          `*Serviço de interesse:* ${d.servico}`
        ];
        if (d.mensagem) linhas.push(`*Mensagem:* ${d.mensagem}`);
        window.open(`https://api.whatsapp.com/send?phone=${WPP}&text=${encodeURIComponent(linhas.join('\n'))}`, '_blank');
        msg.className = 'msg ok';
        msg.textContent = 'Ótimo! Recebemos suas informações.';
        form.reset();
      } catch (err) {
        msg.className = 'msg erro';
        msg.textContent = 'Não foi possível processar o seu envio. Tente novamente.';
      }
    });
  });

  // Filtro de projetos (Projetos e Galeria)
  document.querySelectorAll('[data-filtros]').forEach(grupo => {
    const alvo = document.querySelector(grupo.dataset.filtros);
    grupo.querySelectorAll('.filtro').forEach(btn => {
      btn.addEventListener('click', () => {
        grupo.querySelectorAll('.filtro').forEach(b => b.classList.remove('ativo'));
        btn.classList.add('ativo');
        const cat = btn.dataset.cat;
        alvo.querySelectorAll('.projeto').forEach(p =>
          p.classList.toggle('oculto', cat !== 'todos' && p.dataset.cat !== cat)
        );
      });
    });
  });

  // Carrossel da home
  const car = document.querySelector('.carrossel');
  if (car) {
    const passo = () => car.querySelector('.projeto').offsetWidth + 22;
    document.querySelector('[data-seta="ant"]').onclick = () => car.scrollBy({ left: -passo(), behavior: 'smooth' });
    document.querySelector('[data-seta="prox"]').onclick = () => car.scrollBy({ left: passo(), behavior: 'smooth' });
  }

  // Imagem quebrada: mantém o espaço com fundo neutro
  document.querySelectorAll('img').forEach(img =>
    img.addEventListener('error', () => { img.style.visibility = 'hidden'; })
  );

  // Revelar ao rolar
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(ents => {
    ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visivel'); io.unobserve(en.target); } });
  }, { threshold: .12 }) : null;
  document.querySelectorAll('.revelar').forEach(el => io ? io.observe(el) : el.classList.add('visivel'));

  // Idioma (EN usa o tradutor do Google, como o GTranslate do site original)
  document.querySelectorAll('.idiomas button').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.lang === 'en') {
      window.open('https://translate.google.com/translate?sl=pt&tl=en&u=' + encodeURIComponent(location.href), '_blank');
    }
  }));

  // Ano no rodapé
  const ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();

/* Menu de vidro: muda para o tom claro quando a abertura sai da tela */
(function () {
  const topo = document.querySelector('.topo');
  const hero = document.querySelector('.hero');
  if (!topo) return;
  const atualizar = () => {
    const limite = hero ? hero.offsetHeight - 90 : 40;
    topo.classList.toggle('rolou', window.scrollY > limite);
  };
  window.addEventListener('scroll', atualizar, { passive: true });
  window.addEventListener('resize', atualizar);
  atualizar();
})();

/* Visor de fotos da página de projeto */
(function () {
  const visor = document.getElementById('visor');
  if (!visor) return;
  const fotos = [...document.querySelectorAll('.foto-proj img')];
  const img = visor.querySelector('img');
  let atual = 0;
  const mostrar = k => { atual = (k + fotos.length) % fotos.length; img.src = fotos[atual].src; img.alt = fotos[atual].alt; };
  document.querySelectorAll('.foto-proj').forEach((a, k) => a.addEventListener('click', ev => {
    ev.preventDefault(); mostrar(k); visor.classList.add('aberto'); visor.setAttribute('aria-hidden', 'false');
  }));
  const fechar = () => { visor.classList.remove('aberto'); visor.setAttribute('aria-hidden', 'true'); };
  visor.querySelector('.visor-fechar').onclick = fechar;
  visor.querySelector('.ant').onclick = () => mostrar(atual - 1);
  visor.querySelector('.prox').onclick = () => mostrar(atual + 1);
  visor.addEventListener('click', ev => { if (ev.target === visor) fechar(); });
  document.addEventListener('keydown', ev => {
    if (!visor.classList.contains('aberto')) return;
    if (ev.key === 'Escape') fechar();
    if (ev.key === 'ArrowLeft') mostrar(atual - 1);
    if (ev.key === 'ArrowRight') mostrar(atual + 1);
  });
})();

/* Contagem animada dos números (0 → valor), quando o número aparece na tela */
(function () {
  const alvos = document.querySelectorAll('.numeros-grandes strong, .barra-flutuante.numeros strong');
  const reduzir = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preparar = el => {
    const m = el.textContent.trim().match(/^(\D*)(\d+)(\D*)$/);
    if (!m) return null;                      // ex.: "∞" fica como está
    const [, antes, num, depois] = m;
    return { antes, depois, fim: parseInt(num, 10), casas: num.startsWith('0') ? num.length : 1 };
  };
  const formatar = (v, d) => d.antes + String(v).padStart(d.casas, '0') + d.depois;
  const animar = (el, d) => {
    const dur = 1800, t0 = performance.now();
    const passo = t => {
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);       // desacelera no fim
      el.textContent = formatar(Math.round(d.fim * e), d);
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };
  alvos.forEach(el => {
    const d = preparar(el);
    if (!d || reduzir) return;
    el.style.fontVariantNumeric = 'tabular-nums';
    el.textContent = formatar(0, d);
    if (!('IntersectionObserver' in window)) { animar(el, d); return; }
    const io = new IntersectionObserver(ents => {
      ents.forEach(en => { if (en.isIntersecting) { animar(el, d); io.disconnect(); } });
    }, { threshold: .6 });
    io.observe(el);
  });
})();

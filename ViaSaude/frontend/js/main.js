/* ==========================================================
   Via Saúde — lógica principal
   (navegação, carrossel, unidades e agendamento)
   ========================================================== */
(() => {
  'use strict';

  const CFG = window.viaSaudeConfig || {};
  const UNITS = window.viaSaudeUnits || [];
  const SERVICES = window.viaSaudeServices || {};
  const STORAGE_KEY = 'viaSaudeAppointments.v2';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const serviceName = (k) => SERVICES[k] || k;
  const unitById = (id) => UNITS.find((u) => u.id === id);
  const LOTACAO = { verde: 'Lotação baixa', amarelo: 'Lotação média', vermelho: 'Lotação alta' };

  const todayISO = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };
  const formatDate = (iso) => {
    const d = new Date(`${iso}T00:00:00`);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' });
  };

  /* ---------- aviso ao usuário ---------- */
  let toastTimer;
  function toast(message, type = 'info') {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.className = `toast ${type}`;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 8000);
  }

  /* ==========================================================
     Navegação
     ========================================================== */
  function initNav() {
    const header = $('.site-header');
    const toggle = $('#navToggle');
    const nav = $('#mainNav');
    const links = $$('.nav-link');

    toggle?.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.forEach((l) => l.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle?.setAttribute('aria-expanded', 'false');
    }));

    const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const sections = $$('main section[id]');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${en.target.id}`));
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      sections.forEach((s) => io.observe(s));
    }
  }

  /* ==========================================================
     Carrossel automático
     ========================================================== */
  function initCarousel() {
    const root = $('[data-carousel]');
    if (!root) return;
    const slides = $$('.slide', root);
    const dotsBox = $('.hero-dots', root);
    const pauseBtn = $('[data-carousel-pause]', root);
    const slidesBox = $('.slides', root);
    let index = 0;
    let timer = null;
    let userPaused = reduceMotion;

    dotsBox.innerHTML = slides
      .map((_, i) => `<button type="button" class="dot" data-i="${i}" aria-label="Ir para o destaque ${i + 1} de ${slides.length}"></button>`)
      .join('');
    const dots = $$('.dot', dotsBox);

    function show(n) {
      index = (n + slides.length) % slides.length;
      slides.forEach((s, i) => {
        s.classList.toggle('is-active', i === index);
        s.setAttribute('aria-hidden', String(i !== index));
      });
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-current', String(i === index));
      });
    }

    function stop() { clearInterval(timer); timer = null; }
    function start() {
      stop();
      const running = !userPaused;
      slidesBox.setAttribute('aria-live', running ? 'off' : 'polite');
      if (running) timer = setInterval(() => show(index + 1), 5000);
    }
    function syncPauseButton() {
      if (!pauseBtn) return;
      pauseBtn.textContent = userPaused ? 'Reproduzir' : 'Pausar';
      pauseBtn.setAttribute('aria-label', userPaused ? 'Retomar rotação automática' : 'Pausar rotação automática');
    }

    $('[data-carousel-prev]', root)?.addEventListener('click', () => { show(index - 1); start(); });
    $('[data-carousel-next]', root)?.addEventListener('click', () => { show(index + 1); start(); });
    dotsBox.addEventListener('click', (e) => {
      const b = e.target.closest('.dot');
      if (b) { show(Number(b.dataset.i)); start(); }
    });
    pauseBtn?.addEventListener('click', () => { userPaused = !userPaused; syncPauseButton(); start(); });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

    show(0);
    syncPauseButton();
    start();
  }

  /* ==========================================================
     Unidades
     ========================================================== */
  const filters = { region: 'todas', service: 'todos', lotacao: 'todos', distance: 'todos', sort: 'fila' };

  function initUnits() {
    const regions = [...new Set(UNITS.map((u) => u.region))];
    $('#regionTabs').innerHTML = ['todas', ...regions]
      .map((r) => `<button type="button" class="tab" data-region="${esc(r)}" aria-pressed="${r === 'todas'}">${r === 'todas' ? 'Todas as regiões' : esc(r)}</button>`)
      .join('');

    $('#serviceFilter').innerHTML =
      '<option value="todos">Todos os serviços</option>' +
      Object.entries(SERVICES).map(([k, v]) => `<option value="${esc(k)}">${esc(v)}</option>`).join('');

    $('#regionTabs').addEventListener('click', (e) => {
      const b = e.target.closest('.tab');
      if (!b) return;
      filters.region = b.dataset.region;
      $$('.tab').forEach((t) => t.setAttribute('aria-pressed', String(t === b)));
      renderUnits();
    });

    [['serviceFilter', 'service'], ['lotacaoFilter', 'lotacao'], ['distanceFilter', 'distance'], ['sortFilter', 'sort']].forEach(([id, key]) => {
      $(`#${id}`).addEventListener('change', (e) => { filters[key] = e.target.value; renderUnits(); });
    });
    $('#clearFilters').addEventListener('click', clearFilters);
    renderUnits();
  }

  function clearFilters() {
    Object.assign(filters, { region: 'todas', service: 'todos', lotacao: 'todos', distance: 'todos', sort: 'fila' });
    $('#serviceFilter').value = 'todos';
    $('#lotacaoFilter').value = 'todos';
    $('#distanceFilter').value = 'todos';
    $('#sortFilter').value = 'fila';
    $$('.tab').forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.region === 'todas')));
    renderUnits();
  }

  function filteredUnits() {
    let list = [...UNITS];
    if (filters.region !== 'todas') list = list.filter((u) => u.region === filters.region);
    if (filters.service !== 'todos') list = list.filter((u) => u.services.includes(filters.service));
    if (filters.lotacao !== 'todos') list = list.filter((u) => u.status === filters.lotacao);
    if (filters.distance === 'ate-2km') list = list.filter((u) => u.distance <= 2);
    if (filters.distance === 'ate-5km') list = list.filter((u) => u.distance <= 5);
    if (filters.distance === 'mais-5km') list = list.filter((u) => u.distance > 5);
    const sorters = {
      fila: (a, b) => a.queueMinutes - b.queueMinutes,
      distancia: (a, b) => a.distance - b.distance,
      nome: (a, b) => a.name.localeCompare(b.name, 'pt-BR')
    };
    return list.sort(sorters[filters.sort] || sorters.fila);
  }

  function renderUnits() {
    const box = $('#unitResults');
    const summary = $('#unitSummary');
    const list = filteredUnits();

    if (!list.length) {
      summary.textContent = 'Nenhuma unidade encontrada.';
      box.innerHTML = `
        <div class="empty">
          <h3>Nenhuma unidade com esses filtros</h3>
          <p>Tente outra região, serviço ou distância.</p>
          <button type="button" class="btn btn-secondary" data-action="clear-filters">Limpar filtros</button>
        </div>`;
      return;
    }

    const low = list.filter((u) => u.status === 'verde').length;
    const best = [...list].sort((a, b) => a.queueMinutes - b.queueMinutes)[0];
    summary.textContent = `${list.length} ${list.length === 1 ? 'unidade' : 'unidades'} · ${low} com lotação baixa · menor fila: ${best.queueMinutes} min (${best.name})`;

    box.innerHTML = list.map((u) => `
      <article class="unit ${esc(u.status)}">
        <div class="unit-top">
          <span class="unit-type">${esc(u.type)} · ${esc(u.region)}</span>
          <span class="badge">${esc(LOTACAO[u.status] || u.status)}</span>
        </div>
        <div>
          <h3>${esc(u.name)}</h3>
          <p class="unit-address">${esc(u.address)}</p>
        </div>
        <div class="unit-meta">
          <div><span>Fila estimada</span><strong>${esc(u.queueMinutes)} min</strong></div>
          <div><span>Distância</span><strong>${u.distance.toFixed(1)} km</strong></div>
        </div>
        <ul class="services" aria-label="Serviços oferecidos">
          ${u.services.map((s) => `<li>${esc(serviceName(s))}</li>`).join('')}
        </ul>
        <div class="unit-actions">
          <a class="btn btn-secondary btn-small" target="_blank" rel="noopener noreferrer"
             href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${u.name} ${u.address}`)}">Como chegar</a>
          <button type="button" class="btn btn-primary btn-small" data-action="prefill-booking" data-unit-id="${esc(u.id)}">Agendar</button>
        </div>
      </article>`).join('');
  }

  /* ==========================================================
     Agendamento
     ========================================================== */
  let editingId = null;

  const el = {};
  function cacheForm() {
    ['appointmentForm', 'appointmentUnit', 'appointmentService', 'appointmentDoctor', 'appointmentMode',
      'appointmentDate', 'appointmentTime', 'patientName', 'patientDocument', 'patientPhone', 'patientEmail',
      'privacyConsent', 'formMessage', 'appointmentsList', 'submitBtn', 'cancelEdit', 'formTitle'
    ].forEach((id) => { el[id] = document.getElementById(id); });
  }

  /* --- armazenamento --- */
  function getAppointments() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  }
  function saveAppointments(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch (e) { toast('Não foi possível salvar. Verifique se o navegador permite armazenar dados do site.', 'error'); }
  }

  /* --- selects encadeados: unidade > serviço > profissional > horário --- */
  function fillUnits() {
    el.appointmentUnit.innerHTML = UNITS.map((u) => `<option value="${esc(u.id)}">${esc(u.name)} · ${esc(u.region)}</option>`).join('');
  }

  function onUnitChange(keep = {}) {
    const u = unitById(el.appointmentUnit.value) || UNITS[0];
    if (!u) return;
    el.appointmentService.innerHTML = u.services.map((s) => `<option value="${esc(s)}">${esc(serviceName(s))}</option>`).join('');
    if (keep.service && u.services.includes(keep.service)) el.appointmentService.value = keep.service;
    onServiceChange(keep);
  }

  function onServiceChange(keep = {}) {
    const u = unitById(el.appointmentUnit.value);
    const doctors = u?.doctorsByService?.[el.appointmentService.value] || [];
    el.appointmentDoctor.innerHTML = doctors.length
      ? doctors.map((d) => `<option value="${esc(d)}">${esc(d)}</option>`).join('')
      : '<option value="">Nenhum profissional disponível</option>';
    if (keep.doctor && doctors.includes(keep.doctor)) el.appointmentDoctor.value = keep.doctor;
    refreshTimes(keep.time);
  }

  function takenTimes(unitId, doctor, date) {
    return new Set(
      getAppointments()
        .filter((a) => a.id !== editingId && a.unitId === unitId && a.doctor === doctor && a.date === date)
        .map((a) => a.time)
    );
  }

  function refreshTimes(keepTime) {
    const select = el.appointmentTime;
    const date = el.appointmentDate.value;
    const u = unitById(el.appointmentUnit.value);
    const slots = u?.availableTimes?.[el.appointmentService.value] || [];

    if (!date) {
      select.innerHTML = '<option value="">Escolha a data primeiro</option>';
      return;
    }

    const taken = takenTimes(u?.id, el.appointmentDoctor.value, date);
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const isToday = date === todayISO();

    const options = slots.map((t) => {
      const past = isToday && t <= hhmm;
      const busy = taken.has(t);
      const label = busy ? `${t} (ocupado)` : past ? `${t} (já passou)` : t;
      return { t, label, disabled: busy || past };
    });
    const free = options.filter((o) => !o.disabled);

    if (!free.length) {
      select.innerHTML = '<option value="">Sem horários nesta data</option>';
      return;
    }
    select.innerHTML = options.map((o) => `<option value="${esc(o.t)}"${o.disabled ? ' disabled' : ''}>${esc(o.label)}</option>`).join('');
    const wanted = keepTime && free.some((o) => o.t === keepTime) ? keepTime : free[0].t;
    select.value = wanted;
  }

  /* --- validação --- */
  function isValidCPF(value) {
    const d = value.replace(/\D/g, '');
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    const calc = (len) => {
      let sum = 0;
      for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
      const r = (sum * 10) % 11;
      return r === 10 ? 0 : r;
    };
    return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
  }

  function isValidCNS(value) {
    const d = value.replace(/\D/g, '');
    if (!/^\d{15}$/.test(d)) return false;
    if (/^[12]/.test(d)) {
      const pis = d.slice(0, 11);
      let sum = 0;
      for (let i = 0; i < 11; i++) sum += Number(pis[i]) * (15 - i);
      let rest = sum % 11;
      let dv = rest === 0 ? 0 : 11 - rest;
      let result;
      if (dv === 10) {
        sum += 2;
        rest = sum % 11;
        dv = 11 - rest;
        result = `${pis}001${dv}`;
      } else {
        result = `${pis}000${dv}`;
      }
      return result === d;
    }
    if (/^[789]/.test(d)) {
      let sum = 0;
      for (let i = 0; i < 15; i++) sum += Number(d[i]) * (15 - i);
      return sum % 11 === 0;
    }
    return false;
  }

  function maskDocument(value) {
    const d = value.replace(/\D/g, '');
    return d.length === 11 ? `***.***.***-${d.slice(-2)}` : `*** **** **** ${d.slice(-4)}`;
  }

  function validate(data) {
    if (!data.unitId) return { field: 'unitId', message: 'Escolha o hospital ou a UPA.' };
    if (!data.service) return { field: 'service', message: 'Escolha o serviço.' };
    if (!data.doctor) return { field: 'doctor', message: 'Escolha o profissional.' };
    if (!data.mode) return { field: 'mode', message: 'Escolha se o atendimento será presencial ou online.' };
    if (!data.date) return { field: 'date', message: 'Escolha a data.' };
    if (data.date < todayISO()) return { field: 'date', message: 'A data precisa ser hoje ou depois de hoje.' };
    if (!data.time) return { field: 'time', message: 'Escolha um horário disponível.' };
    if (!/^[A-Za-zÀ-ÿ'’ -]{2,}$/.test(data.name) || data.name.trim().split(/\s+/).length < 2) {
      return { field: 'name', message: 'Informe nome e sobrenome, usando apenas letras.' };
    }
    if (!isValidCPF(data.document) && !isValidCNS(data.document)) {
      return { field: 'document', message: 'CPF ou Cartão SUS inválido. Confira os números digitados.' };
    }
    const phoneDigits = data.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      return { field: 'phone', message: 'Informe o telefone com DDD, por exemplo (61) 99999-9999.' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { field: 'email', message: 'Informe um e-mail válido.' };
    }
    if (!data.privacy) return { field: 'privacyConsent', message: 'Para continuar, concorde com o uso dos dados para o agendamento.' };
    return null;
  }

  // problemas de catálogo: unidade, serviço, profissional ou horário que deixaram de existir
  function catalogProblem(a) {
    const u = unitById(a.unitId);
    if (!u) return 'A unidade não está mais disponível.';
    if (!u.services.includes(a.service)) return 'O serviço não está mais disponível nesta unidade.';
    if (!(u.doctorsByService?.[a.service] || []).includes(a.doctor)) return 'O profissional não está mais disponível.';
    if (!(u.availableTimes?.[a.service] || []).includes(a.time)) return 'O horário não está mais disponível.';
    return '';
  }

  function availabilityProblem(a, ignoreId = null) {
    const problem = catalogProblem(a);
    if (problem) return problem;
    const conflict = getAppointments().some((o) => o.id !== ignoreId && o.unitId === a.unitId && o.doctor === a.doctor && o.date === a.date && o.time === a.time);
    return conflict ? 'Este horário já está ocupado. Escolha outro.' : '';
  }

  /* --- mensagens do formulário --- */
  function showFormMessage(text, type) {
    el.formMessage.textContent = text;
    el.formMessage.className = `form-message ${type}`;
  }
  function clearFormMessage() {
    el.formMessage.textContent = '';
    el.formMessage.className = 'form-message';
  }
  function clearInvalid() {
    $$('[aria-invalid="true"]', el.appointmentForm).forEach((n) => n.removeAttribute('aria-invalid'));
  }

  const makeId = () => (window.crypto?.randomUUID ? crypto.randomUUID() : `appt-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const makeProtocol = () => `VS-${Date.now().toString(36).toUpperCase()}`;

  function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const field = (k) => String(fd.get(k) || '').trim();
    const data = {
      unitId: field('unitId'), service: field('service'), doctor: field('doctor'), mode: field('mode'),
      date: field('date'), time: field('time'), name: field('name'), document: field('document'),
      phone: field('phone'), email: field('email'), privacy: !!fd.get('privacyConsent')
    };

    clearInvalid();
    const error = validate(data);
    if (error) {
      showFormMessage(error.message, 'error');
      const target = form.elements[error.field];
      if (target) { target.setAttribute('aria-invalid', 'true'); target.focus(); }
      return;
    }

    const problem = availabilityProblem(data, editingId);
    if (problem) {
      const msg = `${problem} Refaça a escolha antes de confirmar.`;
      showFormMessage(msg, 'warning');
      toast(msg, 'warning');
      refreshTimes();
      return;
    }

    const existing = editingId ? getAppointments().find((a) => a.id === editingId) : null;
    const now = new Date().toISOString();
    const record = {
      id: existing?.id || makeId(),
      protocol: existing?.protocol || makeProtocol(),
      unitId: data.unitId, service: data.service, doctor: data.doctor, mode: data.mode,
      date: data.date, time: data.time, name: data.name,
      documentMasked: maskDocument(data.document), // o número completo não é guardado
      phone: data.phone, email: data.email,
      issue: '', createdAt: existing?.createdAt || now, updatedAt: now
    };

    const others = getAppointments().filter((a) => a.id !== record.id);
    saveAppointments([...others, record]);

    const unit = unitById(record.unitId);
    const wasEditing = !!existing;
    endEditing();
    renderAppointments();

    const base = `${wasEditing ? 'Agendamento alterado' : 'Agendamento registrado'}: ${serviceName(record.service)} em ${unit.name}, ${formatDate(record.date)} às ${record.time}, com ${record.doctor}. Protocolo ${record.protocol}.`;
    showFormMessage(CFG.demoMode ? `${base} Modo demonstração: nenhuma unidade foi avisada.` : base, 'success');
    toast(wasEditing ? 'Agendamento alterado.' : 'Agendamento registrado.', 'success');
  }

  /* --- lista de agendamentos --- */
  function renderAppointments() {
    const list = getAppointments().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    if (!list.length) {
      el.appointmentsList.innerHTML = '<p class="appt-sub">Você ainda não tem agendamentos. Preencha o formulário ao lado para marcar o primeiro.</p>';
      return;
    }
    el.appointmentsList.innerHTML = list.map((a) => {
      const u = unitById(a.unitId);
      const online = a.mode === 'online';
      return `
        <article class="appt${a.issue ? ' has-issue' : ''}">
          <div class="appt-top">
            <div>
              <h3>${esc(u ? u.name : 'Unidade indisponível')}</h3>
              <p class="appt-sub">${esc(serviceName(a.service))} · ${esc(a.doctor)}</p>
            </div>
            <span class="pill ${online ? 'online' : 'presencial'}">${online ? 'Online' : 'Presencial'}</span>
          </div>
          <dl class="appt-meta">
            <dt>Data</dt><dd>${esc(formatDate(a.date))}</dd>
            <dt>Horário</dt><dd>${esc(a.time)}</dd>
            <dt>Paciente</dt><dd>${esc(a.name)}</dd>
            <dt>Documento</dt><dd>${esc(a.documentMasked || '')}</dd>
            <dt>Protocolo</dt><dd>${esc(a.protocol || '')}</dd>
          </dl>
          ${a.issue ? `<p class="appt-alert" role="alert">${esc(a.issue)} Toque em Remarcar para escolher outra opção.</p>` : ''}
          <div class="appt-actions">
            <button type="button" class="btn btn-secondary btn-small" data-action="reschedule" data-id="${esc(a.id)}">Remarcar</button>
            <button type="button" class="btn btn-danger btn-small" data-action="cancel" data-id="${esc(a.id)}">Cancelar</button>
          </div>
        </article>`;
    }).join('');
  }

  /* --- remarcar / cancelar --- */
  function startEditing(id) {
    const a = getAppointments().find((x) => x.id === id);
    if (!a) return;
    editingId = id;
    el.appointmentUnit.value = unitById(a.unitId) ? a.unitId : UNITS[0].id;
    onUnitChange({ service: a.service, doctor: a.doctor });
    el.appointmentMode.value = a.mode;
    el.appointmentDate.value = a.date >= todayISO() ? a.date : '';
    refreshTimes(a.time);
    el.patientName.value = a.name;
    el.patientDocument.value = '';
    el.patientPhone.value = a.phone;
    el.patientEmail.value = a.email;
    el.privacyConsent.checked = false;
    el.submitBtn.textContent = 'Salvar alteração';
    el.cancelEdit.hidden = false;
    el.formTitle.textContent = 'Você está alterando um agendamento. Por segurança, digite o CPF ou Cartão SUS novamente.';
    clearFormMessage();
    scrollToBooking();
    toast('Altere o que precisar e salve.', 'info');
  }

  function endEditing() {
    editingId = null;
    el.appointmentForm.reset();
    clearInvalid();
    el.appointmentDate.min = todayISO();
    fillUnits();
    onUnitChange();
    el.submitBtn.textContent = 'Confirmar agendamento';
    el.cancelEdit.hidden = true;
    el.formTitle.textContent = 'Preencha os dados abaixo. Os horários ocupados aparecem desativados.';
  }

  function cancelAppointment(id) {
    const a = getAppointments().find((x) => x.id === id);
    if (!a) return;
    const u = unitById(a.unitId);
    if (!window.confirm(`Cancelar o agendamento de ${serviceName(a.service)} em ${u ? u.name : 'unidade'} no dia ${formatDate(a.date)} às ${a.time}?`)) return;
    saveAppointments(getAppointments().filter((x) => x.id !== id));
    if (editingId === id) endEditing();
    renderAppointments();
    toast('Agendamento cancelado.', 'info');
  }

  function scrollToBooking() {
    $('#agendar')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function prefillBooking({ unitId, service }) {
    if (editingId) endEditing();
    let u = unitId ? unitById(unitId) : UNITS.find((x) => x.services.includes(service));
    if (!u) u = UNITS[0];
    el.appointmentUnit.value = u.id;
    onUnitChange({ service: service && u.services.includes(service) ? service : undefined });
    scrollToBooking();
    setTimeout(() => el.appointmentDate.focus({ preventScroll: true }), 500);
  }

  /* --- aviso de indisponibilidade depois da marcação --- */
  function recheckAppointments(silent = false) {
    const list = getAppointments();
    let newIssues = 0;
    list.forEach((a) => {
      const issue = catalogProblem(a);
      if (issue && !a.issue) newIssues += 1;
      a.issue = issue;
    });
    saveAppointments(list);
    renderAppointments();
    if (newIssues && !silent) {
      toast(`Atenção: ${newIssues === 1 ? 'um agendamento ficou indisponível' : `${newIssues} agendamentos ficaram indisponíveis`}. Refaça a marcação em Meus agendamentos.`, 'warning');
    }
  }

  function initBooking() {
    cacheForm();
    if (!el.appointmentForm) return;
    fillUnits();
    el.appointmentDate.min = todayISO();
    onUnitChange();

    el.appointmentUnit.addEventListener('change', () => onUnitChange());
    el.appointmentService.addEventListener('change', () => onServiceChange());
    el.appointmentDoctor.addEventListener('change', () => refreshTimes());
    el.appointmentDate.addEventListener('change', () => refreshTimes());
    el.appointmentForm.addEventListener('submit', onSubmit);
    el.cancelEdit.addEventListener('click', () => { endEditing(); clearFormMessage(); });
    el.appointmentForm.addEventListener('input', (e) => e.target.removeAttribute?.('aria-invalid'));

    renderAppointments();
    recheckAppointments();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) recheckAppointments(); });
    setInterval(() => recheckAppointments(), 5 * 60 * 1000);
  }

  /* ==========================================================
     Eventos globais e início
     ========================================================== */
  function initActions() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-action]');
      if (!trigger) return;
      const { action } = trigger.dataset;

      if (action === 'prefill-booking') {
        e.preventDefault();
        prefillBooking({ unitId: trigger.dataset.unitId, service: trigger.dataset.service });
      } else if (action === 'cancel') {
        cancelAppointment(trigger.dataset.id);
      } else if (action === 'reschedule') {
        startEditing(trigger.dataset.id);
      } else if (action === 'clear-filters') {
        clearFilters();
      }
    });
  }

  function init() {
    if (CFG.demoMode) $('#demoBanner')?.removeAttribute('hidden');
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();

    initNav();
    initCarousel();
    initUnits();
    initBooking();
    initActions();
  }

  window.viaSaude = { recheckAppointments };
  document.addEventListener('DOMContentLoaded', init);
})();
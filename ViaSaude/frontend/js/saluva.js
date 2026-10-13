
(() => {
  'use strict';

  const CFG = window.viaSaudeConfig || {};
  const KEY = 'viaSaudeChat.v2';
  const MAX_SAVED = 40;
  const WELCOME = {
    role: 'ai',
    text: 'Olá! Eu sou a Saluva, assistente do Via Saúde. Posso ajudar a achar uma unidade, comparar filas e explicar como marcar consulta ou exame.\n\nNão faço diagnóstico nem indico tratamento. Em emergência, ligue 192.'
  };

  const views = [];
  let messages = load();
  let busy = false;
  let uid = 0;

  /* ---------- armazenamento ---------- */
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(saved) && saved.length) {
        return saved.filter((m) => m && (m.role === 'user' || m.role === 'ai') && typeof m.text === 'string');
      }
    } catch (e) { /* ignora */ }
    return [WELCOME];
  }

  function save() {
    messages = messages.slice(-MAX_SAVED);
    try { localStorage.setItem(KEY, JSON.stringify(messages)); } catch (e) { /* ignora */ }
  }

  /* ---------- textos auxiliares ---------- */
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const units = () => window.viaSaudeUnits || [];
  const services = () => window.viaSaudeServices || {};
  const demoNote = () => (CFG.demoMode ? '\n\n(Aviso: as filas e unidades deste site são dados de demonstração.)' : '');
  const statusText = { verde: 'lotação baixa', amarelo: 'lotação média', vermelho: 'lotação alta' };
  const line = (u) => `• ${u.name} (${u.region}): fila de cerca de ${u.queueMinutes} min, ${statusText[u.status]}, a ${u.distance.toFixed(1)} km`;

  const SERVICE_ALIASES = {
    pediatria: ['pediatr', 'crianca', 'bebe', 'filho', 'filha'],
    cardiologia: ['cardio', 'coracao'],
    ginecologia: ['gineco'],
    ultrassom: ['ultrassom', 'ultrasson', 'ultra som', 'exame de imagem'],
    vacina: ['vacin'],
    'consulta-geral': ['clinica geral', 'consulta geral', 'clinico geral', 'medico geral']
  };

  /* ---------- segurança: emergência e diagnóstico ---------- */
  function urgentReply(t) {
    if (/suicid|me matar|tirar minha vida|quero morrer|automutil|me machucar/.test(t)) {
      return 'Sinto muito que você esteja passando por isso. Você não precisa enfrentar isso sozinho(a).\n\nLigue agora para o CVV no 188 (gratuito, 24 horas). Se houver risco imediato, ligue 192 (SAMU) ou vá à UPA mais próxima.';
    }
    if (/dor no peito|falta de ar|dificuldade (para|de) respirar|desmai|convuls|sangramento (forte|intenso)|\bavc\b|derrame|infarto|engasg|inconsciente|nao acorda|queimadura grave|overdose|envenen/.test(t)) {
      return 'Isso pode ser uma emergência. Ligue agora para o SAMU no 192 ou vá imediatamente à UPA ou ao pronto-socorro mais próximo. Não espere para marcar consulta.\n\nA Saluva não faz diagnóstico e não define prioridade de atendimento.';
    }
    return '';
  }

  function medicalReply(t) {
    if (/o que eu tenho|diagnostic|sintoma|remedio|medicamento|dose|posso tomar|receita|e grave\??$/.test(t)) {
      return 'Não posso diagnosticar nem indicar medicamentos. Para avaliar o que você está sentindo, procure uma UBS ou UPA, ou agende uma consulta aqui no site. Se piorar ou houver risco, ligue 192.';
    }
    return '';
  }

  /* ---------- respostas locais ---------- */
  function localReply(message) {
    const t = norm(message);
    if (!t.trim()) return 'Pode me dizer o que você precisa? Posso orientar sobre fila, unidades ou agendamento.';

    const urgent = urgentReply(t);
    if (urgent) return urgent;
    const medical = medicalReply(t);
    if (medical) return medical;

    const list = units();

    if (/menor fila|mais rapido|menos fila|fila menor|menos cheia|menos lotad/.test(t)) {
      const top = [...list].sort((a, b) => a.queueMinutes - b.queueMinutes).slice(0, 3);
      return `As unidades com menor fila agora são:\n${top.map(line).join('\n')}${demoNote()}`;
    }

    if (/mais perto|mais proxim|perto de mim|proxima/.test(t)) {
      const top = [...list].sort((a, b) => a.distance - b.distance).slice(0, 3);
      return `As unidades mais próximas são:\n${top.map(line).join('\n')}${demoNote()}`;
    }

    for (const [key, words] of Object.entries(SERVICE_ALIASES)) {
      if (words.some((w) => t.includes(w))) {
        const found = list.filter((u) => u.services.includes(key)).sort((a, b) => a.queueMinutes - b.queueMinutes).slice(0, 3);
        if (found.length) {
          return `${services()[key] || key} está disponível em:\n${found.map(line).join('\n')}\n\nPara marcar, vá até a seção Agendar e escolha o serviço.${demoNote()}`;
        }
      }
    }

    if (/remarcar|cancelar|mudar (a )?(data|horario)/.test(t)) {
      return 'Em Meus agendamentos (seção Agendar), use os botões Remarcar ou Cancelar no agendamento desejado.';
    }

    if (/marcar|agendar|consulta|exame/.test(t)) {
      return 'Para marcar: 1) escolha a unidade, o serviço e o profissional; 2) selecione modalidade, data e horário; 3) preencha seus dados e confirme. Os horários ocupados aparecem desativados.';
    }

    if (/documento|levar|cartao sus|carteira/.test(t)) {
      return 'Leve um documento oficial com foto e o Cartão SUS. Se tiver, leve também receitas, exames anteriores e a carteira de vacinação.';
    }

    if (/fila|espera|lotacao|cheio|cores?|verde|amarelo|vermelho/.test(t)) {
      return 'A cor mostra a lotação informada pela unidade: verde é baixa, amarelo é média e vermelho é alta. Ela não é classificação de risco: a prioridade de atendimento é definida pela equipe de saúde.';
    }

    if (/como chegar|rota|endereco|mapa|localizar|onde fica/.test(t)) {
      return 'Em cada unidade, toque em Como chegar para abrir a rota no Google Maps.';
    }

    if (/cpf|dados|privacidade|lgpd|seguranca/.test(t)) {
      return 'Os dados do agendamento ficam salvos apenas no seu navegador. O documento aparece mascarado na lista e tudo é apagado quando você cancela o agendamento ou limpa os dados do site.';
    }

    if (/^(oi|ola|bom dia|boa tarde|boa noite|ajuda|quem e voce|o que voce faz)/.test(t) || /saluva|como funciona/.test(t)) {
      return 'Eu ajudo a usar o Via Saúde: achar unidades, comparar filas, marcar consulta ou exame e entender as informações do site. O que você precisa?';
    }

    return 'Posso ajudar a achar uma unidade, comparar filas, mostrar onde há um serviço (como pediatria ou vacina) e explicar como agendar. Se for urgente, ligue 192.';
  }

  function buildContext() {
    return units()
      .map((u) => `${u.name} (${u.type}, ${u.region}): ${u.services.map((s) => services()[s] || s).join(', ')}; fila ~${u.queueMinutes} min; ${statusText[u.status]}; ${u.distance} km`)
      .join('\n')
      .slice(0, 3800);
  }

  /* ---------- API pública: askSaluva ---------- */
  async function askSaluva(message, history = []) {
    const t = norm(message);
    const safe = urgentReply(t) || medicalReply(t);
    if (safe) return safe; // nunca depende da IA

    if (CFG.saluvaEndpoint) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
      try {
        const res = await fetch(CFG.saluvaEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history.slice(-12).map((m) => ({ role: m.role, text: m.text })),
            context: buildContext(),
            demo: !!CFG.demoMode
          }),
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data && typeof data.reply === 'string' && data.reply.trim()) return data.reply.trim();
        throw new Error('resposta vazia');
      } catch (err) {
        console.warn('Saluva: IA indisponível, usando respostas locais.', err);
      } finally {
        clearTimeout(timer);
      }
    }
    return localReply(message);
  }

  /* ---------- interface ---------- */
  function mount(root) {
    const id = `saluva-input-${++uid}`;
    const log = document.createElement('div');
    log.className = 'chat-log';
    log.setAttribute('role', 'log');
    log.setAttribute('aria-live', 'polite');
    log.setAttribute('aria-label', 'Conversa com a Saluva');
    log.tabIndex = 0;

    const typing = document.createElement('p');
    typing.className = 'chat-typing';
    typing.hidden = true;
    typing.textContent = 'Saluva está digitando…';

    const form = document.createElement('form');
    form.className = 'chat-form';
    form.autocomplete = 'off';
    form.innerHTML = `
      <label class="sr-only" for="${id}">Mensagem para a Saluva</label>
      <input type="text" id="${id}" maxlength="500" placeholder="Digite sua pergunta" />
      <button type="submit" class="btn btn-primary btn-small">Enviar</button>`;

    const foot = document.createElement('div');
    foot.className = 'chat-foot';
    foot.innerHTML = '<button type="button" class="chat-clear">Limpar conversa</button>';

    root.append(log, typing, form, foot);

    const view = { root, log, typing, input: form.querySelector('input'), button: form.querySelector('button') };
    views.push(view);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = view.input.value.trim();
      if (!text) return;
      view.input.value = '';
      send(text);
    });

    foot.querySelector('.chat-clear').addEventListener('click', clearChat);
    return view;
  }

  function renderAll() {
    views.forEach((v) => {
      v.log.replaceChildren(
        ...messages.map((m) => {
          const b = document.createElement('div');
          b.className = `bubble ${m.role === 'user' ? 'user' : 'ai'}`;
          b.textContent = m.text; // textContent evita injeção de HTML
          return b;
        })
      );
      v.log.scrollTop = v.log.scrollHeight;
    });
  }

  function setBusy(state) {
    busy = state;
    views.forEach((v) => {
      v.typing.hidden = !state;
      v.button.disabled = state;
    });
  }

  async function send(text) {
    const content = String(text || '').trim().slice(0, 500);
    if (!content || busy) return;
    messages.push({ role: 'user', text: content });
    save();
    renderAll();
    setBusy(true);
    try {
      const reply = await askSaluva(content, messages);
      messages.push({ role: 'ai', text: reply });
    } catch (e) {
      messages.push({ role: 'ai', text: 'Tive um problema para responder agora. Tente de novo ou ligue 192 se for urgente.' });
    }
    save();
    setBusy(false);
    renderAll();
  }

  function clearChat() {
    messages = [{ role: 'ai', text: 'Conversa limpa. Em que posso ajudar?' }];
    save();
    renderAll();
  }

  /* ---------- widget flutuante ---------- */
  const widget = () => document.getElementById('chatWidget');

  function openWidget(open = true) {
    const w = widget();
    const fab = document.getElementById('openSaluva');
    const label = document.getElementById('fabLabel');
    if (!w) return;
    w.hidden = !open;
    if (fab) fab.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Fechar' : 'Saluva';
    if (open) {
      renderAll();
      const view = views.find((v) => v.root === w);
      view?.input.focus();
    }
  }

  function init() {
    document.querySelectorAll('[data-saluva]').forEach(mount);
    renderAll();

    document.getElementById('openSaluva')?.addEventListener('click', () => openWidget(widget()?.hidden));
    document.getElementById('closeChat')?.addEventListener('click', () => {
      openWidget(false);
      document.getElementById('openSaluva')?.focus();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && widget() && !widget().hidden) openWidget(false);
    });

    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-saluva-open]');
      if (opener) {
        openWidget(true);
        return;
      }
      const prompt = e.target.closest('[data-saluva-prompt]');
      if (prompt) {
        if (!prompt.closest('#saluva')) openWidget(true);
        send(prompt.dataset.saluvaPrompt);
      }
    });
  }

  window.askSaluva = askSaluva;
  window.Saluva = { open: () => openWidget(true), close: () => openWidget(false), send };
  document.addEventListener('DOMContentLoaded', init);
})();   
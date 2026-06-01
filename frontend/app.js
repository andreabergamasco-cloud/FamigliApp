const API = 'https://genuine-rejoicing-production-751d.up.railway.app/api';

// --- DATA ---
async function getScadenze() {
    const idFamiglia = localStorage.getItem('idFamiglia');
    const idUtente = localStorage.getItem('idUtente');
    return (await fetch(`${API}/scadenze?idFamiglia=${idFamiglia}&idUtente=${idUtente}`)).json();
}

async function getSpese() {
    const idFamiglia = localStorage.getItem('idFamiglia');
    const idUtente = localStorage.getItem('idUtente');
    return (await fetch(`${API}/spese?idFamiglia=${idFamiglia}&idUtente=${idUtente}`)).json();
}
async function getAnimali() {
    const idFamiglia = localStorage.getItem('idFamiglia');
    return (await fetch(`${API}/animali?idFamiglia=${idFamiglia}`)).json();
}

async function creaScadenza(data) {
    const idFamiglia = parseInt(localStorage.getItem('idFamiglia'));
    const idUtente = parseInt(localStorage.getItem('idUtente'));
    await fetch(`${API}/scadenze`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ ...data, idFamiglia, idUtente })
    });
}

async function creaSpesa(data) {
    const idFamiglia = parseInt(localStorage.getItem('idFamiglia'));
    const idUtente = parseInt(localStorage.getItem('idUtente'));
    await fetch(`${API}/spese`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ ...data, idFamiglia, idUtente })
    });
}
async function creaAnimale(data) {
    const idFamiglia = parseInt(localStorage.getItem('idFamiglia'));
    const idUtente = parseInt(localStorage.getItem('idUtente'));
    await fetch(`${API}/animali`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ ...data, idFamiglia, idUtente })
    });
}
async function eliminaScadenza(id) {
  await fetch(`${API}/scadenze/${id}`, { method: 'DELETE' });
}
async function eliminaSpesa(id) {
  await fetch(`${API}/spese/${id}`, { method: 'DELETE' });
}
async function eliminaAnimale(id) {
  await fetch(`${API}/animali/${id}`, { method: 'DELETE' });
}

// --- UTILS ---
function giorniAllaScadenza(data) {
  const oggi = new Date(); oggi.setHours(0,0,0,0);
  const d = new Date(data); d.setHours(0,0,0,0);
  return Math.round((d - oggi) / 86400000);
}

function badgeScadenza(giorni) {
  if (giorni < 0) return { cls: 'badge-red', testo: 'Scaduta' };
  if (giorni === 0) return { cls: 'badge-red', testo: 'Oggi' };
  if (giorni <= 7) return { cls: 'badge-amber', testo: `${giorni} giorni` };
  if (giorni <= 30) return { cls: 'badge-blue', testo: `${giorni} giorni` };
  return { cls: 'badge-green', testo: `${giorni} giorni` };
}

function dotClass(giorni) {
  if (giorni <= 0) return 'dot-red';
  if (giorni <= 7) return 'dot-amber';
  if (giorni <= 30) return 'dot-blue';
  return 'dot-green';
}

function iconaAnimale(specie) {
  if (specie === 'cane') return '🐶';
  if (specie === 'gatto') return '🐱';
  return '🐾';
}

function formattaData(d) {
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

// --- RENDER ---
async function renderDashboard() {
  const [scadenze, spese, appuntamenti] = await Promise.all([
    getScadenze(), getSpese(), getAppuntamenti()
  ]);

  // --- Scadenze imminenti ---
  const prossime = scadenze
    .filter(s => !s.completata)
    .map(s => ({ ...s, giorni: giorniAllaScadenza(s.dataScadenza) }))
    .sort((a, b) => a.giorni - b.giorni)
    .slice(0, 6);

  const el = document.getElementById('lista-scadenze-dashboard');
  if (prossime.length === 0) {
    el.innerHTML = '<p class="empty">Nessuna scadenza imminente</p>';
  } else {
    el.innerHTML = prossime.map(s => {
      const b = badgeScadenza(s.giorni);
      return `<div class="card">
        <div class="scadenza-row">
          <span class="dot ${dotClass(s.giorni)}"></span>
          <span class="scad-label">${s.titolo}<small>${s.categoria}</small></span>
          <span class="badge ${b.cls}">${b.testo}</span>
        </div>
      </div>`;
    }).join('');
  }

  // --- Statistiche spese ---
  const mese = new Date().getMonth();
  const anno = new Date().getFullYear();
  const speseDelMese = spese.filter(s => {
    const d = new Date(s.data);
    return d.getMonth() === mese && d.getFullYear() === anno;
  });

  const totale = speseDelMese.reduce((acc, s) => acc + s.importo, 0);
  const bollette = speseDelMese.filter(s => s.categoria === 'bolletta').reduce((acc, s) => acc + s.importo, 0);
  const manutenzioni = speseDelMese.filter(s => s.categoria === 'manutenzione').reduce((acc, s) => acc + s.importo, 0);
  const animaliSpese = speseDelMese.filter(s => s.categoria === 'animale').reduce((acc, s) => acc + s.importo, 0);

  document.getElementById('stats-spese').innerHTML = `
    <div class="stat-card"><p class="label">Totale mese</p><p class="valore">€ ${totale.toFixed(2)}</p></div>
    <div class="stat-card"><p class="label">Bollette</p><p class="valore">€ ${bollette.toFixed(2)}</p></div>
    <div class="stat-card"><p class="label">Manutenzioni</p><p class="valore">€ ${manutenzioni.toFixed(2)}</p></div>
    <div class="stat-card"><p class="label">Animali</p><p class="valore">€ ${animaliSpese.toFixed(2)}</p></div>
  `;

  // --- Grafico ---
  renderGrafico(speseDelMese);

  // --- Prossimi 7 giorni ---
  const oggi = new Date(); oggi.setHours(0,0,0,0);
  const tra7 = new Date(oggi); tra7.setDate(oggi.getDate() + 7);

  const mesiBrevi = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

  const prossimi7 = [
    ...scadenze.filter(s => {
      const d = new Date(s.dataScadenza); d.setHours(0,0,0,0);
      return d >= oggi && d <= tra7 && !s.completata;
    }).map(s => ({ titolo: s.titolo, data: new Date(s.dataScadenza), tipo: 'scadenza', sub: s.categoria })),
    ...appuntamenti.filter(a => {
      const d = new Date(a.data); d.setHours(0,0,0,0);
      return d >= oggi && d <= tra7;
    }).map(a => ({ titolo: a.titolo, data: new Date(a.data), tipo: 'appuntamento', sub: a.ora ? `ore ${a.ora}` : a.tipo })),
    ...spese.filter(s => {
      const d = new Date(s.data); d.setHours(0,0,0,0);
      return d >= oggi && d <= tra7;
    }).map(s => ({ titolo: s.titolo, data: new Date(s.data), tipo: 'spesa', sub: `€ ${s.importo?.toFixed(2)}` }))
  ].sort((a, b) => a.data - b.data);

  const coloriTipo = {
    scadenza: 'cal-evento-scadenza',
    appuntamento: 'cal-evento-appuntamento',
    spesa: 'cal-evento-spesa'
  };
  const etichetteTipo = { scadenza: 'Scadenza', appuntamento: 'Appuntamento', spesa: 'Spesa' };

  const elProssimi = document.getElementById('lista-prossimi-7');
  if (prossimi7.length === 0) {
    elProssimi.innerHTML = '<p class="empty" style="padding:1rem">Nessun evento nei prossimi 7 giorni</p>';
  } else {
    elProssimi.innerHTML = prossimi7.map(e => `
      <div class="prossimi-item">
        <div class="prossimi-data">
          <span class="giorno">${e.data.getDate()}</span>
          <span class="mese">${mesiBrevi[e.data.getMonth()]}</span>
        </div>
        <div class="prossimi-info">
          <p>${e.titolo}</p>
          <small>${e.sub}</small>
        </div>
        <span class="prossimi-tipo ${coloriTipo[e.tipo]}">${etichetteTipo[e.tipo]}</span>
      </div>`).join('');
  }
}

async function renderScadenze() {
  const scadenze = await getScadenze();
  const el = document.getElementById('lista-scadenze-completa');
  if (scadenze.length === 0) { el.innerHTML = '<p class="empty">Nessuna scadenza</p>'; return; }
  el.innerHTML = scadenze.map(s => {
    const giorni = giorniAllaScadenza(s.dataScadenza);
    const b = badgeScadenza(giorni);
    return `<div class="card">
      <div class="scadenza-row">
        <span class="dot ${dotClass(giorni)}"></span>
        <span class="scad-label">${s.titolo}<small>${formattaData(s.dataScadenza)} · ${s.categoria}</small></span>
        <span class="badge ${b.cls}">${b.testo}</span>
        <button class="btn-icon" onclick="elimina('scadenza',${s.id})">🗑</button>
      </div>
    </div>`;
  }).join('');
}

async function renderSpese() {
  const spese = await getSpese();
  const el = document.getElementById('lista-spese');
  if (spese.length === 0) { el.innerHTML = '<p class="empty">Nessuna spesa registrata</p>'; return; }
  el.innerHTML = spese.map(s => `
    <div class="card">
      <div class="scadenza-row">
        <span class="scad-label">${s.titolo}<small>${formattaData(s.data)} · ${s.categoria}</small></span>
        <strong>€ ${s.importo.toFixed(2)}</strong>
        <button class="btn-icon" onclick="elimina('spesa',${s.id})">🗑</button>
      </div>
    </div>`).join('');
}

async function renderAnimali() {
  const animali = await getAnimali();
  const el = document.getElementById('lista-animali');
  if (animali.length === 0) { el.innerHTML = '<p class="empty">Nessun animale aggiunto</p>'; return; }
  el.innerHTML = animali.map(a => `
    <div class="card">
      <div class="animale-card">
        <div class="animale-avatar">${iconaAnimale(a.specie)}</div>
        <div class="animale-info">
          <p>${a.nome}</p>
          <small>${a.specie}${a.razza ? ' · ' + a.razza : ''}${a.dataNascita ? ' · ' + formattaData(a.dataNascita) : ''}</small>
        </div>
        <button class="btn-icon" onclick="elimina('animale',${a.id})">🗑</button>
      </div>
    </div>`).join('');
}

// --- NAVIGAZIONE ---
function mostraSezione(nome) {
  document.querySelectorAll('.sezione').forEach(s => s.classList.add('nascosta'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(nome).classList.remove('nascosta');
  event.target.classList.add('active');
  if (nome === 'dashboard') renderDashboard();
  if (nome === 'scadenze') renderScadenze();
  if (nome === 'spese') renderSpese();
  if (nome === 'animali') renderAnimali();
  if (nome === 'calendario') renderCalendario();
}

// --- MODAL ---
function apriModal(tipo) {
  document.getElementById('modal-overlay').classList.remove('nascosta');
  const titoli = { scadenza: 'Nuova scadenza', spesa: 'Nuova spesa', animale: 'Nuovo animale' };
  document.getElementById('modal-titolo').textContent = titoli[tipo];
  document.getElementById('modal-body').innerHTML = formModal(tipo);
}

function chiudiModal() {
  document.getElementById('modal-overlay').classList.add('nascosta');
}

function formModal(tipo) {
  if (tipo === 'scadenza') return `
    <div class="form-group"><label>Titolo</label><input id="f-titolo" type="text" placeholder="Es. Bolletta luce"></div>
    <div class="form-group"><label>Data scadenza</label><input id="f-data" type="date"></div>
    <div class="form-group"><label>Categoria</label>
      <select id="f-categoria">
        <option value="bolletta">Bolletta</option>
        <option value="manutenzione">Manutenzione</option>
        <option value="assicurazione">Assicurazione</option>
        <option value="animale">Animale</option>
        <option value="altro">Altro</option>
      </select></div>
    <div class="form-group"><label>Note</label><textarea id="f-note" placeholder="Opzionale"></textarea></div>
    <div class="form-group" style="display:flex;align-items:center;justify-content:space-between;padding:8px 0">
      <label style="margin:0">Visibile solo a me</label>
      <input type="checkbox" id="f-privata" style="width:auto;cursor:pointer;width:18px;height:18px">
    </div>
    <button class="btn-submit" onclick="salva('scadenza')">Salva</button>`;

  if (tipo === 'spesa') return `
    <div class="form-group"><label>Titolo</label><input id="f-titolo" type="text" placeholder="Es. Bolletta gas"></div>
    <div class="form-group"><label>Importo (€)</label><input id="f-importo" type="number" step="0.01" placeholder="0.00"></div>
    <div class="form-group"><label>Data</label><input id="f-data" type="date"></div>
    <div class="form-group"><label>Categoria</label>
      <select id="f-categoria">
        <option value="bolletta">Bolletta</option>
        <option value="manutenzione">Manutenzione</option>
        <option value="animale">Animale</option>
        <option value="altro">Altro</option>
      </select></div>
    <div class="form-group"><label>Note</label><textarea id="f-note" placeholder="Opzionale"></textarea></div>
    <div class="form-group" style="display:flex;align-items:center;justify-content:space-between;padding:8px 0">
      <label style="margin:0">Visibile solo a me</label>
      <input type="checkbox" id="f-privata" style="width:auto;cursor:pointer;width:18px;height:18px">
    </div>
    <button class="btn-submit" onclick="salva('spesa')">Salva</button>`;

  if (tipo === 'animale') return `
    <div class="form-group"><label>Nome</label><input id="f-nome" type="text" placeholder="Es. Luna"></div>
    <div class="form-group"><label>Specie</label>
      <select id="f-specie">
        <option value="cane">Cane</option>
        <option value="gatto">Gatto</option>
        <option value="altro">Altro</option>
      </select></div>
    <div class="form-group"><label>Razza</label><input id="f-razza" type="text" placeholder="Opzionale"></div>
    <div class="form-group"><label>Data di nascita</label><input id="f-nascita" type="date"></div>
    <button class="btn-submit" onclick="salva('animale')">Salva</button>`;

  if (tipo === 'appuntamento') return `
    <div class="form-group"><label>Titolo</label><input id="f-titolo" type="text" placeholder="Es. Visita veterinaria Luna"></div>
    <div class="form-group"><label>Data</label><input id="f-data" type="date"></div>
    <div class="form-group"><label>Ora</label><input id="f-ora" type="time"></div>
    <div class="form-group"><label>Tipo</label>
      <select id="f-tipo-app">
        <option value="generico">Generico</option>
        <option value="veterinario">Veterinario</option>
        <option value="medico">Medico</option>
        <option value="scuola">Scuola</option>
        <option value="lavoro">Lavoro</option>
      </select></div>
    <div class="form-group"><label>Note</label><textarea id="f-note" placeholder="Opzionale"></textarea></div>
    <div class="form-group" style="display:flex;align-items:center;justify-content:space-between;padding:8px 0">
      <label style="margin:0">Visibile solo a me</label>
      <input type="checkbox" id="f-privata" style="width:auto;cursor:pointer;width:18px;height:18px">
    </div>
    <button class="btn-submit" onclick="salva('appuntamento')">Salva</button>`;
}

async function salva(tipo) {
  if (tipo === 'scadenza') {
    const titolo = document.getElementById('f-titolo').value.trim();
    const data = document.getElementById('f-data').value;
    if (!titolo || !data) return alert('Titolo e data sono obbligatori');
    await creaScadenza({
      titolo, dataScadenza: new Date(data).toISOString(),
      categoria: document.getElementById('f-categoria').value,
      descrizione: document.getElementById('f-note').value,
      completata: false, ricorrente: false,
      privata: document.getElementById('f-privata').checked
    });
    chiudiModal(); renderDashboard(); renderScadenze();
  }

  if (tipo === 'spesa') {
    const titolo = document.getElementById('f-titolo').value.trim();
    const importo = parseFloat(document.getElementById('f-importo').value);
    const data = document.getElementById('f-data').value;
    if (!titolo || !importo || !data) return alert('Tutti i campi sono obbligatori');
    await creaSpesa({
      titolo, importo, data: new Date(data).toISOString(),
      categoria: document.getElementById('f-categoria').value,
      note: document.getElementById('f-note').value,
      privata: document.getElementById('f-privata').checked
    });
    chiudiModal(); renderSpese(); renderDashboard();
  }

  if (tipo === 'animale') {
    const nome = document.getElementById('f-nome').value.trim();
    if (!nome) return alert('Il nome è obbligatorio');
    const nascita = document.getElementById('f-nascita').value;
    await creaAnimale({
      nome, specie: document.getElementById('f-specie').value,
      razza: document.getElementById('f-razza').value || null,
      dataNascita: nascita ? new Date(nascita).toISOString() : null
    });
    chiudiModal(); renderAnimali();
  }

  if (tipo === 'appuntamento') {
    const titolo = document.getElementById('f-titolo').value.trim();
    const data = document.getElementById('f-data').value;
    if (!titolo || !data) return Swal.fire({ icon: 'warning', title: 'Attenzione', text: 'Titolo e data sono obbligatori' });
    await creaAppuntamento({
        titolo,
        data: new Date(data).toISOString(),
        ora: document.getElementById('f-ora').value,
        tipo: document.getElementById('f-tipo-app').value,
        descrizione: document.getElementById('f-note').value,
        privato: document.getElementById('f-privata').checked,
        colore: '#a78bfa'
    });
    chiudiModal();
    renderCalendario();
}
}

let chartInstance = null;

function renderGrafico(spese) {
  const categorie = ['bolletta', 'manutenzione', 'animale', 'altro'];
  const etichette = ['Bollette', 'Manutenzioni', 'Animali', 'Altro'];
  const colori = ['#378ADD', '#4ade80', '#f59e0b', '#9aa4b2'];

  const valori = categorie.map(cat =>
    spese.filter(s => s.categoria === cat).reduce((acc, s) => acc + s.importo, 0)
  );

  const totale = valori.reduce((a, b) => a + b, 0);

  // Distruggi il grafico precedente se esiste
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

  if (totale === 0) {
    document.querySelector('.chart-wrapper').style.display = 'none';
    return;
  }

  document.querySelector('.chart-wrapper').style.display = 'flex';

  const ctx = document.getElementById('chart-categorie').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: etichette,
      datasets: [{
        data: valori,
        backgroundColor: colori,
        borderColor: '#171a21',
        borderWidth: 3,
        hoverOffset: 6
      }]
    },
    options: {
      cutout: '70%',
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      animation: { animateRotate: true, duration: 600 }
    }
  });

  // Legenda custom
  document.getElementById('chart-legenda').innerHTML = etichette.map((label, i) => {
    if (valori[i] === 0) return '';
    const perc = ((valori[i] / totale) * 100).toFixed(1);
    return `<div class="legenda-item">
      <span class="legenda-dot" style="background:${colori[i]}"></span>
      <span class="legenda-label">${label}</span>
      <span class="legenda-valore">€ ${valori[i].toFixed(2)}</span>
      <span style="font-size:12px;color:var(--text-muted)">${perc}%</span>
    </div>`;
  }).join('');
}

async function elimina(tipo, id) {
  const result = await Swal.fire({
    title: 'Sei sicuro?',
    text: 'Questa operazione non può essere annullata.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sì, elimina',
    cancelButtonText: 'Annulla',
  });
  if (!result.isConfirmed) return;
  if (tipo === 'scadenza') { await eliminaScadenza(id); renderScadenze(); renderDashboard(); }
  if (tipo === 'spesa') { await eliminaSpesa(id); renderSpese(); renderDashboard(); }
  if (tipo === 'animale') { await eliminaAnimale(id); renderAnimali(); }
  Swal.fire({ title: 'Eliminato!', icon: 'success', timer: 1500, showConfirmButton: false });
}

async function uploadFoto(input) {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);

    const idUtente = localStorage.getItem('idUtente');
    const res = await fetch(`http://localhost:5271/api/auth/upload-foto/${idUtente}`, {
        method: 'POST',
        body: formData
    });

    if (res.ok) {
        const data = await res.json();
        localStorage.setItem('fotoProfilo', data.url);
        document.getElementById('avatar-img').src = 'http://localhost:5271' + data.url;
        document.getElementById('avatar-img').style.display = 'block';
        document.getElementById('avatar-svg').style.display = 'none';
    }
}

async function toggleAvatarMenu() {
  document.getElementById('avatar-menu').classList.toggle('nascosta');
}

async function chiudiAvatarMenu() {
  document.getElementById('avatar-menu').classList.add('nascosta');
}

async function logout() {
  const result = await Swal.fire({
    title: 'Logout',
    text: 'Vuoi davvero uscire?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sì, esci',
    cancelButtonText: 'Annulla',
  });
  if (result.isConfirmed) {
    localStorage.clear();
    window.location.href = 'login.html';
  }
}

// Chiudi il menu cliccando fuori
document.addEventListener('click', e => {
  const wrapper = document.querySelector('.header-utente-wrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    chiudiAvatarMenu();
  }
});

function apriModalFamiglia() {
  const overlay = document.getElementById('modal-famiglia-overlay');
  overlay.classList.remove('nascosta');
  const idFamiglia = localStorage.getItem('idFamiglia');
  if (!idFamiglia || idFamiglia === '0') {
    mostraFormCreaFamiglia();
  } else {
    mostraInvitiFamiglia();
  }
}

function mostraFormCreaFamiglia() {
  document.getElementById('modal-famiglia-titolo').textContent = 'Crea la tua famiglia';
  document.getElementById('modal-famiglia-body').innerHTML = `
    <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">
      Non fai ancora parte di una famiglia. Creane una o unisciti con un codice.
    </p>
    <div class="famiglia-form-group">
      <label>Cognome famiglia</label>
      <input id="f-cognome-famiglia" type="text" placeholder="Es. Rossi">
    </div>
    <button class="btn-submit" onclick="creaFamiglia()">Crea famiglia</button>
    <div style="text-align:center;margin:12px 0;font-size:13px;color:var(--text-muted)">oppure</div>
    <div class="famiglia-form-group">
      <label>Hai un codice invito?</label>
      <input id="f-codice-join" type="text" placeholder="Es. AB3K9PQR" style="text-transform:uppercase;letter-spacing:3px">
    </div>
    <button class="btn-copia" onclick="uniscitiConCodice()">Unisciti alla famiglia</button>
  `;
}

async function creaFamiglia() {
  const cognome = document.getElementById('f-cognome-famiglia').value.trim();
  if (!cognome) return alert('Inserisci il cognome della famiglia');
  const idUtente = parseInt(localStorage.getItem('idUtente'));
  const res = await fetch(`${API}/auth/famiglia/crea`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUtente, cognome })
  });
  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('idFamiglia', data.id);
    document.getElementById('nome-famiglia').textContent = `Famiglia ${data.cognome}`;
    mostraInvitiFamiglia(data.codice, data.cognome);
  }
}

async function uniscitiConCodice() {
  const codice = document.getElementById('f-codice-join').value.trim().toUpperCase();
  if (!codice) return alert('Inserisci il codice invito');
  // Cerca la famiglia con quel codice e aggiorna l'utente
  const res = await fetch(`${API}/auth/famiglia/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUtente: parseInt(localStorage.getItem('idUtente')), codice })
  });
  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('idFamiglia', data.id);
    document.getElementById('nome-famiglia').textContent = `Famiglia ${data.cognome}`;
    document.getElementById('modal-famiglia-overlay').classList.add('nascosta');
    alert('Benvenuto nella famiglia!');
  } else {
    alert('Codice non valido');
  }
}

async function mostraInvitiFamiglia(codiceOverride, cognomeOverride) {
  const idFamiglia = localStorage.getItem('idFamiglia');
  let codice = codiceOverride;
  let cognome = cognomeOverride;

  if (!codice) {
    const res = await fetch(`${API}/auth/famiglia/${idFamiglia}`);
    const data = await res.json();
    codice = data.codice;
    cognome = data.cognome;
  }

  const linkInvito = `http://127.0.0.1:5500/login.html?join=${codice}`;

  document.getElementById('modal-famiglia-titolo').textContent = `Famiglia ${cognome}`;
  document.getElementById('modal-famiglia-body').innerHTML = `
    <div class="famiglia-codice-box">
      <p class="famiglia-codice-label">Codice invito</p>
      <p class="famiglia-codice" id="testo-codice">${codice}</p>
      <p class="famiglia-codice-label">Condividi questo codice con i membri della tua famiglia</p>
    </div>
    <div id="qrcode-container"></div>
    <button class="btn-copia" onclick="copiaCodice('${linkInvito}')">📋 Copia link invito</button>
    <button class="btn-copia" onclick="rigeneraCodice()">🔄 Genera nuovo codice</button>
  `;

  new QRCode(document.getElementById('qrcode-container'), {
    text: linkInvito,
    width: 160,
    height: 160,
    colorDark: '#000000',
    colorLight: '#ffffff',
  });
}

function copiaCodice(codice) {
  navigator.clipboard.writeText(codice);
  Swal.fire({ title: 'Copiato!', text: 'Link invito copiato negli appunti', icon: 'success', timer: 1500, showConfirmButton: false });
}

async function rigeneraCodice() {
  const idFamiglia = localStorage.getItem('idFamiglia');
  const res = await fetch(`${API}/auth/famiglia/rigenera-codice/${idFamiglia}`, { method: 'POST' });
  if (res.ok) {
    const data = await res.json();
    document.getElementById('testo-codice').textContent = data.codice;
    document.getElementById('qrcode-container').innerHTML = '';
    const linkInvito = `http://127.0.0.1:5500/login.html?join=${data.codice}`;
    new QRCode(document.getElementById('qrcode-container'), {
      text: linkInvito,
      width: 160,
      height: 160,
      colorDark: '#000000',
      colorLight: '#ffffff',
    });
  }
}

// --- CALENDARIO ---
let calMese = new Date().getMonth();
let calAnno = new Date().getFullYear();

async function getAppuntamenti() {
    const idFamiglia = localStorage.getItem('idFamiglia');
    const idUtente = localStorage.getItem('idUtente');
    return (await fetch(`${API}/appuntamenti?idFamiglia=${idFamiglia}&idUtente=${idUtente}`)).json();
}

async function creaAppuntamento(data) {
    const idFamiglia = parseInt(localStorage.getItem('idFamiglia'));
    const idUtente = parseInt(localStorage.getItem('idUtente'));
    await fetch(`${API}/appuntamenti`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ ...data, idFamiglia, idUtente })
    });
}

async function eliminaAppuntamento(id) {
    await fetch(`${API}/appuntamenti/${id}`, { method: 'DELETE' });
}

function cambaMese(delta) {
    calMese += delta;
    if (calMese > 11) { calMese = 0; calAnno++; }
    if (calMese < 0) { calMese = 11; calAnno--; }
    renderCalendario();
}

async function renderCalendario() {
    const [scadenze, spese, appuntamenti] = await Promise.all([
        getScadenze(), getSpese(), getAppuntamenti()
    ]);

    const mesi = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
                  'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
    document.getElementById('cal-titolo-mese').textContent = `${mesi[calMese]} ${calAnno}`;

    const primoGiorno = new Date(calAnno, calMese, 1);
    const ultimoGiorno = new Date(calAnno, calMese + 1, 0);
    const oggi = new Date();

    // Giorno della settimana del primo giorno (0=dom, adattato a lun=0)
    let inizioGriglia = primoGiorno.getDay() - 1;
    if (inizioGriglia < 0) inizioGriglia = 6;

    const giorni = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
    let html = giorni.map(g => `<div class="cal-giorno-header">${g}</div>`).join('');

    // Giorni del mese precedente
    for (let i = 0; i < inizioGriglia; i++) {
        const d = new Date(calAnno, calMese, -inizioGriglia + i + 1);
        html += `<div class="cal-giorno altro-mese"><div class="cal-num">${d.getDate()}</div></div>`;
    }

    // Giorni del mese corrente
    for (let d = 1; d <= ultimoGiorno.getDate(); d++) {
        const dataStr = `${calAnno}-${String(calMese+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const isOggi = oggi.getDate() === d && oggi.getMonth() === calMese && oggi.getFullYear() === calAnno;

        const scadenzeGiorno = scadenze.filter(s => new Date(s.dataScadenza).toDateString() === new Date(calAnno, calMese, d).toDateString());
        const speseGiorno = spese.filter(s => new Date(s.data).toDateString() === new Date(calAnno, calMese, d).toDateString());
        const appGiorno = appuntamenti.filter(a => new Date(a.data).toDateString() === new Date(calAnno, calMese, d).toDateString());

        const eventiHtml = [
            ...scadenzeGiorno.slice(0,2).map(s => `<div class="cal-evento cal-evento-scadenza">${s.titolo}</div>`),
            ...speseGiorno.slice(0,1).map(s => `<div class="cal-evento cal-evento-spesa">€${s.importo}</div>`),
            ...appGiorno.slice(0,1).map(a => `<div class="cal-evento cal-evento-appuntamento">${a.titolo}</div>`)
        ].join('');

        const totEventi = scadenzeGiorno.length + speseGiorno.length + appGiorno.length;
        const altro = totEventi > 4 ? `<div style="font-size:10px;color:var(--text-muted)">+${totEventi-4} altri</div>` : '';

        html += `<div class="cal-giorno ${isOggi ? 'oggi' : ''}" onclick="apriDettaglioGiorno('${dataStr}')">
            <div class="cal-num">${d}</div>
            ${eventiHtml}${altro}
        </div>`;
    }

    document.getElementById('cal-griglia').innerHTML = html;
}

async function apriDettaglioGiorno(dataStr) {
    const [scadenze, spese, appuntamenti] = await Promise.all([
        getScadenze(), getSpese(), getAppuntamenti()
    ]);

    const data = new Date(dataStr);
    const formato = data.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
    document.getElementById('cal-dettaglio-titolo').textContent = formato;

    const sc = scadenze.filter(s => new Date(s.dataScadenza).toDateString() === data.toDateString());
    const sp = spese.filter(s => new Date(s.data).toDateString() === data.toDateString());
    const ap = appuntamenti.filter(a => new Date(a.data).toDateString() === data.toDateString());

    const tutto = [
        ...sc.map(s => ({ ...s, _tipo: 'scadenza' })),
        ...sp.map(s => ({ ...s, _tipo: 'spesa' })),
        ...ap.map(a => ({ ...a, _tipo: 'appuntamento' }))
    ];

    if (tutto.length === 0) {
        document.getElementById('cal-dettaglio').classList.add('nascosta');
        return;
    }

    document.getElementById('cal-dettaglio-lista').innerHTML = tutto.map(e => {
        const colori = { scadenza: 'cal-evento-scadenza', spesa: 'cal-evento-spesa', appuntamento: 'cal-evento-appuntamento' };
        const etichette = { scadenza: 'Scadenza', spesa: 'Spesa', appuntamento: 'Appuntamento' };
        const extra = e._tipo === 'spesa' ? ` — € ${e.importo?.toFixed(2)}` : e.ora ? ` — ${e.ora}` : '';
        return `<div class="cal-dettaglio-item">
            <span class="cal-dettaglio-tipo ${colori[e._tipo]}">${etichette[e._tipo]}</span>
            <span style="flex:1">${e.titolo}${extra}</span>
            <button class="btn-icon" onclick="eliminaDalCalendario('${e._tipo}',${e.id})">🗑</button>
        </div>`;
    }).join('');

    document.getElementById('cal-dettaglio').classList.remove('nascosta');
}

async function eliminaDalCalendario(tipo, id) {
    const result = await Swal.fire({
        title: 'Eliminare?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sì, elimina',
        cancelButtonText: 'Annulla'
    });
    if (!result.isConfirmed) return;
    if (tipo === 'scadenza') await eliminaScadenza(id);
    if (tipo === 'spesa') await eliminaSpesa(id);
    if (tipo === 'appuntamento') await eliminaAppuntamento(id);
    renderCalendario();
    document.getElementById('cal-dettaglio').classList.add('nascosta');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-chiudi-famiglia').addEventListener('click', () => {
    document.getElementById('modal-famiglia-overlay').classList.add('nascosta');
  });
  document.getElementById('modal-famiglia-overlay').addEventListener('click', e => {
    if (e.target.id === 'modal-famiglia-overlay')
      document.getElementById('modal-famiglia-overlay').classList.add('nascosta');
  });
});

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('data-oggi').textContent = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'modal-overlay') chiudiModal();
  });
  document.getElementById('btn-chiudi-modal').addEventListener('click', chiudiModal);
  const nome = localStorage.getItem('nome');
  if (nome) document.getElementById('nome-utente').textContent = `Ciao, ${nome}`;

  const idFamiglia = localStorage.getItem('idFamiglia');
  if (idFamiglia) {
    fetch(`http://localhost:5271/api/auth/famiglia/${idFamiglia}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById('nome-famiglia').textContent = `Famiglia ${data.cognome}`;
        });
  }

  // Carica foto profilo se esiste
  const fotoSalvata = localStorage.getItem('fotoProfilo');
  if (fotoSalvata) {
      document.getElementById('avatar-img').src = 'http://localhost:5271' + fotoSalvata;
      document.getElementById('avatar-img').style.display = 'block';
      document.getElementById('avatar-svg').style.display = 'none';
  }
  renderDashboard();
});
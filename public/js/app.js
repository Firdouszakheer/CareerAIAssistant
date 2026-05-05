/* public/js/app.js — Core application logic */

/* ─── State ─────────────────────────────────────────────────────────────── */
let currentProfile = {};
let chatHistory    = [];
let currentRecs    = [];

/* ─── Navigation ─────────────────────────────────────────────────────────── */
document.getElementById('logo-link').addEventListener('click', e => {
  e.preventDefault();
  showHome();
});
document.getElementById('back-btn').addEventListener('click', showHome);

function showHome() {
  document.getElementById('results-page').style.display = 'none';
  document.getElementById('home-page').style.display   = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Reset button state
  const btn = document.getElementById('main-btn');
  btn.disabled = false;
  document.getElementById('btn-text').textContent = 'Get Career Advice';
}

function showResults() {
  document.getElementById('home-page').style.display   = 'none';
  document.getElementById('results-page').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─── Form submission ────────────────────────────────────────────────────── */
async function submitAdvice() {
  const interest = document.getElementById('interest').value.trim();
  const academic = document.getElementById('academic').value.trim();
  const skills   = document.getElementById('skills').value.trim();
  const goal     = document.getElementById('goal').value.trim();

  // Validate
  if (!interest) return showFormError('Please enter what you are interested in.');
  if (!academic) return showFormError('Please enter your academic background.');
  clearFormError();

  // Save profile
  currentProfile = { interest, academic, skills, goal };
  chatHistory    = [];
  currentRecs    = [];

  // UI: loading
  const btn = document.getElementById('main-btn');
  btn.disabled = true;
  document.getElementById('btn-text').textContent = 'Analyzing…';

  showResults();
  showLoading(true);

  // Update subtitle
  document.getElementById('results-subtitle').textContent =
    `Based on your interest in ${interest} · ${academic}`;

  try {
    const res = await fetch('/api/career/advice', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ interest, academic, skills, goal }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Something went wrong.');

    currentRecs = (json.data.recommendations || []).map(r => r.title);
    renderResults(json.data);

  } catch (err) {
    showLoading(false);
    document.getElementById('results-content').style.display = 'block';
    document.getElementById('results-content').innerHTML =
      `<div class="error-banner" style="display:block">⚠ ${escHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
    document.getElementById('btn-text').textContent = 'Get Career Advice';
  }
}

function showLoading(on) {
  document.getElementById('loading-state').style.display    = on ? 'block' : 'none';
  document.getElementById('results-content').style.display  = on ? 'none'  : 'block';
  document.getElementById('chat-section').style.display     = on ? 'none'  : 'block';
}

/* ─── Render results ─────────────────────────────────────────────────────── */
function renderResults(data) {
  showLoading(false);

  const recs = data.recommendations || [];
  const el   = document.getElementById('results-content');

  el.innerHTML = `
    <div class="blueprint-box">
      <h3>✦ Your Career Blueprint</h3>
      <p>${escHtml(data.summary || '')}</p>
      ${data.insight ? `<div class="blueprint-insight"><strong>Key Insight:</strong> ${escHtml(data.insight)}</div>` : ''}
    </div>
    <div class="recs-label">Top Recommendations</div>
    ${recs.map((r, i) => renderRecCard(r, i + 1)).join('')}
  `;

  // Show chat with a welcome message
  document.getElementById('chat-section').style.display = 'block';
  document.getElementById('chat-messages').innerHTML = '';
  addChatMessage('ai', `Hi! I've reviewed your profile and generated ${recs.length} career recommendations. Ask me anything — salary negotiation, skill gaps, alternative paths, or anything else!`);
}

function renderRecCard(r, rank) {
  const roadmap = (r.roadmap || []).map((s, i) =>
    `<li><div class="r-num">${i + 1}</div><span>${escHtml(s)}</span></li>`
  ).join('');

  const skills = (r.skills_needed || []).map(s =>
    `<span class="skill-tag">${escHtml(s)}</span>`
  ).join('');

  return `
  <div class="rec-card">
    <div class="rec-card-bar"></div>
    <div class="rec-rank">#${rank} Recommendation · ${r.match_score || ''}% match</div>
    <div class="rec-title">${escHtml(r.title || '')}</div>
    <div class="rec-badges">
      ${r.salary_range ? `<span class="badge badge-salary">$ ${escHtml(r.salary_range)}</span>` : ''}
      ${r.demand       ? `<span class="badge badge-demand">↑ ${escHtml(r.demand)}</span>` : ''}
      ${r.time_to_entry ? `<span class="badge badge-time">⏱ ${escHtml(r.time_to_entry)}</span>` : ''}
    </div>
    ${r.description ? `<p class="rec-desc">${escHtml(r.description)}</p>` : ''}
    ${r.why_good_fit ? `<p class="rec-fit">✓ ${escHtml(r.why_good_fit)}</p>` : ''}
    <div class="rec-grid">
      <div class="rec-section">
        <h4>⊙ Suggested Roadmap</h4>
        <ul class="roadmap-list">${roadmap}</ul>
      </div>
      <div class="rec-section">
        <h4>✦ Key Skills Needed</h4>
        <div class="skills-wrap">${skills}</div>
      </div>
    </div>
  </div>`;
}

/* ─── Chat ───────────────────────────────────────────────────────────────── */
async function sendChat() {
  const input = document.getElementById('chat-input');
  const msg   = input.value.trim();
  if (!msg) return;

  addChatMessage('user', msg);
  input.value = '';

  const sendBtn = document.getElementById('chat-send-btn');
  sendBtn.disabled = true;

  // Optimistic typing indicator
  const typingId = 'typing-' + Date.now();
  addChatMessage('ai', '…', typingId);

  chatHistory.push({ role: 'user', content: msg });

  try {
    const res = await fetch('/api/career/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        message:         msg,
        history:         chatHistory.slice(-12), // keep context window reasonable
        profile:         currentProfile,
        recommendations: currentRecs,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Chat error.');

    chatHistory.push({ role: 'assistant', content: json.reply });
    updateChatMessage(typingId, json.reply);

  } catch (err) {
    updateChatMessage(typingId, '⚠ ' + err.message, true);
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

function addChatMessage(role, text, id) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  if (id) div.id = id;
  div.innerHTML = `
    <div class="msg-av">${role === 'ai' ? 'L' : 'You'}</div>
    <div class="msg-bubble">${renderRichText(text)}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function updateChatMessage(id, text, isError) {
  const el = document.getElementById(id);
  if (!el) return;
  const bubble = el.querySelector('.msg-bubble');
  if (bubble) {
    bubble.innerHTML = renderRichText(text);
    if (isError) bubble.style.color = 'var(--red)';
  }
}

function renderRichText(text) {
  const escaped = escHtml(text);
  const lines = escaped.split(/\r?\n/);
  const htmlParts = [];
  let inList = false;
  let inOrdered = false;

  lines.forEach(line => {
    if (/^\s*[-*+]\s+/.test(line)) {
      if (!inList) {
        if (inOrdered) { htmlParts.push('</ol>'); inOrdered = false; }
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push(`<li>${line.replace(/^\s*[-*+]\s+/, '')}</li>`);
      return;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      if (!inOrdered) {
        if (inList) { htmlParts.push('</ul>'); inList = false; }
        htmlParts.push('<ol>');
        inOrdered = true;
      }
      htmlParts.push(`<li>${line.replace(/^\s*\d+\.\s+/, '')}</li>`);
      return;
    }

    if (inList) { htmlParts.push('</ul>'); inList = false; }
    if (inOrdered) { htmlParts.push('</ol>'); inOrdered = false; }

    const headingMatch = line.match(/^\s*(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      htmlParts.push(`<strong>${headingMatch[2]}</strong>`);
      return;
    }

    if (line.trim() === '') {
      htmlParts.push('<br>');
      return;
    }

    htmlParts.push(line);
  });

  if (inList) htmlParts.push('</ul>');
  if (inOrdered) htmlParts.push('</ol>');

  let html = htmlParts.join('\n');
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>');

  return html;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function showFormError(msg) {
  const el = document.getElementById('form-error');
  el.textContent = msg;
  el.style.display = 'block';
}
function clearFormError() {
  const el = document.getElementById('form-error');
  el.textContent = '';
  el.style.display = 'none';
}
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─── Health check on load ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res  = await fetch('/api/health');
    const json = await res.json();
    if (!json.keyLoaded) {
      console.warn('⚠ GROQ_API_KEY not found in environment. Add it to your Replit Secrets.');
    }
  } catch (_) {}
});

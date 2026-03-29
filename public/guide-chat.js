/**
 * Tax Advisor Pro — Guide Chatbot Widget
 * Embeddable AI chatbot for all guide/book pages.
 * The bot is context-aware: it knows which guide page it's on
 * and can answer questions about both the book content AND the webapp.
 *
 * Usage: <script src="guide-chat.js"></script> at end of <body>
 */

(function() {
  'use strict';

  // ── CONFIG ──
  const API_BASE = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
    ? window.location.origin : null;
  const CHAT_TIMEOUT = 30000;

  // ── DETECT PAGE CONTEXT ──
  function detectPageContext() {
    const title = document.title || '';
    const url = window.location.pathname || '';
    const h1 = document.querySelector('h1')?.textContent || '';
    const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent).join(', ');

    // Gather visible text from chapters (first 4000 chars)
    let bookContent = '';
    const chapters = document.querySelectorAll('.chapter, section, article');
    if (chapters.length > 0) {
      chapters.forEach(ch => {
        bookContent += ch.textContent.replace(/\s+/g, ' ').trim() + '\n\n';
      });
    } else {
      // Fallback: get main content area
      const main = document.querySelector('.main, main, .content, body');
      if (main) bookContent = main.textContent.replace(/\s+/g, ' ').trim();
    }
    bookContent = bookContent.substring(0, 6000); // limit to 6000 chars

    // Detect which state guide
    let stateName = 'Federal (General)';
    const stateMatch = url.match(/guide-([a-z]{2})\.html/);
    if (stateMatch) {
      const stateMap = {
        nj: 'New Jersey', ny: 'New York', fl: 'Florida', ca: 'California',
        tx: 'Texas', pa: 'Pennsylvania', il: 'Illinois', oh: 'Ohio',
        ga: 'Georgia', nc: 'North Carolina', mi: 'Michigan', va: 'Virginia', wa: 'Washington'
      };
      stateName = stateMap[stateMatch[1]] || stateMatch[1].toUpperCase();
    }

    return {
      pageTitle: title,
      pageUrl: url,
      heading: h1,
      chapters: h2s,
      stateName: stateName,
      bookContent: bookContent
    };
  }

  // ── SYSTEM PROMPT ──
  const GUIDE_SYSTEM_PROMPT = `You are "Tax Advisor AI" — a highly knowledgeable U.S. tax advisor embedded inside an interactive tax guide book. You combine the expertise of a licensed CPA and tax attorney. You provide guidance for the 2025 tax year (filing in 2026).

YOUR PERSONA & STYLE:
- You speak in a natural mix of English and Arabic (Arabizi style)
- Use Arabic phrases naturally: يعني، عشان، هاي، بس، كمان، إذا، لازم، ممكن
- Be warm, approachable, but authoritative
- Use "you/أنت" directly — make it personal

CONTEXT AWARENESS:
- You are embedded in a tax guide book page. Before each message, you receive [BOOK CONTEXT] with the current page title, state, and book content.
- When the user asks about something covered in the book, reference the specific chapter or section.
- If the user asks about something NOT in the current guide, you can still answer from your tax knowledge — just note it's not in this particular guide.
- You can also answer questions about the Tax Advisor Pro web app (how to use it, where to enter data, etc.)
- If the user is on a STATE guide page, focus your answers on that state's tax laws, but you can compare with federal or other states.

RULES:
- Always clarify that you provide educational guidance, not formal legal/tax advice
- Use 2025 tax year figures
- Keep responses concise — 2-3 paragraphs max
- Use bold for key terms and numbers
- Give practical, actionable advice
- If someone asks "what does this chapter say about X?", summarize from the book content
- If someone asks a tax question, answer it AND point them to the relevant chapter if it exists in the book`;

  // ── STATE ──
  let chatHistory = [];
  let chatOpen = false;

  // ── INJECT CSS ──
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .gc-toggle {
        position: fixed;
        bottom: 28px;
        right: 28px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0d3b66, #1a5276);
        color: #c9a84c;
        border: 2px solid rgba(201,168,76,0.4);
        cursor: pointer;
        font-size: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(13,59,102,0.3), 0 0 20px rgba(201,168,76,0.15);
        z-index: 9998;
        transition: all 0.22s ease;
      }
      .gc-toggle:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(13,59,102,0.35), 0 0 28px rgba(201,168,76,0.25); }
      .gc-badge {
        position: absolute;
        top: -2px; right: -2px;
        width: 18px; height: 18px;
        background: #c9a84c;
        color: #0d3b66;
        border-radius: 50%;
        font-size: 10px;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .gc-panel {
        position: fixed;
        bottom: 100px;
        right: 28px;
        width: 380px;
        max-height: 520px;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 8px 40px rgba(13,59,102,0.15);
        border: 1px solid #e2ddd2;
        display: none;
        flex-direction: column;
        z-index: 9999;
        overflow: hidden;
        font-family: 'Lato', 'Noto Sans Arabic', sans-serif;
        animation: gcSlideUp 0.25s ease;
      }
      .gc-panel.open { display: flex; }
      @keyframes gcSlideUp {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .gc-header {
        background: linear-gradient(135deg, #050e1a, #0d3b66);
        color: white;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .gc-header-icon { font-size: 24px; }
      .gc-header-info h3 { font-size: 14px; font-weight: 700; color: #c9a84c; margin: 0; font-family: 'Playfair Display', serif; }
      .gc-header-info span { font-size: 11px; color: rgba(255,255,255,0.5); }
      .gc-close {
        margin-left: auto;
        background: none;
        border: none;
        color: rgba(255,255,255,0.5);
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
      }
      .gc-close:hover { color: white; }

      .gc-messages {
        flex: 1;
        overflow-y: auto;
        padding: 14px;
        min-height: 200px;
        max-height: 340px;
        background: #faf8f2;
      }
      .gc-messages::-webkit-scrollbar { width: 4px; }
      .gc-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

      .gc-msg {
        margin-bottom: 12px;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.65;
        max-width: 88%;
        word-wrap: break-word;
      }
      .gc-msg.bot {
        background: white;
        border: 1px solid #e2ddd2;
        border-radius: 12px 12px 12px 2px;
        color: #1a1f36;
      }
      .gc-msg.bot .gc-label {
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #c9a84c;
        margin-bottom: 4px;
      }
      .gc-msg.user {
        background: linear-gradient(135deg, #0d3b66, #1a5276);
        color: white;
        margin-left: auto;
        border-radius: 12px 12px 2px 12px;
      }
      .gc-msg.system {
        background: linear-gradient(135deg, #e8eff8, #e8f5ef);
        border: 1px solid #0d3b66;
        text-align: center;
        font-size: 12px;
        max-width: 100%;
      }

      .gc-typing {
        display: none;
        padding: 6px 14px;
        font-size: 12px;
        color: #5e6a82;
      }
      .gc-typing.visible { display: flex; gap: 4px; align-items: center; }
      .gc-dot {
        width: 6px; height: 6px;
        background: #c9a84c;
        border-radius: 50%;
        animation: gcBounce 1.2s infinite;
      }
      .gc-dot:nth-child(2) { animation-delay: 0.15s; }
      .gc-dot:nth-child(3) { animation-delay: 0.3s; }
      @keyframes gcBounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-5px); }
      }

      .gc-input-row {
        padding: 10px 12px;
        display: flex;
        gap: 8px;
        align-items: center;
        background: white;
        border-top: 1px solid #e2ddd2;
      }
      .gc-input {
        flex: 1;
        border: 1.5px solid #e2ddd2;
        border-radius: 50px;
        padding: 9px 14px;
        font-family: 'Lato', 'Noto Sans Arabic', sans-serif;
        font-size: 13px;
        font-weight: 600;
        color: #1a1f36;
        background: #faf8f2;
        outline: none;
        transition: border-color 0.15s;
      }
      .gc-input:focus { border-color: #c9a84c; }
      .gc-input::placeholder { color: #b0b5c3; }
      .gc-send {
        width: 36px; height: 36px;
        border-radius: 50%;
        background: #c9a84c;
        color: #0d3b66;
        border: none;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s;
        flex-shrink: 0;
      }
      .gc-send:hover { background: #dab95e; }
      .gc-send:disabled { background: #ddd; cursor: not-allowed; }

      /* Quick actions */
      .gc-quick {
        padding: 6px 12px;
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        background: #faf8f2;
        border-top: 1px solid #e2ddd2;
      }
      .gc-quick-btn {
        padding: 5px 10px;
        border: 1px solid #e2ddd2;
        border-radius: 50px;
        background: white;
        font-size: 11px;
        font-weight: 600;
        color: #0d3b66;
        cursor: pointer;
        transition: all 0.15s;
        font-family: 'Lato', sans-serif;
      }
      .gc-quick-btn:hover { background: #e8eff8; border-color: #0d3b66; }

      @media (max-width: 768px) {
        .gc-panel { width: calc(100vw - 24px); right: 12px; bottom: 96px; }
        .gc-toggle { bottom: 16px; right: 16px; width: 52px; height: 52px; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── INJECT HTML ──
  function injectHTML() {
    const ctx = detectPageContext();
    const stateLabel = ctx.stateName !== 'Federal (General)' ? ctx.stateName + ' Guide' : 'Tax Guide';

    const html = `
      <button class="gc-toggle" id="gcToggle" onclick="window._gcToggle()">
        💬
        <span class="gc-badge" id="gcBadge">?</span>
      </button>
      <div class="gc-panel" id="gcPanel">
        <div class="gc-header">
          <span class="gc-header-icon">⚖️</span>
          <div class="gc-header-info">
            <h3>Tax Advisor AI</h3>
            <span>Ask about this guide — اسأل عن الدليل</span>
          </div>
          <button class="gc-close" onclick="window._gcToggle()">✕</button>
        </div>
        <div class="gc-messages" id="gcMessages">
          <div class="gc-msg bot">
            <div class="gc-label">Tax Advisor — مستشار الضرائب</div>
            أهلاً! I'm reading the <strong>${stateLabel}</strong> with you. Ask me anything about what's in this guide, or any tax question! 🏛️<br><br>
            <strong>اسألني أي شي</strong> — عن الدليل أو عن الضرائب بشكل عام.
          </div>
        </div>
        <div class="gc-typing" id="gcTyping">
          <div class="gc-dot"></div><div class="gc-dot"></div><div class="gc-dot"></div>
        </div>
        <div class="gc-quick" id="gcQuick">
          <button class="gc-quick-btn" onclick="window._gcQuick('Summarize this guide for me')">📋 Summarize</button>
          <button class="gc-quick-btn" onclick="window._gcQuick('What deductions can I claim?')">💰 Deductions</button>
          <button class="gc-quick-btn" onclick="window._gcQuick('How do I use the Tax Advisor Pro app?')">💻 App Guide</button>
          <button class="gc-quick-btn" onclick="window._gcQuick('ممكن تشرحلي بالعربي؟')">🌐 بالعربي</button>
        </div>
        <div class="gc-input-row">
          <input type="text" class="gc-input" id="gcInput" placeholder="Ask anything... اسأل أي شي..."
                 onkeydown="if(event.key==='Enter')window._gcSend()">
          <button class="gc-send" id="gcSendBtn" onclick="window._gcSend()">➤</button>
        </div>
      </div>
    `;
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
  }

  // ── HELPERS ──
  function addMsg(role, text) {
    const div = document.createElement('div');
    if (role === 'system') {
      div.className = 'gc-msg system';
      div.innerHTML = text;
    } else if (role === 'bot') {
      div.className = 'gc-msg bot';
      let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
      div.innerHTML = '<div class="gc-label">Tax Advisor — مستشار الضرائب</div>' + formatted;
    } else {
      div.className = 'gc-msg user';
      div.textContent = text;
    }
    document.getElementById('gcMessages').appendChild(div);
    scrollChat();
  }

  function scrollChat() {
    const c = document.getElementById('gcMessages');
    setTimeout(() => c.scrollTop = c.scrollHeight, 50);
  }

  function showTyping(show) {
    document.getElementById('gcTyping').classList.toggle('visible', show);
    document.getElementById('gcSendBtn').disabled = show;
    scrollChat();
  }

  async function fetchWithTimeout(url, opts, timeout) {
    return Promise.race([
      fetch(url, opts),
      new Promise((_, rej) => setTimeout(() => rej(new Error('Request timed out')), timeout))
    ]);
  }

  // ── API CALL ──
  async function callAPI(messages) {
    const ctx = detectPageContext();

    const bookContext = `[BOOK CONTEXT — You are on: "${ctx.pageTitle}"]
State: ${ctx.stateName}
Page heading: ${ctx.heading}
Chapters on this page: ${ctx.chapters}

Book content (current page):
${ctx.bookContent}
[END BOOK CONTEXT]`;

    const fullMessages = [
      { role: 'user', content: '[SYSTEM] ' + GUIDE_SYSTEM_PROMPT + '\n\n' + bookContext },
      { role: 'assistant', content: 'Understood. I have access to the current guide page content and can answer questions about this book and about taxes in general. I will reference specific chapters and sections when relevant.' },
      ...messages.slice(-16)
    ];

    const resp = await fetchWithTimeout(API_BASE + '/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: fullMessages, max_tokens: 1536 })
    }, CHAT_TIMEOUT);

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      if (resp.status === 401) throw new Error('API key invalid — المفتاح منتهي');
      throw new Error(err.error?.message || 'API error ' + resp.status);
    }
    const data = await resp.json();
    return data.content[0].text;
  }

  // ── PUBLIC FUNCTIONS ──
  window._gcToggle = function() {
    chatOpen = !chatOpen;
    document.getElementById('gcPanel').classList.toggle('open', chatOpen);
    document.getElementById('gcBadge').style.display = chatOpen ? 'none' : 'flex';
    if (chatOpen) {
      document.getElementById('gcInput').focus();
      scrollChat();
      // Connection test on first open
      if (!window._gcTested && API_BASE) {
        window._gcTested = true;
        fetch(API_BASE + '/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: 'Hi' }], max_tokens: 5 })
        }).then(r => {
          if (!r.ok) addMsg('system', '⚠️ API issue — check .env key');
        }).catch(() => {
          addMsg('system', '⚠️ Server not running — شغّل start.bat وافتح localhost:3000');
        });
      }
    }
  };

  window._gcSend = async function() {
    const input = document.getElementById('gcInput');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addMsg('user', text);
    chatHistory.push({ role: 'user', content: text });

    // Hide quick actions after first message
    document.getElementById('gcQuick').style.display = 'none';

    showTyping(true);
    try {
      const reply = await callAPI(chatHistory);
      chatHistory.push({ role: 'assistant', content: reply });
      showTyping(false);
      addMsg('bot', reply);
    } catch (err) {
      showTyping(false);
      addMsg('bot', `⚠️ ${err.message}\n\n💡 Make sure start.bat is running and open localhost:3000/guide.html`);
    }
  };

  window._gcQuick = function(text) {
    document.getElementById('gcInput').value = text;
    window._gcSend();
  };

  // ── INIT ──
  injectStyles();
  injectHTML();
})();

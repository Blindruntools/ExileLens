/* ═══════════════════════════════════════════════════
   EXILE'S LENS — app.js (PRODUCTION DESKTOP & MOBILE RUNTIME)
═══════════════════════════════════════════════════ */

// ── STAT DEFINITIONS ──────────────────────────────────────
const STAT_DEFINITIONS = [
  // DAMAGE
  { keys: ['physical damage', 'phys damage'],        cat: 'damage',   label: 'Physical Damage' },
  { keys: ['elemental damage', 'ele damage'],        cat: 'damage',   label: 'Elemental Damage' },
  { keys: ['spell damage', 'spell'],                  cat: 'damage',   label: 'Spell Damage' },
  { keys: ['fire damage'],                            cat: 'damage',   label: 'Fire Damage' },
  { keys: ['cold damage', 'ice damage'],              cat: 'damage',   label: 'Cold Damage' },
  { keys: ['lightning damage', 'lightning'],          cat: 'damage',   label: 'Lightning Damage' },
  { keys: ['chaos damage'],                           cat: 'damage',   label: 'Chaos Damage' },
  { keys: ['attack damage'],                          cat: 'damage',   label: 'Attack Damage' },
  { keys: ['critical strike chance', 'crit chance'], cat: 'damage',   label: 'Crit Chance' },
  { keys: ['critical strike multiplier', 'crit multi', 'crit multiplier'], cat: 'damage', label: 'Crit Multi' },
  { keys: ['attack speed'],                           cat: 'damage',   label: 'Attack Speed' },
  { keys: ['cast speed'],                             cat: 'damage',   label: 'Cast Speed' },
  { keys: ['damage'],                                 cat: 'damage',   label: 'Damage (Generic)' },

  // DEFENSE
  { keys: ['maximum life', 'max life', 'maximum health', 'max health'], cat: 'defense', label: 'Max Life' },
  { keys: ['life regeneration', 'life regen', 'life recovery'],         cat: 'defense', label: 'Life Regen' },
  { keys: ['maximum mana', 'max mana'],                                  cat: 'defense', label: 'Max Mana' },
  { keys: ['mana regeneration', 'mana regen'],                           cat: 'defense', label: 'Mana Regen' },
  { keys: ['armour', 'armor'],                                           cat: 'defense', label: 'Armour' },
  { keys: ['evasion'],                                                   cat: 'defense', label: 'Evasion' },
  { keys: ['energy shield', '\\bes\\b'],                                 cat: 'defense', label: 'Energy Shield' },
  { keys: ['block chance', 'block'],                                     cat: 'defense', label: 'Block Chance' },
  { keys: ['fire resistance', 'fire res'],                               cat: 'defense', label: 'Fire Res' },
  { keys: ['cold resistance', 'cold res'],                               cat: 'defense', label: 'Cold Res' },
  { keys: ['lightning resistance', 'lightning res'],                     cat: 'defense', label: 'Lightning Res' },
  { keys: ['chaos resistance', 'chaos res'],                             cat: 'defense', label: 'Chaos Res' },
  { keys: ['all resistances', 'all res', 'elemental resistances'],      cat: 'defense', label: 'All Resistances' },
  { keys: ['spell suppression', 'suppress'],                             cat: 'defense', label: 'Spell Suppression' },

  // ATTRIBUTES
  { keys: ['strength', '\\bstr\\b'],                      cat: 'attribute', label: 'Strength' },
  { keys: ['dexterity', '\\bdex\\b'],                     cat: 'attribute', label: 'Dexterity' },
  { keys: ['intelligence', '\\bint\\b'],                  cat: 'attribute', label: 'Intelligence' },
  { keys: ['all attributes', 'all stats'],            cat: 'attribute', label: 'All Attributes' },

  // UTILITY
  { keys: ['movement speed', 'move speed'],           cat: 'utility',  label: 'Movement Speed' },
  { keys: ['cooldown recovery', 'cooldown'],          cat: 'utility',  label: 'Cooldown Recovery' },
  { keys: ['flask charges', 'flask'],                 cat: 'utility',  label: 'Flask Effect' },
  { keys: ['mana', 'mana cost'],                      cat: 'utility',  label: 'Mana' },
];

// Structural Setup: Ensure complex structures evaluate ahead of generic ones
STAT_DEFINITIONS.forEach(def => { def.keys.sort((a, b) => b.length - a.length); });
STAT_DEFINITIONS.sort((a, b) => {
  const maxA = Math.max(...a.keys.map(k => k.replace(/\\b/g, '').length));
  const maxB = Math.max(...b.keys.map(k => k.replace(/\\b/g, '').length));
  return maxB - maxA;
});

// ── STRICT PARSING LAYER ──
function parseItem(text) {
  if (!text || !text.trim()) return [];

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const found = [];

  for (const line of lines) {
    let cleanedLine = line.toLowerCase().replace(/\([^)]+\)/g, '').replace(/\{[^}]+\}/g, '');
    
    // Track numbers safely
    const numbers = [];
    const numReg = /[\d]+(?:\.\d+)?/g;
    let m;
    while ((m = numReg.exec(cleanedLine)) !== null) {
      if (parseFloat(m[0]) > 50000) continue; // Skip wild dimension footprints
      numbers.push(parseFloat(m[0]));
    }

    // Skip tracking lines completely lacking numeric scale (stops non-stat ghost text matches)
    if (numbers.length === 0) continue;

    let matched = null;
    for (const def of STAT_DEFINITIONS) {
      const matchFound = def.keys.some(k => {
        const regexStr = k.startsWith('\\b') ? k : `\\b${k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`;
        return new RegExp(regexStr, 'i').test(cleanedLine);
      });

      if (matchFound) {
        matched = def;
        break;
      }
    }

    if (!matched) continue;

    let value = 0;
    if (cleanedLine.includes('to') && numbers.length === 2) {
      value = (numbers[0] + numbers[1]) / 2;
    } else {
      value = numbers[0];
    }

    const isPercent = line.includes('%') || cleanedLine.includes('speed') || cleanedLine.includes('chance') || cleanedLine.includes('multiplier') || cleanedLine.includes('res');

    found.push({ 
      label: matched.label, 
      category: matched.cat, 
      value, 
      raw: line,
      isPercent: isPercent
    });
  }
  return found;
}

// ── PROFILE CALCULATOR SCALARS ──
function calculateWeightsFromInput(inputText) {
  const query = (inputText || '').toLowerCase();
  
  // Base default scalars
  let weights = { damage: 1.0, defense: 1.0, attribute: 1.0, utility: 1.0 };
  
  if (!query.trim()) return weights;

  // Real-time text classification matching
  if (query.includes('damage') || query.includes('monk') || query.includes('crit') || query.includes('spell') || query.includes('dps')) {
    weights.damage += 1.5;
    weights.utility += 0.2;
  }
  if (query.includes('tank') || query.includes('life') || query.includes('shield') || query.includes('res') || query.includes('druid') || query.includes('slam')) {
    weights.defense += 1.5;
    weights.attribute += 0.4;
  }
  if (query.includes('speed') || query.includes('mana') || query.includes('flask') || query.includes('cooldown')) {
    weights.utility += 1.2;
    weights.damage += 0.3;
  }
  
  return weights;
}

function renderBuildTags(weights) {
  const container = document.getElementById('buildTags');
  if (!container) return;

  let html = '';
  Object.entries(weights).forEach(([cat, val]) => {
    let tier = 'low';
    if (val >= 2.0) tier = 'high';
    else if (val > 1.0) tier = 'mid';
    html += `<span class="build-tag ${tier}">${cat.toUpperCase()} ×${val.toFixed(1)}</span>`;
  });
  container.innerHTML = html;
}

function calculateScore(stats, weights) {
  let total = 0;
  for (const stat of stats) { total += stat.value * (weights[stat.category] ?? 1.0); }
  return Math.round(total * 10) / 10;
}

function updatePreview(textareaId, previewId) {
  const text  = document.getElementById(textareaId).value;
  const stats = parseItem(text);
  const preview = document.getElementById(previewId);

  if (stats.length === 0) {
    preview.innerHTML = '<span class="preview-hint">Paste stats or tap Scan Image ↑</span>';
    return;
  }
  preview.innerHTML = `<div class="stat-chips">${stats.map(s => `<span class="stat-chip" title="${s.raw}">+${s.value}${s.isPercent ? '%' : ''} ${s.label}</span>`).join('')}</div>`;
}

// ── DOM SYSTEM SYNC INITIALIZATION ──
document.addEventListener('DOMContentLoaded', () => {
  const buildInput = document.getElementById('buildInput');

  // Initial build weights calculation loop
  let currentWeights = calculateWeightsFromInput(buildInput.value);
  renderBuildTags(currentWeights);

  buildInput.addEventListener('input', () => {
    currentWeights = calculateWeightsFromInput(buildInput.value);
    renderBuildTags(currentWeights);
  });

  // Structural Input Listeners
  document.getElementById('itemA').addEventListener('input', () => updatePreview('itemA', 'previewA'));
  document.getElementById('itemB').addEventListener('input', () => updatePreview('itemB', 'previewB'));

  document.getElementById('clearA').addEventListener('click', () => { document.getElementById('itemA').value = ''; updatePreview('itemA', 'previewA'); });
  document.getElementById('clearB').addEventListener('click', () => { document.getElementById('itemB').value = ''; updatePreview('itemB', 'previewB'); });

  // ── FIX: MOBILE FILE DISPATCH INTERFACES ──
  document.querySelectorAll('.scan-trigger-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const inputId = btn.getAttribute('data-target');
      const inputEl = document.getElementById(inputId);
      if (inputEl) inputEl.click();
    });
  });

  // TESSERACT OCR DISPATCH CONTROL
  document.querySelectorAll('.item-image-input').forEach(input => {
    input.addEventListener('change', async function(e) {
      const file = e.target.files[0];
      const targetTextareaId = this.getAttribute('data-textarea');
      const targetPreviewId = targetTextareaId === 'itemA' ? 'previewA' : 'previewB';
      if (!file) return;

      const textarea = document.getElementById(targetTextareaId);
      const previewBox = document.getElementById(targetPreviewId);
      
      textarea.value = "Consulting the lens... Extracting stats from image metadata...";
      previewBox.innerHTML = '<span class="preview-hint" style="color:var(--blue); font-weight: 600;">⚡ Reading image... Processing data metrics.</span>';

      try {
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
          logger: m => {
            if (m.status === 'recognizing' && previewBox) {
              previewBox.innerHTML = `<span class="preview-hint" style="color:var(--gold);">🔮 Deciphering: ${Math.floor(m.progress * 100)}%</span>`;
            }
          }
        });

        if (!text || !text.trim()) {
          textarea.value = "";
          previewBox.innerHTML = '<span class="preview-hint" style="color:var(--red);">No readable text found.</span>';
          return;
        }

        let fixedText = text.replace(/[lI|]/g, '1').replace(/o/gi, '0').replace(/§/g, '5');
        const rawLines = fixedText.split('\n').map(l => l.trim()).filter(Boolean);
        const validatedLines = [];

        for (const line of rawLines) {
          let lowerLine = line.toLowerCase();
          if (lowerLine.includes('attacks per second:') || lowerLine.includes('critical strike chance:') ||
              lowerLine.includes('physical damage:') || lowerLine.includes('elemental damage:') || 
              lowerLine.includes('item class:') || lowerLine.includes('rarity:') ||
              lowerLine.includes('requirements:') || lowerLine.includes('item level:')) {
            continue;
          }

          if (parseItem(line).length > 0) {
            let cleanLine = line.replace(/\([^)]+\)/g, '').replace(/\{[^}]+\}/g, '').trim();
            if (cleanLine) validatedLines.push(cleanLine);
          }
        }

        textarea.value = validatedLines.length > 0 ? validatedLines.join('\n') : "⚠️ No matching explicit modifiers discovered.";
        updatePreview(targetTextareaId, targetPreviewId);

      } catch (err) {
        console.error(err);
        textarea.value = "";
        previewBox.innerHTML = '<span class="preview-hint" style="color:var(--red);">Processing error. Ensure clear lighting.</span>';
      } finally {
        input.value = '';
      }
    });
  });

  // EVALUATION COMPUTE LINK
  document.getElementById('compareBtn').addEventListener('click', () => {
    const textA = document.getElementById('itemA').value.trim();
    const textB = document.getElementById('itemB').value.trim();

    if (!textA && !textB) {
      const btn = document.getElementById('compareBtn');
      btn.style.animation = 'none'; btn.offsetHeight; btn.style.animation = 'shake 0.4s ease';
      return;
    }

    const statsA = parseItem(textA);
    const statsB = parseItem(textB);

    const scoreA = textA ? calculateScore(statsA, currentWeights) : 0;
    const scoreB = textB ? calculateScore(statsB, currentWeights) : 0;

    renderResults(scoreA, scoreB, statsA, statsB, currentWeights);
  });
});

// ── FIXED GRAPHIC LAYOUT CALCULATION GENERATOR ──
function renderResults(scoreA, scoreB, statsA, statsB, weights) {
  const section = document.getElementById('resultsSection');
  const inner   = document.getElementById('resultsInner');

  let diffPct = 0, diffLabel = '', diffClass = 'neutral', verdictClass = 'sidegrade', verdictIcon = '◈', verdictText = 'Sidegrade', verdictDesc = 'Marginal matrix variation.';

  // PROTECTION LAUNCHER AGAINST DIV-BY-ZERO RUNAWAY VALUES
  if (scoreA === 0 && scoreB === 0) {
    diffPct = 0; diffLabel = 'no change'; verdictText = 'Null Core'; verdictDesc = 'No readable parameters discovered.';
  } else if (scoreA === 0 && scoreB > 0) {
    diffPct = 100; diffLabel = '% better'; diffClass = 'positive'; verdictClass = 'upgrade'; verdictIcon = '▲'; verdictText = 'Upgrade'; verdictDesc = 'Target item yields clean baseline synchronization.';
  } else if (scoreB === 0 && scoreA > 0) {
    diffPct = 100; diffLabel = '% worse'; diffClass = 'negative'; verdictClass = 'downgrade'; verdictIcon = '▼'; verdictText = 'Downgrade'; verdictDesc = 'Retain baseline item layout.';
  } else {
    const raw = ((scoreB - scoreA) / scoreA) * 100;
    diffPct = Math.abs(Math.round(raw * 10) / 10);
    diffLabel = raw >= 0 ? '% better' : '% worse';
    diffClass = raw >= 0 ? 'positive' : 'negative';

    if (raw > 5) {
      verdictClass = 'upgrade'; verdictIcon = '▲'; verdictText = 'Upgrade'; verdictDesc = 'Noticeable stat efficiency increase.';
    } else if (raw < -5) {
      verdictClass = 'downgrade'; verdictIcon = '▼'; verdictText = 'Downgrade'; verdictDesc = 'Performance degradation vector detected.';
    } else {
      verdictClass = 'sidegrade'; verdictIcon = '◈'; verdictText = 'Sidegrade'; verdictDesc = 'Negligible variance.';
    }
  }

  const maxScore = Math.max(scoreA, scoreB, 1);
  const barA = Math.round((scoreA / maxScore) * 100);
  const barB = Math.round((scoreB / maxScore) * 100);
  const winnerA = scoreA >= scoreB;

  inner.innerHTML = `
    <div class="verdict-banner ${verdictClass}">
      <div class="verdict-icon">${verdictIcon}</div>
      <div><div class="verdict-label ${verdictClass}">${verdictText}</div><div class="verdict-desc">${verdictDesc}</div></div>
      <div class="verdict-diff"><div class="diff-pct ${diffClass}">${diffPct > 0 ? diffPct + '%' : '—'}</div><div class="diff-label">${diffLabel}</div></div>
    </div>
    <div class="scores-grid">
      <div class="score-card">
        <div class="score-card-label">Current Item</div><div class="score-value">${scoreA.toFixed(1)}</div>
        <div class="score-bar-track"><div class="score-bar-fill ${winnerA ? 'winner' : ''}" style="width:0%" data-target="${barA}"></div></div>
        <div class="stat-breakdown">
          ${statsA.map(s => `<div class="breakdown-row"><span class="breakdown-stat">${s.label}</span><span class="breakdown-val">${s.value}${s.isPercent ? '%' : ''}</span></div>`).join('') || '<div class="preview-hint">No explicit mods tracked.</div>'}
        </div>
      </div>
      <div class="score-card">
        <div class="score-card-label">Market Item</div><div class="score-value">${scoreB.toFixed(1)}</div>
        <div class="score-bar-track"><div class="score-bar-fill ${!winnerA ? 'winner' : ''}" style="width:0%" data-target="${barB}"></div></div>
        <div class="stat-breakdown">
          ${statsB.map(s => `<div class="breakdown-row"><span class="breakdown-stat">${s.label}</span><span class="breakdown-val">${s.value}${s.isPercent ? '%' : ''}</span></div>`).join('') || '<div class="preview-hint">No explicit mods tracked.</div>'}
        </div>
      </div>
    </div>
    <div class="weight-legend"><span class="weight-legend-title">Active Weights:</span>${Object.entries(weights).map(([c, w]) => `<span class="build-tag ${w >= 2 ? 'high' : w >= 1 ? 'mid' : 'low'}">${c} ×${w.toFixed(1)}</span>`).join('')}</div>
  `;

  section.classList.add('visible');
  section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  requestAnimationFrame(() => { requestAnimationFrame(() => { document.querySelectorAll('.score-bar-fill').forEach(b => b.style.width = b.dataset.target + '%'); }); });
}

/* ═══════════════════════════════════════════════════
   EXILE'S LENS — app_3.js (STRICTLY HARDENED RUNTIME)
   Item parsing, client-side OCR parsing, and scoring engine
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
  { keys: ['energy shield', '\\bes\\b'],                                 cat: 'defense', label: 'Energy Shield' }, // Escaped boundary to prevent random character matching
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

// Structural Sorting: Ensures longest keys match first
STAT_DEFINITIONS.forEach(def => { def.keys.sort((a, b) => b.length - a.length); });
STAT_DEFINITIONS.sort((a, b) => {
  const maxA = Math.max(...a.keys.map(k => k.replace(/\\b/g, '').length));
  const maxB = Math.max(...b.keys.map(k => k.replace(/\\b/g, '').length));
  return maxB - maxA;
});

// ── BUILD SCALARS ──
const BUILD_WEIGHTS = {
  damage:   { damage: 3.0, attribute: 0.6, defense: 0.4, utility: 0.5 },
  tank:     { damage: 0.5, attribute: 0.6, defense: 3.0, utility: 0.8 },
  balanced: { damage: 1.5, attribute: 0.8, defense: 1.5, utility: 0.7 },
};

const BUILD_TAG_DATA = {
  damage:   [ { text: 'Damage ×3.0', tier: 'high' }, { text: 'Utility ×0.5', tier: 'mid' }, { text: 'Defense ×0.4', tier: 'low' } ],
  tank:     [ { text: 'Defense ×3.0', tier: 'high' }, { text: 'Utility ×0.8', tier: 'mid' }, { text: 'Damage ×0.5', tier: 'low' } ],
  balanced: [ { text: 'Damage ×1.5', tier: 'high' }, { text: 'Defense ×1.5', tier: 'high' }, { text: 'Utility ×0.7', tier: 'low' } ],
};

function renderBuildTags(build) {
  const tags = BUILD_TAG_DATA[build] || [];
  document.getElementById('buildTags').innerHTML = tags.map(t => `<span class="build-tag ${t.tier}">${t.text}</span>`).join('');
}

document.getElementById('buildType').addEventListener('change', function () { renderBuildTags(this.value); });
renderBuildTags('damage');

// ── HARDENED PARSING ENGINE ──
function parseItem(text) {
  if (!text || !text.trim()) return [];

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const found = [];

  for (const line of lines) {
    let cleanedLine = line.toLowerCase().replace(/\([^)]+\)/g, '').replace(/\{[^}]+\}/g, '');
    
    // Extract numerical elements first
    const numbers = [];
    const numReg = /[\d]+(?:\.\d+)?/g;
    let m;
    while ((m = numReg.exec(cleanedLine)) !== null) {
      const numStr = m[0];
      if (parseFloat(numStr) > 50000) continue; // Drop rogue UI timestamps or aspect ratios
      numbers.push(parseFloat(numStr));
    }

    // CRITICAL BUGFIX: If there's no actual number on the line, skip completely.
    // This stops lines like "fries = = = = " from being evaluated as +0 stats.
    if (numbers.length === 0) continue;

    let matched = null;
    for (const def of STAT_DEFINITIONS) {
      const matchFound = def.keys.some(k => {
        // If key already contains regex boundaries, use it directly; otherwise construct word boundary check
        const regexStr = k.startsWith('\\b') ? k : `\\b${k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`;
        const rx = new RegExp(regexStr, 'i');
        return rx.test(cleanedLine);
      });

      if (matchFound) {
        matched = def;
        break;
      }
    }

    // Skip line if it doesn't map directly to a valid explicit modifier word boundary
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

function calculateScore(stats, build) {
  const weights = BUILD_WEIGHTS[build] || BUILD_WEIGHTS.balanced;
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

// ── INPUT ASSIGNMENT LISTENERS ──
document.getElementById('itemA').addEventListener('input', () => updatePreview('itemA', 'previewA'));
document.getElementById('itemB').addEventListener('input', () => updatePreview('itemB', 'previewB'));

document.getElementById('clearA').addEventListener('click', () => { document.getElementById('itemA').value = ''; updatePreview('itemA', 'previewA'); });
document.getElementById('clearB').addEventListener('click', () => { document.getElementById('itemB').value = ''; updatePreview('itemB', 'previewB'); });

// ── TESSERACT CLIENT IMAGE OCR IMPLEMENTATION (STRICT AFFIX SANITATION) ──
document.querySelectorAll('.item-image-input').forEach(input => {
  input.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const targetTextareaId = this.dataset.target;
    const targetPreviewId = targetTextareaId === 'itemA' ? 'previewA' : 'previewB';
    if (!file) return;

    const textarea = document.getElementById(targetTextareaId);
    const previewBox = document.getElementById(targetPreviewId);
    
    textarea.value = "Consulting the lens... Extracting stats from image metadata...";
    previewBox.innerHTML = '<span class="preview-hint" style="color:var(--blue); font-weight: 600;">⚡ Reading image... Processing data metrics.</span>';

    Tesseract.recognize(file, 'eng', { logger: m => console.log(m) })
      .then(({ data: { text } }) => {
        if (!text || !text.trim()) {
          textarea.value = "";
          previewBox.innerHTML = '<span class="preview-hint" style="color:var(--red);">No readable text found.</span>';
          return;
        }

        let fixedRawText = text
          .replace(/[lI|]/g, '1')    
          .replace(/o/gi, '0')       
          .replace(/§/g, '5');       

        const rawLines = fixedRawText.split('\n').map(l => l.trim()).filter(Boolean);
        const validatedLines = [];

        for (const line of rawLines) {
          let lowerLine = line.toLowerCase();

          // Global bypass flags for game template lines that shouldn't build explicitly
          if (lowerLine.includes('attacks per second:') || 
              lowerLine.includes('critical strike chance:') ||
              lowerLine.includes('physical damage:') || 
              lowerLine.includes('elemental damage:') || 
              lowerLine.includes('item class:') || 
              lowerLine.includes('rarity:') ||
              lowerLine.includes('requirements:') ||
              lowerLine.includes('item level:')) {
            continue;
          }

          // Run strict temporary check through regex engine validation mapping before pushing to field
          const testParse = parseItem(line);
          if (testParse.length > 0) {
            let cleanOutputLine = line.replace(/\([^)]+\)/g, '').replace(/\{[^}]+\}/g, '').trim();
            if (cleanOutputLine) {
              validatedLines.push(cleanOutputLine);
            }
          }
        }

        if (validatedLines.length > 0) {
          textarea.value = validatedLines.join('\n');
        } else {
          textarea.value = "⚠️ No matching explicit modifiers discovered.\n\nRaw scan read:\n" + text.substring(0, 60) + "...";
        }
        
        updatePreview(targetTextareaId, targetPreviewId);
      })
      .catch(err => {
        textarea.value = "";
        previewBox.innerHTML = '<span class="preview-hint" style="color:var(--red);">Processing error. Ensure clear lighting.</span>';
        console.error(err);
      });
  });
});

// ── EVALUATION PIPELINE ──
document.getElementById('compareBtn').addEventListener('click', compareItems);

function compareItems() {
  const textA = document.getElementById('itemA').value.trim();
  const textB = document.getElementById('itemB').value.trim();
  const build = document.getElementById('buildType').value;

  if (!textA && !textB) { shakeButton(); return; }

  const statsA = parseItem(textA);
  const statsB = parseItem(textB);

  const scoreA = textA ? calculateScore(statsA, build) : 0;
  const scoreB = textB ? calculateScore(statsB, build) : 0;

  renderResults(scoreA, scoreB, statsA, statsB, build);
}

function shakeButton() {
  const btn = document.getElementById('compareBtn');
  btn.style.animation = 'none'; btn.offsetHeight; btn.style.animation = 'shake 0.4s ease';
}

// ── FIXED OUTPUT PRESENTATION & MATH CALCULATION LAYER ──
function renderResults(scoreA, scoreB, statsA, statsB, build) {
  const section = document.getElementById('resultsSection');
  const inner   = document.getElementById('resultsInner');

  let diffPct = 0, diffLabel = '', diffClass = 'neutral', verdictClass = 'sidegrade', verdictIcon = '◈', verdictText = 'Sidegrade', verdictDesc = 'Marginal matrix variation.';

  // CRITICAL MATH BOUNDARY BUGFIX: Protects layout against division by zero and extreme values
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

  const weights = BUILD_WEIGHTS[build] || BUILD_WEIGHTS.balanced;

  inner.innerHTML = `
    <div class="verdict-banner ${verdictClass}">
      <div class="verdict-icon">${verdictIcon}</div>
      <div><div class="verdict-label ${verdictClass}">${verdictText}</div><div class="verdict-desc">${verdictDesc}</div></div>
      <div class="verdict-diff"><div class="diff-pct ${diffClass}">${diffPct > 0 ? diffPct + '%' : '—'}</div><div class="diff-label">${diffLabel}</div></div>
    </div>
    <div class="scores-grid">
      <!-- CURRENT ITEM CARD -->
      <div class="score-card">
        <div class="score-card-label">Current Item</div><div class="score-value">${scoreA.toFixed(1)}</div>
        <div class="score-bar-track"><div class="score-bar-fill ${winnerA ? 'winner' : ''}" style="width:0%" data-target="${barA}"></div></div>
        <div class="stat-breakdown">
          ${statsA.map(s => `
            <div class="breakdown-row">
              <span class="breakdown-stat">${s.label}</span>
              <span class="breakdown-val">${s.raw && s.raw.trim().startsWith('+') ? '+' : ''}${s.value}${s.isPercent ? '%' : ''}</span>
            </div>
          `).join('') || '<div class="preview-hint">No explicit mods tracked.</div>'}
        </div>
      </div>
      <!-- MARKET ITEM CARD -->
      <div class="score-card">
        <div class="score-card-label">Market Item</div><div class="score-value">${scoreB.toFixed(1)}</div>
        <div class="score-bar-track"><div class="score-bar-fill ${!winnerA ? 'winner' : ''}" style="width:0%" data-target="${barB}"></div></div>
        <div class="stat-breakdown">
          ${statsB.map(s => `
            <div class="breakdown-row">
              <span class="breakdown-stat">${s.label}</span>
              <span class="breakdown-val">${s.raw && s.raw.trim().startsWith('+') ? '+' : ''}${s.value}${s.isPercent ? '%' : ''}</span>
            </div>
          `).join('') || '<div class="preview-hint">No explicit mods tracked.</div>'}
        </div>
      </div>
    </div>
    <div class="weight-legend"><span class="weight-legend-title">Active Weights:</span>${Object.entries(weights).map(([c, w]) => `<span class="build-tag ${w >= 2 ? 'high' : w >= 1 ? 'mid' : 'low'}">${c} ×${w}</span>`).join('')}</div>
  `;

  section.classList.add('visible');
  section.scrollIntoView({ behavior: 'smooth', block: 'nearest');
  requestAnimationFrame(() => { requestAnimationFrame(() => { document.querySelectorAll('.score-bar-fill').forEach(b => b.style.width = b.dataset.target + '%'); }); });
}

// ── HOOK SCANNING PERFORMANCE GUIDE ON INIT ──
document.addEventListener("DOMContentLoaded", () => {
  const buildSection = document.querySelector(".build-section");
  if (buildSection) {
    const guideBox = document.createElement("div");
    guideBox.className = "build-section";
    guideBox.style.marginTop = "-20px";
    guideBox.style.marginBottom = "36px";
    guideBox.style.padding = "16px 20px";
    guideBox.style.background = "rgba(10, 8, 4, 0.4)";
    guideBox.style.border = "1px dashed rgba(200, 169, 110, 0.2)";
    
    guideBox.innerHTML = `
      <label class="section-label" style="color: var(--gold); margin-bottom: 6px; font-size: 10px;">📸 OPTIMAL SCREENSHOT SCANNING GUIDE</label>
      <p style="font-size: 14px; color: var(--text-dim); line-height: 1.5; margin: 0;">
        For precise OCR matching, clip your images directly around the item affix panel. Removing phone UI elements or noisy inventory borders guarantees flawless tracking metrics.
      </p>
    `;
    buildSection.parentNode.insertBefore(guideBox, buildSection.nextSibling);
  }
});

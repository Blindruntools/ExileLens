/* ═══════════════════════════════════════════════════
   EXILE'S LENS — app_3.js
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
  { keys: ['energy shield', 'es'],                                       cat: 'defense', label: 'Energy Shield' },
  { keys: ['block chance', 'block'],                                     cat: 'defense', label: 'Block Chance' },
  { keys: ['fire resistance', 'fire res'],                               cat: 'defense', label: 'Fire Res' },
  { keys: ['cold resistance', 'cold res'],                               cat: 'defense', label: 'Cold Res' },
  { keys: ['lightning resistance', 'lightning res'],                     cat: 'defense', label: 'Lightning Res' },
  { keys: ['chaos resistance', 'chaos res'],                             cat: 'defense', label: 'Chaos Res' },
  { keys: ['all resistances', 'all res', 'elemental resistances'],      cat: 'defense', label: 'All Resistances' },
  { keys: ['spell suppression', 'suppress'],                             cat: 'defense', label: 'Spell Suppression' },

  // ATTRIBUTES
  { keys: ['strength', ' str '],                      cat: 'attribute', label: 'Strength' },
  { keys: ['dexterity', ' dex '],                     cat: 'attribute', label: 'Dexterity' },
  { keys: ['intelligence', ' int '],                  cat: 'attribute', label: 'Intelligence' },
  { keys: ['all attributes', 'all stats'],            cat: 'attribute', label: 'All Attributes' },

  // UTILITY
  { keys: ['movement speed', 'move speed'],           cat: 'utility',  label: 'Movement Speed' },
  { keys: ['cooldown recovery', 'cooldown'],          cat: 'utility',  label: 'Cooldown Recovery' },
  { keys: ['flask charges', 'flask'],                 cat: 'utility',  label: 'Flask Effect' },
  { keys: ['mana', 'mana cost'],                      cat: 'utility',  label: 'Mana' },
];

// Structural Pre-sorting block to mitigate string matching collisions
STAT_DEFINITIONS.forEach(def => { def.keys.sort((a, b) => b.length - a.length); });
STAT_DEFINITIONS.sort((a, b) => {
  const maxA = Math.max(...a.keys.map(k => k.length));
  const maxB = Math.max(...b.keys.map(k => k.length));
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

// ── PARSING AND NORMALIZATION ENGINE ──
function parseItem(text) {
  if (!text || !text.trim()) return []; // cite: 4

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean); // cite: 4
  const found = []; // cite: 4

  for (const line of lines) { // cite: 4
    let cleanedLine = line.toLowerCase(); // cite: 4
    
    // Wipe artifact metadata flags
    cleanedLine = cleanedLine.replace(/\([^)]+\)/g, '').replace(/\{[^}]+\}/g, ''); // cite: 4

    // 1. Strict Keyword Verification
    let matched = null; // cite: 4
    for (const def of STAT_DEFINITIONS) { // cite: 4
      if (def.keys.some(k => cleanedLine.includes(k))) { // cite: 4
        matched = def; // cite: 4
        break; // cite: 4
      }
    }

    // Drop line immediately if it has zero recognized PoE stats
    if (!matched) continue; // cite: 4

    // 2. Localized Extraction
    const numbers = []; // cite: 4
    const numReg = /[\d]+(?:\.\d+)?/g; // cite: 4
    let m; // cite: 4
    while ((m = numReg.exec(cleanedLine)) !== null) { // cite: 4
      const numStr = m[0]; // cite: 4
      // Sanity Filter: Drop rogue UI strings or item IDs that aren't real stat tiers
      if (parseFloat(numStr) > 50000) continue; // cite: 4
      numbers.push(parseFloat(numStr)); // cite: 4
    }

    if (numbers.length === 0) continue; // cite: 4

    let value = 0; // cite: 4
    if (cleanedLine.includes('to') && numbers.length === 2) { // cite: 4
      value = (numbers[0] + numbers[1]) / 2; // cite: 4
    } else {
      value = numbers[0]; // cite: 4
    }

    // Flag if it's a percentage modifier based on line text or stat types
    const isPercent = line.includes('%') || cleanedLine.includes('speed') || cleanedLine.includes('chance') || cleanedLine.includes('multiplier') || cleanedLine.includes('res');

    found.push({ 
      label: matched.label, 
      category: matched.cat, 
      value, 
      raw: line,
      isPercent: isPercent
    }); // cite: 4
  }
  return found; // cite: 4
}

function calculateScore(stats, build) {
  const weights = BUILD_WEIGHTS[build] || BUILD_WEIGHTS.balanced; // cite: 4
  let total = 0; // cite: 4
  for (const stat of stats) { total += stat.value * (weights[stat.category] ?? 1.0); } // cite: 4
  return Math.round(total * 10) / 10; // cite: 4
}

function updatePreview(textareaId, previewId) {
  const text  = document.getElementById(textareaId).value; // cite: 4
  const stats = parseItem(text); // cite: 4
  const preview = document.getElementById(previewId); // cite: 4

  if (stats.length === 0) {
    preview.innerHTML = '<span class="preview-hint">Paste stats or tap Scan Image ↑</span>'; // cite: 4
    return; // cite: 4
  }
  preview.innerHTML = `<div class="stat-chips">${stats.map(s => `<span class="stat-chip" title="${s.raw}">+${s.value}${s.isPercent ? '%' : ''} ${s.label}</span>`).join('')}</div>`;
}

// ── INPUT ASSIGNMENT LISTENERS ──
document.getElementById('itemA').addEventListener('input', () => updatePreview('itemA', 'previewA')); // cite: 4
document.getElementById('itemB').addEventListener('input', () => updatePreview('itemB', 'previewB'));

// UI Control Resets
document.getElementById('clearA').addEventListener('click', () => { document.getElementById('itemA').value = ''; updatePreview('itemA', 'previewA'); }); // cite: 4
document.getElementById('clearB').addEventListener('click', () => { document.getElementById('itemB').value = ''; updatePreview('itemB', 'previewB'); }); // cite: 4

// ── FIX 1: TESSERACT CLIENT IMAGE OCR IMPLEMENTATION (PRE-FILTERED ENVIRONMENT) ──
document.querySelectorAll('.item-image-input').forEach(input => {
  input.addEventListener('change', function(e) {
    const file = e.target.files[0]; // cite: 4
    const targetTextareaId = this.dataset.target; // cite: 4
    const targetPreviewId = targetTextareaId === 'itemA' ? 'previewA' : 'previewB'; // cite: 4
    if (!file) return; // cite: 4

    const textarea = document.getElementById(targetTextareaId); // cite: 4
    const previewBox = document.getElementById(targetPreviewId); // cite: 4
    
    textarea.value = "Consulting the lens... Extracting stats from image metadata..."; // cite: 4
    previewBox.innerHTML = '<span class="preview-hint" style="color:var(--blue); font-weight: 600;">⚡ Reading image... Processing data metrics.</span>'; // cite: 4

    Tesseract.recognize(file, 'eng', { logger: m => console.log(m) }) // cite: 4
      .then(({ data: { text } }) => {
        if (!text || !text.trim()) {
          textarea.value = "";
          previewBox.innerHTML = '<span class="preview-hint" style="color:var(--red);">No readable text found.</span>';
          return;
        }

        // Run global OCR character fix passes
        let fixedRawText = text
          .replace(/[lI|]/g, '1')    // Correct vertical pipeline read mismatches cleanly
          .replace(/o/gi, '0')       // Prevent character zero reading as text alphabet characters
          .replace(/§/g, '5');       // Clean up common math notation anomalies

        // Split text and strip out operating system headers, item details, or frame clutter
        const rawLines = fixedRawText.split('\n').map(l => l.trim()).filter(Boolean);
        const validatedLines = [];

        for (const line of rawLines) {
          let lowerLine = line.toLowerCase();

          // Auto-discard metadata headers and block metrics that aren't explicit affixes
          if (lowerLine.includes('damage:') || 
              lowerLine.includes('chance:') || 
              lowerLine.includes('second:') || 
              lowerLine.includes('class:') || 
              lowerLine.includes('rarity:') ||
              lowerLine.includes('requirements:') ||
              lowerLine.includes('item level:')) {
            continue;
          }

          // Cross-verify against recognized stat dictionaries
          const isRealStat = STAT_DEFINITIONS.some(def => 
            def.keys.some(k => lowerLine.includes(k))
          );

          if (isRealStat) {
            let cleanOutputLine = line.replace(/\([^)]+\)/g, '').replace(/\{[^}]+\}/g, '').trim();
            if (cleanOutputLine) {
              validatedLines.push(cleanOutputLine);
            }
          }
        }

        // Render clean structural lines into UI
        if (validatedLines.length > 0) {
          textarea.value = validatedLines.join('\n');
        } else {
          textarea.value = "⚠️ No mod text matched.\n\nRaw text found:\n" + text.substring(0, 60) + "...";
        }
        
        updatePreview(targetTextareaId, targetPreviewId); // cite: 4
      })
      .catch(err => {
        textarea.value = ""; // cite: 4
        previewBox.innerHTML = '<span class="preview-hint" style="color:var(--red);">Processing error. Ensure clear lighting.</span>'; // cite: 4
        console.error(err); // cite: 4
      });
  });
});

// ── EVALUATION PIPELINE ──
document.getElementById('compareBtn').addEventListener('click', compareItems); // cite: 4

function compareItems() {
  const textA = document.getElementById('itemA').value.trim(); // cite: 4
  const textB = document.getElementById('itemB').value.trim(); // cite: 4
  const build = document.getElementById('buildType').value; // cite: 4

  if (!textA && !textB) { shakeButton(); return; } // cite: 4

  const statsA = parseItem(textA); // cite: 4
  const statsB = parseItem(textB); // cite: 4

  const scoreA = textA ? calculateScore(statsA, build) : 0; // cite: 4
  const scoreB = textB ? calculateScore(statsB, build) : 0; // cite: 4

  renderResults(scoreA, scoreB, statsA, statsB, build); // cite: 4
}

function shakeButton() {
  const btn = document.getElementById('compareBtn'); // cite: 4
  btn.style.animation = 'none'; btn.offsetHeight; btn.style.animation = 'shake 0.4s ease'; // cite: 4
}

// ── FIX 2: DYNAMIC OUTPUT PRESENTATION LAYER ──
function renderResults(scoreA, scoreB, statsA, statsB, build) {
  const section = document.getElementById('resultsSection'); // cite: 4
  const inner   = document.getElementById('resultsInner'); // cite: 4

  let diffPct = 0, diffLabel = '', diffClass = 'neutral', verdictClass = 'sidegrade', verdictIcon = '◈', verdictText = 'Sidegrade', verdictDesc = 'Marginal matrix variation.'; // cite: 4

  if (scoreA === 0 && scoreB === 0) {
    verdictText = 'Null Core'; verdictDesc = 'No readable parameters found.'; // cite: 4
  } else if (scoreA === 0) {
    diffPct = 100; diffLabel = '% better'; diffClass = 'positive'; verdictClass = 'upgrade'; verdictIcon = '▲'; verdictText = 'Upgrade'; verdictDesc = 'Market target yields clear optimization.'; // cite: 4
  } else if (scoreB === 0) {
    diffPct = 100; diffLabel = '% worse'; diffClass = 'negative'; verdictClass = 'downgrade'; verdictIcon = '▼'; verdictText = 'Downgrade'; verdictDesc = 'Retain equipped element.'; // cite: 4
  } else {
    const raw = ((scoreB - scoreA) / scoreA) * 100; // cite: 4
    diffPct = Math.abs(Math.round(raw * 10) / 10); // cite: 4
    diffLabel = raw >= 0 ? '% better' : '% worse'; // cite: 4
    diffClass = raw >= 0 ? 'positive' : 'negative'; // cite: 4

    if (raw > 5) {
      verdictClass = 'upgrade'; verdictIcon = '▲'; verdictText = 'Upgrade'; verdictDesc = 'Noticeable stat efficiency increase.'; // cite: 4
    } else if (raw < -5) {
      verdictClass = 'downgrade'; verdictIcon = '▼'; verdictText = 'Downgrade'; verdictDesc = 'Performance degradation vector detected.'; // cite: 4
    } else {
      verdictClass = 'sidegrade'; verdictIcon = '◈'; verdictText = 'Sidegrade'; verdictDesc = 'Negligible variance. Balance based on resistance needs.'; // cite: 4
    }
  }

  const maxScore = Math.max(scoreA, scoreB, 1); // cite: 4
  const barA = Math.round((scoreA / maxScore) * 100); // cite: 4
  const barB = Math.round((scoreB / maxScore) * 100); // cite: 4
  const winnerA = scoreA >= scoreB; // cite: 4

  const weights = BUILD_WEIGHTS[build] || BUILD_WEIGHTS.balanced; // cite: 4

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
          ${statsA.map(s => `
            <div class="breakdown-row">
              <span class="breakdown-stat">${s.label}</span>
              <span class="breakdown-val">${s.raw && s.raw.trim().startsWith('+') ? '+' : ''}${s.value}${s.isPercent ? '%' : ''}</span>
            </div>
          `).join('') || '<div class="preview-hint">No valid mods.</div>'}
        </div>
      </div>
      <div class="score-card">
        <div class="score-card-label">Market Item</div><div class="score-value">${scoreB.toFixed(1)}</div>
        <div class="score-bar-track"><div class="score-bar-fill ${!winnerA ? 'winner' : ''}" style="width:0%" data-target="${barB}"></div></div>
        <div class="stat-breakdown">
          ${statsB.map(s => `
            <div class="breakdown-row">
              <span class="breakdown-stat">${s.label}</span>
              <span class="breakdown-val">${s.raw && s.raw.trim().startsWith('+') ? '+' : ''}${s.value}${s.isPercent ? '%' : ''}</span>
            </div>
          `).join('') || '<div class="preview-hint">No valid mods.</div>'}
        </div>
      </div>
    </div>
    <div class="weight-legend"><span class="weight-legend-title">Active Weights:</span>${Object.entries(weights).map(([c, w]) => `<span class="build-tag ${w >= 2 ? 'high' : w >= 1 ? 'mid' : 'low'}">${c} ×${w}</span>`).join('')}</div>
  `; // cite: 4

  section.classList.add('visible'); // cite: 4
  section.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // cite: 4
  requestAnimationFrame(() => { requestAnimationFrame(() => { document.querySelectorAll('.score-bar-fill').forEach(b => b.style.width = b.dataset.target + '%'); }); }); // cite: 4
}

// ── DYNAMIC INJECTION: SCANNING HOW-TO-USE GUIDE ──
document.addEventListener("DOMContentLoaded", () => {
  const buildSection = document.querySelector(".build-section"); // cite: 4
  if (buildSection) { // cite: 4
    const guideBox = document.createElement("div"); // cite: 4
    guideBox.className = "build-section"; // cite: 4
    guideBox.style.marginTop = "-20px"; // cite: 4
    guideBox.style.marginBottom = "36px"; // cite: 4
    guideBox.style.padding = "16px 20px"; // cite: 4
    guideBox.style.background = "rgba(10, 8, 4, 0.4)"; // cite: 4
    guideBox.style.border = "1px dashed rgba(200, 169, 110, 0.2)"; // cite: 4
    
    guideBox.innerHTML = `
      <label class="section-label" style="color: var(--gold); margin-bottom: 6px; font-size: 10px;">
        📸 OPTIMAL SCREENSHOT SCANNING GUIDE
      </label>
      <p style="font-size: 14px; color: var(--text-dim); line-height: 1.5; margin: 0;">
        For high precision OCR matching, take a <strong style="color: var(--gold-bright);">tight, clear screenshot focusing strictly on the item mods text block</strong>. Crop out peripheral information such as operating system phone headers (clock/battery signals) or game background artifacts to eliminate reading errors.
      </p>
    `; // cite: 4
    buildSection.parentNode.insertBefore(guideBox, buildSection.nextSibling); // cite: 4
  }
});

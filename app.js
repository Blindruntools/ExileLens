/**
 * EXILE'S LENS — High-Precision Local Character Scanner
 */

const POE2_MODIFIER_DICTIONARY = {
  implicits: [
    { id: 'inc_attr_req', label: '% Increased Attribute Requirements', keywords: ['attribute', 'requirement', 'increased'], weight: -1.0 },
    { id: 'base_armour', label: 'Base Armour Value', keywords: ['armour'], weight: 1.0 },
    { id: 'base_evasion', label: 'Base Evasion Value', keywords: ['evasion'], weight: 1.0 }
  ],
  defences: [
    { id: 'armour_pct', label: '% Increased Armour', keywords: ['increased', 'armour'], weight: 2.0 },
    { id: 'evasion_pct', label: '% Increased Evasion', keywords: ['increased', 'evasion'], weight: 2.0 },
    { id: 'energy_shield', label: '+ to Energy Shield', keywords: ['energy', 'shield'], weight: 1.5 }
  ],
  attributes: [
    { id: 'strength', label: '+ to Strength', keywords: ['strength'], weight: 1.5 },
    { id: 'dexterity', label: '+ to Dexterity', keywords: ['dexterity'], weight: 1.5 },
    { id: 'intelligence', label: '+ to Intelligence', keywords: ['intelligence'], weight: 1.5 },
    { id: 'all_stats', label: '+ to All Attributes', keywords: ['all', 'attributes'], weight: 4.5 }
  ],
  resists: [
    { id: 'fire_res', label: '% Fire Resistance', keywords: ['fire', 'resistance'], weight: 1.2 },
    { id: 'cold_res', label: '% Cold Resistance', keywords: ['cold', 'resistance'], weight: 1.2 },
    { id: 'lightning_res', label: '% Lightning Resistance', keywords: ['lightning', 'resistance'], weight: 1.2 },
    { id: 'chaos_res', label: '% Chaos Resistance', keywords: ['chaos', 'resistance'], weight: 2.5 }
  ],
  resources: [
    { id: 'max_life', label: '+ to Maximum Life', keywords: ['maximum', 'life'], weight: 2.0 },
    { id: 'max_mana', label: '+ to Maximum Mana', keywords: ['maximum', 'mana'], weight: 1.5 },
    { id: 'spirit', label: '+ to Spirit', keywords: ['spirit'], weight: 4.0 }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  renderPanels('menuA', 'panelA');
  renderPanels('menuB', 'panelB');
  initActionListeners();
});

function renderPanels(containerId, prefix) {
  const target = document.getElementById(containerId);
  target.innerHTML = '';

  Object.keys(POE2_MODIFIER_DICTIONARY).forEach(cat => {
    const section = document.createElement('div');
    section.className = 'attribute-category-group';
    section.innerHTML = `<div class="category-group-title">${cat.toUpperCase()}</div>`;

    POE2_MODIFIER_DICTIONARY[cat].forEach(mod => {
      const row = document.createElement('div');
      row.className = 'attribute-menu-row';
      row.innerHTML = `
        <label>${mod.label}</label>
        <div class="row-controls">
          <button type="button" class="ctrl-btn" onclick="tweak('${prefix}_${mod.id}', -1)">-</button>
          <input type="number" id="${prefix}_${mod.id}" value="0" />
          <button type="button" class="ctrl-btn" onclick="tweak('${prefix}_${mod.id}', 1)">+</button>
        </div>
      `;
      section.appendChild(row);
    });
    target.appendChild(section);
  });
}

function tweak(id, offset) {
  const el = document.getElementById(id);
  if (el) el.value = Math.max(0, (parseInt(el.value, 10) || 0) + offset);
}

function initActionListeners() {
  document.querySelectorAll('.scan-trigger-btn').forEach(btn => {
    btn.addEventListener('click', () => document.getElementById(btn.getAttribute('data-target')).click());
  });

  document.querySelectorAll('.item-image-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const targetPrefix = input.id.includes('itemA') ? 'panelA' : 'panelB';
      const indicator = input.previousElementSibling;
      indicator.innerText = '⏳ SHARPENING FILTER...';

      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = async function() {
          // Process contrast matrix through canvas viewport layers
          const processedDataUrl = filterBackgroundNoise(img);
          indicator.innerText = '🔮 RUNNING LEXER...';

          try {
            // Apply strict character constraints to prevent symbol tracking failures
            const res = await Tesseract.recognize(processedDataUrl, 'eng', {
              tessedit_char_whitelist: '0123456789+- %abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:',
              tessedit_pageseg_mode: '6' 
            });
            processCleanTextTokens(res.data.text, targetPrefix);
          } catch (err) {
            console.error("Local Scan Exception: ", err);
          } finally {
            indicator.innerText = '📸 SCAN IMAGE';
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  });

  document.getElementById('clearA').addEventListener('click', () => resetAll('panelA'));
  document.getElementById('clearB').addEventListener('click', () => resetAll('panelB'));
  document.getElementById('compareBtn').addEventListener('click', runComparisonEngine);
}

/**
 * High-Contrast Binarization Matrix Filter
 * Strips game art background blending, turning font characters stark white and backgrounds pure black.
 */
function filterBackgroundNoise(imageElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  ctx.drawImage(imageElement, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imgData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    // Detect PoE2 specific color bounds (White, Magic Blue, Rare Gold text values)
    const matchesFontProfile = (r > 130 && g > 115 && b > 85) || (b > 175 && r < 115) || (r > 180 && g > 170 && b > 150);

    const binaryValue = matchesFontProfile ? 255 : 0;
    pixels[i] = pixels[i + 1] = pixels[i + 2] = binaryValue; 
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Tokenization Rule Processor
 */
function processCleanTextTokens(rawText, prefix) {
  const blocks = rawText.toLowerCase().split('\n').map(line => line.trim()).filter(line => line.length > 2);

  blocks.forEach(line => {
    // Isolate value modifiers (+54, 120, -10)
    const numericRegexMatch = line.match(/([-+]?\d+)/);
    if (!numericRegexMatch) return;
    const cleanInteger = parseInt(numericRegexMatch[0], 10);

    Object.keys(POE2_MODIFIER_DICTIONARY).forEach(cat => {
      POE2_MODIFIER_DICTIONARY[cat].forEach(mod => {
        let keywordHits = 0;
        
        mod.keywords.forEach(word => {
          if (line.includes(word) || computeLevenshteinDistance(line, word) < 2) {
            keywordHits++;
          }
        });

        // Verify total hit threshold overrides to guarantee precision
        if (keywordHits >= Math.ceil(mod.keywords.length * 0.7)) {
          const uiTargetNode = document.getElementById(`${prefix}_${mod.id}`);
          if (uiTargetNode) {
            uiTargetNode.value = Math.abs(cleanInteger);
          }
        }
      });
    });
  });
}

// Intercepts character drops from image noise artifacts
function computeLevenshteinDistance(s1, s2) {
  let costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function resetAll(prefix) {
  document.querySelectorAll(`[id^="${prefix}_"]`).forEach(i => i.value = 0);
}

function runComparisonEngine() {
  let scoreA = 0, scoreB = 0;
  let summary = [];

  Object.keys(POE2_MODIFIER_DICTIONARY).forEach(cat => {
    POE2_MODIFIER_DICTIONARY[cat].forEach(mod => {
      const valA = parseInt(document.getElementById(`panelA_${mod.id}`).value, 10) || 0;
      const valB = parseInt(document.getElementById(`panelB_${mod.id}`).value, 10) || 0;

      if (valA !== 0 || valB !== 0) {
        scoreA += valA * mod.weight;
        scoreB += valB * mod.weight;
        summary.push({ label: mod.label, a: valA, b: valB });
      }
    });
  });

  displayAnalysis(scoreA, scoreB, summary);
}

function displayAnalysis(sA, sB, metrics) {
  const wrapper = document.getElementById('resultsSection');
  const inner = document.getElementById('resultsInner');
  
  const totalShift = sA === 0 ? sB * 100 : ((sB - sA) / sA) * 100;
  const pctClass = totalShift >= 0 ? 'positive' : 'negative';

  inner.innerHTML = `
    <div class="verdict-banner" style="border-left: 4px solid var(--gold);">
      <div>
        <div class="verdict-label">Local Character Scan Evaluation Done</div>
        <div class="verdict-desc">Item values calculated accurately using canvas pre-filtering.</div>
      </div>
      <div class="verdict-diff">
        <div class="diff-pct ${pctClass}">${totalShift >= 0 ? '+' : ''}${totalShift.toFixed(1)}%</div>
        <div class="diff-label">Calculated Differential</div>
      </div>
    </div>
    <div class="score-card">
      <div class="stat-breakdown">
        ${metrics.map(m => `<div class="breakdown-row"><span class="breakdown-stat">${m.label}</span><span class="breakdown-val">${m.a} ➔ ${m.b}</span></div>`).join('')}
      </div>
    </div>
  `;
  wrapper.className = "results-section visible";
}

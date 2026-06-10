/**
 * EXILE'S LENS — Contextual Client-Side Scanning Matrix
 */

const POE2_CONTEXTUAL_DATABASE = {
  weapons: {
    implicits: [
      { id: 'crit_chance', label: 'Base Critical Hit Chance %', keywords: ['critical', 'chance'], weight: 1.5 },
      { id: 'attack_speed', label: 'Attacks Per Second', keywords: ['attacks', 'second'], weight: 3.0 }
    ],
    damage_metrics: [
      { id: 'phys_dmg_min', label: 'Min Physical Damage', keywords: ['physical', 'damage'], weight: 2.0 },
      { id: 'phys_dmg_max', label: 'Max Physical Damage', keywords: ['physical', 'damage'], weight: 2.0 },
      { id: 'lightning_dmg', label: 'Adds to Lightning Damage', keywords: ['added', 'lightning', 'damage'], weight: 2.5 },
      { id: 'fire_dmg', label: 'Adds to Fire Damage', keywords: ['added', 'fire', 'damage'], weight: 2.5 },
      { id: 'cold_dmg', label: 'Adds to Cold Damage', keywords: ['added', 'cold', 'damage'], weight: 2.5 }
    ],
    utility: [
      { id: 'stun_duration', label: '% Increased Stun Duration', keywords: ['stun', 'duration', 'increased'], weight: 1.0 },
      { id: 'cast_speed', label: '% Increased Cast Speed', keywords: ['cast', 'speed', 'increased'], weight: 2.5 }
    ]
  },
  armor: {
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
    resources: [
      { id: 'max_life', label: '+ to Maximum Life', keywords: ['maximum', 'life'], weight: 2.0 },
      { id: 'spirit', label: '+ to Spirit', keywords: ['spirit'], weight: 4.0 }
    ]
  },
  jewelry: {
    implicits: [
      { id: 'base_all_res', label: '+% to all Elemental Resistances', keywords: ['all', 'elemental', 'resistances'], weight: 3.0 },
      { id: 'base_mana', label: '+ to Maximum Mana', keywords: ['maximum', 'mana'], weight: 1.0 }
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
    ]
  }
};

let currentContext = 'weapons'; // Default fallback state matrix

document.addEventListener('DOMContentLoaded', () => {
  rebuildContextualPanels();
  initActionListeners();
  setupContextTabs();
});

function setupContextTabs() {
  document.querySelectorAll('.type-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      currentContext = tab.getAttribute('data-type');
      rebuildContextualPanels();
      
      // Clear previous comparison layouts safely
      document.getElementById('resultsSection').classList.remove('visible');
    });
  });
}

function rebuildContextualPanels() {
  renderActiveMenu('menuA', 'panelA');
  renderActiveMenu('menuB', 'panelB');
}

function renderActiveMenu(containerId, prefix) {
  const target = document.getElementById(containerId);
  target.innerHTML = '';

  const activePool = POE2_CONTEXTUAL_DATABASE[currentContext];

  Object.keys(activePool).forEach(cat => {
    const section = document.createElement('div');
    section.className = 'attribute-category-group';
    section.innerHTML = `<div class="category-group-title">${cat.toUpperCase()}</div>`;

    activePool[cat].forEach(mod => {
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
      indicator.innerText = '⏳ SHARPENING FILTERS...';

      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = async function() {
          const processedDataUrl = filterBackgroundNoise(img);
          indicator.innerText = '🔮 RUNNING LEXER...';

          try {
            const res = await Tesseract.recognize(processedDataUrl, 'eng', {
              tessedit_char_whitelist: '0123456789+- %abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-:',
              tessedit_pageseg_mode: '6' 
            });
            processContextualTokens(res.data.text, targetPrefix);
          } catch (err) {
            console.error("Local Runtime Capture Error: ", err);
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

    // High fidelity capture mapping PoE2 text color styles
    const matchesFontProfile = (r > 130 && g > 115 && b > 85) || (b > 175 && r < 115) || (r > 180 && g > 170 && b > 150);

    const binaryValue = matchesFontProfile ? 255 : 0;
    pixels[i] = pixels[i + 1] = pixels[i + 2] = binaryValue; 
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Split Token Logic based on Active Component Matrix Selection State Context
 */
function processContextualTokens(rawText, prefix) {
  const lines = rawText.toLowerCase().split('\n').map(l => l.trim()).filter(l => l.length > 2);
  const activePool = POE2_CONTEXTUAL_DATABASE[currentContext];

  lines.forEach(line => {
    // Look for numbers or ranges (e.g., 25-45 or +12)
    const numbersFound = line.match(/(\d+)/g);
    if (!numbersFound) return;

    Object.keys(activePool).forEach(cat => {
      activePool[cat].forEach(mod => {
        let keywordHits = 0;
        
        mod.keywords.forEach(word => {
          if (line.includes(word) || computeLevenshteinDistance(line, word) < 2) {
            keywordHits++;
          }
        });

        if (keywordHits >= Math.ceil(mod.keywords.length * 0.7)) {
          const uiTargetNode = document.getElementById(`${prefix}_${mod.id}`);
          if (uiTargetNode) {
            // Handle damage ranges on weapons cleanly by filling min/max sequentially
            if (mod.id === 'phys_dmg_min' && numbersFound.length >= 2) {
              uiTargetNode.value = parseInt(numbersFound[0], 10);
              const maxNode = document.getElementById(`${prefix}_phys_dmg_max`);
              if (maxNode) maxNode.value = parseInt(numbersFound[1], 10);
            } else if (mod.id !== 'phys_dmg_max') {
              uiTargetNode.value = parseInt(numbersFound[0], 10);
            }
          }
        }
      });
    });
  });
}

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
  const activePool = POE2_CONTEXTUAL_DATABASE[currentContext];

  Object.keys(activePool).forEach(cat => {
    activePool[cat].forEach(mod => {
      const valA = parseFloat(document.getElementById(`panelA_${mod.id}`).value) || 0;
      const valB = parseFloat(document.getElementById(`panelB_${mod.id}`).value) || 0;

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
        <div class="verdict-label">Dynamic Asset Evaluation Done [${currentContext.toUpperCase()}]</div>
        <div class="verdict-desc">Item values calculated accurately using targeted contextual filters.</div>
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

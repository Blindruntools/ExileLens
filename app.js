/**
 * EXILE'S LENS — Ultimate Hybrid Engine (Version 1 UI + Spatial Scan Backend)
 */

const POE2_CONTEXTUAL_DATABASE = {
  weapons: {
    base_damage: [
      { id: 'added_phys', label: 'Added Physical Damage', keywords: ['added', 'physical', 'damage'], weight: 2.5 },
      { id: 'inc_phys_pct', label: '% Increased Physical Damage', keywords: ['increased', 'physical', 'damage'], weight: 3.0 },
      { id: 'added_fire', label: 'Added Fire Damage', keywords: ['added', 'fire', 'damage'], weight: 2.0 },
      { id: 'added_cold', label: 'Added Cold Damage', keywords: ['added', 'cold', 'damage'], weight: 2.0 },
      { id: 'added_lightning', label: 'Added Lightning Damage', keywords: ['added', 'lightning', 'damage'], weight: 2.0 },
      { id: 'added_chaos', label: 'Added Chaos Damage', keywords: ['added', 'chaos', 'damage'], weight: 2.5 }
    ],
    damage_scaling: [
      { id: 'inc_dmg_pct', label: '% Increased Damage', keywords: ['increased', 'damage'], weight: 2.0 },
      { id: 'inc_ele_dmg', label: '% Increased Elemental Damage', keywords: ['increased', 'elemental', 'damage'], weight: 2.0 },
      { id: 'inc_chaos_dmg', label: '% Increased Chaos Damage', keywords: ['increased', 'chaos', 'damage'], weight: 2.5 },
      { id: 'inc_spell_dmg', label: '% Increased Spell Damage', keywords: ['increased', 'spell', 'damage'], weight: 2.5 },
      { id: 'inc_attack_dmg', label: '% Increased Attack Damage', keywords: ['increased', 'attack', 'damage'], weight: 2.0 }
    ],
    speed_and_crit: [
      { id: 'attack_speed', label: 'Attack Speed', keywords: ['attack', 'speed'], weight: 3.5 },
      { id: 'cast_speed', label: 'Cast Speed', keywords: ['cast', 'speed'], weight: 3.0 },
      { id: 'projectile_speed', label: 'Projectile Speed', keywords: ['projectile', 'speed'], weight: 1.5 },
      { id: 'reload_speed', label: 'Reload Speed (Crossbows)', keywords: ['reload', 'speed'], weight: 2.0 },
      { id: 'crit_chance', label: 'Critical Strike Chance', keywords: ['critical', 'strike', 'chance'], weight: 2.5 },
      { id: 'crit_mult', label: 'Critical Strike Multiplier', keywords: ['critical', 'strike', 'multiplier'], weight: 3.0 },
      { id: 'glob_crit_chance', label: 'Global Critical Strike Chance', keywords: ['global', 'critical', 'chance'], weight: 2.5 },
      { id: 'glob_crit_mult', label: 'Global Critical Strike Multiplier', keywords: ['global', 'critical', 'multiplier'], weight: 3.0 }
    ],
    accuracy_and_sustain: [
      { id: 'accuracy_rating', label: 'Accuracy Rating', keywords: ['accuracy', 'rating'], weight: 1.5 },
      { id: 'inc_accuracy_pct', label: '% Increased Accuracy Rating', keywords: ['increased', 'accuracy'], weight: 1.5 },
      { id: 'phys_leech_life', label: 'Physical Damage Leeched as Life', keywords: ['physical', 'leeched', 'life'], weight: 1.5 },
      { id: 'phys_leech_mana', label: 'Physical Damage Leeched as Mana', keywords: ['physical', 'leeched', 'mana'], weight: 1.5 },
      { id: 'life_leech', label: 'Life Leech', keywords: ['life', 'leech'], weight: 1.5 },
      { id: 'mana_leech', label: 'Mana Leech', keywords: ['mana', 'leech'], weight: 1.5 }
    ],
    skill_levels: [
      { id: 'skills_all', label: 'Levels to All Skills', keywords: ['levels', 'all', 'skills'], weight: 6.0 },
      { id: 'skills_spell', label: 'Levels to Spell Skills', keywords: ['levels', 'spell', 'skills'], weight: 5.0 },
      { id: 'skills_melee', label: 'Levels to Melee Skills', keywords: ['levels', 'melee', 'skills'], weight: 5.0 },
      { id: 'skills_proj', label: 'Levels to Projectile Skills', keywords: ['levels', 'projectile', 'skills'], weight: 5.0 }
    ]
  },
  armor: {
    defences: [
      { id: 'armour_val', label: 'Armour Value', keywords: ['armour'], weight: 1.5 },
      { id: 'inc_armour_pct', label: '% Increased Armour', keywords: ['increased', 'armour'], weight: 2.0 },
      { id: 'evasion_val', label: 'Evasion Rating', keywords: ['evasion', 'rating'], weight: 1.5 },
      { id: 'inc_evasion_pct', label: '% Increased Evasion', keywords: ['increased', 'evasion'], weight: 2.0 },
      { id: 'es_val', label: 'Energy Shield', keywords: ['energy', 'shield'], weight: 1.5 },
      { id: 'inc_es_pct', label: '% Increased Energy Shield', keywords: ['increased', 'energy', 'shield'], weight: 2.0 }
    ],
    core_attributes: [
      { id: 'strength', label: 'Strength', keywords: ['strength'], weight: 1.5 },
      { id: 'dexterity', label: 'Dexterity', keywords: ['dexterity'], weight: 1.5 },
      { id: 'intelligence', label: 'Intelligence', keywords: ['intelligence'], weight: 1.5 },
      { id: 'all_stats', label: 'All Attributes', keywords: ['all', 'attributes'], weight: 4.5 }
    ],
    life_mana_spirit: [
      { id: 'max_life', label: 'Maximum Life', keywords: ['maximum', 'life'], weight: 2.5 },
      { id: 'max_mana', label: 'Maximum Mana', keywords: ['maximum', 'mana'], weight: 1.5 },
      { id: 'spirit', label: 'Spirit', keywords: ['spirit'], weight: 4.5 }
    ],
    resists_and_utility: [
      { id: 'fire_res', label: '% Fire Resistance', keywords: ['fire', 'resistance'], weight: 1.2 },
      { id: 'cold_res', label: '% Cold Resistance', keywords: ['cold', 'resistance'], weight: 1.2 },
      { id: 'lightning_res', label: '% Lightning Resistance', keywords: ['lightning', 'resistance'], weight: 1.2 },
      { id: 'chaos_res', label: '% Chaos Resistance', keywords: ['chaos', 'resistance'], weight: 2.5 },
      { id: 'all_ele_res', label: '% All Elemental Resistances', keywords: ['all', 'elemental', 'resistances'], weight: 3.0 },
      { id: 'move_speed', label: '% Increased Movement Speed', keywords: ['movement', 'speed'], weight: 6.0 }
    ]
  },
  rings: {
    implicits: [
      { id: 'amethyst_chaos', label: 'Amethyst Ring Base (Chaos Res)', keywords: ['chaos', 'resistance'], weight: 2.5 },
      { id: 'prismatic_all', label: 'Prismatic Ring Base (All Res)', keywords: ['all', 'resistances'], weight: 3.0 },
      { id: 'pearl_cast', label: 'Pearl Ring Base (Cast Speed)', keywords: ['cast', 'speed'], weight: 2.5 },
      { id: 'hoop_all', label: 'Golden Hoop Base (All Attributes)', keywords: ['all', 'attributes'], weight: 4.5 }
    ],
    explicits: [
      { id: 'max_life', label: 'Maximum Life', keywords: ['maximum', 'life'], weight: 2.5 },
      { id: 'max_mana', label: 'Maximum Mana', keywords: ['maximum', 'mana'], weight: 1.5 },
      { id: 'fire_res', label: '% Fire Resistance', keywords: ['fire', 'resistance'], weight: 1.2 },
      { id: 'cold_res', label: '% Cold Resistance', keywords: ['cold', 'resistance'], weight: 1.2 },
      { id: 'lightning_res', label: '% Lightning Resistance', keywords: ['lightning', 'resistance'], weight: 1.2 },
      { id: 'chaos_res', label: '% Chaos Resistance', keywords: ['chaos', 'resistance'], weight: 2.5 }
    ]
  },
  amulet: {
    implicits: [
      { id: 'imp_all_stats', label: 'Amulet Base: All Attributes', keywords: ['all', 'attributes'], weight: 4.5 },
      { id: 'imp_spirit', label: 'Amulet Base: Spirit', keywords: ['spirit'], weight: 4.5 }
    ],
    valuable_explicits: [
      { id: 'skills_all', label: 'Levels to All Skills', keywords: ['levels', 'all', 'skills'], weight: 6.0 },
      { id: 'skills_spell', label: 'Levels to Spell Skills', keywords: ['levels', 'spell', 'skills'], weight: 5.0 },
      { id: 'max_life', label: 'Maximum Life', keywords: ['maximum', 'life'], weight: 2.5 },
      { id: 'chaos_res', label: '% Chaos Resistance', keywords: ['chaos', 'resistance'], weight: 2.5 }
    ]
  }
};

let currentContext = 'weapons';

document.addEventListener('DOMContentLoaded', () => {
  rebuildContextualPanels();
  initActionListeners();
  setupContextTabs(); 
});

function setupContextTabs() {
  document.querySelectorAll('.type-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentContext = tab.getAttribute('data-type');
      rebuildContextualPanels();
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
    section.innerHTML = `<div class="category-group-title">${cat.toUpperCase().replace(/_/g, ' ')}</div>`;

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
  if (el) {
    el.value = Math.max(0, (parseInt(el.value, 10) || 0) + offset);
  }
}

function initActionListeners() {
  document.querySelectorAll('.scan-trigger-btn').forEach(btn => {
    btn.addEventListener('click', () => document.getElementById(btn.getAttribute('data-target')).click());
  });

  document.querySelectorAll('.item-image-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const targetPrefix = input.id.includes('itemAFile') ? 'panelA' : 'panelB';
      const indicator = input.previousElementSibling;
      indicator.innerText = '🛰️ SEGMENTING CARD ZONES...';

      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = async function() {
          try {
            const zones = segmentItemCardZones(img);
            indicator.innerText = '🔮 PROCESSING TEXT MATRIX...';

            if (zones.implicit) {
              const textImp = await recognizeCanvasZone(zones.implicit);
              processContextualTokens(textImp, targetPrefix);
            }
            if (zones.explicit) {
              const textExp = await recognizeCanvasZone(zones.explicit);
              processContextualTokens(textExp, targetPrefix);
            }
          } catch (err) {
            console.error("Spatial Scan Fail: ", err);
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

async function recognizeCanvasZone(canvas) {
  const dataUrl = canvas.toDataURL('image/png');
  const res = await Tesseract.recognize(dataUrl, 'eng', {
    tessedit_char_whitelist: '0123456789+- %abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-:(,)',
    tessedit_pageseg_mode: '6'
  });
  return res.data.text;
}

function segmentItemCardZones(imageElement) {
  const rawCanvas = document.createElement('canvas');
  const rawCtx = rawCanvas.getContext('2d');
  rawCanvas.width = imageElement.naturalWidth;
  rawCanvas.height = imageElement.naturalHeight;
  rawCtx.drawImage(imageElement, 0, 0);

  const imgData = rawCtx.getImageData(0, 0, rawCanvas.width, rawCanvas.height);
  const pixels = imgData.data;
  const width = rawCanvas.width;
  const height = rawCanvas.height;

  let dividerYCoordinates = [];
  
  for (let y = 5; y < height - 5; y++) {
    let continuousDarkCount = 0;
    for (let x = Math.floor(width * 0.2); x < Math.floor(width * 0.8); x++) {
      const idx = (y * width + x) * 4;
      if (pixels[idx] < 50 && pixels[idx+1] < 45 && pixels[idx+2] < 40) {
        continuousDarkCount++;
      }
    }
    if (continuousDarkCount > (width * 0.4)) {
      if (dividerYCoordinates.length === 0 || y - dividerYCoordinates[dividerYCoordinates.length - 1] > 20) {
        dividerYCoordinates.push(y);
      }
    }
  }

  if (dividerYCoordinates.length === 0) {
    dividerYCoordinates = [Math.floor(height * 0.3), Math.floor(height * 0.6)];
  } else if (dividerYCoordinates.length === 1) {
    dividerYCoordinates.push(Math.floor(height * 0.65));
  }

  dividerYCoordinates.sort((a, b) => a - b);
  const yTopDivider = dividerYCoordinates[0];
  const yBottomDivider = dividerYCoordinates[1];

  return {
    implicit: scaleAndBinarizeZone(rawCanvas, 0, yTopDivider, width, (yBottomDivider - yTopDivider)),
    explicit: scaleAndBinarizeZone(rawCanvas, 0, yBottomDivider, width, (height - yBottomDivider))
  };
}

function scaleAndBinarizeZone(sourceCanvas, x, y, w, h) {
  if (h <= 0 || w <= 0) return null;
  const targetScale = 3; 
  const outCanvas = document.createElement('canvas');
  const outCtx = outCanvas.getContext('2d');
  
  outCanvas.width = w * targetScale;
  outCanvas.height = h * targetScale;
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';
  outCtx.drawImage(sourceCanvas, x, y, w, h, 0, 0, outCanvas.width, outCanvas.height);

  const imgData = outCtx.getImageData(0, 0, outCanvas.width, outCanvas.height);
  const pixels = imgData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    const grayscale = 0.299 * pixels[i] + 0.587 * pixels[i+1] + 0.114 * pixels[i+2];
    const mask = grayscale > 110 ? 255 : 0;
    pixels[i] = pixels[i+1] = pixels[i+2] = mask;
  }

  outCtx.putImageData(imgData, 0, 0);
  return outCanvas;
}

function processContextualTokens(rawText, prefix) {
  const lines = rawText.toLowerCase().split('\n').map(l => l.trim()).filter(l => l.length > 2);
  const activePool = POE2_CONTEXTUAL_DATABASE[currentContext];

  lines.forEach(line => {
    const cleanLine = line.replace(/\(\s*(\d+)\s*[-➔to]+\s*(\d+)\s*\)/g, ''); 
    const numbersFound = cleanLine.match(/(\d+)/g);
    
    if (!numbersFound) return; 
    const extractedStat = parseInt(numbersFound[0], 10);
    const attributeTextOnly = cleanLine.replace(/[\d\+\%\-\(\)]/g, '').trim();
    
    let bestMatch = null;
    let highestHitRatio = 0.0;

    Object.keys(activePool).forEach(cat => {
      activePool[cat].forEach(mod => {
        let keywordHits = 0;
        mod.keywords.forEach(word => {
          if (attributeTextOnly.includes(word)) keywordHits++;
        });

        const hitRatio = keywordHits / mod.keywords.length;
        if (hitRatio >= 0.60 && hitRatio > highestHitRatio) {
          highestHitRatio = hitRatio;
          bestMatch = mod;
        }
      });
    });

    if (bestMatch) {
      const uiTargetNode = document.getElementById(`${prefix}_${bestMatch.id}`);
      if (uiTargetNode) {
        uiTargetNode.value = extractedStat;
        uiTargetNode.classList.add('scan-success-flash');
        setTimeout(() => uiTargetNode.classList.remove('scan-success-flash'), 400);
      }
    }
  });
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
      const nodeA = document.getElementById(`panelA_${mod.id}`);
      const nodeB = document.getElementById(`panelB_${mod.id}`);
      
      const valA = nodeA ? parseFloat(nodeA.value) || 0 : 0;
      const valB = nodeB ? parseFloat(nodeB.value) || 0 : 0;

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
  
  let totalShift = sA > 0 ? ((sB - sA) / sA) * 100 : sB > 0 ? 100 : 0;
  const pctClass = totalShift >= 0 ? 'positive' : 'negative';
  
  inner.innerHTML = `
    <div class="verdict-banner">
      <div>
        <div class="verdict-label">${totalShift > 0 ? '📊 UPGRADE EVALUATED' : '⚖️ WEIGHT EQUALIZED'}</div>
        <div class="verdict-desc">Review your metrics or tweak values manually above to see live impacts.</div>
      </div>
      <div class="verdict-diff">
        <div class="diff-pct ${pctClass}">${totalShift >= 0 ? '+' : ''}${totalShift.toFixed(1)}%</div>
      </div>
    </div>
    <div class="score-card">
      <div class="stat-breakdown">
        ${metrics.map(m => `
          <div class="breakdown-row">
            <span class="breakdown-stat">${m.label}</span>
            <span class="breakdown-val"><span>${m.a}</span> ➔ <span>${m.b}</span></span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  wrapper.className = "results-section visible";
}

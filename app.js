// Dictionary of Path of Exile 2 Base Modifiers & Regular Expressions for parsing
const POE2_MODIFIER_DICTIONARY = {
  defences: [
    { id: 'armour', label: 'Armour', regex: /(?:^|\s)(\d+)\s*armour/i, baseWeight: 1.0 },
    { id: 'evasion', label: 'Evasion Rating', regex: /(?:^|\s)(\d+)\s*evasion/i, baseWeight: 1.0 },
    { id: 'energy_shield', label: 'Energy Shield', regex: /(?:^|\s)(\d+)\s*energy\s*shield/i, baseWeight: 1.2 }
  ],
  attributes: [
    { id: 'strength', label: '+ to Strength', regex: /\+(\d+)\s*to\s*strength/i, baseWeight: 1.5 },
    { id: 'dexterity', label: '+ to Dexterity', regex: /\+(\d+)\s*to\s*dexterity/i, baseWeight: 1.5 },
    { id: 'intelligence', label: '+ to Intelligence', regex: /\+(\d+)\s*to\s*intelligence/i, baseWeight: 1.5 },
    { id: 'all_stats', label: '+ to All Attributes', regex: /\+(\d+)\s*to\s*all\s*attributes/i, baseWeight: 4.5 }
  ],
  offensive: [
    { id: 'phys_dmg_inc', label: '% Increased Physical Damage', regex: /(\d+)%\s*increased\s*physical/i, baseWeight: 2.5 },
    { id: 'crit_chance', label: '% Increased Critical Strike Chance', regex: /(\d+)%\s*increased\s*critical/i, baseWeight: 2.0 },
    { id: 'attack_speed', label: '% Increased Attack Speed', regex: /(\d+)%\s*increased\s*attack\s*speed/i, baseWeight: 3.0 },
    { id: 'cast_speed', label: '% Increased Cast Speed', regex: /(\d+)%\s*increased\s*cast\s*speed/i, baseWeight: 3.0 }
  ],
  resists: [
    { id: 'fire_res', label: '% Fire Resistance', regex: /\+(\d+)%\s*to\s*fire/i, baseWeight: 1.2 },
    { id: 'cold_res', label: '% Cold Resistance', regex: /\+(\d+)%\s*to\s*cold/i, baseWeight: 1.2 },
    { id: 'lightning_res', label: '% Lightning Resistance', regex: /\+(\d+)%\s*to\s*lightning/i, baseWeight: 1.2 },
    { id: 'chaos_res', label: '% Chaos Resistance', regex: /\+(\d+)%\s*to\s*chaos/i, baseWeight: 2.0 }
  ],
  resources: [
    { id: 'max_life', label: '+ to Maximum Life', regex: /\+(\d+)\s*to\s*maximum\s*life/i, baseWeight: 2.0 },
    { id: 'max_mana', label: '+ to Maximum Mana', regex: /\+(\d+)\s*to\s*maximum\s*mana/i, baseWeight: 1.5 },
    { id: 'spirit', label: '+ to Spirit', regex: /\+(\d+)\s*to\s*spirit/i, baseWeight: 4.0 }
  ]
};

// Application State Initialization
document.addEventListener('DOMContentLoaded', () => {
  renderAttributeMenus('menuA', 'panelA');
  renderAttributeMenus('menuB', 'panelB');
  setupEventListeners();
});

// Build standard lists inside panels out of dictionary arrays
function renderAttributeMenus(containerId, panelPrefix) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  Object.keys(POE2_MODIFIER_DICTIONARY).forEach(category => {
    const groupWrapper = document.createElement('div');
    groupWrapper.className = 'attribute-category-group';
    
    const title = document.createElement('div');
    title.className = 'category-group-title';
    title.innerText = category.replace('_', ' ').toUpperCase();
    groupWrapper.appendChild(title);

    POE2_MODIFIER_DICTIONARY[category].forEach(mod => {
      const row = document.createElement('div');
      row.className = 'attribute-menu-row';
      row.innerHTML = `
        <label for="${panelPrefix}_${mod.id}">${mod.label}</label>
        <div class="row-controls">
          <button type="button" class="ctrl-btn" onclick="stepValue('${panelPrefix}_${mod.id}', -5)">-</button>
          <input type="number" id="${panelPrefix}_${mod.id}" data-mod-id="${mod.id}" data-category="${category}" value="0" min="0" />
          <button type="button" class="ctrl-btn" onclick="stepValue('${panelPrefix}_${mod.id}', 5)">+</button>
        </div>
      `;
      groupWrapper.appendChild(row);
    });

    container.appendChild(groupWrapper);
  });
}

// Adjust value using step buttons
function stepValue(inputId, amount) {
  const input = document.getElementById(inputId);
  if (input) {
    let current = parseInt(input.value, 10) || 0;
    input.value = Math.max(0, current + amount);
  }
}

// Setup Event Handlers safely
function setupEventListeners() {
  // Delegate image scanning triggers cleanly for mobile compatibility
  document.querySelectorAll('.scan-trigger-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      document.getElementById(targetId).click();
    });
  });

  // Handle native file selections asynchronously with Tesseract OCR
  document.querySelectorAll('.item-image-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const targetPanel = input.id.includes('itemA') ? 'panelA' : 'panelB';
      const scanBtn = input.previousElementSibling;
      const originalText = scanBtn.innerText;

      scanBtn.innerText = '⏳ SCANNING...';
      scanBtn.style.opacity = '0.5';

      try {
        const result = await Tesseract.recognize(file, 'eng');
        parseOcrTextToForm(result.data.text, targetPanel);
      } catch (err) {
        console.error("OCR Error processing selection:", err);
        alert("Failed to scan image accurately. Please use manual step controls.");
      } finally {
        scanBtn.innerText = originalText;
        scanBtn.style.opacity = '1';
        input.value = ''; // Reset input target buffer
      }
    });
  });

  // Wire clear buttons
  document.getElementById('clearA').addEventListener('click', () => resetPanelFields('panelA'));
  document.getElementById('clearB').addEventListener('click', () => resetPanelFields('panelB'));

  // Wire core comparison function execution
  document.getElementById('compareBtn').addEventListener('click', executeComparisonCalculation);
}

// Extract attributes dynamically out of raw image OCR strings
function parseOcrTextToForm(text, panelPrefix) {
  Object.keys(POE2_MODIFIER_DICTIONARY).forEach(category => {
    POE2_MODIFIER_DICTIONARY[category].forEach(mod => {
      const match = text.match(mod.regex);
      if (match) {
        const val = parseInt(match[1], 10);
        const inputField = document.getElementById(`${panelPrefix}_${mod.id}`);
        if (inputField && val) {
          inputField.value = val;
        }
      }
    });
  });
}

function resetPanelFields(panelPrefix) {
  document.querySelectorAll(`[id^="${panelPrefix}_"]`).forEach(input => input.value = 0);
}

// Compute dynamic item values factoring in custom search inputs
function executeComparisonCalculation() {
  const buildProfileString = document.getElementById('buildInput').value.toLowerCase();
  
  let scoreA = 0;
  let scoreB = 0;
  let summaryDetails = [];

  Object.keys(POE2_MODIFIER_DICTIONARY).forEach(category => {
    POE2_MODIFIER_DICTIONARY[category].forEach(mod => {
      const valA = parseInt(document.getElementById(`panelA_${mod.id}`).value, 10) || 0;
      const valB = parseInt(document.getElementById(`panelB_${mod.id}`).value, 10) || 0;

      if (valA > 0 || valB > 0) {
        // Calculate scaling if user focuses on explicit mechanics in input line
        let adaptiveMultiplier = 1.0;
        if (buildProfileString.length > 0) {
          const words = mod.label.toLowerCase().split(' ');
          words.forEach(word => {
            if (word.length > 3 && buildProfileString.includes(word)) adaptiveMultiplier += 1.5;
          });
          if (buildProfileString.includes(category)) adaptiveMultiplier += 1.0;
        }

        const exactWeight = mod.baseWeight * adaptiveMultiplier;
        scoreA += valA * exactWeight;
        scoreB += valB * exactWeight;

        summaryDetails.push({
          label: mod.label,
          a: valA,
          b: valB
        });
      }
    });
  });

  renderOutputs(scoreA, scoreB, summaryDetails);
}

// Build presentation markup blocks dynamically
function renderOutputs(scoreA, scoreB, details) {
  const resultsSection = document.getElementById('resultsSection');
  const resultsInner = document.getElementById('resultsInner');

  if (scoreA === 0 && scoreB === 0) {
    resultsInner.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-dim);">No attributes configured. Configure stethoscopes manually or re-run scans.</div>`;
    resultsSection.style.display = 'block';
    return;
  }

  const diffPct = scoreA === 0 ? scoreB * 100 : ((scoreB - scoreA) / scoreA) * 100;
  let verdictClass = 'sidegrade';
  let verdictTitle = 'Sidegrade / Alternative';
  let verdictDesc = 'The market item provides alternative trade-offs with similar item weights.';

  if (diffPct > 3.0) {
    verdictClass = 'upgrade';
    verdictTitle = 'Definite Upgrade';
    verdictDesc = 'This market item elevates your archetype configuration priority values.';
  } else if (diffPct < -3.0) {
    verdictClass = 'downgrade';
    verdictTitle = 'Downgrade / Loss';
    verdictDesc = 'Equipping this item will lower your overall active combat efficiencies.';
  }

  const pctString = diffPct >= 0 ? `+${diffPct.toFixed(1)}%` : `${diffPct.toFixed(1)}%`;
  const pctClass = diffPct > 3.0 ? 'positive' : (diffPct < -3.0 ? 'negative' : 'neutral');

  let breakdownHtml = details.map(d => `
    <div class="breakdown-row">
      <span class="breakdown-stat">${d.label}</span>
      <span class="breakdown-val">${d.a} ➔ ${d.b}</span>
    </div>
  `).join('');

  const maxScore = Math.max(scoreA, scoreB, 1);
  const barA = (scoreA / maxScore) * 100;
  const barB = (scoreB / maxScore) * 100;

  resultsInner.innerHTML = `
    <div class="verdict-banner ${verdictClass}">
      <div class="verdict-icon">◆</div>
      <div>
        <div class="verdict-label ${verdictClass}">${verdictTitle}</div>
        <div class="verdict-desc">${verdictDesc}</div>
      </div>
      <div class="verdict-diff">
        <div class="diff-pct ${pctClass}">${pctString}</div>
        <div class="diff-label">Power Shift</div>
      </div>
    </div>

    <div class="scores-grid">
      <div class="score-card">
        <div class="score-card-label">Current Item Value</div>
        <div class="score-value">${scoreA.toFixed(0)}</div>
        <div class="score-bar-track">
          <div class="score-bar-fill ${scoreA >= scoreB ? 'winner' : ''}" style="width: ${barA}%"></div>
        </div>
      </div>
      <div class="score-card">
        <div class="score-card-label">Market Item Value</div>
        <div class="score-value">${scoreB.toFixed(0)}</div>
        <div class="score-bar-track">
          <div class="score-bar-fill ${scoreB >= scoreA ? 'winner' : ''}" style="width: ${barB}%"></div>
        </div>
      </div>
    </div>

    <div class="score-card">
      <div class="score-card-label" style="margin-bottom:10px;">Attribute Shift Breakdown</div>
      <div class="stat-breakdown">${breakdownHtml}</div>
    </div>
  `;

  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

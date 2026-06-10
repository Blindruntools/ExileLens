/**
 * EXILE'S LENS — Client Application Controller
 */

const POE2_MODIFIER_DICTIONARY = {
  implicits: [
    { id: 'inc_attr_req', label: '% Increased Attribute Requirements', weight: -1.0 },
    { id: 'base_armour', label: 'Base Armour Value', weight: 1.0 },
    { id: 'base_evasion', label: 'Base Evasion Value', weight: 1.0 }
  ],
  defences: [
    { id: 'armour_pct', label: '% Increased Armour', weight: 2.0 },
    { id: 'evasion_pct', label: '% Increased Evasion', weight: 2.0 },
    { id: 'energy_shield', label: '+ to Energy Shield', weight: 1.5 }
  ],
  attributes: [
    { id: 'strength', label: '+ to Strength', weight: 1.5 },
    { id: 'dexterity', label: '+ to Dexterity', weight: 1.5 },
    { id: 'intelligence', label: '+ to Intelligence', weight: 1.5 },
    { id: 'all_stats', label: '+ to All Attributes', weight: 4.5 }
  ],
  resists: [
    { id: 'fire_res', label: '% Fire Resistance', weight: 1.2 },
    { id: 'cold_res', label: '% Cold Resistance', weight: 1.2 },
    { id: 'lightning_res', label: '% Lightning Resistance', weight: 1.2 },
    { id: 'chaos_res', label: '% Chaos Resistance', weight: 2.5 }
  ],
  resources: [
    { id: 'max_life', label: '+ to Maximum Life', weight: 2.0 },
    { id: 'max_mana', label: '+ to Maximum Mana', weight: 1.5 },
    { id: 'spirit', label: '+ to Spirit', weight: 4.0 }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  renderAttributeInputs('menuA', 'panelA');
  renderAttributeInputs('menuB', 'panelB');
  setupEventListeners();
});

function renderAttributeInputs(containerId, prefix) {
  const targetContainer = document.getElementById(containerId);
  targetContainer.innerHTML = '';

  Object.keys(POE2_MODIFIER_DICTIONARY).forEach(category => {
    const groupElement = document.createElement('div');
    groupElement.className = 'attribute-category-group';
    groupElement.innerHTML = `<div class="category-group-title">${category.toUpperCase()}</div>`;

    POE2_MODIFIER_DICTIONARY[category].forEach(mod => {
      const row = document.createElement('div');
      row.className = 'attribute-menu-row';
      row.innerHTML = `
        <label>${mod.label}</label>
        <div class="row-controls">
          <button type="button" class="ctrl-btn" onclick="adjustValue('${prefix}_${mod.id}', -1)">-</button>
          <input type="number" id="${prefix}_${mod.id}" value="0" />
          <button type="button" class="ctrl-btn" onclick="adjustValue('${prefix}_${mod.id}', 1)">+</button>
        </div>
      `;
      groupElement.appendChild(row);
    });
    targetContainer.appendChild(groupElement);
  });
}

function adjustValue(id, change) {
  const input = document.getElementById(id);
  if (input) {
    input.value = Math.max(0, (parseInt(input.value, 10) || 0) + change);
  }
}

function setupEventListeners() {
  document.querySelectorAll('.scan-trigger-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById(btn.getAttribute('data-target')).click();
    });
  });

  document.querySelectorAll('.item-image-input').forEach(input => {
    input.addEventListener('change', () => {
      const panelPrefix = input.id.includes('itemA') ? 'panelA' : 'panelB';
      executeVisionScan(input.id, panelPrefix);
    });
  });

  document.getElementById('clearA').addEventListener('click', () => resetFields('panelA'));
  document.getElementById('clearB').addEventListener('click', () => resetFields('panelB'));
  document.getElementById('compareBtn').addEventListener('click', calculateItemDifferential);
}

function resetFields(prefix) {
  document.querySelectorAll(`[id^="${prefix}_"]`).forEach(input => input.value = 0);
}

// Base64 conversion utility
function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
}

// Deep Multimodal AI Call Execution
async function executeVisionScan(fileInputId, panelPrefix) {
  const fileInput = document.getElementById(fileInputId);
  const file = fileInput.files[0];
  if (!file) return;

  const triggerButton = fileInput.previousElementSibling;
  const originalText = triggerButton.innerText;
  triggerButton.innerText = '🔮 SCANNING CORNER...';
  triggerButton.disabled = true;

  try {
    const base64String = await convertFileToBase64(file);

    // Call your local Express endpoint
    const response = await fetch('/api/scan-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64String })
    });

    if (!response.ok) throw new Error('Server dropped vision payload response.');

    const parsedData = await response.json();

    // Dynamically inject values back into UI inputs matching keys
    Object.keys(parsedData).forEach(key => {
      const inputField = document.getElementById(`${panelPrefix}_${key}`);
      if (inputField) {
        inputField.value = parsedData[key];
      }
    });

  } catch (err) {
    console.error("AI Mapping error: ", err);
    alert("The oracle encountered a connection error decoding that screenshot.");
  } finally {
    triggerButton.innerText = originalText;
    triggerButton.disabled = false;
    fileInput.value = ''; // Flush layout stream buffer
  }
}

function calculateItemDifferential() {
  let scoreA = 0;
  let scoreB = 0;
  let activeMetrics = [];

  Object.keys(POE2_MODIFIER_DICTIONARY).forEach(category => {
    POE2_MODIFIER_DICTIONARY[category].forEach(mod => {
      const valA = parseInt(document.getElementById(`panelA_${mod.id}`).value, 10) || 0;
      const valB = parseInt(document.getElementById(`panelB_${mod.id}`).value, 10) || 0;

      if (valA !== 0 || valB !== 0) {
        scoreA += valA * mod.weight;
        scoreB += valB * mod.weight;
        activeMetrics.push({ label: mod.label, a: valA, b: valB });
      }
    });
  });

  renderComparisonOutput(scoreA, scoreB, activeMetrics);
}

function renderComparisonOutput(sA, sB, metrics) {
  const targetSection = document.getElementById('resultsSection');
  const innerContainer = document.getElementById('resultsInner');

  const shiftPercentage = sA === 0 ? sB * 100 : ((sB - sA) / sA) * 100;
  const deltaClass = shiftPercentage >= 0 ? 'positive' : 'negative';

  innerContainer.innerHTML = `
    <div class="verdict-banner" style="border-left: 4px solid var(--gold);">
      <div>
        <div class="verdict-label">Affix Evaluation Generated</div>
        <div class="verdict-desc">Item values calculated accurately against algorithmic scale constraints.</div>
      </div>
      <div class="verdict-diff">
        <div class="diff-pct ${deltaClass}">${shiftPercentage >= 0 ? '+' : ''}${shiftPercentage.toFixed(1)}%</div>
        <div class="diff-label">Calculated Shift</div>
      </div>
    </div>
    <div class="score-card">
      <div class="stat-breakdown">
        ${metrics.map(m => `
          <div class="breakdown-row">
            <span class="breakdown-stat">${m.label}</span>
            <span class="breakdown-val">${m.a} ➔ ${m.b}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  targetSection.className = "results-section visible";
}

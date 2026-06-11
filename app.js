/**
 * EXILE'S LENS — Core Execution Logic
 * Features: Otsu Adaptive Binarization & Layout-Aware Token Anchor Matching
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
    hybrid_defences: [
      { id: 'armour_evasion', label: 'Armour + Evasion', keywords: ['armour', 'evasion'], weight: 2.0 },
      { id: 'armour_es', label: 'Armour + Energy Shield', keywords: ['armour', 'energy', 'shield'], weight: 2.0 },
      { id: 'evasion_es', label: 'Evasion + Energy Shield', keywords: ['evasion', 'energy', 'shield'], weight: 2.0 },
      { id: 'armour_evasion_es', label: 'Armour + Evasion + Energy Shield', keywords: ['armour', 'evasion', 'energy', 'shield'], weight: 2.5 }
    ],
    core_attributes: [
      { id: 'strength', label: 'Strength', keywords: ['strength'], weight: 1.5 },
      { id: 'dexterity', label: 'Dexterity', keywords: ['dexterity'], weight: 1.5 },
      { id: 'intelligence', label: 'Intelligence', keywords: ['intelligence'], weight: 1.5 },
      { id: 'all_stats', label: 'All Attributes', keywords: ['all', 'attributes'], weight: 4.5 },
      { id: 'str_dex', label: 'Strength + Dexterity', keywords: ['strength', 'dexterity'], weight: 3.0 },
      { id: 'str_int', label: 'Strength + Intelligence', keywords: ['strength', 'intelligence'], weight: 3.0 },
      { id: 'dex_int', label: 'Dexterity + Intelligence', keywords: ['dexterity', 'intelligence'], weight: 3.0 }
    ],
    life_mana_spirit: [
      { id: 'max_life', label: 'Maximum Life', keywords: ['maximum', 'life'], weight: 2.5 },
      { id: 'life_regen', label: 'Life Regeneration', keywords: ['life', 'regeneration'], weight: 1.2 },
      { id: 'max_mana', label: 'Maximum Mana', keywords: ['maximum', 'mana'], weight: 1.5 },
      { id: 'mana_regen', label: 'Mana Regeneration', keywords: ['mana', 'regeneration'], weight: 1.2 },
      { id: 'spirit', label: 'Spirit', keywords: ['spirit'], weight: 4.5 }
    ],
    resists_and_utility: [
      { id: 'fire_res', label: '% Fire Resistance', keywords: ['fire', 'resistance'], weight: 1.2 },
      { id: 'cold_res', label: '% Cold Resistance', keywords: ['cold', 'resistance'], weight: 1.2 },
      { id: 'lightning_res', label: '% Lightning Resistance', keywords: ['lightning', 'resistance'], weight: 1.2 },
      { id: 'chaos_res', label: '% Chaos Resistance', keywords: ['chaos', 'resistance'], weight: 2.5 },
      { id: 'all_ele_res', label: '% All Elemental Resistances', keywords: ['all', 'elemental', 'resistances'], weight: 3.0 },
      { id: 'move_speed', label: '% Increased Movement Speed (Boots)', keywords: ['movement', 'speed'], weight: 6.0 },
      { id: 'block_chance', label: 'Block Chance', keywords: ['block', 'chance'], weight: 2.0 },
      { id: 'stun_threshold', label: 'Stun Threshold', keywords: ['stun', 'threshold'], weight: 1.0 },
      { id: 'rarity_found', label: '% Increased Rarity of Items Found', keywords: ['rarity', 'found'], weight: 1.5 }
    ]
  },
  rings: {
    implicits: [
      { id: 'ruby_fire', label: 'Ruby Ring Base (Fire Res)', keywords: ['fire', 'resistance'], weight: 1.2 },
      { id: 'sapphire_cold', label: 'Sapphire Ring Base (Cold Res)', keywords: ['cold', 'resistance'], weight: 1.2 },
      { id: 'topaz_lightning', label: 'Topaz Ring Base (Lightning Res)', keywords: ['lightning', 'resistance'], weight: 1.2 },
      { id: 'amethyst_chaos', label: 'Amethyst Ring Base (Chaos Res)', keywords: ['chaos', 'resistance'], weight: 2.5 },
      { id: 'prismatic_all', label: 'Prismatic Ring Base (All Res)', keywords: ['all', 'resistances'], weight: 3.0 },
      { id: 'emerald_acc', label: 'Emerald Ring Base (Accuracy)', keywords: ['accuracy'], weight: 1.5 },
      { id: 'pearl_cast', label: 'Pearl Ring Base (Cast Speed)', keywords: ['cast', 'speed'], weight: 2.5 },
      { id: 'iron_phys', label: 'Iron Ring Base (Physical Damage)', keywords: ['physical', 'damage'], weight: 2.0 },
      { id: 'lazuli_mana', label: 'Lazuli Ring Base (Mana)', keywords: ['mana'], weight: 1.5 },
      { id: 'hoop_all', label: 'Golden Hoop Base (All Attributes)', keywords: ['all', 'attributes'], weight: 4.5 },
      { id: 'gold_rarity', label: 'Gold Ring Base (Item Rarity)', keywords: ['rarity', 'found'], weight: 2.0 },
      { id: 'unset_slot', label: 'Unset Ring Base (Extra Skill Slot)', keywords: ['unset', 'skill', 'slot'], weight: 5.0 }
    ],
    damage_modifiers: [
      { id: 'ring_add_phys', label: 'Adds Physical Damage to Attacks', keywords: ['adds', 'physical', 'damage', 'attacks'], weight: 2.5 },
      { id: 'ring_add_fire', label: 'Adds Fire Damage to Attacks', keywords: ['adds', 'fire', 'damage', 'attacks'], weight: 2.0 },
      { id: 'ring_add_cold', label: 'Adds Cold Damage to Attacks', keywords: ['adds', 'cold', 'damage', 'attacks'], weight: 2.0 },
      { id: 'ring_add_lightning', label: 'Adds Lightning Damage to Attacks', keywords: ['adds', 'lightning', 'damage', 'attacks'], weight: 2.0 },
      { id: 'ring_add_chaos', label: 'Adds Chaos Damage to Attacks', keywords: ['adds', 'chaos', 'damage', 'attacks'], weight: 2.5 },
      { id: 'ring_inc_dmg', label: '% Increased Damage', keywords: ['increased', 'damage'], weight: 2.2 },
      { id: 'ring_inc_ele_dmg', label: '% Increased Elemental Damage with Attack Skills', keywords: ['increased', 'elemental', 'damage'], weight: 2.2 },
      { id: 'ring_fire_dmg', label: '% Increased Fire Damage', keywords: ['increased', 'fire', 'damage'], weight: 2.0 },
      { id: 'ring_cold_dmg', label: '% Increased Cold Damage', keywords: ['increased', 'cold', 'damage'], weight: 2.0 },
      { id: 'ring_lightning_dmg', label: '% Increased Lightning Damage', keywords: ['increased', 'lightning', 'damage'], weight: 2.0 }
    ],
    explicits: [
      { id: 'max_life', label: 'Maximum Life', keywords: ['maximum', 'life'], weight: 2.5 },
      { id: 'max_mana', label: 'Maximum Mana', keywords: ['maximum', 'mana'], weight: 1.5 },
      { id: 'mana_regen', label: 'Mana Regeneration', keywords: ['mana', 'regeneration'], weight: 1.5 },
      { id: 'fire_res', label: '% Fire Resistance', keywords: ['fire', 'resistance'], weight: 1.2 },
      { id: 'cold_res', label: '% Cold Resistance', keywords: ['cold', 'resistance'], weight: 1.2 },
      { id: 'lightning_res', label: '% Lightning Resistance', keywords: ['lightning', 'resistance'], weight: 1.2 },
      { id: 'chaos_res', label: '% Chaos Resistance', keywords: ['chaos', 'resistance'], weight: 2.5 },
      { id: 'glob_crit_chance', label: 'Global Critical Strike Chance', keywords: ['global', 'critical', 'chance'], weight: 2.5 },
      { id: 'glob_crit_mult', label: 'Global Critical Strike Multiplier', keywords: ['global', 'critical', 'multiplier'], weight: 3.0 },
      { id: 'rarity_found', label: '% Increased Rarity of Items Found', keywords: ['rarity', 'found'], weight: 1.5 }
    ],
    core_attributes: [
      { id: 'strength', label: 'Strength', keywords: ['strength'], weight: 1.5 },
      { id: 'dexterity', label: 'Dexterity', keywords: ['dexterity'], weight: 1.5 },
      { id: 'intelligence', label: 'Intelligence', keywords: ['intelligence'], weight: 1.5 },
      { id: 'all_stats', label: 'All Attributes', keywords: ['all', 'attributes'], weight: 4.5 }
    ]
  },
  amulet: {
    implicits: [
      { id: 'imp_strength', label: 'Amulet Base: Strength', keywords: ['strength'], weight: 1.5 },
      { id: 'imp_dexterity', label: 'Amulet Base: Dexterity', keywords: ['dexterity'], weight: 1.5 },
      { id: 'imp_intelligence', label: 'Amulet Base: Intelligence', keywords: ['intelligence'], weight: 1.5 },
      { id: 'imp_all_stats', label: 'Amulet Base: All Attributes', keywords: ['all', 'attributes'], weight: 4.5 },
      { id: 'imp_spirit', label: 'Amulet Base: Spirit', keywords: ['spirit'], weight: 4.5 },
      { id: 'imp_mana_regen', label: 'Amulet Base: Mana Regeneration', keywords: ['mana', 'regeneration'], weight: 1.5 },
      { id: 'imp_es_bonus', label: 'Amulet Base: Energy Shield', keywords: ['energy', 'shield'], weight: 1.5 },
      { id: 'imp_runic_ward', label: '% Increased Maximum Runic Ward', keywords: ['increased', 'maximum', 'runic', 'ward'], weight: 2.0 }
    ],
    damage_modifiers: [
      { id: 'am_inc_dmg', label: '% Increased Damage', keywords: ['increased', 'damage'], weight: 2.5 },
      { id: 'am_inc_ele_dmg', label: '% Increased Elemental Damage', keywords: ['increased', 'elemental', 'damage'], weight: 2.2 },
      { id: 'am_fire_dmg', label: '% Increased Fire Damage', keywords: ['increased', 'fire', 'damage'], weight: 2.0 },
      { id: 'am_cold_dmg', label: '% Increased Cold Damage', keywords: ['increased', 'cold', 'damage'], weight: 2.0 },
      { id: 'am_lightning_dmg', label: '% Increased Lightning Damage', keywords: ['increased', 'lightning', 'damage'], weight: 2.0 },
      { id: 'am_chaos_dmg', label: '% Increased Chaos Damage', keywords: ['increased', 'chaos', 'damage'], weight: 2.5 },
      { id: 'am_spell_dmg', label: '% Increased Spell Damage', keywords: ['increased', 'spell', 'damage'], weight: 2.5 },
      { id: 'am_spell_dmg_shield', label: '% Increased Spell Damage while holding a Shield', keywords: ['increased', 'spell', 'damage', 'holding', 'shield'], weight: 2.5 },
      { id: 'am_add_phys', label: 'Adds Physical Damage to Attacks', keywords: ['adds', 'physical', 'damage', 'attacks'], weight: 2.5 },
      { id: 'am_add_fire', label: 'Adds Fire Damage to Attacks', keywords: ['adds', 'fire', 'damage', 'attacks'], weight: 2.0 },
      { id: 'am_add_cold', label: 'Adds Cold Damage to Attacks', keywords: ['adds', 'cold', 'damage', 'attacks'], weight: 2.0 },
      { id: 'am_add_lightning', label: 'Adds Lightning Damage to Attacks', keywords: ['adds', 'lightning', 'damage', 'attacks'], weight: 2.0 },
      { id: 'am_crit_chance_cold', label: '% Increased Critical Strike Chance with Cold Skills', keywords: ['increased', 'critical', 'strike', 'chance', 'cold', 'skills'], weight: 2.5 },
      { id: 'am_crit_mult_cold', label: '% Increased Critical Strike Multiplier with Cold Skills', keywords: ['increased', 'critical', 'strike', 'multiplier', 'cold', 'skills'], weight: 3.0 },
      { id: 'am_crit_chance_fire', label: '% Increased Critical Strike Chance with Fire Skills', keywords: ['increased', 'critical', 'strike', 'chance', 'fire', 'skills'], weight: 2.5 },
      { id: 'am_crit_mult_fire', label: '% Increased Critical Strike Multiplier with Fire Skills', keywords: ['increased', 'critical', 'strike', 'multiplier', 'fire', 'skills'], weight: 3.0 },
      { id: 'am_crit_chance_lightning', label: '% Increased Critical Strike Chance with Lightning Skills', keywords: ['increased', 'critical', 'strike', 'chance', 'lightning', 'skills'], weight: 2.5 },
      { id: 'am_crit_mult_lightning', label: '% Increased Critical Strike Multiplier with Lightning Skills', keywords: ['increased', 'critical', 'strike', 'multiplier', 'lightning', 'skills'], weight: 3.0 },
      { id: 'am_atk_speed_shield', label: '% Increased Attack Speed while holding a Shield', keywords: ['increased', 'attack', 'speed', 'holding', 'shield'], weight: 2.8 },
      { id: 'am_atk_speed_onehand', label: '% Increased Attack Speed with One Handed Melee Weapons', keywords: ['increased', 'attack', 'speed', 'one', 'handed', 'melee'], weight: 2.8 },
      { id: 'am_crit_chance_onehand', label: '% Increased Critical Strike Chance with One Handed Melee Weapons', keywords: ['increased', 'critical', 'strike', 'chance', 'one', 'handed', 'melee'], weight: 2.5 }
    ],
    valuable_explicits: [
      { id: 'skills_all', label: 'Levels to All Skills', keywords: ['levels', 'all', 'skills'], weight: 6.0 },
      { id: 'skills_spell', label: 'Levels to Spell Skills', keywords: ['levels', 'spell', 'skills'], weight: 5.0 },
      { id: 'max_life', label: 'Maximum Life', keywords: ['maximum', 'life'], weight: 2.5 },
      { id: 'fire_res', label: '% Fire Resistance', keywords: ['fire', 'resistance'], weight: 1.2 },
      { id: 'cold_res', label: '% Cold Resistance', keywords: ['cold', 'resistance'], weight: 1.2 },
      { id: 'lightning_res', label: '% Lightning Resistance', keywords: ['lightning', 'resistance'], weight: 1.2 },
      { id: 'chaos_res', label: '% Chaos Resistance', keywords: ['chaos', 'resistance'], weight: 2.5 },
      { id: 'glob_crit_chance', label: 'Global Critical Strike Chance', keywords: ['global', 'critical', 'chance'], weight: 2.5 },
      { id: 'glob_crit_mult', label: 'Global Critical Strike Multiplier', keywords: ['global', 'critical', 'multiplier'], weight: 3.0 },
      { id: 'rarity_found', label: '% Increased Rarity of Items Found', keywords: ['rarity', 'found'], weight: 1.5 },
      { id: 'spirit', label: 'Spirit', keywords: ['spirit'], weight: 4.5 }
    ],
    core_attributes: [
      { id: 'strength', label: 'Strength', keywords: ['strength'], weight: 1.5 },
      { id: 'dexterity', label: 'Dexterity', keywords: ['dexterity'], weight: 1.5 },
      { id: 'intelligence', label: 'Intelligence', keywords: ['intelligence'], weight: 1.5 },
      { id: 'all_stats', label: 'All Attributes', keywords: ['all', 'attributes'], weight: 4.5 }
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
      const targetPrefix = input.id.includes('itemAFile') ? 'panelA' : 'panelB';
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
              tessedit_char_whitelist: '0123456789+- %abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-:(,)',
              tessedit_pageseg_mode: '6' 
            });
            processContextualTokens(res.data.text, targetPrefix);
          } catch (err) {
            console.error("OCR Failure Exception: ", err);
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

  // Step 1: Convert to Grayscale using digital ITU-R luminance weights
  const grayscale = new Uint8Array(pixels.length / 4);
  for (let i = 0; i < pixels.length; i += 4) {
    grayscale[i / 4] = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
  }

  // Step 2: Compute Otsu's Global Adaptive Thresholding
  let histogram = new Array(256).fill(0);
  for (let i = 0; i < grayscale.length; i++) {
    histogram[grayscale[i]]++;
  }

  let totalPixels = grayscale.length;
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * histogram[t];

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let varMax = 0;
  let threshold = 120; // Default fallback threshold

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;

    wF = totalPixels - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];

    let mB = sumB / wB;
    let mF = (sum - sumB) / wF;

    let varBetween = wB * wF * (mB - mF) * (mB - mF);

    if (varBetween > varMax) {
      varMax = varBetween;
      threshold = t;
    }
  }

  // Step 3: Apply optimal adaptive threshold mask to binary pixels (White text on black canvas)
  const targetThreshold = threshold * 0.9; 

  for (let i = 0; i < pixels.length; i += 4) {
    const monoIntensity = grayscale[i / 4];
    const binaryColor = monoIntensity > targetThreshold ? 255 : 0;

    pixels[i]     = binaryColor; 
    pixels[i + 1] = binaryColor; 
    pixels[i + 2] = binaryColor; 
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

function processContextualTokens(rawText, prefix) {
  const lines = rawText.toLowerCase().split('\n').map(l => l.trim()).filter(l => l.length > 2);
  const activePool = POE2_CONTEXTUAL_DATABASE[currentContext];

  lines.forEach(line => {
    // 1. ANCHOR DETECTION: Look for numerical properties first
    const cleanLine = line.replace(/\(\s*(\d+)\s*[-➔to]+\s*(\d+)\s*\)/g, '$2'); 
    const numbersFound = cleanLine.match(/(\d+)/g);
    
    if (!numbersFound) return; 

    const extractedStat = numbersFound.length > 1 
      ? Math.max(...numbersFound.map(Number)) 
      : parseInt(numbersFound[0], 10);

    // 2. FEATURE MAPPING: Isolate pure alphabetical attribute descriptors
    const attributeTextOnly = cleanLine.replace(/[\d\+\%\-\(\)]/g, '').trim();
    
    // 3. FUZZY MATCHING MATRIX
    let bestMatch = null;
    let highestHitRatio = 0.0;

    Object.keys(activePool).forEach(cat => {
      activePool[cat].forEach(mod => {
        let keywordHits = 0;
        
        mod.keywords.forEach(word => {
          if (attributeTextOnly.includes(word) || computeLevenshteinDistance(attributeTextOnly, word) < 2) {
            keywordHits++;
          }
        });

        const hitRatio = keywordHits / mod.keywords.length;

        if (hitRatio >= 0.65 && hitRatio > highestHitRatio) {
          highestHitRatio = hitRatio;
          bestMatch = mod;
        }
      });
    });

    // 4. INPUT LOCK-ON
    if (bestMatch) {
      const uiTargetNode = document.getElementById(`${prefix}_${bestMatch.id}`);
      if (uiTargetNode) {
        const currentUiVal = parseInt(uiTargetNode.value, 10) || 0;
        uiTargetNode.value = Math.max(currentUiVal, extractedStat);
        
        uiTargetNode.classList.add('scan-success-flash');
        setTimeout(() => uiTargetNode.classList.remove('scan-success-flash'), 600);
      }
    }
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
  
  let totalShift = 0;
  if (sA > 0) {
    totalShift = ((sB - sA) / sA) * 100;
  } else if (sB > 0) {
    totalShift = 100; 
  }

  const pctClass = totalShift >= 0 ? 'positive' : 'negative';
  
  let verdictTitle = "EQUIVOCAL EXCHANGE";
  let verdictDescription = "The item has identical calculated weights or holds zero metrics.";
  
  if (totalShift > 15) {
    verdictTitle = "🚨 DEFINITE UPGRADE";
    verdictDescription = "This item yields a massive increase to your baseline weights. Swap it out immediately.";
  } else if (totalShift > 0) {
    verdictTitle = "MINIMAL UPGRADE";
    verdictDescription = "Slight stat increase. Make sure your build doesn't rely heavily on specific resistance thresholds before breaking current sets.";
  } else if (totalShift < 0) {
    verdictTitle = "❌ DOWNGRADE DETECTED";
    verdictDescription = "Equipping this item drops your net weight. Keep your current gear active or salvage this drop.";
  }

  inner.innerHTML = `
    <div class="verdict-banner">
      <div>
        <div class="verdict-label" style="color: ${totalShift > 0 ? 'var(--green-bright)' : totalShift < 0 ? 'var(--red-accent)' : 'var(--gold)'}">${verdictTitle}</div>
        <div class="verdict-desc">${verdictDescription}</div>
      </div>
      <div class="verdict-diff">
        <div class="diff-pct ${pctClass}">${totalShift >= 0 ? '+' : ''}${totalShift.toFixed(1)}%</div>
        <div class="diff-label">Upgrade Differential</div>
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

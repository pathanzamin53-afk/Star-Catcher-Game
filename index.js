window.addEventListener('load', function () {
  'use strict';

  var VERSION = '2.1';
  var STORE_KEY = 'starCatcherSave_v3';
  var PROFILE_KEY = 'starCatcherProfiles_v1';
  var ACTIVE_PROFILE_KEY = 'starCatcherActiveProfile';

  // =================== DEVICE DETECTION ===================
  var deviceType = (function() {
    var ua = navigator.userAgent || '';
    if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(ua)) return 'mobile';
    if (/iPad/i.test(ua)) return 'mobile';
    if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return 'mobile';
    var hasFine = window.matchMedia('(pointer: fine)').matches;
    var hasCoarse = window.matchMedia('(pointer: coarse)').matches;
    var noHover = window.matchMedia('(hover: none)').matches;
    if (hasFine && !hasCoarse) return 'desktop';
    if (hasFine && hasCoarse) return (window.innerWidth < 768 && window.innerHeight < 900) ? 'mobile' : 'desktop';
    if (hasCoarse && noHover) return 'mobile';
    return (window.innerWidth < 640 && window.innerHeight < 900) ? 'mobile' : 'desktop';
  })();

  // =================== THEMES ===================
  var THEMES = {
    crystal:   { id:'crystal',   name:'Crystal',    emoji:'💎', cost:0,    stops:[[0,'#ffe0f5'],[0.3,'#ff6eb4'],[0.6,'#ff0080'],[0.85,'#a855f7'],[1,'#00f0ff']], glow1:'#ff6eb4', glow2:'#ff0080', pattern:'facet' },
    spiderman: { id:'spiderman', name:'Spider-Man', emoji:'🕷️', cost:250,  stops:[[0,'#ff5a5a'],[0.4,'#c41e1e'],[0.5,'#1a2c7a'],[0.85,'#2040a8'],[1,'#0d1547']], glow1:'#ff3333', glow2:'#2040a8', pattern:'web' },
    batman:    { id:'batman',    name:'Batman',     emoji:'🦇', cost:350,  stops:[[0,'#4a4a4a'],[0.3,'#1a1a1a'],[0.6,'#000000'],[0.85,'#1f1f1f'],[1,'#0a0a0a']], glow1:'#ffd700', glow2:'#333333', pattern:'bat' },
    superman:  { id:'superman',  name:'Superman',   emoji:'⚡', cost:500,  stops:[[0,'#4d9dff'],[0.3,'#1e5cff'],[0.55,'#0a3a99'],[0.85,'#c81e1e'],[1,'#7a0d0d']], glow1:'#4d9dff', glow2:'#c81e1e', pattern:'shield' },
    captain:   { id:'captain',   name:'Captain',    emoji:'🎖️', cost:500,  stops:[[0,'#4d7fff'],[0.3,'#1e4dcf'],[0.55,'#e8e8e8'],[0.85,'#c81e1e'],[1,'#8a0d0d']], glow1:'#4d7fff', glow2:'#e8e8e8', pattern:'star' },
    hulk:      { id:'hulk',      name:'Hulk',       emoji:'💚', cost:600,  stops:[[0,'#7dff5c'],[0.3,'#3ecc1a'],[0.55,'#1a8a0d'],[0.85,'#6a1fa8'],[1,'#3a0d66']], glow1:'#3ecc1a', glow2:'#6a1fa8', pattern:'crack' },
    ironman:   { id:'ironman',   name:'Iron Man',   emoji:'⚡', cost:800,  stops:[[0,'#ffd966'],[0.3,'#ffa500'],[0.55,'#c81e1e'],[0.85,'#8a0d0d'],[1,'#4a0606']], glow1:'#ffa500', glow2:'#c81e1e', pattern:'reactor' },
    joker:     { id:'joker',     name:'Joker',      emoji:'🃏', cost:800,  stops:[[0,'#7dff5c'],[0.3,'#1a8a0d'],[0.55,'#6a1fa8'],[0.85,'#3a0d66'],[1,'#1a0630']], glow1:'#7dff5c', glow2:'#a855f7', pattern:'jester' },
    thanos:    { id:'thanos',    name:'Thanos',     emoji:'💜', cost:1000, stops:[[0,'#c084fc'],[0.3,'#8b5cf6'],[0.55,'#6a1fa8'],[0.85,'#ffd700'],[1,'#8a6800']], glow1:'#a855f7', glow2:'#ffd700', pattern:'stones' },
    sakura:    { id:'sakura',    name:'Sakura',     emoji:'🌸', cost:1200, stops:[[0,'#ffe0f5'],[0.3,'#ffb3d9'],[0.6,'#ff6eb4'],[0.85,'#ff0080'],[1,'#a855f7']], glow1:'#ffb3d9', glow2:'#ff6eb4', pattern:'sakura' },
    gold:      { id:'gold',      name:'Gold',       emoji:'👑', cost:1500, stops:[[0,'#fff3b0'],[0.3,'#ffd700'],[0.55,'#b8860b'],[0.85,'#8a6800'],[1,'#4a3800']], glow1:'#ffd700', glow2:'#b8860b', pattern:'facet' },
    rainbow:   { id:'rainbow',   name:'Rainbow',    emoji:'🌈', cost:2500, stops:null, glow1:'#ff00ff', glow2:'#00ffff', pattern:'sparkle' }
  };
  var THEME_ORDER = ['crystal','spiderman','batman','superman','captain','hulk','ironman','joker','thanos','sakura','gold','rainbow'];

  // =================== MULTI-PROFILE SYSTEM ===================
  function getProfiles() {
    try {
      var raw = localStorage.getItem(PROFILE_KEY);
      if (raw) return JSON.parse(raw) || {};
    } catch(e) {}
    return {};
  }

  function saveProfiles(profiles) {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles)); } catch(e) {}
  }

  function getActiveProfileId() {
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  }

  function setActiveProfileId(id) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  }

  function getCurrentProfileKey() {
    var id = getActiveProfileId();
    if (!id) return STORE_KEY;
    return STORE_KEY + '_' + id;
  }

  var PROFILE_EMOJIS = ['😎','🦊','🐯','🦁','🐼','🐸','🦄','🐙','🦖','🚀','🐶','🐱','🐺','🦝','🐨','🌟','🔥','⚡','👑','💎'];

  function createProfile(name) {
    var id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    var profiles = getProfiles();
    profiles[id] = {
      id: id,
      name: name,
      emoji: PROFILE_EMOJIS[Math.floor(Math.random() * PROFILE_EMOJIS.length)],
      createdAt: Date.now()
    };
    saveProfiles(profiles);
    return id;
  }

  function deleteProfile(id) {
    var profiles = getProfiles();
    if (!profiles[id]) return false;
    delete profiles[id];
    saveProfiles(profiles);
    try { localStorage.removeItem(STORE_KEY + '_' + id); } catch(e) {}
    if (getActiveProfileId() === id) {
      var keys = Object.keys(profiles);
      if (keys.length > 0) setActiveProfileId(keys[0]);
      else localStorage.removeItem(ACTIVE_PROFILE_KEY);
    }
    return true;
  }

  function switchProfile(id) {
    // Save current profile first
    try {
      store.lastPlayed = Date.now();
      localStorage.setItem(getCurrentProfileKey(), JSON.stringify(store));
    } catch(e) {}
    // Switch active
    setActiveProfileId(id);
    // Load new profile's store
    loadStore();
    // Refresh UI
    updateProfileUI();
    updateDiamondUI();
    bestLine.textContent = 'Best: ' + store.best.toLocaleString();
    renderAchFull();
    renderStats();
    renderShop();
  }

  // =================== SAVE STORE ===================
  var store = {
    version: VERSION,
    best: 0, totalGames: 0, totalScore: 0,
    totalStars: 0, totalBigStars: 0, totalGems: 0, totalBombs: 0, totalLives: 0,
    bestCombo: 0, bestLevel: 1, totalPlaytime: 0, totalAchievements: 0,
    diamonds: 0, earnedDiamonds: 0,
    ownedThemes: ['crystal'], currentTheme: 'crystal',
    achievements: {}, firstPlayed: null, lastPlayed: null
  };

  function numOr(v, f) {
    var n = Number(v);
    return (isFinite(n) && n >= 0) ? n : (f || 0);
  }

  function loadStore() {
    // Reset store to defaults first
    store = {
      version: VERSION,
      best: 0, totalGames: 0, totalScore: 0,
      totalStars: 0, totalBigStars: 0, totalGems: 0, totalBombs: 0, totalLives: 0,
      bestCombo: 0, bestLevel: 1, totalPlaytime: 0, totalAchievements: 0,
      diamonds: 0, earnedDiamonds: 0,
      ownedThemes: ['crystal'], currentTheme: 'crystal',
      achievements: {}, firstPlayed: null, lastPlayed: null
    };

    try {
      var raw = localStorage.getItem(getCurrentProfileKey());
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          Object.keys(store).forEach(function(k) {
            if (parsed[k] !== undefined) store[k] = parsed[k];
          });
        }
      }
      ['best','totalGames','totalScore','totalStars','totalBigStars','totalGems','totalBombs','totalLives','bestCombo','totalPlaytime','totalAchievements','diamonds','earnedDiamonds'].forEach(function(k){ store[k] = numOr(store[k], 0); });
      store.bestLevel = Math.max(1, numOr(store.bestLevel, 1));
      if (!Array.isArray(store.ownedThemes)) store.ownedThemes = ['crystal'];
      var seen = {};
      store.ownedThemes = store.ownedThemes.filter(function(id) { if (!THEMES[id] || seen[id]) return false; seen[id] = true; return true; });
      if (store.ownedThemes.indexOf('crystal') === -1) store.ownedThemes.push('crystal');
      if (!THEMES[store.currentTheme]) store.currentTheme = 'crystal';
      if (store.ownedThemes.indexOf(store.currentTheme) === -1) store.currentTheme = 'crystal';
      if (!store.achievements || typeof store.achievements !== 'object') store.achievements = {};
      if (!store.firstPlayed) store.firstPlayed = Date.now();
    } catch(e) { console.warn('[Store] load failed:', e); }

    // Ensure default profile exists
    var profiles = getProfiles();
    if (Object.keys(profiles).length === 0) {
      var defaultId = createProfile('Player');
      setActiveProfileId(defaultId);
    } else if (!getActiveProfileId() || !profiles[getActiveProfileId()]) {
      setActiveProfileId(Object.keys(profiles)[0]);
    }

    // Re-sync achievements reference
    unlocked = store.achievements || {};
    activeTheme = THEMES[store.currentTheme] || THEMES.crystal;
  }

  var savedTimeout = null;
  function saveStore(showIndicator) {
    try {
      store.lastPlayed = Date.now();
      store.version = VERSION;
      localStorage.setItem(getCurrentProfileKey(), JSON.stringify(store));
      if (showIndicator) flashSaved();
    } catch(e) { console.warn('[Store] save failed:', e); }
  }
  function saveStoreDebounced() {
    if (savedTimeout) clearTimeout(savedTimeout);
    savedTimeout = setTimeout(function(){ saveStore(false); }, 400);
  }

  var savedEl = document.getElementById('savedIndicator');
  var savedHideTimeout = null;
  function flashSaved() {
    savedEl.classList.add('show');
    if (savedHideTimeout) clearTimeout(savedHideTimeout);
    savedHideTimeout = setTimeout(function(){ savedEl.classList.remove('show'); }, 900);
  }

  // =================== DOM ===================
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d', { alpha: false });
  var overlay = document.getElementById('overlay');
  var hudScore = document.getElementById('score');
  var hudLevel = document.getElementById('level');
  var hudLives = document.getElementById('lives');
  var hudScoreBox = document.getElementById('hudScoreBox');
  var hudLevelBox = document.getElementById('hudLevelBox');
  var hudLivesBox = document.getElementById('hudLivesBox');
  var comboEl = document.getElementById('comboBadge');
  var comboBar = document.getElementById('comboBar');
  var comboFill = document.getElementById('comboBarFill');
  var achWrap = document.getElementById('achWrap');
  var toastWrap = document.getElementById('toastWrap');
  var bestLine = document.getElementById('bestLine');
  var deviceText = document.getElementById('deviceText');
  var menuHint = document.getElementById('menuHint');
  var howText = document.getElementById('howText');
  var menuDiamonds = document.getElementById('menuDiamonds');
  var shopDiamonds = document.getElementById('shopDiamonds');
  var themeGrid = document.getElementById('themeGrid');
  var overDiamondsEarned = document.getElementById('overDiamondsEarned');
  var currentPlayerNameEl = document.getElementById('currentPlayerName');
  var profileListEl = document.getElementById('profileList');
  var newProfileInput = document.getElementById('newProfileInput');

  if (deviceType === 'desktop') {
    deviceText.textContent = 'Desktop Mode';
    menuHint.innerHTML = 'Falling stars ko <b>crystal catcher</b> se pakdo!<br>Mouse ya Arrow keys se move karo.';
    howText.innerHTML = '<b>1.</b> Falling items ko catcher se pakdo<br><b>2.</b> <b>Mouse move</b> ya <b>← →</b> arrow keys<br><b>3.</b> <b>Space</b> = Quick start<br><b>4.</b> <b>💎 Gems</b> pakdo = +5 diamonds<br><b>5.</b> <b>🛒 Shop</b> mein themes kharido<br><b>6.</b> <b>💣</b> se bacho = life kam<br><b>7.</b> Lagatar pakdo = <b>COMBO</b> ×5 multiplier tak!<br><b>8.</b> <b>👤 Profile</b> se multiple players banao!';
  } else {
    deviceText.textContent = 'Mobile Mode';
    menuHint.innerHTML = 'Falling stars ko apne <b>crystal catcher</b> se pakdo!<br>Screen touch karke move karo.';
    howText.innerHTML = '<b>1.</b> Falling items ko catcher se pakdo<br><b>2.</b> <b>Screen touch / drag</b> karke move karo<br><b>3.</b> <b>💎 Gems</b> pakdo = +5 diamonds<br><b>4.</b> <b>🛒 Shop</b> mein themes kharido<br><b>5.</b> <b>💣</b> se bacho = life kam<br><b>6.</b> Lagatar pakdo = <b>COMBO</b> ×5 multiplier tak!<br><b>7.</b> <b>👤 Profile</b> se multiple players banao!';
  }

  var screens = {
    menu:       document.getElementById('screenMenu'),
    over:       document.getElementById('screenOver'),
    shop:       document.getElementById('screenShop'),
    ach:        document.getElementById('screenAch'),
    stats:      document.getElementById('screenStats'),
    how:        document.getElementById('screenHow'),
    profiles:   document.getElementById('screenProfiles'),
    newProfile: document.getElementById('screenNewProfile')
  };
  var overTitle = document.getElementById('overTitle');
  var overText = document.getElementById('overText');
  var overNewBest = document.getElementById('overNewBest');
  var achListFull = document.getElementById('achListFull');
  var achProgress = document.getElementById('achProgress');
  var statsList = document.getElementById('statsList');

  function showScreen(name) {
    Object.keys(screens).forEach(function(k) {
      if (screens[k]) screens[k].classList.toggle('active', k === name);
    });
    if (name === null) overlay.classList.add('hidden');
    else overlay.classList.remove('hidden');
  }

  function currentScreen() {
    if (screens.menu.classList.contains('active')) return 'menu';
    if (screens.over.classList.contains('active')) return 'over';
    if (screens.shop.classList.contains('active')) return 'shop';
    if (screens.ach.classList.contains('active')) return 'ach';
    if (screens.stats.classList.contains('active')) return 'stats';
    if (screens.how.classList.contains('active')) return 'how';
    if (screens.profiles.classList.contains('active')) return 'profiles';
    if (screens.newProfile.classList.contains('active')) return 'newProfile';
    return null;
  }

  function showToast(text, icon, type) {
    var existing = toastWrap.querySelectorAll('.toast:not(.out)');
    if (existing.length >= 3) existing[0].remove();
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.innerHTML = (icon ? '<span>' + icon + '</span>' : '') + '<span>' + text + '</span>';
    toastWrap.appendChild(el);
    setTimeout(function(){
      if (el.parentNode) {
        el.classList.add('out');
        setTimeout(function(){ if (el.parentNode) el.remove(); }, 400);
      }
    }, 1800);
  }

  // =================== ACHIEVEMENTS ===================
  var ACH_DEFS = {
    firstStar:  { icon:'⭐', name:'First Catch',   desc:'Pehla star pakda!' },
    combo10:    { icon:'🔥', name:'Combo Master',  desc:'10x combo!' },
    combo25:    { icon:'💥', name:'Combo God',     desc:'25x combo!' },
    score500:   { icon:'🥉', name:'Rising Star',   desc:'500 points' },
    score1500:  { icon:'🥈', name:'Star Hunter',   desc:'1500 points' },
    score3000:  { icon:'🥇', name:'Galaxy Master', desc:'3000 points' },
    score6000:  { icon:'👑', name:'Legend',        desc:'6000 points' },
    level5:     { icon:'🚀', name:'Level 5',       desc:'Level 5 tak' },
    level10:    { icon:'🌌', name:'Deep Space',    desc:'Level 10 tak' },
    gems10:     { icon:'💎', name:'Gem Collector', desc:'10 gems' },
    gems50:     { icon:'💠', name:'Jeweler',       desc:'50 gems' },
    survivor:   { icon:'🛡️', name:'Survivor',      desc:'Level 5, no damage' },
    perfect300: { icon:'✨', name:'Flawless',      desc:'300 pts, no damage' }
  };
  var ACH_KEYS = Object.keys(ACH_DEFS);
  var unlocked = store.achievements || {};
  var sessionFlags = {};
  var sessionDiamonds = 0;

  function renderAchFull() {
    achListFull.innerHTML = '';
    var count = 0;
    ACH_KEYS.forEach(function(key) {
      var d = ACH_DEFS[key];
      var isUnlocked = !!unlocked[key];
      if (isUnlocked) count++;
      var el = document.createElement('div');
      el.className = 'ach-item' + (isUnlocked ? ' unlocked' : '');
      el.innerHTML = '<div class="ach-item-icon">' + d.icon + '</div><div class="ach-item-text"><span class="ach-item-name">' + d.name + '</span><span class="ach-item-desc">' + d.desc + '</span></div>';
      achListFull.appendChild(el);
    });
    achProgress.textContent = count + ' / ' + ACH_KEYS.length + ' Unlocked';
    store.totalAchievements = count;
  }

  function unlockAch(key) {
    if (unlocked[key]) return;
    if (!ACH_DEFS[key]) return;
    unlocked[key] = true;
    store.achievements = unlocked;
    grantDiamonds(30, 'Achievement Bonus', '🏆');
    saveStore(true);
    showAchToast(ACH_DEFS[key]);
    sfx(880, 0.12, 'triangle', 0.08);
    setTimeout(function(){ sfx(1174, 0.14, 'triangle', 0.08); }, 90);
    setTimeout(function(){ sfx(1568, 0.22, 'triangle', 0.08); }, 190);
  }

  function showAchToast(def) {
    var el = document.createElement('div');
    el.className = 'ach-toast';
    el.innerHTML = '<div class="ach-icon">' + def.icon + '</div><div class="ach-text"><span class="ach-title">Achievement Unlocked</span><span class="ach-name">' + def.name + '</span><span class="ach-desc">' + def.desc + '</span></div>';
    achWrap.appendChild(el);
    setTimeout(function(){
      if (el.parentNode) {
        el.classList.add('out');
        setTimeout(function(){ if (el.parentNode) el.remove(); }, 450);
      }
    }, 3200);
  }

  function checkAch() {
    try {
      if (sessionFlags.caughtStar) unlockAch('firstStar');
      if (combo >= 10) unlockAch('combo10');
      if (combo >= 25) unlockAch('combo25');
      if (score >= 500) unlockAch('score500');
      if (score >= 1500) unlockAch('score1500');
      if (score >= 3000) unlockAch('score3000');
      if (score >= 6000) unlockAch('score6000');
      if (level >= 5) unlockAch('level5');
      if (level >= 10) unlockAch('level10');
      if (sessionFlags.gemsCaught >= 10) unlockAch('gems10');
      if (sessionFlags.gemsCaught >= 50) unlockAch('gems50');
      if (level >= 5 && sessionFlags.lostLife === false && sessionFlags.caughtStar) unlockAch('survivor');
      if (score >= 300 && sessionFlags.lostLife === false && sessionFlags.caughtStar) unlockAch('perfect300');
    } catch(e) {}
  }

  function grantDiamonds(amount, reason, icon) {
    if (!isFinite(amount) || amount <= 0) return;
    store.diamonds += amount;
    store.earnedDiamonds += amount;
    sessionDiamonds += amount;
    updateDiamondUI();
    if (reason) showToast('+' + amount + ' 💎  ' + reason, icon, 'gold');
    saveStoreDebounced();
  }

  function updateDiamondUI() {
    menuDiamonds.textContent = store.diamonds.toLocaleString();
    shopDiamonds.textContent = store.diamonds.toLocaleString();
  }

  // =================== SHOP ===================
  function themePreviewStyle(t) {
    if (t.stops === null) return 'background:linear-gradient(90deg,#ff0000,#ff8800,#ffee00,#00ff44,#00eeff,#4444ff,#cc00ff,#ff0000);background-size:200% 100%;animation:rainbowSlide 3s linear infinite;';
    var cs = t.stops.map(function(s){ return s[1] + ' ' + Math.round(s[0]*100) + '%'; }).join(', ');
    return 'background:linear-gradient(180deg, ' + cs + ');';
  }

  function renderShop() {
    themeGrid.innerHTML = '';
    updateDiamondUI();
    THEME_ORDER.forEach(function(id) {
      var t = THEMES[id];
      if (!t) return;
      var owned = store.ownedThemes.indexOf(id) !== -1;
      var equipped = store.currentTheme === id;
      var canAfford = store.diamonds >= t.cost;
      var card = document.createElement('div');
      card.className = 'theme-card';
      if (equipped) card.classList.add('equipped');
      else if (owned) card.classList.add('owned');
      else if (!canAfford) card.classList.add('locked');

      var costClass = 'theme-cost';
      var costText = '';
      if (equipped) { costClass += ' equipped-badge'; costText = '✓ Equipped'; }
      else if (owned) { costClass += ' owned-badge'; costText = 'Tap to use'; }
      else if (t.cost === 0) { costClass += ' free'; costText = 'Free'; }
      else { costText = '💎 ' + t.cost; }

      var checkMark = equipped ? '<div class="theme-check">✓</div>' : '';
      card.innerHTML = checkMark + '<div class="theme-preview" style="' + themePreviewStyle(t) + '">' + t.emoji + '</div><div class="theme-name">' + t.name + '</div><div class="' + costClass + '">' + costText + '</div>';
      card.addEventListener('click', function(){ handleThemeClick(id, card); });
      themeGrid.appendChild(card);
    });
  }

  function handleThemeClick(id, cardEl) {
    var t = THEMES[id];
    if (!t) return;
    var owned = store.ownedThemes.indexOf(id) !== -1;
    if (owned) {
      if (store.currentTheme === id) { showToast('Already equipped', '✓', 'success'); return; }
      store.currentTheme = id;
      buildPlayerGlow();
      saveStore(true);
      renderShop();
      showToast(t.name + ' equipped!', t.emoji, 'success');
      return;
    }
    if (store.diamonds < t.cost) {
      var need = t.cost - store.diamonds;
      if (cardEl) {
        cardEl.classList.add('shake');
        setTimeout(function(){ if (cardEl) cardEl.classList.remove('shake'); }, 450);
      }
      showToast('Need ' + need + ' more 💎', '💔', 'error');
      return;
    }
    store.diamonds -= t.cost;
    if (store.diamonds < 0) store.diamonds = 0;
    store.ownedThemes.push(id);
    store.currentTheme = id;
    buildPlayerGlow();
    saveStore(true);
    renderShop();
    updateDiamondUI();
    showToast(t.name + ' unlocked!', t.emoji, 'gold');
  }

  // =================== STATS ===================
  function formatPlaytime(ms) {
    if (!ms || ms < 1000) return '0s';
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    if (h > 0) return h + 'h ' + m + 'm';
    if (m > 0) return m + 'm ' + sec + 's';
    return sec + 's';
  }

  function renderStats() {
    var achCount = 0;
    ACH_KEYS.forEach(function(k){ if (unlocked[k]) achCount++; });
    store.totalAchievements = achCount;
    var avgScore = store.totalGames > 0 ? Math.round(store.totalScore / store.totalGames) : 0;
    var rows = [
      { icon:'🏆', label:'Best Score', value: store.best.toLocaleString(), highlight:true },
      { icon:'💎', label:'Diamonds', value: store.diamonds.toLocaleString(), highlight:true },
      { icon:'🛒', label:'Themes Owned', value: store.ownedThemes.length + ' / ' + THEME_ORDER.length },
      { icon:'🎮', label:'Games Played', value: store.totalGames.toLocaleString() },
      { icon:'📈', label:'Total Score', value: store.totalScore.toLocaleString() },
      { icon:'📊', label:'Average Score', value: avgScore.toLocaleString() },
      { icon:'⭐', label:'Stars Caught', value: store.totalStars.toLocaleString() },
      { icon:'🌟', label:'Big Stars', value: store.totalBigStars.toLocaleString() },
      { icon:'💠', label:'Gems Collected', value: store.totalGems.toLocaleString() },
      { icon:'💣', label:'Bombs Hit', value: store.totalBombs.toLocaleString() },
      { icon:'🔥', label:'Best Combo', value: store.bestCombo + 'x', highlight:true },
      { icon:'🚀', label:'Best Level', value: store.bestLevel, highlight:true },
      { icon:'🏅', label:'Achievements', value: achCount + ' / ' + ACH_KEYS.length },
      { icon:'⏱️', label:'Total Playtime', value: formatPlaytime(store.totalPlaytime) }
    ];
    var html = '';
    rows.forEach(function(r) {
      html += '<div class="stat-row' + (r.highlight ? ' highlight' : '') + '"><span class="label"><span>' + r.icon + '</span>' + r.label + '</span><span class="value">' + r.value + '</span></div>';
    });
    statsList.innerHTML = html;
  }

  // =================== GAME STATE ===================
  var W = 300, H = 500, DPR = 1;
  var running = false;
  var score = 0, lives = 3, level = 1, combo = 0, comboTimer = 0;
  var items = [], particles = [], floats = [], shooters = [];
  var starLayers = [[], [], []];
  var petals = [];
  var spawnTimer = 0, shake = 0, squish = 1;
  var screenFlash = 0, flashColor = '#ffffff';
  var lastTime = 0, time = 0;
  var playerTrail = [];
  var sessionStart = 0;
  var lastPlaytimeTick = 0;
  var sessionEnded = false;

  var player = { x:150, y:500, w:96, h:34, targetX:150, pointerActive:false, lastX:150 };
  var keys = { left:false, right:false };

  var TYPES = {
    star:    { emoji:'⭐', points:10, r:15, good:true,  c1:'#ffd700', c2:'#ff9f0a' },
    bigstar: { emoji:'🌟', points:15, r:17, good:true,  c1:'#ffe066', c2:'#ffb300' },
    gem:     { emoji:'💎', points:30, r:17, good:true,  c1:'#00f0ff', c2:'#a855f7' },
    bomb:    { emoji:'💣', points:0,  r:17, good:false, c1:'#ff453a', c2:'#8b0000' },
    life:    { emoji:'❤️', points:0,  r:15, good:false, c1:'#ff0080', c2:'#c81d6e' }
  };

  var GLOWS = {};
  var PLAYER_GLOW = null;
  var VIGNETTE = null;
  var bgGrad = null;
  var activeTheme = THEMES[store.currentTheme] || THEMES.crystal;

  function hexA(hex, a) {
    if (!hex || hex.charAt(0) !== '#') return hex || 'rgba(255,255,255,0)';
    var h = hex.substring(1);
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if (h.length !== 6) return 'rgba(255,255,255,0)';
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  function makeGlowSprite(size, c1, c2) {
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var cc = c.getContext('2d');
    var half = size / 2;
    var grd = cc.createRadialGradient(half, half, 0, half, half, half);
    grd.addColorStop(0, hexA(c1, 1.0));
    grd.addColorStop(0.15, hexA(c1, 0.75));
    grd.addColorStop(0.4, hexA(c2, 0.4));
    grd.addColorStop(0.7, hexA(c2, 0.12));
    grd.addColorStop(1, hexA(c2, 0));
    cc.fillStyle = grd;
    cc.fillRect(0, 0, size, size);
    return c;
  }

  function buildSprites() {
    Object.keys(TYPES).forEach(function(k) {
      var t = TYPES[k];
      GLOWS[k] = makeGlowSprite(160, t.c1, t.c2);
    });
    buildPlayerGlow();
  }

  function buildPlayerGlow() {
    activeTheme = THEMES[store.currentTheme] || THEMES.crystal;
    PLAYER_GLOW = makeGlowSprite(320, activeTheme.glow1, activeTheme.glow2);
  }

  var actx = null;
  function sfx(freq, dur, type, vol, slideTo) {
    try {
      if (!actx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        actx = new AC();
      }
      if (actx.state === 'suspended') actx.resume();
      if (actx.state === 'closed') { actx = null; return; }
      var t = actx.currentTime;
      var o = actx.createOscillator();
      var g = actx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(vol || 0.07, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(actx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch (e) {}
  }

  function goMenu() {
    if (running) endSession();
    running = false;
    screenFlash = 0;
    shake = 0;
    squish = 1;
    items = []; particles = []; floats = []; shooters = [];
    playerTrail = [];
    comboEl.classList.remove('show');
    comboBar.classList.remove('show');
    bestLine.textContent = 'Best: ' + store.best.toLocaleString();
    updateDiamondUI();
    updateProfileUI();
    showScreen('menu');
  }

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    var dprCap = deviceType === 'desktop' ? 2 : 1.5;
    DPR = Math.min(window.devicePixelRatio || 1, dprCap);
    W = Math.max(300, Math.floor(rect.width));
    H = Math.max(400, Math.floor(rect.height));
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.imageSmoothingEnabled = true;
    buildStars();
    buildPetals();
    buildStaticLayers();
    player.x = Math.min(Math.max(player.x, player.w/2), W - player.w/2);
    player.targetX = player.x;
    player.y = H - 80;
  }

  function buildStaticLayers() {
    VIGNETTE = document.createElement('canvas');
    VIGNETTE.width = W; VIGNETTE.height = H;
    var vc = VIGNETTE.getContext('2d');
    var vgrd = vc.createRadialGradient(W/2, H/2, Math.min(W,H) * 0.3, W/2, H/2, Math.max(W,H) * 0.8);
    vgrd.addColorStop(0, 'rgba(0,0,0,0)');
    vgrd.addColorStop(1, 'rgba(0,0,0,0.6)');
    vc.fillStyle = vgrd;
    vc.fillRect(0, 0, W, H);
    bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0a0512');
    bgGrad.addColorStop(0.25, '#18082a');
    bgGrad.addColorStop(0.5, '#22103a');
    bgGrad.addColorStop(0.75, '#2a0e42');
    bgGrad.addColorStop(1, '#2a0828');
  }

  function buildStars() {
    starLayers = [[], [], []];
    var perLayer = [Math.floor((W * H) / 24000), Math.floor((W * H) / 16000), Math.floor((W * H) / 28000)];
    var layerSizes = [
      { r:[0.3, 0.7], a:[0.3, 0.55], drift:[0.02, 0.05] },
      { r:[0.6, 1.0], a:[0.45, 0.75], drift:[0.06, 0.12] },
      { r:[1.0, 1.6], a:[0.7, 1.0], drift:[0.14, 0.22] }
    ];
    for (var L = 0; L < 3; L++) {
      var sz = layerSizes[L];
      for (var i = 0; i < perLayer[L]; i++) {
        var pal = ['#ffffff', '#ffb3d9', '#ff6eb4', '#e5d4ff', '#00f0ff'];
        var c = pal[(Math.random() * pal.length) | 0];
        starLayers[L].push({
          x: Math.random() * W, y: Math.random() * H,
          r: sz.r[0] + Math.random() * (sz.r[1] - sz.r[0]),
          a: sz.a[0] + Math.random() * (sz.a[1] - sz.a[0]),
          tw: Math.random() * Math.PI * 2,
          sp: Math.random() * 0.04 + 0.01,
          drift: sz.drift[0] + Math.random() * (sz.drift[1] - sz.drift[0]),
          c: c
        });
      }
    }
  }

  function buildPetals() {
    petals = [];
    for (var i = 0; i < 16; i++) {
      petals.push({
        x: Math.random() * W, y: Math.random() * H,
        size: 4 + Math.random() * 5,
        rot: Math.random() * Math.PI * 2,
        rotSpd: (Math.random() - 0.5) * 0.035,
        vy: 0.35 + Math.random() * 0.7,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.008 + Math.random() * 0.02,
        swayAmp: 20 + Math.random() * 40,
        drift: 0.1 + Math.random() * 0.2,
        baseX: 0,
        hue: Math.random() < 0.3 ? 'cyan' : (Math.random() < 0.5 ? 'white' : 'pink'),
        alpha: 0.45 + Math.random() * 0.35
      });
      petals[i].baseX = petals[i].x;
    }
  }

  function spawnShooter() {
    var fromLeft = Math.random() < 0.5;
    shooters.push({
      x: fromLeft ? -30 : W + 30,
      y: Math.random() * H * 0.5,
      vx: fromLeft ? 5 + Math.random() * 3 : -(5 + Math.random() * 3),
      vy: 2 + Math.random() * 2,
      len: 80 + Math.random() * 80,
      life: 1, decay: 0.008 + Math.random() * 0.005
    });
  }

  function burst(x, y, colors, count, power) {
    for (var i = 0; i < count; i++) {
      var ang = Math.random() * Math.PI * 2;
      var spd = Math.random() * power + 1;
      particles.push({
        x: x, y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 1.2,
        r: Math.random() * 3.2 + 1,
        life: 1, decay: 0.02 + Math.random() * 0.025,
        color: colors[(Math.random() * colors.length) | 0]
      });
    }
  }

  function addFloat(x, y, text, color) {
    floats.push({ x: x, y: y, text: text, color: color, life: 1, vy: -1.6 });
  }

  function pickType() {
    var r = Math.random();
    if (r < 0.045 && lives < 3) return 'life';
    if (r < 0.21) return 'bomb';
    if (r < 0.31) return 'gem';
    if (r < 0.44) return 'bigstar';
    return 'star';
  }

  function spawnItem() {
    var type = pickType();
    var def = TYPES[type];
    var pad = def.r + 12;
    items.push({
      x: pad + Math.random() * (W - pad * 2),
      y: -40,
      vy: 1.9 + level * 0.33 + Math.random() * 0.5,
      vx: (Math.random() - 0.5) * 0.5,
      rot: 0, rotSpd: (Math.random() - 0.5) * 0.06,
      pulse: Math.random() * Math.PI * 2,
      type: type, emoji: def.emoji, points: def.points, r: def.r, good: def.good,
      c1: def.c1, c2: def.c2, glow: GLOWS[type]
    });
  }

  function updateHUD() {
    hudScore.textContent = isFinite(score) ? score.toLocaleString() : '0';
    hudLevel.textContent = level;
    var s = '';
    for (var i = 0; i < 3; i++) s += (i < lives) ? '❤' : '·';
    hudLives.textContent = s;
  }
  function pulseHUD(el) {
    if (!el) return;
    el.classList.remove('pulse');
    void el.offsetWidth;
    el.classList.add('pulse');
  }

  function startSession() {
    sessionStart = Date.now();
    lastPlaytimeTick = sessionStart;
    sessionEnded = false;
  }

  function tickPlaytime() {
    if (!running || !sessionStart) return;
    var now = Date.now();
    var delta = now - lastPlaytimeTick;
    lastPlaytimeTick = now;
    if (delta > 0 && delta < 5000) {
      store.totalPlaytime += delta;
      saveStoreDebounced();
    }
  }

  function endSession() {
    if (sessionEnded || !sessionStart) return;
    sessionEnded = true;
    tickPlaytime();
    store.totalGames++;
    store.totalScore += score;
    if (score > store.best) store.best = score;
    if (combo > store.bestCombo) store.bestCombo = combo;
    if (level > store.bestLevel) store.bestLevel = level;
    saveStore(true);
    sessionStart = 0;
  }

  function resetGame() {
    score = 0; lives = 3; level = 1; combo = 0; comboTimer = 0;
    items = []; particles = []; floats = []; shooters = [];
    playerTrail = [];
    spawnTimer = 0; shake = 0; squish = 1;
    screenFlash = 0; sessionDiamonds = 0;
    sessionFlags = { caughtStar:false, lostLife:false, gemsCaught:0 };
    player.x = W / 2;
    player.targetX = W / 2;
    player.lastX = W / 2;
    player.pointerActive = false;
    player.y = H - 80;
    updateHUD();
    comboEl.classList.remove('show');
    comboBar.classList.remove('show');
  }

  function gameOver() {
    running = false;
    screenFlash = 0;
    shake = 0;
    squish = 1;
    comboEl.classList.remove('show');
    comboBar.classList.remove('show');

    var isNewBest = score > store.best;
    if (isNewBest) store.best = score;
    endSession();

    overTitle.innerHTML = 'Game<br>Over';
    overText.innerHTML = 'Score: <b>' + score.toLocaleString() + '</b><br>Level: <b>' + level + '</b> &nbsp;|&nbsp; Best Combo: <b>' + combo + 'x</b>';
    overNewBest.style.display = isNewBest ? 'block' : 'none';
    overDiamondsEarned.textContent = sessionDiamonds;
    showScreen('over');
    sfx(320, 0.5, 'sawtooth', 0.09, 90);
  }

  function handleCatch(it) {
    squish = 1.35;

    if (it.type === 'bomb') {
      lives--;
      store.totalBombs++;
      combo = 0;
      comboEl.classList.remove('show');
      comboBar.classList.remove('show');
      shake = 22;
      screenFlash = 1;
      flashColor = '#ff2040';
      burst(it.x, it.y, ['#ff2040', '#ff6eb4', '#ffd700', '#ffffff'], 24, 7);
      addFloat(it.x, it.y - 10, '💥 BOOM!', '#ff2040');
      sfx(150, 0.32, 'sawtooth', 0.1, 55);
      if (deviceType === 'mobile' && navigator.vibrate) {
        try { navigator.vibrate(90); } catch(e){}
      }
      sessionFlags.lostLife = true;
      updateHUD();
      pulseHUD(hudLivesBox);
      saveStoreDebounced();
      if (lives <= 0) gameOver();
      return;
    }

    if (it.type === 'life') {
      if (lives < 3) { lives++; updateHUD(); pulseHUD(hudLivesBox); }
      store.totalLives++;
      burst(it.x, it.y, ['#ff0080', '#ff6eb4', '#ffffff'], 18, 5);
      addFloat(it.x, it.y - 10, '+1 LIFE', '#ff0080');
      sfx(523, 0.1, 'sine', 0.08);
      setTimeout(function(){ sfx(784, 0.1, 'sine', 0.08); }, 80);
      saveStoreDebounced();
      return;
    }

    sessionFlags.caughtStar = true;
    if (it.type === 'gem') {
      sessionFlags.gemsCaught++;
      store.totalGems++;
      grantDiamonds(5, null, null);
      addFloat(it.x, it.y - 28, '+5 💎', '#00f0ff');
    } else if (it.type === 'bigstar') {
      store.totalBigStars++;
    } else {
      store.totalStars++;
    }

    combo++;
    comboTimer = 90;
    if (combo > store.bestCombo) store.bestCombo = combo;

    var mult = Math.min(5, 1 + Math.floor(combo / 5));
    var gained = it.points * mult;
    score += gained;

    var colors = it.type === 'gem' ? ['#00f0ff', '#a855f7', '#ffffff', '#ff6eb4'] : ['#ffd700', '#ff6eb4', '#ffffff', '#ffe066'];
    burst(it.x, it.y, colors, it.type === 'gem' ? 22 : 15, it.type === 'gem' ? 5.5 : 4);
    addFloat(it.x, it.y - 8, '+' + gained, it.type === 'gem' ? '#00f0ff' : '#ffd700');

    if (combo > 0 && combo % 10 === 0) {
      screenFlash = 0.5;
      flashColor = it.c1;
      burst(it.x, it.y, ['#ffffff', '#ffe066'], 16, 6.5);
    }

    var base = 520 + Math.min(combo, 14) * 62;
    sfx(base, 0.085, 'sine', 0.06);

    comboBar.classList.add('show');
    comboFill.style.width = Math.min(100, (combo % 5 === 0 ? 5 : combo % 5) * 20) + '%';

    if (combo >= 3) {
      comboEl.textContent = '🔥 ' + combo + 'x Combo' + (mult > 1 ? '  ×' + mult : '');
      comboEl.classList.add('show');
      if (comboEl._t) clearTimeout(comboEl._t);
      comboEl._t = setTimeout(function(){ comboEl.classList.remove('show'); }, 900);
    }
    updateHUD();
    pulseHUD(hudScoreBox);
    saveStoreDebounced();
    checkAch();
  }

  function update(dt) {
    time += dt;

    if (player.pointerActive) {
      player.x += (player.targetX - player.x) * Math.min(1, 0.3 * dt);
    } else {
      var spd = 9 * dt;
      if (keys.left) player.x -= spd;
      if (keys.right) player.x += spd;
      player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, player.x));
      player.targetX = player.x;
    }

    var dx = player.x - player.lastX;
    if (Math.abs(dx) > 2) {
      playerTrail.push({ x: player.x, y: player.y, w: player.w, h: player.h, life: 1, decay: 0.08 });
      if (playerTrail.length > 8) playerTrail.shift();
    }
    player.lastX = player.x;
    for (var tr = playerTrail.length - 1; tr >= 0; tr--) {
      playerTrail[tr].life -= playerTrail[tr].decay * dt;
      if (playerTrail[tr].life <= 0) playerTrail.splice(tr, 1);
    }

    squish += (1 - squish) * Math.min(1, 0.18 * dt);
    shake *= Math.pow(0.86, dt);
    if (screenFlash > 0) screenFlash *= Math.pow(0.88, dt);
    if (screenFlash < 0.01) screenFlash = 0;

    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0 && combo > 0) {
        combo = 0;
        comboEl.classList.remove('show');
        comboBar.classList.remove('show');
      }
    }

    var newLevel = 1 + Math.floor(score / 260);
    if (newLevel > level) {
      level = newLevel;
      if (level > store.bestLevel) store.bestLevel = level;
      addFloat(W / 2, H * 0.42, 'LEVEL ' + level + '!', '#ff6eb4');
      grantDiamonds(5, null, null);
      screenFlash = 0.7;
      flashColor = '#ff6eb4';
      sfx(660, 0.1, 'square', 0.06);
      setTimeout(function(){ sfx(990, 0.16, 'square', 0.06); }, 100);
      updateHUD();
      pulseHUD(hudLevelBox);
      saveStoreDebounced();
      checkAch();
    }

    var spawnInterval = Math.max(19, 56 - level * 4.2);
    spawnTimer += dt;
    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0;
      spawnItem();
      if (level > 4 && Math.random() < 0.22) spawnItem();
    }

    if (Math.random() < 0.003 * dt) spawnShooter();
    for (var i = shooters.length - 1; i >= 0; i--) {
      var sh = shooters[i];
      sh.x += sh.vx * dt;
      sh.y += sh.vy * dt;
      sh.life -= sh.decay * dt;
      if (sh.life <= 0 || sh.x < -100 || sh.x > W + 100 || sh.y > H + 100) shooters.splice(i, 1);
    }

    var py = player.y;
    for (var j = items.length - 1; j >= 0; j--) {
      var it = items[j];
      it.y += it.vy * dt;
      it.x += it.vx * dt;
      it.rot += it.rotSpd * dt;
      it.pulse += 0.14 * dt;
      if (it.x < it.r || it.x > W - it.r) it.vx *= -1;
      var ddx = Math.abs(it.x - player.x);
      var ddy = Math.abs(it.y - py);
      var hit = ddx < player.w / 2 + it.r * 0.55 && ddy < player.h / 2 + it.r * 0.75;
      if (hit) {
        items.splice(j, 1);
        handleCatch(it);
        if (!running) return;
        continue;
      }
      if (it.y > H + 50) {
        items.splice(j, 1);
        if (it.good && combo > 0) {
          combo = 0;
          comboEl.classList.remove('show');
          comboBar.classList.remove('show');
        }
      }
    }

    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 0.14 * dt;
      pt.vx *= Math.pow(0.985, dt);
      pt.life -= pt.decay * dt;
      if (pt.life <= 0) particles.splice(p, 1);
    }

    for (var f = floats.length - 1; f >= 0; f--) {
      var fl = floats[f];
      fl.y += fl.vy * dt;
      fl.vy *= Math.pow(0.97, dt);
      fl.life -= 0.017 * dt;
      if (fl.life <= 0) floats.splice(f, 1);
    }

    for (var L = 0; L < 3; L++) {
      var layer = starLayers[L];
      for (var s = 0; s < layer.length; s++) {
        var st = layer[s];
        st.tw += st.sp * dt;
        st.y += st.drift * dt;
        if (st.y > H + 4) { st.y = -4; st.x = Math.random() * W; }
      }
    }

    for (var pn = 0; pn < petals.length; pn++) {
      var pet = petals[pn];
      pet.y += pet.vy * dt;
      pet.sway += pet.swaySpeed * dt;
      pet.x = pet.baseX + Math.sin(pet.sway) * pet.swayAmp;
      pet.x += pet.drift * dt;
      pet.rot += pet.rotSpd * dt;
      if (pet.y > H + 20) {
        pet.y = -20;
        pet.baseX = Math.random() * W;
        pet.x = pet.baseX;
        pet.sway = Math.random() * Math.PI * 2;
      }
      if (pet.x < -30) { pet.baseX = W + 20; pet.x = pet.baseX; }
      if (pet.x > W + 30) { pet.baseX = -20; pet.x = pet.baseX; }
    }
  }

  // =================== RENDER ===================
  function roundRect(c, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + rr, y);
    c.arcTo(x + w, y, x + w, y + h, rr);
    c.arcTo(x + w, y + h, x, y + h, rr);
    c.arcTo(x, y + h, x, y, rr);
    c.arcTo(x, y, x + w, y, rr);
    c.closePath();
  }

  function drawGrid() {
    var horizonY = H * 0.74;
    var vanishX = W / 2;
    ctx.save();
    for (var i = 0; i < 14; i++) {
      var t = (i + (time * 0.008) % 1) / 14;
      var y = horizonY + Math.pow(t, 2.2) * (H - horizonY);
      ctx.globalAlpha = (1 - t) * 0.25;
      ctx.strokeStyle = '#ff6eb4';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    for (var v = 0; v <= 11; v++) {
      var xAtBottom = (v / 11 - 0.5) * W * 2.4 + W / 2;
      var t2 = 1 - Math.abs(v / 11 - 0.5) * 2;
      ctx.globalAlpha = t2 * 0.25;
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(vanishX, horizonY); ctx.lineTo(xAtBottom, H); ctx.stroke();
    }
    ctx.restore();
  }

  function drawAuroraWaves() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var colors = [['#ff6eb4', 0.12], ['#a855f7', 0.09], ['#00f0ff', 0.08]];
    for (var c = 0; c < colors.length; c++) {
      var col = colors[c][0];
      var alpha = colors[c][1];
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      for (var x = -10; x <= W + 10; x += 16) {
        var y = 50 + c * 32 + Math.sin(x * 0.008 + time * 0.02 + c * 2) * 26 + Math.sin(x * 0.018 + time * 0.035 + c) * 14;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W + 10, 0);
      ctx.closePath();
      var g = ctx.createLinearGradient(0, 0, 0, 180);
      g.addColorStop(0, hexA(col, alpha));
      g.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = g;
      ctx.fill();
    }
    ctx.restore();
  }

  function drawPetalShape(c, x, y, size, rot, fill) {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.fillStyle = fill;
    c.beginPath();
    c.moveTo(0, -size);
    c.bezierCurveTo(size * 0.85, -size * 0.5, size * 0.7, size * 0.4, 0, size);
    c.bezierCurveTo(-size * 0.7, size * 0.4, -size * 0.85, -size * 0.5, 0, -size);
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.5)';
    c.beginPath();
    c.ellipse(0, 0, size * 0.16, size * 0.45, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  function getThemeGradient(ph) {
    var t = activeTheme;
    if (!t) t = THEMES.crystal;
    if (t.stops === null) {
      var g = ctx.createLinearGradient(0, -ph/2, 0, ph/2);
      var hueBase = (time * 2) % 360;
      for (var i = 0; i <= 6; i++) {
        var p = i / 6;
        var h = (hueBase + p * 360) % 360;
        g.addColorStop(p, 'hsl(' + h + ',95%,62%)');
      }
      return g;
    }
    var g2 = ctx.createLinearGradient(0, -ph/2, 0, ph/2);
    for (var j = 0; j < t.stops.length; j++) {
      g2.addColorStop(t.stops[j][0], t.stops[j][1]);
    }
    return g2;
  }

  function drawThemePattern(pw, ph, theme) {
    var id = theme.id;
    if (id === 'crystal') {
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      for (var i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 14, -ph/2);
        ctx.lineTo(i * 14 + 10, ph/2);
        ctx.stroke();
      }
    } else if (id === 'spiderman') {
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.2;
      for (var s = 0; s < 10; s++) {
        var ang = (s / 10) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ang) * pw * 1.2, Math.sin(ang) * ph * 1.2);
        ctx.stroke();
      }
      for (var r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, (pw/2) * (r / 3.5), (ph/2) * (r / 3.5), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (id === 'batman') {
      var bg = ctx.createRadialGradient(0, 0, 0, 0, 0, pw * 0.6);
      bg.addColorStop(0, 'rgba(255,220,0,0.9)');
      bg.addColorStop(0.5, 'rgba(255,200,0,0.4)');
      bg.addColorStop(1, 'rgba(255,200,0,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(-pw/2, -ph/2, pw, ph);
    } else if (id === 'superman') {
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(0, -ph/2 + 3);
      ctx.lineTo(pw * 0.35, 0);
      ctx.lineTo(0, ph/2 - 3);
      ctx.lineTo(-pw * 0.35, 0);
      ctx.closePath(); ctx.fill();
    } else if (id === 'captain') {
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = '#ffffff';
      var spikes = 5, outer = 11, inner = 4.5;
      ctx.beginPath();
      for (var k = 0; k < spikes * 2; k++) {
        var rr = (k % 2 === 0) ? outer : inner;
        var a = (k * Math.PI) / spikes - Math.PI / 2;
        if (k === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
        else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath(); ctx.fill();
    } else if (id === 'hulk') {
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = '#c8ff90';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-pw/2 + 5, -ph/2 + 4);
      ctx.lineTo(-pw/2 + 22, -1);
      ctx.lineTo(-pw/2 + 10, ph/2 - 4);
      ctx.stroke();
    } else if (id === 'ironman') {
      var pulse = 0.7 + Math.sin(time * 0.18) * 0.3;
      var rg = ctx.createRadialGradient(0, 0, 0, 0, 0, 16);
      rg.addColorStop(0, 'rgba(255,255,255,' + (0.98 * pulse) + ')');
      rg.addColorStop(0.4, 'rgba(140,210,255,' + (0.85 * pulse) + ')');
      rg.addColorStop(1, 'rgba(0,150,255,0)');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
    } else if (id === 'joker') {
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-pw/2, 0);
      for (var x = -pw/2; x < pw/2; x += 8) ctx.lineTo(x, Math.sin(x * 0.4) * 4);
      ctx.stroke();
    } else if (id === 'thanos') {
      ctx.globalAlpha = 0.95;
      var stones = ['#7b00ff', '#0066ff', '#ff0000', '#ff8800', '#00ff00', '#ffff00'];
      for (var si = 0; si < 6; si++) {
        ctx.fillStyle = stones[si];
        ctx.shadowColor = stones[si];
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(-28 + si * 11.2, -ph/2 + 8, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    } else if (id === 'sakura') {
      ctx.globalAlpha = 0.85;
      var positions = [[-pw*0.32, -ph*0.18, 5, 0.4], [-pw*0.15, ph*0.05, 4, -0.3], [pw*0.05, -ph*0.22, 5.5, 0.7], [pw*0.22, ph*0.12, 4.5, -0.5], [pw*0.34, -ph*0.1, 4, 0.2]];
      for (var sp2 = 0; sp2 < positions.length; sp2++) {
        var pp = positions[sp2];
        drawPetalShape(ctx, pp[0], pp[1], pp[2], pp[3] + time * 0.02, 'rgba(255,200,230,0.95)');
      }
    } else if (id === 'gold') {
      ctx.globalAlpha = 0.75;
      var shinePos = (time * 1.5) % (pw + 40) - pw/2 - 20;
      var sg = ctx.createLinearGradient(shinePos - 18, 0, shinePos + 18, 0);
      sg.addColorStop(0, 'rgba(255,255,255,0)');
      sg.addColorStop(0.5, 'rgba(255,255,255,0.95)');
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(-pw/2, -ph/2, pw, ph);
    } else if (id === 'rainbow') {
      ctx.globalAlpha = 0.9;
      for (var sp3 = 0; sp3 < 10; sp3++) {
        var spx = Math.sin(time * 0.05 + sp3 * 1.7) * (pw/2 - 6);
        var spy = Math.cos(time * 0.06 + sp3 * 2.3) * (ph/2 - 4);
        var sz = 1 + Math.sin(time * 0.15 + sp3) * 0.6;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(spx, spy, sz + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
  }

  function drawPlayer() {
    var pw = player.w, ph = player.h;
    var sx = 1 + (squish - 1) * 0.55;
    var sy = 1 - (squish - 1) * 0.5;
    var theme = activeTheme || THEMES.crystal;

    for (var t = 0; t < playerTrail.length; t++) {
      var tr = playerTrail[t];
      ctx.globalAlpha = tr.life * 0.32;
      ctx.fillStyle = theme.glow1;
      roundRect(ctx, tr.x - pw/2, tr.y - ph/2, pw, ph, ph/2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.globalCompositeOperation = 'lighter';
    var gs = 260;
    ctx.globalAlpha = 0.8 + Math.sin(time * 0.1) * 0.1;
    ctx.drawImage(PLAYER_GLOW, player.x - gs/2, player.y - gs/2, gs, gs);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(sx, sy);

    ctx.shadowColor = theme.glow1;
    ctx.shadowBlur = 24;
    ctx.fillStyle = getThemeGradient(ph);
    roundRect(ctx, -pw/2, -ph/2, pw, ph, ph/2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.save();
    roundRect(ctx, -pw/2, -ph/2, pw, ph, ph/2);
    ctx.clip();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#000000';
    ctx.fillRect(-pw/2, -ph/2, pw, ph);
    ctx.globalAlpha = 1;
    drawThemePattern(pw, ph, theme);
    var hl = ctx.createLinearGradient(0, -ph/2, 0, -ph/2 + 14);
    hl.addColorStop(0, 'rgba(255,255,255,0.75)');
    hl.addColorStop(0.5, 'rgba(255,255,255,0.18)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hl;
    ctx.fillRect(-pw/2, -ph/2, pw, 14);
    var bl = ctx.createLinearGradient(0, ph/2 - 12, 0, ph/2);
    bl.addColorStop(0, 'rgba(0,0,0,0)');
    bl.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = bl;
    ctx.fillRect(-pw/2, ph/2 - 12, pw, 12);
    ctx.restore();

    ctx.globalAlpha = 1;
    ctx.font = '24px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 1;
    ctx.fillText(theme.emoji, 0, 1);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = 1.8;
    roundRect(ctx, -pw/2, -ph/2, pw, ph, ph/2);
    ctx.stroke();

    var shineX = ((time * 1.4) % (pw + 80)) - 40 - pw / 2;
    var shg = ctx.createLinearGradient(shineX - 18, 0, shineX + 18, 0);
    shg.addColorStop(0, 'rgba(255,255,255,0)');
    shg.addColorStop(0.5, 'rgba(255,255,255,0.75)');
    shg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shg;
    ctx.globalCompositeOperation = 'lighter';
    roundRect(ctx, -pw/2 + 2, -ph/2 + 2, pw - 4, ph - 4, ph/2 - 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();

    var orbitR = pw * 0.7;
    for (var k = 0; k < 2; k++) {
      var ang = time * 0.06 + k * Math.PI;
      var ox = player.x + Math.cos(ang) * orbitR * 0.9;
      var oy = player.y + Math.sin(ang) * 4;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      var orbGlow = ctx.createRadialGradient(ox, oy, 0, ox, oy, 12);
      orbGlow.addColorStop(0, 'rgba(255,255,255,0.95)');
      orbGlow.addColorStop(0.35, hexA(theme.glow1, 0.8));
      orbGlow.addColorStop(1, hexA(theme.glow1, 0));
      ctx.fillStyle = orbGlow;
      ctx.beginPath(); ctx.arc(ox, oy, 12, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function render() {
    ctx.save();
    if (running && shake > 0.4) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(-40, -40, W + 80, H + 80);
    drawAuroraWaves();
    drawGrid();

    for (var L = 0; L < 3; L++) {
      var layer = starLayers[L];
      for (var s = 0; s < layer.length; s++) {
        var st = layer[s];
        var a = st.a + Math.sin(st.tw) * 0.3;
        if (a < 0.03) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = st.c;
        var rr = st.r;
        ctx.fillRect(st.x - rr, st.y - rr, rr * 2, rr * 2);
      }
    }
    ctx.globalAlpha = 1;

    for (var pn = 0; pn < petals.length; pn++) {
      var pet = petals[pn];
      var col;
      if (pet.hue === 'pink') col = 'rgba(255,179,217,' + pet.alpha + ')';
      else if (pet.hue === 'cyan') col = 'rgba(0,240,255,' + (pet.alpha * 0.85) + ')';
      else col = 'rgba(255,230,240,' + pet.alpha + ')';
      drawPetalShape(ctx, pet.x, pet.y, pet.size, pet.rot, col);
    }

    for (var si = 0; si < shooters.length; si++) {
      var sh = shooters[si];
      var norm = Math.sqrt(sh.vx * sh.vx + sh.vy * sh.vy) || 1;
      var ux = sh.vx / norm, uy = sh.vy / norm;
      var g2 = ctx.createLinearGradient(sh.x, sh.y, sh.x - ux * sh.len, sh.y - uy * sh.len);
      g2.addColorStop(0, 'rgba(255,200,230,' + (sh.life * 0.95) + ')');
      g2.addColorStop(1, 'rgba(255,200,230,0)');
      ctx.strokeStyle = g2;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(sh.x - ux * sh.len, sh.y - uy * sh.len);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'lighter';
    for (var p = 0; p < particles.length; p++) {
      var pt = particles[p];
      var life = pt.life;
      if (life <= 0) continue;
      ctx.globalAlpha = life;
      ctx.fillStyle = pt.color;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * life, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var k2 = 0; k2 < items.length; k2++) {
      var it = items[k2];
      ctx.globalCompositeOperation = 'lighter';
      var glowSize = it.r * 3.8 + Math.sin(it.pulse) * 6;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(it.glow, it.x - glowSize/2, it.y - glowSize/2, glowSize, glowSize);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      if (it.type === 'gem' || it.type === 'bomb') {
        ctx.save();
        ctx.translate(it.x, it.y);
        ctx.rotate(it.rot * 1.4);
        ctx.strokeStyle = it.c1;
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath(); ctx.arc(0, 0, it.r + 7, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(Math.sin(it.pulse * 0.6) * 0.15);
      ctx.font = (it.r * 2) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
      ctx.fillText(it.emoji, 0, 1);
      ctx.restore();
    }

    drawPlayer();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var f = 0; f < floats.length; f++) {
      var fl = floats[f];
      var fa = Math.max(0, Math.min(1, fl.life * 1.4));
      if (fa < 0.02) continue;
      ctx.globalAlpha = fa;
      ctx.font = '800 ' + Math.round(17 + (1 - fl.life) * 8) + 'px -apple-system, "SF Pro Display", "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = fl.color;
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 3;
      ctx.strokeText(fl.text, fl.x, fl.y);
      ctx.fillText(fl.text, fl.x, fl.y);
    }
    ctx.globalAlpha = 1;

    ctx.drawImage(VIGNETTE, 0, 0);

    if (running && screenFlash > 0.01) {
      ctx.globalAlpha = screenFlash * 0.35;
      ctx.fillStyle = flashColor;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function loop(t) {
    if (!lastTime) lastTime = t;
    var dt = (t - lastTime) / 16.667;
    if (!isFinite(dt) || dt <= 0) dt = 1;
    if (dt > 3) dt = 3;
    lastTime = t;
    if (running) {
      try { update(dt); tickPlaytime(); }
      catch (err) { console.error('[SC] update err:', err); }
    }
    try { render(); }
    catch (err) { console.error('[SC] render err:', err); }
    requestAnimationFrame(loop);
  }

  // =================== INPUT ===================
  function setPointer(clientX) {
    var rect = canvas.getBoundingClientRect();
    player.pointerActive = true;
    player.targetX = Math.max(player.w / 2, Math.min(W - player.w / 2, clientX - rect.left));
  }
  canvas.addEventListener('pointermove', function(e){ setPointer(e.clientX); }, { passive: true });
  canvas.addEventListener('pointerdown', function(e){ setPointer(e.clientX); }, { passive: true });
  canvas.addEventListener('touchmove', function(e){
    if (e.touches.length) setPointer(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('keydown', function(e){
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { keys.left = true; player.pointerActive = false; }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keys.right = true; player.pointerActive = false; }
    if (e.key === ' ' && !running && currentScreen() === 'menu') { e.preventDefault(); startGame(); }
  });
  window.addEventListener('keyup', function(e){
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
  });

  // =================== START ===================
  function ensureAudio() {
    if (!actx) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) actx = new AC();
      } catch(err){}
    }
    if (actx && actx.state === 'suspended') {
      try { actx.resume(); } catch(e){}
    }
  }

  function startGame() {
    try {
      ensureAudio();
      if (running) endSession();
      resize();
      resetGame();
      showScreen(null);
      running = true;
      lastTime = 0;
      startSession();
      sfx(523, 0.09, 'sine', 0.07);
      setTimeout(function(){ sfx(784, 0.14, 'sine', 0.07); }, 90);
    } catch (err) { console.error('[SC] startGame err:', err); }
  }

  function bindBtn(id, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); ensureAudio(); fn(); });
    el.addEventListener('pointerdown', function(e){ e.stopPropagation(); });
  }

  bindBtn('btnPlay', startGame);
  bindBtn('btnPlayAgain', startGame);
  bindBtn('btnShop', function(){ renderShop(); showScreen('shop'); });
  bindBtn('btnAch', function(){ renderAchFull(); showScreen('ach'); });
  bindBtn('btnStats', function(){ renderStats(); showScreen('stats'); });
  bindBtn('btnHow', function(){ showScreen('how'); });
  bindBtn('btnMenu', goMenu);
  bindBtn('btnBackShop', goMenu);
  bindBtn('btnBackAch', goMenu);
  bindBtn('btnBackStats', goMenu);
  bindBtn('btnBackHow', goMenu);

  // =================== PROFILE UI ===================
  function updateProfileUI() {
    var profiles = getProfiles();
    var activeId = getActiveProfileId();
    var active = profiles[activeId];
    if (active && currentPlayerNameEl) {
      var emoji = active.emoji || '😎';
      currentPlayerNameEl.textContent = emoji + ' ' + active.name;
    } else if (currentPlayerNameEl) {
      currentPlayerNameEl.textContent = 'Player';
    }
  }

  function renderProfileList() {
    profileListEl.innerHTML = '';
    var profiles = getProfiles();
    var activeId = getActiveProfileId();
    var keys = Object.keys(profiles);

    if (keys.length === 0) {
      profileListEl.innerHTML = '<div class="profile-empty">Koi player nahi hai<br>Naya player banao!</div>';
      return;
    }

    keys.forEach(function(id) {
      var p = profiles[id];
      var isActive = id === activeId;
      var profileStore = null;
      try {
        var raw = localStorage.getItem(STORE_KEY + '_' + id);
        if (raw) profileStore = JSON.parse(raw);
      } catch(e) {}

      var best = profileStore ? (profileStore.best || 0) : 0;
      var diamonds = profileStore ? (profileStore.diamonds || 0) : 0;
      var games = profileStore ? (profileStore.totalGames || 0) : 0;

      var row = document.createElement('div');
      row.className = 'profile-row' + (isActive ? ' active' : '');
      row.innerHTML =
        '<div class="profile-avatar">' + (p.emoji || '😎') + '</div>' +
        '<div class="profile-info">' +
          '<div class="profile-name">' + p.name + (isActive ? ' <span class="profile-check">✓</span>' : '') + '</div>' +
          '<div class="profile-stats">' +
            '<span>🏆 ' + best.toLocaleString() + '</span>' +
            '<span>💎 ' + diamonds.toLocaleString() + '</span>' +
            '<span>🎮 ' + games + '</span>' +
          '</div>' +
        '</div>' +
        (keys.length > 1 ? '<button class="profile-delete" data-id="' + id + '" type="button">×</button>' : '');

      row.addEventListener('click', function(e) {
        if (e.target.classList.contains('profile-delete')) return;
        if (id === activeId) { goMenu(); return; }
        switchProfile(id);
        showToast('Switched to ' + p.name, p.emoji || '👤', 'success');
        goMenu();
      });

      var delBtn = row.querySelector('.profile-delete');
      if (delBtn) {
        delBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (confirm('Delete "' + p.name + '" profile? Ye permanently delete ho jaayega.')) {
            deleteProfile(id);
            renderProfileList();
            updateProfileUI();
            showToast('Profile deleted', '🗑️', 'error');
          }
        });
      }

      profileListEl.appendChild(row);
    });
  }

  function createNewProfile() {
    var val = (newProfileInput && newProfileInput.value || '').trim().slice(0, 15);
    if (!val) { showToast('Naam daalo', '⚠️', 'error'); return; }

    var profiles = getProfiles();
    for (var id in profiles) {
      if (profiles[id].name.toLowerCase() === val.toLowerCase()) {
        showToast('Ye naam already exists', '⚠️', 'error');
        return;
      }
    }

    var newId = createProfile(val);
    switchProfile(newId);
    showToast('Welcome, ' + val + '!', '👋', 'success');
    if (newProfileInput) newProfileInput.value = '';
    goMenu();
  }

  bindBtn('btnProfile', function() {
    renderProfileList();
    showScreen('profiles');
  });
  bindBtn('btnNewProfile', function() {
    if (newProfileInput) newProfileInput.value = '';
    showScreen('newProfile');
    setTimeout(function(){ if (newProfileInput) newProfileInput.focus(); }, 200);
  });
  bindBtn('btnBackProfiles', goMenu);
  bindBtn('btnCreateProfile', createNewProfile);
  bindBtn('btnCancelProfile', function() {
    renderProfileList();
    showScreen('profiles');
  });

  if (newProfileInput) {
    newProfileInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); createNewProfile(); }
      e.stopPropagation();
    });
  }

  // =================== PERSISTENCE ===================
  var lastUnloadSave = 0;
  function finalSave() {
    var now = Date.now();
    if (now - lastUnloadSave < 300) return;
    lastUnloadSave = now;
    if (running && sessionStart) endSession();
    else saveStore(false);
  }
  window.addEventListener('beforeunload', finalSave);
  window.addEventListener('pagehide', finalSave);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (running) tickPlaytime();
      saveStore(false);
    } else {
      if (running && sessionStart) lastPlaytimeTick = Date.now();
      lastTime = 0;
    }
  });
  window.addEventListener('blur', function () {
    if (running) tickPlaytime();
    saveStore(false);
  });
  setInterval(function () {
    if (running && sessionStart) {
      tickPlaytime();
      saveStore(false);
    }
  }, 10000);

  // =================== INIT ===================
  try {
    loadStore();
    buildSprites();
    resize();
    player.x = W / 2;
    player.y = H - 80;
    player.targetX = W / 2;
    player.lastX = W / 2;
    updateHUD();
    updateDiamondUI();
    updateProfileUI();
    bestLine.textContent = 'Best: ' + store.best.toLocaleString();
    renderAchFull();
    renderStats();
    renderShop();
    showScreen('menu');
    requestAnimationFrame(loop);
    console.log('[StarCatcher] v' + VERSION + ' · Sakura Multi-Profile · Device: ' + deviceType);
    console.log('[StarCatcher] Profiles:', getProfiles());
    console.log('[StarCatcher] Active store:', store);
  } catch (err) {
    console.error('[SC] init err:', err);
  }

  var resizeTimeout = null;
  window.addEventListener('resize', function () {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function(){ resize(); }, 120);
  });
  window.addEventListener('orientationchange', function () {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function(){ resize(); }, 250);
  });
});
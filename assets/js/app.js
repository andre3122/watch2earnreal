/* Watch2EarnReall Client – Telegram Mini App */
(() => {
  const tg = window.Telegram?.WebApp;
  tg?.ready?.();
  try { tg?.expand?.(); } catch (_) {}

  const state = {
    user: tg?.initDataUnsafe?.user || null,
    balance: 0.00,
    streak: 0,
    lastCheckin: null,
    address: localStorage.getItem("bsc_address") || "",
    refCount: 0,
    refBonus: 0,
    tasks: {
      ad1: { completed: false, reward: 0.02 },
      ad2: { completed: false, reward: 0.02 },
    }
  };

  const els = {
    screens: {
      home: document.getElementById("screen-home"),
      task: document.getElementById("screen-task"),
      referral: document.getElementById("screen-referral"),
      profile: document.getElementById("screen-profile"),
    },
    tabs: document.querySelectorAll(".tabbar .tab"),
    balance: document.getElementById("balance"),
    streakInfo: document.getElementById("streakInfo"),
    checkinGrid: document.getElementById("checkinGrid"),
    btnCheckin: document.getElementById("btnCheckin"),
    refLink: document.getElementById("refLink"),
    btnCopyRef: document.getElementById("btnCopyRef"),
    btnShareRef: document.getElementById("btnShareRef"),
    refCount: document.getElementById("refCount"),
    refBonus: document.getElementById("refBonus"),
    refList: document.getElementById("refList"),
    profileAvatar: document.getElementById("profileAvatar"),
    profileName: document.getElementById("profileName"),
    profileUsername: document.getElementById("profileUsername"),
    withdrawForm: document.getElementById("withdrawForm"),
    withdrawAmount: document.getElementById("withdrawAmount"),
    addressForm: document.getElementById("addressForm"),
    bscAddress: document.getElementById("bscAddress"),
    modalBackdrop: document.getElementById("modalBackdrop"),
    modalTitle: document.getElementById("modalTitle"),
    modalMsg: document.getElementById("modalMsg"),
    modalCancel: document.getElementById("modalCancel"),
    modalOk: document.getElementById("modalOk"),
  };

  // Replace with your bot username to generate referral link
  const BOT_USERNAME = "YOUR_BOT_USERNAME"; // e.g., "watch2earnreall_bot"

  function money(n) { return `$${Number(n).toFixed(2)}`; }

  function setBalance(n) {
    state.balance = Number(n);
    els.balance.textContent = money(state.balance);
  }

  function loadPersisted() {
    const s = localStorage.getItem("checkin_state");
    if (s) {
      try {
        const j = JSON.parse(s);
        state.streak = j.streak || 0;
        state.lastCheckin = j.lastCheckin || null;
      } catch {}
    }
    if (state.address) {
      els.bscAddress.value = state.address;
    }
  }

  function saveCheckin() {
    localStorage.setItem("checkin_state", JSON.stringify({
      streak: state.streak,
      lastCheckin: state.lastCheckin
    }));
  }

  function todayStr() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth()+1).padStart(2,"0");
    const d = String(now.getDate()).padStart(2,"0");
    return `${y}-${m}-${d}`;
  }

  function canCheckinToday() {
    return state.lastCheckin !== todayStr();
  }

  function renderCheckinGrid() {
    // rotate color starting angle to look flashy
    els.checkinGrid.querySelectorAll("li").forEach((li, idx) => {
      li.style.setProperty("--start", `${idx*40}deg`);
      const day = Number(li.dataset.day);
      li.classList.toggle("active", day <= state.streak);
      li.classList.toggle("checked", day <= state.streak);
    });
    els.streakInfo.innerHTML = `Streak: <strong>${state.streak}</strong> hari`;
    if (!canCheckinToday()) {
      els.btnCheckin.disabled = true;
      els.btnCheckin.textContent = "Sudah Check‑in";
    } else {
      els.btnCheckin.disabled = false;
      els.btnCheckin.textContent = "Check‑in Hari Ini";
    }
  }

  async function handleCheckin() {
    if (!canCheckinToday()) return;
    // Optional: call your server to record check-in
    // await fetch("/api/checkin", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ user_id: state.user?.id }) });
    state.lastCheckin = todayStr();
    state.streak = Math.min(7, (state.streak || 0) + 1);
    saveCheckin();
    renderCheckinGrid();
    toast("Check‑in berhasil! Streak +" + state.streak);
  }

  function setScreen(name) {
    Object.entries(els.screens).forEach(([key, el]) => el.classList.toggle("active", key === name));
    els.tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.target === name));
  }

  function initTabs() {
    els.tabs.forEach(tab => {
      tab.addEventListener("click", () => setScreen(tab.dataset.target));
    });
  }

  function setProfile() {
    const u = state.user;
    const name = u ? [u.first_name, u.last_name].filter(Boolean).join(" ") : "Guest";
    const username = u?.username ? `@${u.username}` : (u ? `id:${u.id}` : "@guest");
    els.profileName.textContent = name;
    els.profileUsername.textContent = username;

    const photo = u?.photo_url;
    if (photo) {
      const img = new Image();
      img.src = photo;
      img.alt = "Avatar";
      els.profileAvatar.innerHTML = "";
      els.profileAvatar.appendChild(img);
    } else {
      // show initials
      const initials = name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
      els.profileAvatar.innerHTML = `<div style="display:grid;place-items:center;width:100%;height:100%;color:#fff;font-weight:800;">${initials}</div>`;
    }
  }

  function setReferral() {
    const id = state.user?.id || "guest";
    const startParam = `ref_${id}`;
    const link = `https://t.me/${BOT_USERNAME}?start=${startParam}`;
    els.refLink.value = link;
  }

  function copy(text) {
    try {
      navigator.clipboard.writeText(text);
      toast("Copied!");
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("Copied!");
    }
  }

  function initReferralButtons() {
    els.btnCopyRef.addEventListener("click", () => copy(els.refLink.value));
    els.btnShareRef.addEventListener("click", () => {
      const url = els.refLink.value;
      const text = "Join Watch2EarnReall dan dapatkan reward nonton iklan!";
      if (navigator.share) {
        navigator.share({ title:"Watch2EarnReall", text, url }).catch(()=>{});
      } else {
        copy(url);
      }
    });
  }

  function toast(msg) {
    if (tg?.showPopup) {
      tg.showPopup({ title:"Info", message: msg, buttons:[{id:"ok", type:"default", text:"OK"}] });
    } else {
      console.log("[Toast]", msg);
    }
  }

  function showModal({ title, message, onOk, onCancel }) {
    els.modalTitle.textContent = title || "Konfirmasi";
    els.modalMsg.textContent = message || "";
    els.modalBackdrop.hidden = false;
    const ok = () => { cleanup(); onOk && onOk(); };
    const cancel = () => { cleanup(); onCancel && onCancel(); };
    const cleanup = () => {
      els.modalBackdrop.hidden = true;
      els.modalOk.removeEventListener("click", ok);
      els.modalCancel.removeEventListener("click", cancel);
    };
    els.modalOk.addEventListener("click", ok);
    els.modalCancel.addEventListener("click", cancel);
  }

  // Monetag integration (placeholder)
  const MONETAG_FN = "show_YOUR_ZONE_ID"; // Replace to match your data-sdk
  function showMonetagAd() {
    // Try to call Monetag SDK function if available
    const fn = window[MONETAG_FN];
    try { if (typeof fn === "function") fn(); } catch (_) {}
    // Fallback modal to confirm completion if SDK doesn't offer callbacks
    return new Promise((resolve) => {
      showModal({
        title: "Iklan",
        message: "Tonton iklan sampai selesai lalu tekan Selesai. Sistem akan verifikasi reward dari server.",
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }

  async function completeTask(taskId) {
    // Call your backend to validate completion and credit
    // Replace URL below with your server endpoint
    const payload = {
      user_id: state.user?.id,
      task_id: taskId,
      // include Monetag proof if you have a postback/token
    };
    try {
      // Example POST (replace with actual):
      // const res = await fetch("https://your-server.example/reward/complete", {
      //   method: "POST", headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload)
      // });
      // const data = await res.json();
      // const credited = data?.credited;
      const credited = true; // demo fallback
      if (credited) {
        state.tasks[taskId].completed = true;
        setBalance(state.balance + state.tasks[taskId].reward);
        document.querySelector(`[data-task-id="${taskId}"] [data-action="watch"]`).disabled = true;
        toast("Reward ditambahkan!");
      } else {
        toast("Verifikasi gagal. Coba lagi.");
      }
    } catch (e) {
      console.error(e);
      toast("Gagal menghubungkan server.");
    }
  }

  function initTasks() {
    document.querySelectorAll(".task-card .btn-cta[data-action='watch']").forEach(btn => {
      btn.addEventListener("click", async () => {
        const taskCard = btn.closest(".task-card");
        const taskId = taskCard.dataset.taskId;
        if (state.tasks[taskId]?.completed) return;
        const watched = await showMonetagAd();
        if (watched) {
          await completeTask(taskId);
        }
      });
    });
  }

  function initWithdrawForm() {
    els.withdrawForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const amount = Number(els.withdrawAmount.value);
      if (isNaN(amount) || amount < 1) {
        toast("Minimum withdraw 1$");
        return;
      }
      if (!state.address) {
        toast("Isi alamat BEP20 dulu.");
        return;
      }
      try {
        // const res = await fetch("https://your-server.example/withdraw", {
        //   method:"POST", headers:{ "Content-Type":"application/json" },
        //   body: JSON.stringify({ user_id: state.user?.id, amount, address: state.address })
        // });
        // const data = await res.json();
        // if (data?.ok) toast("Permintaan withdraw dikirim.");
        toast("Permintaan withdraw dikirim (demo).");
        els.withdrawAmount.value = "";
      } catch {
        toast("Gagal mengirim withdraw.");
      }
    });
  }

  function initAddressForm() {
    els.addressForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const addr = (els.bscAddress.value || "").trim();
      if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
        toast("Alamat BEP20 tidak valid.");
        return;
      }
      state.address = addr;
      localStorage.setItem("bsc_address", addr);
      toast("Alamat disimpan.");
    });
  }

  function populateDemoReferrals() {
    // Replace with your server data
    els.refCount.textContent = state.refCount;
    els.refBonus.textContent = money(state.refBonus);
    els.refList.innerHTML = "";
    // demo placeholder list
    // state.refCount > 0 ? render real list
  }

  function init() {
    loadPersisted();
    setProfile();
    setReferral();
    setBalance(state.balance);
    renderCheckinGrid();
    initTabs();
    initReferralButtons();
    initTasks();
    initWithdrawForm();
    initAddressForm();

    els.btnCheckin.addEventListener("click", handleCheckin);
    populateDemoReferrals();

    // Optional: theme sync with Telegram
    document.body.dataset.tg = tg?.colorScheme || "light";
  }

  init();
})();

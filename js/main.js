(() => {
  const D = window.DUMB;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const hasGsap = !!window.gsap;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.body.classList.add("is-loading");
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- toast ---------- */
  const toastEl = $("#toast");
  let toastT;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-on"), 2600);
  };
  window.dumbToast = toast;

  /* ---------- time in surat ---------- */
  const istNow = () => {
    const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
      .formatToParts(new Date()).reduce((o, x) => (o[x.type] = x.value, o), {});
    return (+p.hour % 24) * 3600 + +p.minute * 60 + +p.second;
  };
  const pad = (n) => String(n).padStart(2, "0");

  const statusEl = $("#status");
  const cd = $("#countdown");
  const dropState = $("#dropState");
  const { open, close, molten } = D.hours;

  function tick() {
    const s = istNow();
    const isOpen = s >= open * 3600 && s < close * 3600;
    statusEl.classList.toggle("is-open", isOpen);
    statusEl.classList.toggle("is-closed", !isOpen);
    statusEl.lastElementChild.textContent = isOpen ? "open rn" : "napping · back 2pm";

    let target, label, live = false;
    if (s >= molten * 3600 && s < close * 3600) {
      target = close * 3600; label = "it's live. RUN."; live = true;
    } else {
      target = molten * 3600; label = isOpen ? "molten drops in" : "we're asleep. molten drops in";
    }
    let diff = target - s;
    if (diff < 0) diff += 86400;
    dropState.textContent = label;
    cd.classList.toggle("is-live", live);
    $("[data-h]", cd).textContent = pad(Math.floor(diff / 3600));
    $("[data-m]", cd).textContent = pad(Math.floor(diff / 60) % 60);
    $("[data-s]", cd).textContent = pad(diff % 60);
    if (live) cd.setAttribute("aria-label", "time left before closing");
  }
  tick();
  setInterval(tick, 1000);

  $("#checkDate").textContent = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date());

  /* ---------- menu ---------- */
  const tabsEl = $("#tabs");
  const itemsEl = $("#items");
  const cats = Object.keys(D.menu);
  tabsEl.innerHTML = cats.map((c, i) =>
    `<button role="tab" aria-selected="${i === 2}" data-cat="${c}">${c}</button>`).join("");

  function renderMenu(cat, animate = true) {
    itemsEl.innerHTML = D.menu[cat].map((it) => `
      <li class="item">
        <span class="item__name">${it.name}</span>
        <span class="item__price">₹${it.price}</span>
        <p class="item__desc">${it.desc}</p>
        ${it.note ? `<span class="item__note">${it.note}</span>` : ""}
      </li>`).join("");
    if (animate && hasGsap && !reduced) {
      gsap.from($$(".item", itemsEl), { y: 18, opacity: 0, duration: .5, stagger: .05, ease: "back.out(1.8)" });
      gsap.from($$(".item__note", itemsEl), { scale: 0, rotate: -40, duration: .6, delay: .25, ease: "back.out(2.5)" });
    }
  }
  tabsEl.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $$("button", tabsEl).forEach((x) => x.setAttribute("aria-selected", x === b));
    renderMenu(b.dataset.cat);
  });
  renderMenu("cookie", false);

  /* ---------- slot machine ---------- */
  const reel = $("#reel");
  const allItems = cats.flatMap((c) => D.menu[c].map((i) => i.name));
  let spinning = false;
  function spin() {
    if (spinning) return;
    spinning = true;
    const pick = allItems[Math.floor(Math.random() * allItems.length)];
    const seq = Array.from({ length: 22 }, () => allItems[Math.floor(Math.random() * allItems.length)]);
    seq.push(pick);
    reel.innerHTML = seq.map((n) => `<li>${n}</li>`).join("");
    const h = reel.firstElementChild.offsetHeight;
    const done = () => {
      spinning = false;
      toast(`${pick}. ${D.decisions[Math.floor(Math.random() * D.decisions.length)]}`);
    };
    if (hasGsap && !reduced) {
      gsap.fromTo(reel, { y: 0 }, { y: -h * (seq.length - 1), duration: 2.4, ease: "power4.out", onComplete: done });
    } else {
      reel.style.transform = `translateY(${-h * (seq.length - 1)}px)`;
      done();
    }
  }
  $$("[data-decide]").forEach((b) => b.addEventListener("click", () => {
    if (b.closest(".hero")) {
      document.getElementById("decide").scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(spin, 900);
    } else spin();
  }));

  /* ---------- pack a dumb box ---------- */
  // how each cookie is drawn: [dough, chips, extra]
  const looks = {
    "Viral Molten Cookie": ["#2b1610", "#140804", "molten"],
    "Classic Choc Chunk": ["#c98a4b", "#3b1d10"],
    "Double Dark Cocoa": ["#3d2219", "#120604"],
    "Biscoff Stuffed": ["#b8742f", "#6e3b14"],
    "Red Velvet Cream Cheese": ["#a3202b", "#fff3e4"],
    "Nutella Lava": ["#8a5a34", "#3a1c0e"],
    "Matcha White Choc Cookie": ["#86a052", "#fff3e4"],
  };
  const boxable = [...D.menu.cookie, ...D.menu.matcha].filter((c) => looks[c.name]);
  const BOX_MAX = 4;
  const packed = [];
  const picker = $("#picker"), boxSlots = $("#boxSlots"), dbox = $("#dbox");
  const boxSay = $("#boxSay"), boxSend = $("#boxSend");
  const sayings = ["is that for me?", "ooh good start", "halfway to happy", "one more. do it.", "box packed. bestie-approved ✨"];
  const drawCookie = (c) => {
    const [base, chip, extra] = looks[c.name];
    return `<span class="ck${extra ? " ck--" + extra : ""}" style="--base:${base};--chip:${chip}"></span>`;
  };
  const shortName = (n) => n.replace(" Cookie", "").replace(" Cream Cheese", "");

  picker.innerHTML = boxable.map((c, i) => `
    <li><button class="pick" type="button" data-i="${i}" aria-label="add ${c.name}, ₹${c.price}">
      ${drawCookie(c)}<span class="pick__name">${shortName(c.name)}</span><span class="pick__price">₹${c.price}</span>
    </button></li>`).join("");

  function renderBox(justAdded) {
    boxSlots.innerHTML = Array.from({ length: BOX_MAX }, (_, i) => packed[i]
      ? `<button class="slot-c is-full" type="button" data-i="${i}" aria-label="take out ${packed[i].name}">${drawCookie(packed[i])}</button>`
      : `<span class="slot-c">+</span>`).join("");
    const full = packed.length === BOX_MAX;
    $("#boxCount").textContent = `${packed.length}/${BOX_MAX} cookies`;
    $("#boxTotal").textContent = "₹" + packed.reduce((t, c) => t + c.price, 0);
    boxSay.textContent = sayings[packed.length];
    boxSend.disabled = !packed.length;
    dbox.classList.toggle("is-full", full);
    $$(".pick", picker).forEach((b) => (b.disabled = full));
    if (justAdded != null && hasGsap && !reduced) {
      gsap.from(boxSlots.children[justAdded].firstElementChild, { y: -180, x: 60, rotation: 240, scale: .4, duration: .7, ease: "bounce.out" });
    }
    if (full && justAdded != null) {
      const r = dbox.getBoundingClientRect();
      setTimeout(() => crumbs(r.left + r.width / 2, r.top + r.height / 2, 18), 350);
      toast("box packed. go claim it 🍪");
    }
  }

  picker.addEventListener("click", (e) => {
    const b = e.target.closest(".pick");
    if (!b || packed.length >= BOX_MAX) return;
    packed.push(boxable[+b.dataset.i]);
    renderBox(packed.length - 1);
  });
  boxSlots.addEventListener("click", (e) => {
    const s = e.target.closest(".slot-c.is-full");
    if (!s) return;
    packed.splice(+s.dataset.i, 1);
    renderBox();
  });
  $("#boxRandom").addEventListener("click", () => {
    if (packed.length === BOX_MAX) packed.length = 0;
    const start = packed.length;
    while (packed.length < BOX_MAX) packed.push(boxable[Math.floor(Math.random() * boxable.length)]);
    renderBox();
    if (hasGsap && !reduced) {
      [...boxSlots.children].slice(start).forEach((s, k) =>
        gsap.from(s.firstElementChild, { y: -180, rotation: 240, scale: .4, duration: .7, delay: k * .12, ease: "bounce.out" }));
    }
    toast("the cookie gods have packed your box");
  });
  boxSend.addEventListener("click", async () => {
    const counts = packed.reduce((m, c) => (m.set(c, (m.get(c) || 0) + 1), m), new Map());
    const lines = [...counts].map(([c, n]) => `- ${n}x ${c.name} (₹${c.price * n})`);
    const total = packed.reduce((t, c) => t + c.price, 0);
    const msg = `hii DUMB! 🍪 i'd like a dumb box:\n${lines.join("\n")}\ntotal: ₹${total}\n(packed it on your website)`;
    let copied = false;
    try { await navigator.clipboard.writeText(msg); copied = true; } catch {}
    toast(copied ? "order copied! paste it in the DM 📋" : "screenshot your box & send it to us 📸");
    window.open("https://ig.me/m/getdumbbbb", "_blank", "noopener");
  });
  renderBox();

  /* ---------- gram ---------- */
  const k = (n) => n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : n;
  $("#gramGrid").innerHTML = D.gram.map((p) => `
    <a class="gpost" href="${p.url}" target="_blank" rel="noopener">
      <img src="${p.img}" alt="${p.cap}" loading="lazy" />
      <span class="gpost__likes">♥ ${k(p.likes)}</span>
      <div class="gpost__meta"><p>${p.cap}</p></div>
    </a>`).join("");

  /* ---------- top bar + bottom dock ---------- */
  const nav = $("#nav");
  const dock = $("#dock");
  const blob = $("#dockBlob");
  const dockLinks = $$("a", dock);
  function setDock(key) {
    const a = dockLinks.find((l) => l.dataset.sec === key);
    dockLinks.forEach((l) => l.classList.toggle("is-active", l === a));
    // the cream blob slides under whichever plain link is active (the mascot button has its own look)
    if (!a || a.classList.contains("dock__main")) return blob.classList.remove("is-on");
    blob.style.width = a.offsetWidth + "px";
    blob.style.transform = `translateX(${a.offsetLeft}px)`;
    blob.classList.add("is-on");
  }
  window.__setDock = setDock;
  setDock("hero");

  /* ---------- the dumb gang talks ---------- */
  const gangLines = [
    "hii bestie 👋",
    "we're the dumb gang",
    "the cookies are hot rn",
    "6pm = molten o'clock",
    "ok stop poking us 😭",
    "made with zero brain cells 🫠",
  ];
  let said = 0;
  $$(".gang__m").forEach((m) => m.addEventListener("click", () => {
    m.classList.remove("is-hop"); void m.offsetWidth; m.classList.add("is-hop");
    $("#gangSay").textContent = gangLines[++said % gangLines.length];
  }));
  $$(".gang__m").forEach((m) => m.addEventListener("animationend", (e) => e.animationName === "hop" && m.classList.remove("is-hop")));

  /* ---------- cursor + crumbs ---------- */
  if (finePointer && !reduced) {
    const cur = $("#cursor");
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, seen = false;
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      if (!seen) { seen = true; cx = x; cy = y; document.body.classList.add("has-cursor"); }
    });
    addEventListener("pointerdown", () => cur.classList.add("is-down"));
    addEventListener("pointerup", () => cur.classList.remove("is-down"));
    document.addEventListener("pointerover", (e) => cur.classList.toggle("is-hover", !!e.target.closest("a, button")));
    (function loop() {
      cx += (x - cx) * .22; cy += (y - cy) * .22;
      cur.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    })();
    addEventListener("click", (e) => crumbs(e.clientX, e.clientY, 8));
  }
  function crumbs(x, y, n) {
    if (!hasGsap) return;
    for (let i = 0; i < n; i++) {
      const c = document.createElement("i");
      c.className = "crumb";
      c.style.left = x + "px"; c.style.top = y + "px";
      c.style.background = Math.random() > .5 ? "var(--biscoff)" : "var(--choc)";
      document.body.appendChild(c);
      gsap.to(c, {
        x: (Math.random() - .5) * 120, y: Math.random() * 90 + 20, rotate: Math.random() * 360,
        opacity: 0, duration: .9 + Math.random() * .4, ease: "power2.out", onComplete: () => c.remove(),
      });
    }
  }

  /* ---------- easter egg: type "dumb" ---------- */
  let buf = "";
  addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return;
    buf = (buf + e.key.toLowerCase()).slice(-4);
    if (buf === "dumb") { rain(); toast("ok you're officially dumb now. welcome 🫠"); }
  });
  function rain() {
    if (!hasGsap) return;
    const em = ["🍪", "🍫", "☕", "🍦", "🫠", "❤️"];
    for (let i = 0; i < 40; i++) {
      const s = document.createElement("span");
      s.className = "cookie-rain";
      s.textContent = em[i % em.length];
      s.style.left = Math.random() * 100 + "vw";
      document.body.appendChild(s);
      gsap.to(s, { y: innerHeight + 120, rotate: (Math.random() - .5) * 720, duration: 1.6 + Math.random() * 1.6, delay: Math.random() * .8, ease: "power1.in", onComplete: () => s.remove() });
    }
  }

  /* ---------- hero photo pile: tap to toss the top shot to the back ---------- */
  const pile = $("#heroPile");
  const slots = () => $$(".hslot", pile);
  const restack = () => slots().forEach((s, i) => s.style.setProperty("--d", 4 + i * 5)); // top card drifts most
  restack();
  const shuffleLines = [
    "next one 👀",
    "ok this one's better",
    "they're all the molten cookie in our heads",
    "stop shuffling, start ordering",
    "fine. keep going. we'll wait",
  ];
  let shuffles = 0, tossing = false;
  pile.addEventListener("click", (e) => {
    if (tossing || !hasGsap) return;
    tossing = true;
    const top = slots().at(-1), card = top.firstElementChild;
    const dir = e.clientX > innerWidth * .75 ? -1 : 1; // throw away from the edge on narrow screens
    gsap.timeline({ onComplete: () => (tossing = false) })
      .to(card, { x: 240 * dir, y: -50, rotation: 26 * dir, duration: reduced ? 0 : .32, ease: "power2.in" })
      .call(() => { pile.prepend(top); restack(); })
      .to(card, { x: 0, y: 0, rotation: 0, duration: reduced ? 0 : .55, ease: "back.out(1.5)" });
    if (shuffles < shuffleLines.length) toast(shuffleLines[shuffles]);
    shuffles++;
  });

  // pile leans toward the mouse
  if (finePointer && !reduced) {
    const hero = $("#hero");
    let tx = 0, ty = 0, px = 0, py = 0;
    hero.addEventListener("pointermove", (e) => {
      tx = (e.clientX / innerWidth - .5) * 2;
      ty = (e.clientY / innerHeight - .5) * 2;
    });
    hero.addEventListener("pointerleave", () => (tx = ty = 0));
    (function lean() {
      px += (tx - px) * .07; py += (ty - py) * .07;
      pile.style.setProperty("--mx", px.toFixed(3));
      pile.style.setProperty("--my", py.toFixed(3));
      requestAnimationFrame(lean);
    })();
  }

  /* ---------- no gsap? just show the page ---------- */
  if (!hasGsap) {
    $("#loader").remove();
    document.body.classList.remove("is-loading");
    return;
  }

  /* ---------- smooth scroll ---------- */
  let lenis;
  if (window.Lenis && !reduced) {
    lenis = window.__lenis = new Lenis({ lerp: .1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: id === "#top" ? 0 : -20, duration: 1.4 });
    }));
  }

  /* nav hides when scrolling down, comes back up */
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (st) => {
      const y = st.scroll();
      nav.classList.toggle("is-hidden", y > lastY && y > 300);
      lastY = y;
    },
  });
  // which dock tab lights up for each section (the box counts as "menu", the gram as "the spot")
  [["hero", "hero"], ["molten", "molten"], ["menu", "menu"], ["spot", "spot"], ["box", "menu"], ["gram", "spot"], ["visit", "visit"]].forEach(([id, key]) => {
    const sec = document.getElementById(id);
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: "top 55%", end: "bottom 55%", onToggle: (st) => st.isActive && setDock(key) });
  });
  addEventListener("resize", () => { const a = $(".dock a.is-active"); a && setDock(a.dataset.sec); });

  /* ---------- split headings ---------- */
  $$(".split").forEach((h) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(" ")); return; }
            const o = document.createElement("span"); o.className = "w";
            const i = document.createElement("span"); i.textContent = w;
            o.appendChild(i); frag.appendChild(o);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.classList.contains("bubble")) {
          const o = document.createElement("span"); o.className = "w";
          n.replaceWith(o); const i = document.createElement("span"); i.appendChild(n); o.appendChild(i);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(h);
  });

  /* ---------- crossed tickers (run opposite ways, speed up when you scroll) ---------- */
  const tracks = $$("[data-ticker]").map((el) => {
    el.innerHTML += el.innerHTML + el.innerHTML;
    return { el, dir: +el.dataset.ticker, x: 0 };
  });
  let boost = 0;
  gsap.ticker.add(() => {
    const v = lenis ? Math.abs(lenis.velocity) : 0;
    boost += (Math.min(v, 40) - boost) * .08;
    tracks.forEach((t) => {
      const w = t.el.scrollWidth / 3;
      t.x -= ((reduced ? 0 : .6) + boost * .35) * t.dir;
      if (t.x <= -w) t.x += w;
      if (t.x > 0) t.x -= w;
      t.el.style.transform = `translateX(${t.x}px)`;
    });
  });

  /* ---------- loader → intro ---------- */
  const bar = $("#loaderBar"), pct = $("#loaderPct");
  const stack = $("#loaderStack"), word = $("#loaderWord"), counter = $("#loaderCount"), timecode = $("#loaderTime");
  const prog = { v: 0 };
  let ready = false;
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.all([fontsReady, new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r)))]).then(() => (ready = true));

  // the reel: their own shots, one-word captions, cuts get faster as it goes. ends on "let's get" → DUMB.
  const shots = [
    ["p03", "molten."], ["p08", "stools."], ["p05", "scoop it."], ["p09", "mirror pic."],
    ["p01", "gooey."], ["p06", "the spot."], ["p07", "last time."], ["p04", "trendy."],
    ["p02", "surat ate."], ["p12", "the vision."], ["p10", "let's get"],
  ];
  const total = shots.length + 1;
  const pad2 = (n) => String(n).padStart(2, "0");

  // fake camcorder timecode, mm:ss:ff
  const t0 = performance.now();
  const tcTimer = setInterval(() => {
    const ms = performance.now() - t0;
    timecode.textContent = `00:${pad2(Math.floor(ms / 1000))}:${pad2(Math.floor((ms % 1000) / 33.3))}`;
  }, 33);

  function setProgress(v, done) {
    gsap.to(prog, {
      v, duration: .25, ease: "power2.out", overwrite: true, onComplete: done,
      onUpdate: () => {
        bar.style.width = prog.v + "%";
        pct.textContent = String(Math.round(prog.v)).padStart(3, "0") + "%";
      },
    });
  }

  function slam(src, label, i, isLogo) {
    const card = document.createElement("div");
    card.className = "lcard" + (isLogo ? " lcard--logo" : "");
    card.innerHTML = `<img src="${src}" alt="" />`;
    stack.appendChild(card);
    while (stack.children.length > 5) stack.firstElementChild.remove();

    const r = (Math.random() - .5) * 18;
    gsap.fromTo(card,
      { scale: 1.55, rotate: r * 2.5, opacity: 0, y: -24 },
      { scale: 1, rotate: isLogo ? -4 : r, opacity: 1, y: 0, duration: .22, ease: "back.out(1.8)" });
    // older shots sink into the pile
    const under = [...stack.children].slice(0, -1);
    under.forEach((o, k) => gsap.to(o, { scale: .96 - (under.length - 1 - k) * .03, duration: .2 }));

    word.textContent = label;
    gsap.fromTo(word, { scale: 1.4, rotate: i % 2 ? 5 : -5 }, { scale: 1, rotate: i % 2 ? -2 : 2, duration: .22, ease: "back.out(2.6)" });
    counter.textContent = `${pad2(i + 1)}/${pad2(total)}`;
    setProgress(isLogo ? 96 : ((i + 1) / total) * 92);

    if (isLogo) {
      gsap.fromTo(word, { scale: 2.2 }, { scale: 1, duration: .45, ease: "elastic.out(1, .45)" });
      gsap.fromTo(".loader__inner", { x: -10 }, { x: 0, duration: .5, ease: "elastic.out(1, .25)" });
    }
  }

  function playReel() {
    const tl = gsap.timeline({ onComplete: finish });
    let t = 0;
    if (!reduced) {
      shots.forEach(([n, label], i) => {
        tl.call(slam, [`assets/ig/${n}.jpg`, label, i], t);
        t += Math.max(.11, .2 - i * .009); // speeds up like a reel build-up
      });
    }
    tl.call(slam, ["assets/ig/logo.jpg", "DUMB.", total - 1, true], t);
    tl.to({}, { duration: reduced ? .2 : .6 }); // hold on the logo for a beat
  }

  function finish() {
    if (!ready) return setTimeout(finish, 80);
    setProgress(100, outro);
  }

  // start the reel once the shots are in memory (or after 2.5s, whichever first) so no blank cuts
  const preload = (src) => new Promise((r) => { const im = new Image(); im.onload = im.onerror = r; im.src = src; });
  Promise.race([
    Promise.all([...shots.map(([n]) => preload(`assets/ig/${n}.jpg`)), preload("assets/ig/logo.jpg")]),
    new Promise((r) => setTimeout(r, 2500)),
  ]).then(playReel);

  function outro() {
    clearInterval(tcTimer);
    const tl = gsap.timeline({
      onComplete: () => {
        $("#loader").remove();
        document.body.classList.remove("is-loading");
        lenis && lenis.start();
        ScrollTrigger.refresh();
      },
    });
    tl.to(".loader__inner, .loader__hud", { y: -30, opacity: 0, duration: .35, ease: "power2.in" })
      .to("#loader", { clipPath: "inset(0 0 100% 0)", duration: .9, ease: "expo.inOut" }, "-=.05")
      .add(heroIntro, "-=.45");
  }

  function heroIntro() {
    window.__dumbIntro = true;
    dispatchEvent(new Event("dumb:intro"));
    if (reduced) return;
    const tl = gsap.timeline();
    tl.from(".hero__dumb span", { yPercent: 120, rotate: (i) => (i % 2 ? 25 : -25), opacity: 0, duration: 1, stagger: .08, ease: "back.out(1.6)" })
      .from(".gang__m .mascot", { y: -120, opacity: 0, duration: .7, stagger: .12, ease: "bounce.out" }, "-=.5")
      .from("#gangSay", { scale: 0, transformOrigin: "0% 100%", duration: .5, ease: "back.out(2.4)" }, "-=.2")
      .from(".hero__sub", { y: 20, opacity: 0, duration: .6 }, "-=.6")
      .from(".hero .reveal-up", { y: 26, opacity: 0, duration: .7, stagger: .1, ease: "power3.out" }, "-=.5")
      .from(".hcard", { y: () => innerHeight * .7, rotation: (i) => (i % 2 ? 30 : -30), opacity: 0, duration: .9, stagger: .11, ease: "back.out(1.3)" }, .15)
      .from(".spin-badge", { scale: 0, rotation: -180, duration: .9, ease: "back.out(2)" }, "-=.5")
      .from(".hero .sticker", { scale: 0, rotate: -90, duration: .8, stagger: .15, ease: "back.out(2.2)" }, "-=.6")
      .from(".hero__note, .scribble--hero", { opacity: 0, x: -20, duration: .6 }, "-=.4")
      .fromTo(".nav", { y: -100 }, { y: 0, duration: .8, ease: "expo.out", clearProps: "transform" }, 0.2);
  }

  if (reduced) return;

  /* ---------- scroll stuff ---------- */
  // headings: words pop up from below
  $$(".split").forEach((h) => {
    gsap.from($$(".w > span", h), {
      yPercent: 110, rotate: 4, duration: .9, stagger: .05, ease: "expo.out",
      scrollTrigger: { trigger: h, start: "top 85%" },
    });
  });

  // generic fade-ups outside the hero
  $$(".molten__lede, .drop-card, .stat, .scoop, .menu__aside, .gram__head .btn, .visit__card, .box__lede, .box__aside, .box__receipt, .spot__intro p").forEach((el) => {
    gsap.from(el, { y: 40, opacity: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });

  // hero parallax on the way out
  gsap.to(".hero__copy", { yPercent: -18, opacity: .2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__dumb span", { y: (i) => -40 - i * 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // floaty stickers
  $$("[data-float]").forEach((el, i) => {
    gsap.to(el, { y: "+=10", rotate: `+=${i % 2 ? 4 : -4}`, duration: 2.4 + i * .3, yoyo: true, repeat: -1, ease: "sine.inOut" });
  });

  // anatomy arrows draw in
  ScrollTrigger.create({ trigger: ".anatomy", start: "top 65%", onEnter: () => $(".anatomy").classList.add("is-in") });
  gsap.from(".anatomy__notes li", { opacity: 0, x: (i) => (i % 2 ? -20 : 20), duration: .6, stagger: .15, scrollTrigger: { trigger: ".anatomy", start: "top 65%" } });
  gsap.fromTo(".polaroid--big", { rotate: -10, y: 60 }, { rotate: -3, y: 0, ease: "none", scrollTrigger: { trigger: ".anatomy", start: "top bottom", end: "center center", scrub: 1 } });

  // number counters
  $$("[data-count]").forEach((el) => {
    const to = +el.dataset.count, o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.6, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" }, onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString("en-IN")) });
  });

  // guest check slides in like it's being handed to you
  gsap.from(".check", { y: 140, rotate: 6, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".check", start: "top 88%" } });
  gsap.from(".decide", { scale: .85, rotate: -4, opacity: 0, duration: .9, ease: "back.out(1.6)", scrollTrigger: { trigger: ".decide", start: "top 90%" } });

  // horizontal gallery (desktop only; on mobile it's a native swipe row)
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const tr = $("#spotTrack");
    const dist = () => tr.scrollWidth - (innerWidth - tr.getBoundingClientRect().left) + 40;
    gsap.to(tr, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: ".spot__pin", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
    });
  });
  mm.add("(max-width: 900px)", () => {
    gsap.from(".pcard", { y: 60, opacity: 0, duration: .8, stagger: .08, scrollTrigger: { trigger: ".spot__track", start: "top 85%" } });
  });

  // box: cookies roll in, box drops onto the table
  gsap.from("#picker li", { y: 50, rotation: (i) => (i % 2 ? 12 : -12), opacity: 0, duration: .6, stagger: .06, ease: "back.out(1.8)", scrollTrigger: { trigger: ".picker", start: "top 88%" } });
  gsap.from(".dbox", { y: -120, rotation: 6, opacity: 0, duration: 1, ease: "bounce.out", scrollTrigger: { trigger: ".dbox", start: "top 85%" } });

  // gram posts drop in staggered
  gsap.from(".gpost", { y: 80, opacity: 0, rotate: (i) => (i % 2 ? 4 : -4), duration: .9, stagger: .07, ease: "power3.out", scrollTrigger: { trigger: ".gram__grid", start: "top 85%" } });

  // mirror wobble
  gsap.fromTo(".mirror", { rotate: -8 }, { rotate: 8, ease: "none", scrollTrigger: { trigger: ".visit", start: "top bottom", end: "bottom top", scrub: true } });

  // footer giant DUMB rises
  gsap.from(".foot__giant", { yPercent: 60, ease: "none", scrollTrigger: { trigger: ".foot", start: "top bottom", end: "bottom bottom", scrub: true } });
})();

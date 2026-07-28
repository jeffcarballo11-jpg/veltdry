(function () {
  "use strict";

  const data = window.__BRAND__ || {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const escHTML = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  /* ---------- Nav scroll state + burger ---------- */
  function initNav() {
    const nav = $("[data-nav]");
    if (!nav) return;
    const onScroll = () => { nav.classList.toggle("is-scrolled", scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const burger = $("[data-burger]");
    const mobile = $("[data-mobile-menu]");
    if (!burger || !mobile) return;
    burger.addEventListener("click", () => {
      const open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      mobile.setAttribute("data-open", String(!open));
    });
    $$("a", mobile).forEach(a => a.addEventListener("click", () => {
      burger.setAttribute("aria-expanded", "false");
      mobile.setAttribute("data-open", "false");
    }));
  }

  /* ---------- Smooth anchor scroll ---------- */
  function initSmoothAnchors() {
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const navOffset = 84;
      window.scrollTo({
        top: el.getBoundingClientRect().top + scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth",
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveals() {
    const els = $$("[data-reveal]");
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("is-revealed");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(el => io.observe(el));

    setTimeout(() => {
      $$("[data-reveal]:not(.is-revealed)").forEach(el => {
        if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  /* ---------- Mouse-reactive gradient (signature effect) ---------- */
  function initMouseGradient() {
    if (!fineHover) return;
    let tx = 30, ty = 30, mx = 30, my = 30;
    document.addEventListener("mousemove", e => {
      tx = (e.clientX / innerWidth) * 100;
      ty = (e.clientY / innerHeight) * 100;
    }, { passive: true });
    function frame() {
      mx += (tx - mx) * 0.05;
      my += (ty - my) * 0.05;
      document.documentElement.style.setProperty("--mx", mx + "%");
      document.documentElement.style.setProperty("--my", my + "%");
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Custom cursor tracking ---------- */
  function initCursor() {
    if (!fineHover) return;
    const root = $("[data-cursor-root]");
    if (!root) return;
    document.documentElement.classList.add("has-cursor");
    const dot = $(".cursor-dot", root);
    const ring = $(".cursor-ring", root);
    let tx = 0, ty = 0, rx = 0, ry = 0, firstMove = false;

    window.addEventListener("mousemove", e => {
      tx = e.clientX; ty = e.clientY;
      if (dot) dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      if (!firstMove) {
        firstMove = true;
        rx = tx; ry = ty;
        if (ring) ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        root.classList.add("is-ready");
      }
    }, { passive: true });

    function tick() {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      if (ring) ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    const HOVERABLES = "a, button, .btn, .feature-card, .problema__card, .price-card, .industria-card, .demo-tab, .chat-card, .metric, .step";
    document.addEventListener("mouseover", e => {
      if (e.target.closest(HOVERABLES)) root.classList.add("is-interactive");
    });
    document.addEventListener("mouseout", e => {
      const toEl = e.relatedTarget;
      if (e.target.closest(HOVERABLES) && !(toEl && toEl.closest && toEl.closest(HOVERABLES))) {
        root.classList.remove("is-interactive");
      }
    });
  }

  /* ---------- Feature card halo (uses same --mx/--my locally) ---------- */
  function initCardHalo() {
    if (!fineHover) return;
    $$(".feature-card, .problema__card").forEach(card => {
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  /* ---------- Tilt on price cards ---------- */
  function initTilt() {
    if (!fineHover) return;
    $$(".price-card, .industria-card").forEach(card => {
      const MAX = 5;
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.style.transformStyle = "preserve-3d";
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      function loop() {
        cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15;
        const scale = card.classList.contains("price-card--featured") ? 1.02 : 1;
        card.style.transform = `perspective(900px) rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg) scale(${scale})`;
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ---------- Count-up numbers ---------- */
  function initCountUp() {
    $$("[data-count-to]").forEach(el => {
      const target = parseFloat(el.dataset.countTo);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const trigger = () => {
        if (window.gsap) {
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target, duration: 1.6, ease: "power2.out",
            onUpdate: () => { el.textContent = prefix + Math.round(obj.v) + suffix; }
          });
        } else {
          el.textContent = prefix + target + suffix;
        }
      };
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { trigger(); io.unobserve(e.target); } });
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }

  /* ---------- Hero chat: idle typing loop ---------- */
  function initHeroChat() {
    const body = $("[data-hero-chat]");
    if (!body) return;
    // Content is hardcoded in HTML already (works without JS).
    // JS only re-triggers the entrance animation once visible.
    const bubbles = $$(".chat-bubble", body);
    bubbles.forEach(b => { b.style.animation = "none"; b.style.opacity = "0"; });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        bubbles.forEach((b, i) => {
          setTimeout(() => {
            b.style.animation = "";
            b.style.opacity = "";
          }, i * 500);
        });
        io.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    io.observe(body);
  }

  /* ---------- Interactive demo (tabs + typing simulation) ---------- */
  function initDemoChat() {
    const tabsWrap = $("[data-demo-tabs]");
    const chatBody = $("[data-demo-chat]");
    if (!tabsWrap || !chatBody || !data.demoScenarios) return;

    let playToken = 0;

    function renderScenario(id) {
      const scenario = data.demoScenarios.find(s => s.id === id) || data.demoScenarios[0];
      const myToken = ++playToken;
      chatBody.innerHTML = "";

      scenario.messages.forEach((msg, i) => {
        setTimeout(() => {
          if (myToken !== playToken) return;
          if (msg.from === "ai") {
            const typing = document.createElement("div");
            typing.className = "chat-bubble chat-bubble--ai chat-bubble--typing";
            typing.innerHTML = "<span></span><span></span><span></span>";
            chatBody.appendChild(typing);
            chatBody.scrollTop = chatBody.scrollHeight;
            setTimeout(() => {
              if (myToken !== playToken) return;
              typing.remove();
              const bubble = document.createElement("div");
              bubble.className = "chat-bubble chat-bubble--ai";
              bubble.textContent = msg.text;
              chatBody.appendChild(bubble);
              chatBody.scrollTop = chatBody.scrollHeight;
            }, 700);
          } else {
            const bubble = document.createElement("div");
            bubble.className = "chat-bubble chat-bubble--user";
            bubble.textContent = msg.text;
            chatBody.appendChild(bubble);
            chatBody.scrollTop = chatBody.scrollHeight;
          }
        }, i * 1100);
      });
    }

    tabsWrap.addEventListener("click", e => {
      const btn = e.target.closest("[data-demo-tab]");
      if (!btn) return;
      $$("[data-demo-tab]", tabsWrap).forEach(b => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });
      renderScenario(btn.dataset.demoTab);
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { renderScenario(data.demoScenarios[0].id); io.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    io.observe(chatBody);
  }

  /* ---------- Boot ---------- */
  function boot() {
    safe(initNav, "initNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initReveals, "initReveals");
    safe(initMouseGradient, "initMouseGradient");
    safe(initCursor, "initCursor");
    safe(initCardHalo, "initCardHalo");
    safe(initTilt, "initTilt");
    safe(initCountUp, "initCountUp");
    safe(initHeroChat, "initHeroChat");
    safe(initDemoChat, "initDemoChat");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

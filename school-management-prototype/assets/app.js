/* =========================================================
   共享行为：状态仓库 / Toast / 弹窗 / 短信验证码 / 原型场景切换
   ========================================================= */
(function () {
  "use strict";

  var D = window.PROTO_DATA;
  var KEY = "proto.school-management.v1";

  /* ---------------- 小工具 ---------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function initial(name) { return (name || "学").trim().charAt(0); }

  /* ---------------- 状态仓库 ---------------- */
  var memory = null;

  function defaultState(scenarioId) {
    var sc = D.SCENARIOS.filter(function (s) { return s.id === scenarioId; })[0] || D.SCENARIOS[0];
    return { scenarioId: sc.id, primaryId: sc.primary, schoolIds: sc.ids.slice(), unboundIds: [], enrollments: {} };
  }

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && Array.isArray(s.schoolIds)) {
          if (!s.enrollments) s.enrollments = {};
          return s;
        }
      }
    } catch (e) { /* file:// 下可能不可用，退回内存 */ }
    if (memory) return memory;
    return defaultState("default");
  }

  function write(s) {
    memory = s;
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
  }

  var store = {
    get: function () { return read(); },
    set: function (s) { write(s); },
    patch: function (obj) {
      var s = read();
      Object.keys(obj).forEach(function (k) { s[k] = obj[k]; });
      write(s);
      return s;
    },
    reset: function (scenarioId) {
      var s = defaultState(scenarioId || "default");
      write(s);
      return s;
    }
  };

  /* ---------------- 数据查询 ---------------- */
  function schoolById(id) {
    var list = D.SCHOOLS.filter(function (s) { return s.id === id; });
    return list.length ? list[0] : null;
  }

  /** 当前已认证（未解绑）的学校，按 state.schoolIds 顺序 */
  function boundSchools() {
    var s = store.get();
    return s.schoolIds
      .filter(function (id) { return s.unboundIds.indexOf(id) === -1; })
      .map(schoolById)
      .filter(Boolean);
  }

  function primarySchool() {
    var s = store.get();
    if (s.primaryId && s.unboundIds.indexOf(s.primaryId) === -1) return schoolById(s.primaryId);
    var bound = boundSchools();
    return bound.length ? bound[0] : null;
  }

  /* ---------------- 学籍阶段 ----------------
     一所学校下可以有多个学历阶段（专升本 / 读研）。
     原型里对学籍的修改写进 state.enrollments 覆盖层，保证刷新后仍然可见。 */
  function enrollmentsOf(school) {
    var overlay = store.get().enrollments || {};
    return overlay[school.id] || school.enrollments;
  }

  function currentEnrollment(school) {
    var list = enrollmentsOf(school);
    return list.filter(function (e) { return e.isCurrent; })[0] || list[0] || null;
  }

  function setEnrollments(schoolId, list) {
    var s = store.get();
    var overlay = Object.assign({}, s.enrollments || {});
    overlay[schoolId] = list;
    store.patch({ enrollments: overlay });
  }

  /** 全部学历阶段，按入学年份倒序 —— 供「学习经历」时间线使用 */
  function allEnrollments() {
    var out = [];
    boundSchools().forEach(function (school) {
      enrollmentsOf(school).forEach(function (e) {
        out.push({ school: school, enrollment: e });
      });
    });
    out.sort(function (a, b) {
      return String(b.enrollment.enrollYear).localeCompare(String(a.enrollment.enrollYear));
    });
    return out;
  }

  /* ---------------- Toast ---------------- */
  function toastHost() {
    var host = $(".toasts");
    if (!host) {
      host = document.createElement("div");
      host.className = "toasts";
      host.setAttribute("role", "status");
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
    }
    return host;
  }

  function toast(text, type) {
    type = type || "ok";
    var host = toastHost();
    var el = document.createElement("div");
    el.className = "toast " + type;
    var mark = type === "err" ? "!" : (type === "info" ? "i" : "\u2713");
    el.innerHTML = '<span class="ti">' + mark + "</span><span></span>";
    el.lastChild.textContent = text;
    host.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .2s, transform .2s";
      el.style.opacity = "0";
      el.style.transform = "translateY(-8px)";
      setTimeout(function () { el.remove(); }, 220);
    }, 2600);
  }

  /* ---------------- 弹窗 ---------------- */
  var openCount = 0;

  function openModal(opts) {
    var prevFocus = document.activeElement;
    var mask = document.createElement("div");
    mask.className = "modal-mask";
    mask.innerHTML =
      '<div class="modal ' + (opts.size || "") + '" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
        '<div class="modal-head">' +
          '<h3 id="modal-title">' + esc(opts.title) + "</h3>" +
          '<button type="button" class="modal-x" aria-label="关闭弹窗">&times;</button>' +
        "</div>" +
        '<div class="modal-body">' + (opts.body || "") + "</div>" +
        (opts.footer === null ? "" : '<div class="modal-foot">' + (opts.footer || "") + "</div>") +
      "</div>";

    document.body.appendChild(mask);
    document.body.style.overflow = "hidden";
    openCount++;

    var modal = $(".modal", mask);
    var locked = false;

    function destroy() {
      mask.remove();
      openCount--;
      if (openCount <= 0) document.body.style.overflow = "";
      if (prevFocus && prevFocus.focus && document.contains(prevFocus)) prevFocus.focus();
    }

    /* 用户主动关闭：加载中时不允许（防止提交被打断） */
    function close() {
      if (locked) return;
      destroy();
    }

    function focusables() {
      return $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', modal)
        .filter(function (el) { return el.offsetParent !== null; });
    }

    mask.addEventListener("click", function (e) {
      if (e.target === mask) close();
    });
    $(".modal-x", mask).addEventListener("click", close);

    mask.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.stopPropagation(); close(); return; }
      if (e.key !== "Tab") return;
      var list = focusables();
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    var api = {
      root: mask,
      close: close,
      destroy: destroy,
      lock: function (v) { locked = !!v; var x = $(".modal-x", mask); if (x) x.disabled = !!v; },
      q: function (sel) { return $(sel, mask); },
      qa: function (sel) { return $$(sel, mask); }
    };

    if (opts.onMount) opts.onMount(api);

    setTimeout(function () {
      var auto = $("[data-autofocus]", modal) || focusables()[0];
      if (auto) auto.focus();
    }, 30);

    return api;
  }

  /* ---------------- 短信验证码 ---------------- */
  function bindSms(btn, opts) {
    opts = opts || {};
    var timer = null;
    btn.addEventListener("click", function () {
      if (btn.disabled) return;
      if (opts.onBefore && opts.onBefore() === false) {
        var host = btn.closest(".field") || btn.closest(".modal-body");
        if (host) {
          host.classList.add("shake");
          setTimeout(function () { host.classList.remove("shake"); }, 320);
        }
        return;
      }
      var left = opts.seconds || 60;
      btn.disabled = true;
      btn.textContent = left + "s 后重发";
      if (opts.onSent) opts.onSent();
      timer = setInterval(function () {
        left--;
        if (left <= 0) {
          clearInterval(timer);
          btn.disabled = false;
          btn.textContent = "重新获取";
        } else {
          btn.textContent = left + "s 后重发";
        }
      }, 1000);
    });
    return function stop() { if (timer) clearInterval(timer); };
  }

  /* ---------------- 学校卡片渲染 ---------------- */
  function schoolCard(school, opts) {
    opts = opts || {};
    var isPrimary = !!opts.primary;
    var actions = opts.actions || "";
    var scope = opts.scope;
    var enr = currentEnrollment(school);
    var phases = enrollmentsOf(school);
    if (!enr) return "";

    var html =
      '<article class="school' + (isPrimary ? " is-primary" : "") + (opts.dim ? " dim" : "") + '" data-id="' + esc(school.id) + '">' +
        '<div class="sc-head">' +
          '<div class="sc-logo' + (isPrimary ? " primary" : "") + '" aria-hidden="true">' + esc(initial(school.name)) + "</div>" +
          '<div class="sc-title">' +
            "<h4>" + esc(school.name) +
              (isPrimary ? '<span class="badge badge-primary">主学校</span>' : "") +
              '<span class="badge badge-plain">' + esc(enr.level) + "</span>" +
              (phases.length > 1 ? '<span class="badge badge-warn">含 ' + phases.length + " 个学历阶段</span>" : "") +
            "</h4>" +
            '<div class="sc-meta">' +
              "<span>" + esc(enr.track) + "</span>" +
              "<span>·</span><span>" + esc(enr.enrollYear) + " 级</span>" +
              "<span>·</span><span>" + esc(enr.status) + "</span>" +
              "<span>·</span><span>认证于 " + esc(school.authedAt) + "</span>" +
              '<span class="badge badge-ok">已认证</span>' +
            "</div>" +
          "</div>" +
          '<div class="sc-actions">' + actions + "</div>" +
        "</div>" +
        '<dl class="sc-grid">' +
          "<div><dt>学号</dt><dd>" + esc(enr.studentNo) + "</dd></div>" +
          "<div><dt>姓名</dt><dd>" + esc(enr.realName) + "</dd></div>" +
          "<div><dt>学院</dt><dd>" + esc(enr.college) + "</dd></div>" +
          "<div><dt>班级</dt><dd>" + esc(enr.className) + "</dd></div>" +
          "<div><dt>专业</dt><dd>" + esc(enr.major) + "</dd></div>" +
          "<div><dt>学历阶段</dt><dd>" + esc(enr.level) + " · " + esc(enr.enrollYear) + " 级</dd></div>" +
        "</dl>" +
        (scope === false ? "" :
          '<div class="sc-scope">' +
            "<span>" + (isPrimary ? "当前默认展示" : "已绑定但非默认展示") + "：</span>" +
            '<span class="scope-chip">课程 ' + enr.metrics.courses + "</span>" +
            '<span class="scope-chip">考试 ' + enr.metrics.exams + "</span>" +
            '<span class="scope-chip">学分 ' + enr.metrics.credits + "</span>" +
            (phases.length > 1
              ? '<span class="muted">阶段间数据不合并，学分不互相折算</span>'
              : "") +
          "</div>") +
      "</article>";
    return html;
  }

  /* ---------------- 侧边栏高亮 ---------------- */
  function markNav(page) {
    $$(".side a[data-page]").forEach(function (a) {
      a.classList.toggle("on", a.dataset.page === page);
      if (a.dataset.page === page) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  /* ---------------- 原型场景切换器 ---------------- */
  function mountDevbar() {
    var s = store.get();
    var box = document.createElement("details");
    box.className = "devbar";
    box.innerHTML =
      "<summary>原型状态</summary>" +
      '<div class="devbody">' +
        "<p>切换数据场景，用于评审各种边界情况。</p>" +
        D.SCENARIOS.map(function (sc) {
          return '<button type="button" data-sc="' + sc.id + '"' + (sc.id === s.scenarioId ? ' class="on"' : "") + ">" +
            esc(sc.label) + "</button>";
        }).join("") +
        '<button type="button" data-sc="reset">↺ 恢复默认并清空本地状态</button>' +
      "</div>";
    document.body.appendChild(box);

    box.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-sc]");
      if (!b) return;
      store.reset(b.dataset.sc === "reset" ? "default" : b.dataset.sc);
      location.reload();
    });
  }

  /* ---------------- 导出 ---------------- */
  window.PROTO = {
    store: store,
    data: D,
    esc: esc,
    $: $,
    $$: $$,
    initial: initial,
    schoolById: schoolById,
    boundSchools: boundSchools,
    primarySchool: primarySchool,
    enrollmentsOf: enrollmentsOf,
    currentEnrollment: currentEnrollment,
    setEnrollments: setEnrollments,
    allEnrollments: allEnrollments,
    toast: toast,
    modal: { open: openModal },
    bindSms: bindSms,
    schoolCard: schoolCard,
    markNav: markNav,
    mountDevbar: mountDevbar
  };

  document.addEventListener("DOMContentLoaded", function () {
    mountDevbar();
  });
})();

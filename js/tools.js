/* In-browser classroom tools. All state stays in localStorage. Nothing is sent. */
(function (global) {
  "use strict";

  var PREFIX = "ak9i.k9startup.";

  function memoryStore() {
    var mem = {};
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem: function (k, v) { mem[k] = String(v); }
    };
  }

  var store = memoryStore();
  var storageOk = false;
  try {
    var probe = PREFIX + "probe";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    store = localStorage;
    storageOk = true;
  } catch (err) {
    storageOk = false;
  }

  function load(key, fallback) {
    try {
      var raw = store.getItem(PREFIX + key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      store.setItem(PREFIX + key, JSON.stringify(value));
    } catch (err) {
      /* Keep working in memory if the browser refuses storage. */
    }
  }

  function money(n) {
    if (!isFinite(n)) return "—";
    var rounded = Math.round(n * 100) / 100;
    var hasCents = Math.abs(rounded % 1) > 0.001;
    return rounded.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: hasCents ? 2 : 0
    });
  }

  function num(value) {
    var n = typeof value === "number" ? value : parseFloat(value);
    return isFinite(n) ? n : 0;
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") node.addEventListener(k.slice(2), attrs[k]);
        else if (attrs[k] === true) node.setAttribute(k, "");
        else if (attrs[k] !== false && attrs[k] != null) node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (child) {
      if (child == null) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  function field(label, input) {
    var wrap = el("label", null, [label, input]);
    return wrap;
  }

  function privacyLine() {
    var p = el("p", { class: "private-note" });
    p.textContent = storageOk
      ? "Saved only in this browser on this device. Nothing is sent anywhere."
      : "This browser is not storing answers. Nothing is sent anywhere.";
    return p;
  }

  function onStore(key, handler) {
    window.addEventListener("storage", function (event) {
      if (event.key === PREFIX + key) handler(load(key, null));
    });
  }

  var NICHES = {
    bedbug: {
      name: "Bed bug detection",
      buyers: "Pest firms, hotels, property managers",
      requirements: "Inspection-only licensing, containment, team certification, alert confirmation",
      start: "Partner with a licensed pest management firm; keep inspection and treatment responsibilities clear.",
      bounds: "Ask the state pesticide or structural pest-control regulator whether paid canine inspection alone requires a company license, individual credential, or supervision. Do not assume that avoiding pesticide application creates an exemption. An unconfirmed alert is not proof of an infestation, and a search without an alert does not establish that the property is pest-free."
    },
    mold: {
      name: "Mold detection",
      buyers: "Inspectors, owners, property managers",
      requirements: "Whether work is regulated assessment; mold coverage; qualified confirmation",
      start: "Define canine work as an adjunct to qualified assessment; separate referral and remediation decisions.",
      bounds: "A canine alert can guide further investigation. It does not identify a species, measure exposure, establish a health diagnosis, or certify a building as safe. A private credential does not replace a state license. There is no basis in the packet for claiming government approval of a mold dog."
    },
    narcotics: {
      name: "Private narcotics detection",
      buyers: "Authorized private clients, employers, schools",
      requirements: "Search authority, privacy, security licensing, controlled-aid registration",
      start: "Seek counsel-reviewed procedures and a precise odor list before selling searches.",
      bounds: "A canine business is not a law-enforcement agency. Do not describe an alert as proof of possession, impairment, a crime, or the identity of a particular substance. Before possessing controlled-substance training aids, contact DEA Diversion and the state regulator. Another party’s registration does not cover your possession, transport, or storage."
    },
    explosives: {
      name: "Explosives detection",
      buyers: "Venues, security contractors, cargo operators",
      requirements: "Security licensing, regulated aids, storage, client and program requirements",
      start: "Evaluate subcontracting under an established qualified provider before building independent infrastructure.",
      bounds: "Ask ATF which license or permit, if any, applies before acquiring regulated explosive training aids. A standard is not a license. A general explosives credential does not authorize air-cargo screening. Do not promise bomb-free clearance. A private canine team is not a bomb-disposal service."
    }
  };

  function breakEven(revenue, variable, fixed, owner) {
    var contribution = revenue - variable;
    var operating = null;
    var target = null;
    if (contribution > 0) {
      operating = Math.ceil(fixed / contribution - 1e-9);
      target = Math.ceil((fixed + owner) / contribution - 1e-9);
      if (operating < 0) operating = 0;
      if (target < 0) target = 0;
    }
    return { contribution: contribution, operating: operating, target: target };
  }

  function initBreakEven(root) {
    var defaults = { revenue: 400, variable: 140, fixed: 2600, owner: 3900 };
    var state = load("breakeven", defaults);
    ["revenue", "variable", "fixed", "owner"].forEach(function (k) {
      if (!isFinite(num(state[k])) && state[k] !== 0) state[k] = defaults[k];
      state[k] = num(state[k]);
    });

    var inputs = {};
    function numberInput(key) {
      var input = el("input", { type: "number", id: "be-" + key, step: "1", value: String(state[key]) });
      input.addEventListener("input", function () {
        state[key] = num(input.value);
        save("breakeven", state);
        render();
      });
      inputs[key] = input;
      return input;
    }

    var contribution = el("p", { class: "result-num", id: "be-contribution" });
    var operating = el("p", { class: "result-num", id: "be-operating" });
    var target = el("p", { class: "result-num", id: "be-target" });
    var note = el("p", { id: "be-note" });
    var match = el("p", { id: "be-match", class: "fine" });

    function render() {
      var result = breakEven(state.revenue, state.variable, state.fixed, state.owner);
      contribution.textContent = money(result.contribution);
      if (result.operating == null) {
        operating.textContent = "—";
        target.textContent = "—";
        note.textContent = "Job contribution is not positive, so a break-even job count is not defined. In this illustration, raise the job price or lower the variable cost.";
      } else {
        operating.textContent = String(result.operating);
        target.textContent = String(result.target);
        note.textContent = "Operating break-even rounds up monthly fixed costs ÷ contribution. The owner-income planning target adds owner pay to fixed costs only because that pay is not already inside the fixed-cost figure. Taxes, debt payments, and reserves need a separate cash plan.";
      }
      var same = state.revenue === 400 && state.variable === 140 && state.fixed === 2600 && state.owner === 3900;
      match.textContent = same
        ? "These entries match the packet illustration: contribution $260, operating break-even 10 jobs, owner-income target 25 jobs."
        : "You changed the teaching inputs. The result is your classroom scenario, not an AK9I price or an earnings claim.";
    }

    function applyRemote(next) {
      if (!next) return;
      ["revenue", "variable", "fixed", "owner"].forEach(function (k) {
        state[k] = num(next[k]);
        if (document.activeElement !== inputs[k]) inputs[k].value = String(state[k]);
      });
      render();
    }

    var reset = el("button", { type: "button", text: "Reset to the packet illustration" });
    reset.addEventListener("click", function () {
      state = { revenue: 400, variable: 140, fixed: 2600, owner: 3900 };
      Object.keys(inputs).forEach(function (k) { inputs[k].value = String(state[k]); });
      save("breakeven", state);
      render();
    });

    root.appendChild(el("div", { class: "inline-fields" }, [
      field("Average job revenue ($)", numberInput("revenue")),
      field("Variable cost per job ($)", numberInput("variable")),
      field("Monthly fixed operating costs ($)", numberInput("fixed")),
      field("Owner compensation target ($ / month)", numberInput("owner"))
    ]));
    root.appendChild(el("div", { class: "results", "aria-live": "polite" }, [
      el("div", { class: "card" }, [el("h3", { text: "Contribution per job" }), contribution]),
      el("div", { class: "card" }, [el("h3", { text: "Operating break-even (jobs)" }), operating]),
      el("div", { class: "card" }, [el("h3", { text: "Jobs for owner-pay target" }), target])
    ]));
    root.appendChild(note);
    root.appendChild(match);
    root.appendChild(reset);
    root.appendChild(privacyLine());
    render();
    onStore("breakeven", applyRemote);
    global.AK9I_BREAK_EVEN = breakEven;
  }

  function cashForecast(model) {
    var receipts = model.receipts.slice();
    var payments = model.payments.slice();
    var outside = 0;
    if (model.delay) {
      outside = receipts[12] || 0;
      var shifted = [0];
      for (var i = 0; i < 12; i += 1) shifted.push(receipts[i] || 0);
      receipts = shifted;
    }
    var pct = Math.max(0, num(model.fewerPct));
    if (pct) {
      receipts = receipts.map(function (r) { return r * (1 - pct / 100); });
    }
    var down = parseInt(model.downWeek, 10) || 0;
    if (down >= 1 && down <= 13) receipts[down - 1] = 0;
    var vetWeek = parseInt(model.vetWeek, 10) || 0;
    if (model.stress && vetWeek >= 1 && vetWeek <= 13) payments[vetWeek - 1] += num(model.vetAmount);

    var rows = [];
    var opening = num(model.opening);
    var low = Infinity;
    var lowWeek = 1;
    var below = [];
    for (var w = 0; w < 13; w += 1) {
      var close = opening + num(receipts[w]) - num(payments[w]);
      rows.push({
        week: w + 1,
        opening: opening,
        receipts: num(receipts[w]),
        payments: num(payments[w]),
        closing: close
      });
      if (close < low) { low = close; lowWeek = w + 1; }
      if (close < 0) below.push(w + 1);
      opening = close;
    }
    return { rows: rows, low: low, lowWeek: lowWeek, below: below, outside: model.delay ? outside : 0 };
  }

  function blankCash() {
    return {
      opening: 0,
      receipts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      payments: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      stress: false,
      delay: false,
      fewerPct: 0,
      downWeek: 0,
      vetAmount: 0,
      vetWeek: 1
    };
  }

  function normalizeCash(raw) {
    var base = blankCash();
    if (!raw) return base;
    base.opening = num(raw.opening);
    base.stress = !!raw.stress;
    base.delay = !!raw.delay;
    base.fewerPct = num(raw.fewerPct);
    base.downWeek = parseInt(raw.downWeek, 10) || 0;
    base.vetAmount = num(raw.vetAmount);
    base.vetWeek = parseInt(raw.vetWeek, 10) || 1;
    for (var i = 0; i < 13; i += 1) {
      base.receipts[i] = raw.receipts && isFinite(num(raw.receipts[i])) ? num(raw.receipts[i]) : 0;
      base.payments[i] = raw.payments && isFinite(num(raw.payments[i])) ? num(raw.payments[i]) : 0;
    }
    return base;
  }

  function initCash(root) {
    var state = normalizeCash(load("cash", null));
    var openingInput = el("input", { id: "cash-opening", type: "number", step: "1", value: String(state.opening) });
    var fillR = el("input", { id: "cash-fill-receipts", type: "number", step: "1", value: "0" });
    var fillP = el("input", { id: "cash-fill-payments", type: "number", step: "1", value: "0" });
    var stress = el("input", { id: "cash-stress", type: "checkbox" });
    stress.checked = state.stress;
    var delay = el("input", { id: "cash-delay", type: "checkbox" });
    delay.checked = state.delay;
    var fewer = el("input", { id: "cash-fewer", type: "number", min: "0", max: "100", step: "1", value: String(state.fewerPct) });
    var down = el("select", { id: "cash-down" });
    var vetAmt = el("input", { id: "cash-vet", type: "number", step: "1", value: String(state.vetAmount) });
    var vetWeek = el("select", { id: "cash-vet-week" });
    [down, vetWeek].forEach(function (sel, idx) {
      var none = el("option", { value: "0", text: idx === 0 ? "None" : "—" });
      if (idx === 0) sel.appendChild(none);
      for (var w = 1; w <= 13; w += 1) sel.appendChild(el("option", { value: String(w), text: "Week " + w }));
    });
    down.value = String(state.downWeek);
    vetWeek.value = String(state.vetWeek);

    var tbody = el("tbody", { id: "cash-body" });
    var summary = el("p", { id: "cash-summary" });
    var outside = el("p", { id: "cash-outside", class: "fine" });
    var receiptInputs = [];
    var paymentInputs = [];
    var openingCells = [];
    var closingCells = [];
    var rowNodes = [];

    for (var rowIndex = 0; rowIndex < 13; rowIndex += 1) {
      (function (index) {
        var r = el("input", { type: "number", step: "1", "aria-label": "Week " + (index + 1) + " receipts", value: String(state.receipts[index]) });
        var p = el("input", { type: "number", step: "1", "aria-label": "Week " + (index + 1) + " payments", value: String(state.payments[index]) });
        r.addEventListener("input", commit);
        p.addEventListener("input", commit);
        receiptInputs.push(r);
        paymentInputs.push(p);
        var openCell = el("td", { class: "num" });
        var closeCell = el("td", { class: "num" });
        if (index === 0) closeCell.id = "cash-week1-close";
        openingCells.push(openCell);
        closingCells.push(closeCell);
        var tr = el("tr", null, [
          el("th", { text: String(index + 1), scope: "row" }),
          openCell,
          el("td", null, [r]),
          el("td", null, [p]),
          closeCell
        ]);
        rowNodes.push(tr);
        tbody.appendChild(tr);
      })(rowIndex);
    }

    function read() {
      var wasStress = state.stress;
      state.opening = num(openingInput.value);
      state.stress = stress.checked;
      state.delay = delay.checked;
      state.fewerPct = num(fewer.value);
      state.downWeek = parseInt(down.value, 10) || 0;
      state.vetAmount = num(vetAmt.value);
      state.vetWeek = parseInt(vetWeek.value, 10) || 1;
      if (!state.stress && !wasStress) {
        for (var i = 0; i < 13; i += 1) {
          state.receipts[i] = num(receiptInputs[i].value);
          state.payments[i] = num(paymentInputs[i].value);
        }
      }
    }

    function render() {
      var model = {
        opening: state.opening,
        receipts: state.receipts.slice(),
        payments: state.payments.slice(),
        delay: state.stress && state.delay,
        fewerPct: state.stress ? state.fewerPct : 0,
        downWeek: state.stress ? state.downWeek : 0,
        vetAmount: state.stress ? state.vetAmount : 0,
        vetWeek: state.vetWeek,
        stress: state.stress
      };
      var forecast = cashForecast(model);
      forecast.rows.forEach(function (row, i) {
        var rInput = receiptInputs[i];
        var pInput = paymentInputs[i];
        if (state.stress) {
          if (document.activeElement !== rInput) rInput.value = String(Math.round(row.receipts * 100) / 100);
          if (document.activeElement !== pInput) pInput.value = String(Math.round(row.payments * 100) / 100);
          rInput.disabled = true;
          pInput.disabled = true;
        } else {
          rInput.disabled = false;
          pInput.disabled = false;
          if (document.activeElement !== rInput) rInput.value = String(state.receipts[i]);
          if (document.activeElement !== pInput) pInput.value = String(state.payments[i]);
        }
        openingCells[i].textContent = money(row.opening);
        closingCells[i].textContent = money(row.closing);
        rowNodes[i].className = row.closing < 0 ? "short" : "";
      });
      var below = forecast.below.length ? " Weeks below zero: " + forecast.below.join(", ") + "." : " No week closes below zero.";
      summary.textContent = "Lowest closing cash " + money(forecast.low) + " in week " + forecast.lowWeek + "." + below;
      outside.textContent = forecast.outside
        ? "Delayed collections: receipts planned for week 13 (" + money(forecast.outside) + ") fall outside this 13-week window."
        : (state.stress ? "Stress test is on. Week cells show the stressed forecast. The base plan is kept underneath." : "Closing cash = opening cash + receipts − payments. Next week opens with this week’s closing cash.");
    }

    function commit() {
      read();
      save("cash", state);
      render();
    }

    [openingInput, stress, delay, fewer, down, vetAmt, vetWeek].forEach(function (node) {
      node.addEventListener("input", commit);
      node.addEventListener("change", commit);
    });

    var applyFill = el("button", { type: "button", text: "Fill every week" });
    applyFill.addEventListener("click", function () {
      var r = num(fillR.value);
      var p = num(fillP.value);
      for (var w = 0; w < 13; w += 1) {
        state.receipts[w] = r;
        state.payments[w] = p;
        receiptInputs[w].value = String(r);
        paymentInputs[w].value = String(p);
      }
      commit();
    });
    var clear = el("button", { type: "button", text: "Clear amounts" });
    clear.addEventListener("click", function () {
      state = blankCash();
      openingInput.value = "0";
      stress.checked = false;
      delay.checked = false;
      fewer.value = "0";
      down.value = "0";
      vetAmt.value = "0";
      vetWeek.value = "1";
      commit();
    });

    root.appendChild(el("div", { class: "inline-fields" }, [
      field("Opening cash ($)", openingInput),
      field("Receipts to copy into every week ($)", fillR),
      field("Payments to copy into every week ($)", fillP),
      applyFill,
      clear
    ]));
    root.appendChild(el("div", { class: "callout" }, [
      el("label", { class: "choice" }, [stress, "Stress-test the plan"]),
      el("p", { class: "fine", text: "The packet names these scenarios and does not set the dollar amounts. Order when the toggle is on: delay collections one week, then reduce receipts, then zero a downtime week, then add a veterinary bill." }),
      el("div", { class: "inline-fields" }, [
        el("label", { class: "choice" }, [delay, "Delay collections one week"]),
        field("Fewer jobs: cut receipts by (%)", fewer),
        field("Dog downtime week", down),
        field("Unexpected veterinary bill ($)", vetAmt),
        field("Veterinary bill week", vetWeek)
      ])
    ]));
    var table = el("table", null, [
      el("caption", { class: "fine", text: "Thirteen-week cash forecast. Enter cash when it is expected to arrive or leave." }),
      el("thead", null, [el("tr", null, [
        el("th", { text: "Week", scope: "col" }),
        el("th", { text: "Opening", scope: "col" }),
        el("th", { text: "Receipts", scope: "col" }),
        el("th", { text: "Payments", scope: "col" }),
        el("th", { text: "Closing", scope: "col" })
      ])]),
      tbody
    ]);
    root.appendChild(table);
    root.appendChild(summary);
    root.appendChild(outside);
    root.appendChild(privacyLine());
    render();
    onStore("cash", function (next) {
      if (!next) return;
      state = normalizeCash(next);
      if (document.activeElement !== openingInput) openingInput.value = String(state.opening);
      stress.checked = state.stress;
      delay.checked = state.delay;
      if (document.activeElement !== fewer) fewer.value = String(state.fewerPct);
      down.value = String(state.downWeek);
      if (document.activeElement !== vetAmt) vetAmt.value = String(state.vetAmount);
      vetWeek.value = String(state.vetWeek);
      render();
    });
    global.AK9I_CASH = cashForecast;
  }

  function initNiche(root) {
    var state = load("niche", { q1: "", q2: "", q3: "" });
    var result = el("div", { id: "niche-result", "aria-live": "polite" });

    function choice(name, value, text) {
      var input = el("input", { type: "radio", name: name, value: value });
      if (state[name] === value) input.checked = true;
      input.addEventListener("change", function () {
        state[name] = value;
        save("niche", state);
        render();
      });
      return el("label", { class: "choice" }, [input, text]);
    }

    function paragraph(text) {
      return el("p", { text: text });
    }

    function render() {
      result.textContent = "";
      if (!state.q1 || !state.q2 || !state.q3) {
        result.appendChild(paragraph("Answer all three questions. The result is a thinking aid for class, not a license determination or a reason to launch."));
        return;
      }
      var primary = NICHES[state.q1];
      var second = NICHES[state.q2];
      if (state.q3 === "assume") {
        result.appendChild(el("div", { class: "callout warn" }, [
          paragraph("Do not assume another party’s registration, or a commercial package, covers your possession, transport, or storage. Resolve authorization before acquiring aids. Non-detonable or packaged explosive aids should not be assumed exempt.")
        ]));
      }
      if (state.q1 !== state.q2) {
        result.appendChild(el("div", { class: "callout warn" }, [
          paragraph("A dog trained for one target does not establish competence in another. Your buyer and your alert rule point at different services. Choose one service before you invest.")
        ]));
      }
      var show = state.q1 === state.q2 ? [primary] : [primary, second];
      show.forEach(function (niche) {
        var card = el("div", { class: "card" }, [
          el("h3", { text: niche.name }),
          paragraph("Buyers: " + niche.buyers),
          paragraph("Resolve first: " + niche.requirements),
          paragraph("Commercial starting point: " + niche.start),
          paragraph(niche.bounds)
        ]);
        result.appendChild(card);
      });
      if ((state.q1 === "narcotics" && state.q3 !== "dea" && state.q3 !== "assume") ||
          (state.q1 === "explosives" && state.q3 !== "atf" && state.q3 !== "assume")) {
        result.appendChild(paragraph(state.q1 === "narcotics"
          ? "Before acquiring controlled-substance training aids, contact DEA Diversion and the state controlled-substance regulator. DEA lists canine handlers under Form 225."
          : "Ask ATF which license or permit, if any, is needed. Also check state and local fire, zoning, and security requirements. Obtain a compliant storage plan rather than picking a magazine type from a student guide."));
      }
      if ((state.q1 === "bedbug" || state.q1 === "mold") && (state.q3 === "dea" || state.q3 === "atf")) {
        result.appendChild(paragraph("Your aid answer is the path for a different service. Ask the regulator about the aids you will actually possess, and do not buy regulated aids for a service you are not authorized to perform."));
      }
      result.appendChild(el("p", { class: "fine", text: "Certification scope, customer requirements, and insurance must match the service you sell. Do not choose a niche from a national price list alone." }));
    }

    root.appendChild(el("fieldset", null, [
      el("legend", { text: "1. Which buyer can you realistically reach in your travel area?" }),
      choice("q1", "bedbug", "Pest management firms, hotels, or property managers"),
      choice("q1", "mold", "Inspectors, owners, or property managers dealing with moisture and mold questions"),
      choice("q1", "narcotics", "Employers, schools, or other private clients who can authorize a search"),
      choice("q1", "explosives", "Venues, security contractors, or cargo operators")
    ]));
    root.appendChild(el("fieldset", null, [
      el("legend", { text: "2. What will you do with an alert?" }),
      choice("q2", "bedbug", "Locate possible activity and hand confirmation to a qualified pest professional"),
      choice("q2", "mold", "Guide further investigation only. I will not identify a species, diagnose, or clear the building"),
      choice("q2", "narcotics", "Report to the person the customer named. I will not call the alert proof"),
      choice("q2", "explosives", "Hand off to the client’s emergency plan and public safety. I will not promise a bomb-free clearance")
    ]));
    root.appendChild(el("fieldset", null, [
      el("legend", { text: "3. What is true about training aids?" }),
      choice("q3", "none", "I will not possess controlled-substance or explosive aids unless the right regulator says I may"),
      choice("q3", "dea", "I will contact DEA Diversion and the state regulator before I possess controlled-substance aids"),
      choice("q3", "atf", "I will ask ATF, and state and local fire, zoning, and security, before I possess explosive aids"),
      choice("q3", "assume", "Someone else’s registration, or a packaged aid, means I can store and transport aids now")
    ]));
    root.appendChild(result);
    var clear = el("button", { type: "button", text: "Clear my answers" });
    clear.addEventListener("click", function () {
      state = { q1: "", q2: "", q3: "" };
      root.querySelectorAll("input[type=radio]").forEach(function (input) { input.checked = false; });
      save("niche", state);
      render();
    });
    root.appendChild(clear);
    root.appendChild(privacyLine());
    render();
    onStore("niche", function (next) {
      if (!next) return;
      state = next;
      root.querySelectorAll("input[type=radio]").forEach(function (input) {
        input.checked = state[input.name] === input.value;
      });
      render();
    });
  }

  function initInterview(root) {
    var defaults = {
      niche: "bedbug",
      segment: "",
      area: "",
      scope: "",
      deliverable: "",
      schedule: "",
      price: "",
      notes: ["", "", "", "", "", "", "", ""],
      count: 0,
      alternatives: ["", "", ""]
    };
    var state = load("interviews", defaults);
    if (!state.notes || state.notes.length !== 8) state.notes = defaults.notes.slice();
    if (!state.alternatives || state.alternatives.length !== 3) state.alternatives = ["", "", ""];

    var niche = el("select", { id: "interview-niche" }, [
      el("option", { value: "bedbug", text: "Bed bug detection" }),
      el("option", { value: "mold", text: "Mold detection" }),
      el("option", { value: "narcotics", text: "Private narcotics detection" }),
      el("option", { value: "explosives", text: "Explosives detection" })
    ]);
    niche.value = state.niche || "bedbug";
    var segment = el("input", { id: "interview-segment", type: "text", value: state.segment || "", placeholder: "Example: pest management firms" });
    var area = el("input", { id: "interview-area", type: "text", value: state.area || "", placeholder: "Your practical driving area" });
    var scope = el("input", { type: "text", value: state.scope || "", placeholder: "Scope" });
    var deliverable = el("input", { type: "text", value: state.deliverable || "", placeholder: "Deliverable" });
    var schedule = el("input", { type: "text", value: state.schedule || "", placeholder: "Scheduling" });
    var price = el("input", { type: "text", value: state.price || "", placeholder: "Estimated price" });
    var count = el("input", { id: "interview-count", type: "number", min: "0", max: "10", step: "1", value: String(state.count || 0) });
    var altInputs = [0, 1, 2].map(function (i) {
      return el("input", { type: "text", value: state.alternatives[i] || "", "aria-label": "Alternative " + (i + 1), placeholder: "Alternative " + (i + 1) });
    });
    var noteInputs = [];
    var list = el("ol", { id: "interview-questions" });

    function questions() {
      var who = segment.value.trim() || "the buyer";
      var where = area.value.trim();
      return [
        "What event triggers the need for " + who + (where ? " (" + where + ")" : "") + "?",
        "How do you handle the problem today?",
        "When did you last pay for a related service?",
        "Who approves the purchase, and what evidence or credentials do you require?",
        "Who is the current provider or alternative?",
        "What frequency, budget, and payment terms are typical?",
        "Offer to test: scope “" + (scope.value.trim() || "…") + "”, deliverable “" + (deliverable.value.trim() || "…") + "”, scheduling “" + (schedule.value.trim() || "…") + "”, estimated price “" + (price.value.trim() || "…") + "”. What objections do you have?",
        "Once we are authorized and ready, would you consider a paid pilot?"
      ];
    }

    function renderList() {
      var qs = questions();
      list.textContent = "";
      qs.forEach(function (q, i) {
        if (!noteInputs[i]) {
          noteInputs[i] = el("textarea", { rows: "2", "aria-label": "Notes for question " + (i + 1) });
          noteInputs[i].value = state.notes[i] || "";
          noteInputs[i].addEventListener("input", commit);
        }
        list.appendChild(el("li", null, [el("p", { text: q }), noteInputs[i]]));
      });
    }

    function commit() {
      state = {
        niche: niche.value,
        segment: segment.value,
        area: area.value,
        scope: scope.value,
        deliverable: deliverable.value,
        schedule: schedule.value,
        price: price.value,
        notes: noteInputs.map(function (n) { return n.value; }),
        count: Math.max(0, Math.min(10, num(count.value))),
        alternatives: altInputs.map(function (n) { return n.value; })
      };
      save("interviews", state);
      renderList();
      updateCount();
    }

    var countLabel = el("p", { id: "interview-tally" });
    function updateCount() {
      var named = state.alternatives.filter(function (a) { return a.trim(); }).length;
      countLabel.textContent = "Interviews recorded: " + state.count + " of a suggested target of 10. Alternatives named: " + named + " of a suggested target of 3. These targets are research goals, not proof that a market exists.";
    }

    [niche, segment, area, scope, deliverable, schedule, price, count].concat(altInputs).forEach(function (node) {
      node.addEventListener("input", commit);
      node.addEventListener("change", commit);
    });

    var copy = el("button", { type: "button", class: "primary", text: "Copy question list" });
    var copyStatus = el("p", { class: "fine", id: "interview-copy-status", "aria-live": "polite" });
    copy.addEventListener("click", function () {
      var text = questions().map(function (q, i) { return (i + 1) + ". " + q; }).join("\n");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copyStatus.textContent = "Copied to the clipboard on this device.";
        }, function () {
          copyStatus.textContent = "Clipboard was blocked. Select the questions on screen instead.";
        });
      } else {
        copyStatus.textContent = "Clipboard is not available. Select the questions on screen instead.";
      }
    });

    root.appendChild(el("div", { class: "inline-fields" }, [
      field("Service you are testing", niche),
      field("One buyer segment", segment),
      field("Travel area", area)
    ]));
    root.appendChild(el("p", { class: "fine", text: "Suggested first cycle from the packet: one segment inside a practical driving radius, such as pest management firms, rather than every property owner in the state." }));
    root.appendChild(el("div", { class: "inline-fields" }, [
      field("Offer scope", scope),
      field("Deliverable", deliverable),
      field("Scheduling", schedule),
      field("Estimated price", price)
    ]));
    root.appendChild(list);
    root.appendChild(el("div", { class: "inline-fields" }, [
      field("Interviews completed (0–10)", count),
      field("Alternative 1", altInputs[0]),
      field("Alternative 2", altInputs[1]),
      field("Alternative 3", altInputs[2])
    ]));
    root.appendChild(countLabel);
    root.appendChild(copy);
    root.appendChild(copyStatus);
    root.appendChild(el("div", { class: "callout" }, [
      el("p", { text: "Proceed when licensing is feasible, the service can be delivered competently, buyers show credible purchase interest, and the price can cover costs. Revise the offer or pause investment when one of those conditions is missing." })
    ]));
    root.appendChild(privacyLine());
    renderList();
    updateCount();
  }

  var PLAN_PROMPTS = [
    ["Customer and buying trigger", "Who pays, and why now?"],
    ["Service and scope", "What do you provide, and what do you exclude?"],
    ["Evidence and differentiation", "Why should a buyer trust this team?"],
    ["Delivery and capacity", "Travel area, staffing, dog rest, and backup?"],
    ["Pricing and payment", "Minimum fee, terms, and repeat service?"],
    ["Sales route", "Referrals, outbound contact, or contracting?"],
    ["Economics and capital", "Startup cost, fixed cost, and cash reserve?"],
    ["Next decision", "What evidence must you collect next?"]
  ];

  function initPlan(root) {
    var state = load("plan", PLAN_PROMPTS.map(function () { return ""; }));
    if (!state || state.length !== 8) state = PLAN_PROMPTS.map(function () { return ""; });
    var grid = el("div", { class: "cols" });
    PLAN_PROMPTS.forEach(function (pair, i) {
      var area = el("textarea", { rows: "3", "aria-label": pair[0] });
      area.value = state[i] || "";
      area.addEventListener("input", function () {
        state[i] = area.value;
        save("plan", state);
      });
      grid.appendChild(el("label", null, [
        pair[0],
        el("span", { class: "fine", text: pair[1] }),
        area
      ]));
    });
    root.appendChild(el("p", { text: "Keep the plan short enough to update after each conversation. Use an SBDC advisor to challenge the assumptions." }));
    root.appendChild(grid);
    root.appendChild(privacyLine());
  }

  var READY = [
    "The service, target odors, buyer, and travel area are defined.",
    "Customer interviews support a viable offer and price.",
    "Company, handler, location, and aid permissions are resolved.",
    "Insurance expressly covers the service and client requirements.",
    "Team performance and accepted certification are current.",
    "Training, aid control, welfare, transport, and backup plans work.",
    "Access authorization, client terms, and response plan are written.",
    "Report template separates observations, confirmation, and limits.",
    "Bookkeeping, billing, tax calendar, and collections are established.",
    "Startup funding and cash forecast cover credible downside cases.",
    "Sensitive data, reports, and credentials are stored securely.",
    "A client follow-up and repeat-service process is scheduled."
  ];

  function initReadiness(root) {
    var state = load("readiness", READY.map(function () { return { status: "open", note: "" }; }));
    if (!state || state.length !== READY.length) {
      state = READY.map(function () { return { status: "open", note: "" }; });
    }
    var tally = el("p", { id: "readiness-tally" });
    var list = el("div", { class: "ready-grid" });

    function updateTally() {
      var done = state.filter(function (item) { return item.status === "done"; }).length;
      var na = state.filter(function (item) { return item.status === "na" && item.note.trim(); }).length;
      var naBlank = state.filter(function (item) { return item.status === "na" && !item.note.trim(); }).length;
      tally.textContent = done + " marked done. " + na + " marked not applicable with a reason. " + (READY.length - done - na) + " still open" + (naBlank ? ", including a “not applicable” that still needs a reason." : ".");
    }

    READY.forEach(function (label, i) {
      var status = state[i] && state[i].status ? state[i].status : "open";
      var note = el("input", { type: "text", value: (state[i] && state[i].note) || "", placeholder: "Evidence location, or why it does not apply", "aria-label": "Note for: " + label });
      var select = el("select", { "aria-label": "Status for: " + label }, [
        el("option", { value: "open", text: "Still open" }),
        el("option", { value: "done", text: "Done" }),
        el("option", { value: "na", text: "Does not apply" })
      ]);
      select.value = status;
      select.addEventListener("change", function () {
        state[i].status = select.value;
        save("readiness", state);
        updateTally();
      });
      note.addEventListener("input", function () {
        state[i].note = note.value;
        save("readiness", state);
        updateTally();
      });
      list.appendChild(el("div", { class: "check-item" }, [
        el("p", { text: label }),
        select,
        note
      ]));
    });

    root.appendChild(el("p", { text: "Mark each item complete or explain why it does not apply. Keep the evidence with your business records." }));
    root.appendChild(tally);
    root.appendChild(list);
    root.appendChild(el("div", { class: "callout warn" }, [
      el("p", { text: "Open items that affect legal authority, safety, required credentials, or team competence must be resolved before work starts. This checklist is not an approval. Ask a qualified advisor about uncertainties." })
    ]));
    root.appendChild(privacyLine());
    updateTally();
  }

  function initPlanner(root) {
    var starters = [
      "Book an SBDC appointment and bring a one-page business concept and rough budget.",
      "Ask the relevant licensing agencies to classify the exact service and training-aid activities.",
      "Interview prospective buyers before committing to major purchases."
    ];
    var blank = starters.map(function (action) {
      return { action: action, owner: "", due: "", evidence: "" };
    });
    var state = load("planner", blank);
    if (!state || state.length !== 3) state = blank;

    var rows = el("div", { id: "planner-rows" });
    var inputs = [];
    state.forEach(function (item, i) {
      var action = el("textarea", { rows: "2", "aria-label": "Action " + (i + 1) });
      var owner = el("input", { type: "text", "aria-label": "Owner " + (i + 1) });
      var due = el("input", { type: "text", "aria-label": "Due date " + (i + 1), placeholder: "Due date" });
      var evidence = el("input", { type: "text", "aria-label": "Completion evidence " + (i + 1), placeholder: "What “done” looks like" });
      action.value = item.action || "";
      owner.value = item.owner || "";
      due.value = item.due || "";
      evidence.value = item.evidence || "";
      [action, owner, due, evidence].forEach(function (node) { node.addEventListener("input", commit); });
      inputs.push({ action: action, owner: owner, due: due, evidence: evidence });
      rows.appendChild(el("fieldset", null, [
        el("legend", { text: "Action " + (i + 1) }),
        field("Action", action),
        el("div", { class: "inline-fields" }, [
          field("Owner", owner),
          field("Due date", due),
          field("Completion evidence", evidence)
        ])
      ]));
    });

    function snapshot() {
      return inputs.map(function (row) {
        return { action: row.action.value, owner: row.owner.value, due: row.due.value, evidence: row.evidence.value };
      });
    }

    function commit() {
      state = snapshot();
      save("planner", state);
    }

    function asText() {
      return snapshot().map(function (row, i) {
        return [
          "Action " + (i + 1) + ": " + row.action,
          "Owner: " + row.owner,
          "Due: " + row.due,
          "Completion evidence: " + row.evidence
        ].join("\n");
      }).join("\n\n") + "\n\nAK9I Student Business Session, Nov 13, 2026. Planning notes saved on this device only.\n";
    }

    var download = el("button", { type: "button", class: "primary", text: "Download as a text file" });
    download.addEventListener("click", function () {
      commit();
      var blob = new Blob([asText()], { type: "text/plain" });
      var url = URL.createObjectURL(blob);
      var a = el("a", { href: url, download: "ak9i-next-three-actions.txt" });
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
    var printBtn = el("button", { type: "button", text: "Print these three actions" });
    printBtn.addEventListener("click", function () {
      commit();
      var slide = root.closest(".slide");
      document.body.classList.add("print-planner");
      if (slide) slide.classList.add("is-print-target");
      window.print();
      document.body.classList.remove("print-planner");
      if (slide) slide.classList.remove("is-print-target");
    });

    root.appendChild(el("p", { text: "The three lines start with the packet’s first actions. Replace them with yours. Add another dog, employee, niche, or service area only when demand, contribution, cash, supervision, licensing, and welfare capacity support it." }));
    root.appendChild(rows);
    root.appendChild(el("div", { class: "inline-fields" }, [download, printBtn]));
    root.appendChild(privacyLine());
  }

  function initDirectory(root) {
    var states = global.AK9I_DIRECTORY || [];
    var select = el("select", { id: "state-select", "aria-label": "State or territory" });
    states.forEach(function (item, i) {
      select.appendChild(el("option", { value: String(i), text: item.name }));
    });
    var virginia = states.findIndex(function (item) { return item.name === "Virginia"; });
    select.value = String(virginia >= 0 ? virginia : 0);
    var out = el("div", { id: "state-results" });

    function anchor(item) {
      var a = el("a", { href: item.href, target: "_blank", rel: "noopener noreferrer", text: item.label + ": " + item.href.replace(/^https:\/\//, "") });
      return el("li", null, [a]);
    }

    function render() {
      var item = states[parseInt(select.value, 10)];
      out.textContent = "";
      if (!item) return;
      var sbdc = el("ul");
      item.sbdc.forEach(function (link) { sbdc.appendChild(anchor(link)); });
      out.appendChild(el("div", { class: "cols" }, [
        el("div", { class: "card" }, [el("h3", { text: "SBDC" }), sbdc]),
        el("div", { class: "card" }, [el("h3", { text: "Economic development" }), el("ul", null, [anchor(item.economic)])]),
        el("div", { class: "card" }, [el("h3", { text: "Veterans services" }), el("ul", null, [anchor(item.veterans)])]),
        el("div", { class: "card" }, [el("h3", { text: "Workforce" }), el("ul", null, [anchor(item.workforce)])])
      ]));
    }

    select.addEventListener("change", render);
    root.appendChild(el("label", null, ["Select a state, DC, or Puerto Rico", select]));
    root.appendChild(out);
    root.appendChild(el("p", { class: "fine", text: "These are navigation starting points from the October 2026.1 packet, not eligibility or licensing determinations. Local city and county programs can differ. SBA, VBOC, SCORE, APEX, and SBIR support: use the national finders, not a guessed nearest office." }));
    render();
  }

  function initReveals(scope) {
    scope.querySelectorAll(".js-reveal").forEach(function (button) {
      if (button.dataset.bound) return;
      button.dataset.bound = "1";
      var answer = button.parentElement.querySelector(".answer");
      button.addEventListener("click", function () {
        var open = answer.hasAttribute("hidden");
        if (open) answer.removeAttribute("hidden");
        else answer.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", open ? "true" : "false");
        button.textContent = open ? "Hide answer" : "Show answer";
      });
    });
  }

  function init(scope) {
    var root = scope || document;
    var be = root.querySelector("#break-even-tool");
    if (be && !be.dataset.ready) { be.dataset.ready = "1"; initBreakEven(be); }
    var cash = root.querySelector("#cash-tool");
    if (cash && !cash.dataset.ready) { cash.dataset.ready = "1"; initCash(cash); }
    var niche = root.querySelector("#niche-tool");
    if (niche && !niche.dataset.ready) { niche.dataset.ready = "1"; initNiche(niche); }
    var interview = root.querySelector("#interview-tool");
    if (interview && !interview.dataset.ready) { interview.dataset.ready = "1"; initInterview(interview); }
    var plan = root.querySelector("#plan-tool");
    if (plan && !plan.dataset.ready) { plan.dataset.ready = "1"; initPlan(plan); }
    var ready = root.querySelector("#readiness-tool");
    if (ready && !ready.dataset.ready) { ready.dataset.ready = "1"; initReadiness(ready); }
    var planner = root.querySelector("#planner-tool");
    if (planner && !planner.dataset.ready) { planner.dataset.ready = "1"; initPlanner(planner); }
    var directory = root.querySelector("#state-tool");
    if (directory && !directory.dataset.ready) { directory.dataset.ready = "1"; initDirectory(directory); }
    initReveals(root);
  }

  global.AK9ITools = { init: init, breakEven: breakEven, cashForecast: cashForecast };
})(window);

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const tt = globalThis, gt = tt.ShadowRoot && (tt.ShadyCSS === void 0 || tt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, mt = Symbol(), xt = /* @__PURE__ */ new WeakMap();
let qt = class {
  constructor(t, i, s) {
    if (this._$cssResult$ = !0, s !== mt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = i;
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (gt && t === void 0) {
      const s = i !== void 0 && i.length === 1;
      s && (t = xt.get(i)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && xt.set(i, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const ie = (e) => new qt(typeof e == "string" ? e : e + "", void 0, mt), A = (e, ...t) => {
  const i = e.length === 1 ? e[0] : t.reduce((s, n, r) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + e[r + 1], e[0]);
  return new qt(i, e, mt);
}, se = (e, t) => {
  if (gt) e.adoptedStyleSheets = t.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of t) {
    const s = document.createElement("style"), n = tt.litNonce;
    n !== void 0 && s.setAttribute("nonce", n), s.textContent = i.cssText, e.appendChild(s);
  }
}, yt = gt ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let i = "";
  for (const s of t.cssRules) i += s.cssText;
  return ie(i);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: ne, defineProperty: re, getOwnPropertyDescriptor: oe, getOwnPropertyNames: ae, getOwnPropertySymbols: le, getPrototypeOf: ce } = Object, ot = globalThis, At = ot.trustedTypes, de = At ? At.emptyScript : "", he = ot.reactiveElementPolyfillSupport, q = (e, t) => e, it = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? de : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let i = e;
  switch (t) {
    case Boolean:
      i = e !== null;
      break;
    case Number:
      i = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(e);
      } catch {
        i = null;
      }
  }
  return i;
} }, ft = (e, t) => !ne(e, t), kt = { attribute: !0, type: String, converter: it, reflect: !1, useDefault: !1, hasChanged: ft };
Symbol.metadata ??= Symbol("metadata"), ot.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let I = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, i = kt) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(t, i), !i.noAccessor) {
      const s = Symbol(), n = this.getPropertyDescriptor(t, s, i);
      n !== void 0 && re(this.prototype, t, n);
    }
  }
  static getPropertyDescriptor(t, i, s) {
    const { get: n, set: r } = oe(this.prototype, t) ?? { get() {
      return this[i];
    }, set(o) {
      this[i] = o;
    } };
    return { get: n, set(o) {
      const d = n?.call(this);
      r?.call(this, o), this.requestUpdate(t, d, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? kt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(q("elementProperties"))) return;
    const t = ce(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(q("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(q("properties"))) {
      const i = this.properties, s = [...ae(i), ...le(i)];
      for (const n of s) this.createProperty(n, i[n]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const i = litPropertyMetadata.get(t);
      if (i !== void 0) for (const [s, n] of i) this.elementProperties.set(s, n);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, s] of this.elementProperties) {
      const n = this._$Eu(i, s);
      n !== void 0 && this._$Eh.set(n, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const i = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const n of s) i.unshift(yt(n));
    } else t !== void 0 && i.push(yt(t));
    return i;
  }
  static _$Eu(t, i) {
    const s = i.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const s of i.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return se(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, i, s) {
    this._$AK(t, s);
  }
  _$ET(t, i) {
    const s = this.constructor.elementProperties.get(t), n = this.constructor._$Eu(t, s);
    if (n !== void 0 && s.reflect === !0) {
      const r = (s.converter?.toAttribute !== void 0 ? s.converter : it).toAttribute(i, s.type);
      this._$Em = t, r == null ? this.removeAttribute(n) : this.setAttribute(n, r), this._$Em = null;
    }
  }
  _$AK(t, i) {
    const s = this.constructor, n = s._$Eh.get(t);
    if (n !== void 0 && this._$Em !== n) {
      const r = s.getPropertyOptions(n), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : it;
      this._$Em = n;
      const d = o.fromAttribute(i, r.type);
      this[n] = d ?? this._$Ej?.get(n) ?? d, this._$Em = null;
    }
  }
  requestUpdate(t, i, s, n = !1, r) {
    if (t !== void 0) {
      const o = this.constructor;
      if (n === !1 && (r = this[t]), s ??= o.getPropertyOptions(t), !((s.hasChanged ?? ft)(r, i) || s.useDefault && s.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, s)))) return;
      this.C(t, i, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, i, { useDefault: s, reflect: n, wrapped: r }, o) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? i ?? this[t]), r !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (i = void 0), this._$AL.set(t, i)), n === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [n, r] of this._$Ep) this[n] = r;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [n, r] of s) {
        const { wrapped: o } = r, d = this[n];
        o !== !0 || this._$AL.has(n) || d === void 0 || this.C(n, void 0, r, d);
      }
    }
    let t = !1;
    const i = this._$AL;
    try {
      t = this.shouldUpdate(i), t ? (this.willUpdate(i), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
    }
    t && this._$AE(i);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((i) => i.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((i) => this._$ET(i, this[i])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
I.elementStyles = [], I.shadowRootOptions = { mode: "open" }, I[q("elementProperties")] = /* @__PURE__ */ new Map(), I[q("finalized")] = /* @__PURE__ */ new Map(), he?.({ ReactiveElement: I }), (ot.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const _t = globalThis, St = (e) => e, st = _t.trustedTypes, Ct = st ? st.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Ft = "$lit$", C = `lit$${Math.random().toFixed(9).slice(2)}$`, Kt = "?" + C, pe = `<${Kt}>`, O = document, K = () => O.createComment(""), Z = (e) => e === null || typeof e != "object" && typeof e != "function", bt = Array.isArray, ue = (e) => bt(e) || typeof e?.[Symbol.iterator] == "function", ct = `[ 	
\f\r]`, B = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Mt = /-->/g, Et = />/g, E = RegExp(`>|${ct}(?:([^\\s"'>=/]+)(${ct}*=${ct}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Lt = /'/g, Tt = /"/g, Zt = /^(?:script|style|textarea|title)$/i, ge = (e) => (t, ...i) => ({ _$litType$: e, strings: t, values: i }), a = ge(1), D = Symbol.for("lit-noChange"), c = Symbol.for("lit-nothing"), Pt = /* @__PURE__ */ new WeakMap(), P = O.createTreeWalker(O, 129);
function Gt(e, t) {
  if (!bt(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ct !== void 0 ? Ct.createHTML(t) : t;
}
const me = (e, t) => {
  const i = e.length - 1, s = [];
  let n, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = B;
  for (let d = 0; d < i; d++) {
    const l = e[d];
    let u, g, h = -1, m = 0;
    for (; m < l.length && (o.lastIndex = m, g = o.exec(l), g !== null); ) m = o.lastIndex, o === B ? g[1] === "!--" ? o = Mt : g[1] !== void 0 ? o = Et : g[2] !== void 0 ? (Zt.test(g[2]) && (n = RegExp("</" + g[2], "g")), o = E) : g[3] !== void 0 && (o = E) : o === E ? g[0] === ">" ? (o = n ?? B, h = -1) : g[1] === void 0 ? h = -2 : (h = o.lastIndex - g[2].length, u = g[1], o = g[3] === void 0 ? E : g[3] === '"' ? Tt : Lt) : o === Tt || o === Lt ? o = E : o === Mt || o === Et ? o = B : (o = E, n = void 0);
    const S = o === E && e[d + 1].startsWith("/>") ? " " : "";
    r += o === B ? l + pe : h >= 0 ? (s.push(u), l.slice(0, h) + Ft + l.slice(h) + C + S) : l + C + (h === -2 ? d : S);
  }
  return [Gt(e, r + (e[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class G {
  constructor({ strings: t, _$litType$: i }, s) {
    let n;
    this.parts = [];
    let r = 0, o = 0;
    const d = t.length - 1, l = this.parts, [u, g] = me(t, i);
    if (this.el = G.createElement(u, s), P.currentNode = this.el.content, i === 2 || i === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (n = P.nextNode()) !== null && l.length < d; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const h of n.getAttributeNames()) if (h.endsWith(Ft)) {
          const m = g[o++], S = n.getAttribute(h).split(C), X = /([.?@])?(.*)/.exec(m);
          l.push({ type: 1, index: r, name: X[2], strings: S, ctor: X[1] === "." ? _e : X[1] === "?" ? be : X[1] === "@" ? ve : at }), n.removeAttribute(h);
        } else h.startsWith(C) && (l.push({ type: 6, index: r }), n.removeAttribute(h));
        if (Zt.test(n.tagName)) {
          const h = n.textContent.split(C), m = h.length - 1;
          if (m > 0) {
            n.textContent = st ? st.emptyScript : "";
            for (let S = 0; S < m; S++) n.append(h[S], K()), P.nextNode(), l.push({ type: 2, index: ++r });
            n.append(h[m], K());
          }
        }
      } else if (n.nodeType === 8) if (n.data === Kt) l.push({ type: 2, index: r });
      else {
        let h = -1;
        for (; (h = n.data.indexOf(C, h + 1)) !== -1; ) l.push({ type: 7, index: r }), h += C.length - 1;
      }
      r++;
    }
  }
  static createElement(t, i) {
    const s = O.createElement("template");
    return s.innerHTML = t, s;
  }
}
function N(e, t, i = e, s) {
  if (t === D) return t;
  let n = s !== void 0 ? i._$Co?.[s] : i._$Cl;
  const r = Z(t) ? void 0 : t._$litDirective$;
  return n?.constructor !== r && (n?._$AO?.(!1), r === void 0 ? n = void 0 : (n = new r(e), n._$AT(e, i, s)), s !== void 0 ? (i._$Co ??= [])[s] = n : i._$Cl = n), n !== void 0 && (t = N(e, n._$AS(e, t.values), n, s)), t;
}
class fe {
  constructor(t, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: i }, parts: s } = this._$AD, n = (t?.creationScope ?? O).importNode(i, !0);
    P.currentNode = n;
    let r = P.nextNode(), o = 0, d = 0, l = s[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let u;
        l.type === 2 ? u = new J(r, r.nextSibling, this, t) : l.type === 1 ? u = new l.ctor(r, l.name, l.strings, this, t) : l.type === 6 && (u = new we(r, this, t)), this._$AV.push(u), l = s[++d];
      }
      o !== l?.index && (r = P.nextNode(), o++);
    }
    return P.currentNode = O, n;
  }
  p(t) {
    let i = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, i), i += s.strings.length - 2) : s._$AI(t[i])), i++;
  }
}
class J {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, i, s, n) {
    this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = s, this.options = n, this._$Cv = n?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && t?.nodeType === 11 && (t = i.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, i = this) {
    t = N(this, t, i), Z(t) ? t === c || t == null || t === "" ? (this._$AH !== c && this._$AR(), this._$AH = c) : t !== this._$AH && t !== D && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : ue(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== c && Z(this._$AH) ? this._$AA.nextSibling.data = t : this.T(O.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: i, _$litType$: s } = t, n = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = G.createElement(Gt(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === n) this._$AH.p(i);
    else {
      const r = new fe(n, this), o = r.u(this.options);
      r.p(i), this.T(o), this._$AH = r;
    }
  }
  _$AC(t) {
    let i = Pt.get(t.strings);
    return i === void 0 && Pt.set(t.strings, i = new G(t)), i;
  }
  k(t) {
    bt(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, n = 0;
    for (const r of t) n === i.length ? i.push(s = new J(this.O(K()), this.O(K()), this, this.options)) : s = i[n], s._$AI(r), n++;
    n < i.length && (this._$AR(s && s._$AB.nextSibling, n), i.length = n);
  }
  _$AR(t = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); t !== this._$AB; ) {
      const s = St(t).nextSibling;
      St(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class at {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, s, n, r) {
    this.type = 1, this._$AH = c, this._$AN = void 0, this.element = t, this.name = i, this._$AM = n, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = c;
  }
  _$AI(t, i = this, s, n) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) t = N(this, t, i, 0), o = !Z(t) || t !== this._$AH && t !== D, o && (this._$AH = t);
    else {
      const d = t;
      let l, u;
      for (t = r[0], l = 0; l < r.length - 1; l++) u = N(this, d[s + l], i, l), u === D && (u = this._$AH[l]), o ||= !Z(u) || u !== this._$AH[l], u === c ? t = c : t !== c && (t += (u ?? "") + r[l + 1]), this._$AH[l] = u;
    }
    o && !n && this.j(t);
  }
  j(t) {
    t === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class _e extends at {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === c ? void 0 : t;
  }
}
class be extends at {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== c);
  }
}
class ve extends at {
  constructor(t, i, s, n, r) {
    super(t, i, s, n, r), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = N(this, t, i, 0) ?? c) === D) return;
    const s = this._$AH, n = t === c && s !== c || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, r = t !== c && (s === c || n);
    n && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class we {
  constructor(t, i, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    N(this, t);
  }
}
const $e = _t.litHtmlPolyfillSupport;
$e?.(G, J), (_t.litHtmlVersions ??= []).push("3.3.3");
const xe = (e, t, i) => {
  const s = i?.renderBefore ?? t;
  let n = s._$litPart$;
  if (n === void 0) {
    const r = i?.renderBefore ?? null;
    s._$litPart$ = n = new J(t.insertBefore(K(), r), r, void 0, i ?? {});
  }
  return n._$AI(e), n;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const vt = globalThis;
class w extends I {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = xe(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return D;
  }
}
w._$litElement$ = !0, w.finalized = !0, vt.litElementHydrateSupport?.({ LitElement: w });
const ye = vt.litElementPolyfillSupport;
ye?.({ LitElement: w });
(vt.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const R = (e) => (t, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ae = { attribute: !0, type: String, converter: it, reflect: !1, hasChanged: ft }, ke = (e = Ae, t, i) => {
  const { kind: s, metadata: n } = i;
  let r = globalThis.litPropertyMetadata.get(n);
  if (r === void 0 && globalThis.litPropertyMetadata.set(n, r = /* @__PURE__ */ new Map()), s === "setter" && ((e = Object.create(e)).wrapped = !0), r.set(i.name, e), s === "accessor") {
    const { name: o } = i;
    return { set(d) {
      const l = t.get.call(this);
      t.set.call(this, d), this.requestUpdate(o, l, e, !0, d);
    }, init(d) {
      return d !== void 0 && this.C(o, void 0, e, d), d;
    } };
  }
  if (s === "setter") {
    const { name: o } = i;
    return function(d) {
      const l = this[o];
      t.call(this, d), this.requestUpdate(o, l, e, !0, d);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function p(e) {
  return (t, i) => typeof i == "object" ? ke(e, t, i) : ((s, n, r) => {
    const o = n.hasOwnProperty(r);
    return n.constructor.createProperty(r, s), o ? Object.getOwnPropertyDescriptor(n, r) : void 0;
  })(e, t, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function b(e) {
  return p({ ...e, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Se = (e, t, i) => (i.configurable = !0, i.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(e, t, i), i);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Ce(e, t) {
  return (i, s, n) => {
    const r = (o) => o.renderRoot?.querySelector(e) ?? null;
    return Se(i, s, { get() {
      return r(this);
    } });
  };
}
class Me {
  constructor(t) {
    this.hass = t;
  }
  setHass(t) {
    this.hass = t;
  }
  getConfig() {
    return this.send("sundial/get_config");
  }
  updateSettings(t) {
    return this.send("sundial/update_settings", { settings: t });
  }
  saveSchema(t) {
    return this.send("sundial/save_schema", { schema: t });
  }
  deleteSchema(t) {
    return this.send("sundial/delete_schema", { schema_id: t });
  }
  setActiveSchema(t) {
    return this.send("sundial/set_active_schema", { schema_id: t });
  }
  // Pass the (possibly unsaved) draft schema so the timeline/preview reflect
  // edits live, without persisting on every change.
  timeline(t) {
    return this.send("sundial/timeline", { schema: t });
  }
  preview(t, i, s) {
    return this.send("sundial/preview", { schema: t, hour: i, apply: s });
  }
  apply(t) {
    return this.send("sundial/apply", t ? { entity_id: t } : {});
  }
  // Live diagnostics for the Status section; polled while a sheet is open.
  status() {
    return this.send("sundial/status");
  }
  // Hand a light back to the schedule (or take it away) from the Status
  // section. Resolves with the refreshed status.
  setManualControl(t, i) {
    return this.send("sundial/set_manual_control", {
      entity_id: t,
      manual: i
    });
  }
  // Full-configuration backup: the raw store document (all schemas + settings).
  exportConfig() {
    return this.send("sundial/export");
  }
  importConfig(t) {
    return this.send("sundial/import", { data: t });
  }
  send(t, i = {}) {
    return this.hass.connection.sendMessagePromise({ type: t, ...i });
  }
}
const Ee = A`
  :host {
    --bg: #fbf3e9;
    --surface: #fffaf2;
    --surface-alt: #f9f0e4;
    --border: #dec4a1;
    --text: #3d2c1e;
    --text-soft: #836a52;
    --accent: #c8743a;
    --accent-strong: #a8521f;
    /* Between --accent and --accent-soft: bright enough to read as a fill,
       light enough to sit alongside the Kelvin-tinted timeline cells. */
    --accent-light: #eda874;
    --accent-soft: #f0dcc3;
    --danger: #9c3b2e;
    /* Text drawn on top of an --accent fill. */
    --on-accent: #fff8ef;
    --radius: 12px;
    --shadow: 0 2px 10px rgba(120, 80, 40, 0.12);
    color-scheme: light;

    background: var(--bg);
    color: var(--text);
    /* Home Assistant's own typography (Roboto), themable via its token. */
    font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
  }

  /* Dark theme — the same warm palette rotated, not a neutral grey one, so
     the panel still reads as Sundial. Set by <sundial-panel> from Home
     Assistant's own dark mode, falling back to the OS preference.
     --accent-strong inverts its relationship to --accent: it is the emphasis
     colour for text, so on a dark ground it has to be the lighter of the two.
     --accent-soft likewise flips from a pale tint to a dark one, since its
     job is to be a quiet background behind accent text. */
  :host([dark]) {
    --bg: #17120e;
    --surface: #211a15;
    --surface-alt: #2a211a;
    --border: #45362a;
    --text: #f3e8db;
    --text-soft: #ab947e;
    --accent: #d9834a;
    --accent-strong: #f0a86c;
    --accent-light: #eda874;
    --accent-soft: #3a2b20;
    --danger: #e2705a;
    --on-accent: #1b1410;
    --shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
    color-scheme: dark;
  }
`, j = A`
  * {
    box-sizing: border-box;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 18px;
    margin-bottom: 16px;
  }

  .grow {
    flex: 1;
    min-width: 0;
  }

  .muted {
    color: var(--text-soft);
    font-size: 0.85rem;
  }

  /* Sub-heading shown directly under an editor's title (e.g. a light's area). */
  .subtitle {
    margin: -6px 0 10px;
    color: var(--text-soft);
    font-size: 0.82rem;
  }

  /* Inline caution note inside an editor. */
  .warn {
    margin: 10px 0 0;
    padding: 8px 10px;
    font-size: 0.8rem;
    line-height: 1.35;
    color: var(--danger);
    background: var(--accent-soft);
    border-left: 3px solid var(--danger);
    border-radius: 6px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-soft);
  }

  /* iOS-style single-line field: label left, control right. */
  label.field.inline {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  label.field.inline select {
    width: auto;
    flex: 0 1 auto;
  }

  /* Small uppercase section heading; as a <details> it reveals its info text.
     Darker than the field labels so the hierarchy reads: tight to its fields,
     generous space above. */
  .section {
    margin: 28px 0 6px;
    color: var(--text);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .section:first-child {
    margin-top: 0;
  }
  details.section summary {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    list-style: none;
  }
  details.section summary::-webkit-details-marker {
    display: none;
  }
  details.section summary svg {
    width: 14px;
    height: 14px;
    flex: none;
    opacity: 0.6;
  }
  details.section[open] summary svg {
    opacity: 1;
    color: var(--accent-strong);
  }
  details.section p {
    margin: 8px 0 0;
    font-weight: 400;
    text-transform: none;
    letter-spacing: normal;
    line-height: 1.4;
  }

  /* Two-part values (e.g. sunrise + sunset) on one row. minmax(0, 1fr) so
     wide intrinsic inputs (type=time) can't stretch their column. */
  .pair {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .pair + .pair {
    margin-top: 14px;
  }
  .pair > button.btn {
    width: 100%;
  }

  /* Indication strip above a slider (e.g. the Kelvin spectrum). */
  .temp-gradient {
    height: 8px;
    border-radius: 4px;
    border: 1px solid var(--border);
  }

  /* Parsed value shown underneath duration sliders. */
  .duration-preview {
    margin-top: -4px;
    text-align: right;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--accent-strong);
    font-variant-numeric: tabular-nums;
  }

  /* Dual-thumb min–max slider: two overlapped native ranges, thumbs only. */
  .minmax {
    position: relative;
    height: 24px;
  }
  .minmax-track {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 4px;
    transform: translateY(-50%);
    border-radius: 2px;
    background: var(--accent-soft);
  }
  .minmax-fill {
    position: absolute;
    top: 0;
    bottom: 0;
    border-radius: 2px;
    background: var(--accent);
  }
  .minmax input[type="range"] {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 24px;
    margin: 0;
    background: transparent;
    -webkit-appearance: none;
    appearance: none;
    pointer-events: none;
  }
  .minmax input[type="range"]::-webkit-slider-runnable-track {
    background: transparent;
    border: none;
  }
  .minmax input[type="range"]::-moz-range-track {
    background: transparent;
    border: none;
  }
  .minmax input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    pointer-events: auto;
    width: 18px;
    height: 18px;
    /* 18px + 2×2px border = 22px outer on a 24px-high input. */
    margin-top: 1px;
    border-radius: 50%;
    background: var(--accent);
    border: 2px solid var(--surface);
    box-shadow: 0 1px 3px rgba(120, 80, 40, 0.4);
    cursor: pointer;
  }
  .minmax input[type="range"]::-moz-range-thumb {
    pointer-events: auto;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    border: 2px solid var(--surface);
    cursor: pointer;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 14px;
  }

  @media (max-width: 960px) {
    /* More breathing room in the drawer forms. */
    .grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
    }
    .section {
      margin: 34px 0 8px;
    }
    /* Flatten cards on mobile so they don't add a second horizontal padding
       inside the panel's own padding. */
    .card {
      padding-left: 0;
      padding-right: 0;
      border: none;
      border-radius: 0;
      box-shadow: none;
      background: transparent;
    }
  }

  input[type="text"],
  input[type="number"],
  input[type="time"],
  select {
    font: inherit;
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 10px;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  input:focus,
  select:focus {
    outline: 2px solid var(--accent);
    border-color: var(--accent);
  }

  input[type="range"] {
    width: 100%;
    accent-color: var(--accent);
    padding: 0;
    border: none;
    background: transparent;
  }

  .field-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }

  .field-head b {
    color: var(--accent-strong);
    font-variant-numeric: tabular-nums;
  }

  /* iOS-style row: label on the left, switch pinned to the right edge. */
  .toggle {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 10px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-soft);
    cursor: pointer;
  }

  /* Custom switch in the panel's palette instead of the system checkbox. */
  .toggle input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    flex: none;
    width: 40px;
    height: 24px;
    margin: 0;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--accent-soft);
    cursor: pointer;
    transition: background 150ms ease, border-color 150ms ease;
  }
  .toggle input[type="checkbox"]::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--surface);
    box-shadow: 0 1px 3px rgba(120, 80, 40, 0.4);
    transition: transform 150ms ease;
  }
  .toggle input[type="checkbox"]:checked {
    background: var(--accent);
    border-color: var(--accent);
  }
  .toggle input[type="checkbox"]:checked::before {
    transform: translateX(16px);
  }
  .toggle input[type="checkbox"]:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  button.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    border-radius: 8px;
    padding: 8px 14px;
    border: 1px solid var(--accent);
    background: var(--accent);
    color: var(--on-accent);
  }

  button.btn svg {
    width: 16px;
    height: 16px;
    flex: none;
  }

  button.btn.ghost {
    background: transparent;
    color: var(--accent-strong);
  }

  /* Danger differs by content colour only — the border stays like its
     neighbours' so the button doesn't shout while idle. */
  button.btn.danger {
    background: transparent;
    color: var(--danger);
  }

  /* Compact variant for secondary corrective actions. */
  button.btn.small {
    padding: 4px 10px;
    font-size: 0.78rem;
  }

  /* Borderless variant for controls that aren't schema actions (settings). */
  button.btn.plain {
    border-color: transparent;
    background: transparent;
    color: var(--accent-strong);
    padding-left: 10px;
    padding-right: 10px;
  }

  button.btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 12px;
  }

  .actions:not(:last-child) {
    margin-bottom: 14px;
  }

  .empty {
    text-align: center;
    color: var(--text-soft);
    padding: 28px;
  }
`, Wt = A`
  .cells {
    position: relative;
    display: grid;
    grid-template-columns: repeat(24, minmax(0, 1fr));
    gap: 1px;
  }
  .cells::before,
  .cells::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--border);
    opacity: 0.5;
    z-index: 2;
    pointer-events: none;
  }
  .cells::before {
    top: 0;
  }
  .cells::after {
    bottom: 0;
  }
  .cell {
    position: relative;
    overflow: hidden;
  }
  .cell.explicit {
    background: var(--border);
  }
  .cell .fill {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
  }
`, dt = Array.from({ length: 24 }, (e, t) => t), L = 1500, T = 6500;
function Le() {
  return {
    min_brightness: 5,
    max_brightness: 100,
    min_color_temp: 2e3,
    max_color_temp: 5500,
    ramp_dark: 5e3,
    ramp_light: 9e3,
    sunrise_time: null,
    sunset_time: null,
    sunrise_offset: 5e3,
    sunset_offset: -5e3,
    min_sunrise_time: null,
    max_sunrise_time: null,
    min_sunset_time: null,
    max_sunset_time: null
  };
}
function Te() {
  return {
    min_brightness: 1,
    max_brightness: 100,
    min_color_temp: 2e3,
    max_color_temp: 5500,
    separate_turn_on_commands: !1,
    limit_mode: "cap",
    render_mode: "auto",
    hours: Array.from({ length: 24 }, () => null)
  };
}
function Pe(e, t) {
  return { id: e, name: t, sun: Le(), lights: {} };
}
function et(e) {
  return e ? e.supports_color_temp || e.supports_rgb : !0;
}
function wt(e) {
  const t = Math.max(1e3, Math.min(12e3, e)) / 100;
  let i, s, n;
  t <= 66 ? (i = 255, s = 99.47 * Math.log(t) - 161.12) : (i = 329.7 * Math.pow(t - 60, -0.1332), s = 288.12 * Math.pow(t - 60, -0.0755)), t >= 66 ? n = 255 : t <= 19 ? n = 0 : n = 138.52 * Math.log(t - 10) - 305.04;
  const r = (o) => Math.max(0, Math.min(255, Math.round(o)));
  return `rgb(${r(i)}, ${r(s)}, ${r(n)})`;
}
function Jt(e, t) {
  if (t) return "var(--accent-light)";
  const i = e.rgb_color;
  return i ? `rgb(${i[0]}, ${i[1]}, ${i[2]})` : wt(e.color_temp);
}
function pt(e, t) {
  const s = [];
  for (let n = 0; n <= 10; n++)
    s.push(wt(e + (t - e) * n / 10));
  return `linear-gradient(90deg, ${s.join(", ")})`;
}
function Xt(e) {
  const t = e < 0 ? "−" : "", i = Math.round(Math.abs(e) / 60), s = Math.floor(i / 60), n = i % 60;
  return s === 0 ? `${t}${n} min` : n === 0 ? `${t}${s} h` : `${t}${s} h ${n} min`;
}
function Oe(e) {
  return String(e).padStart(2, "0");
}
function Yt(e) {
  return "#" + e.map((t) => Math.max(0, Math.min(255, Math.round(t))).toString(16).padStart(2, "0")).join("");
}
function Re(e) {
  const t = e.replace("#", "");
  return [
    parseInt(t.slice(0, 2), 16) || 0,
    parseInt(t.slice(2, 4), 16) || 0,
    parseInt(t.slice(4, 6), 16) || 0
  ];
}
function ut() {
  const e = /* @__PURE__ */ new Date(), t = e.getHours() * 60 + e.getMinutes();
  return Math.min(1435, Math.round(t / 5) * 5) / 60;
}
const x = (e) => a`<svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d=${e} />
  </svg>`, Ot = x("M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"), Rt = x(
  "M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z"
), Ht = x(
  "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"
), It = x(
  "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
), He = x(
  "M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21M12,4A5,5 0 0,1 17,9C17,10.82 15.98,12.41 14.5,13.28L14,13.58V16H10V13.58L9.5,13.28C8.02,12.41 7,10.82 7,9A5,5 0 0,1 12,4Z"
), Ie = x(
  "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
), De = x(
  "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"
), Ne = x("M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"), Dt = x(
  "M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54a7 7 0 0 0-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.31 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96a7 7 0 0 0 1.62.94l.36 2.54a.5.5 0 0 0 .5.42h3.84a.5.5 0 0 0 .5-.42l.36-2.54a7 7 0 0 0 1.62-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"
), Nt = x(
  "M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.62L12.75,4H11.25Z"
);
function _(e, t) {
  return t ? a`<details class="section">
    <summary>${e} ${De}</summary>
    <p class="muted">${t}</p>
  </details>` : a`<div class="section">${e}</div>`;
}
function Qt(e, t, i, s, n) {
  const r = Math.max(0, Math.min(100, (e - t) / (i - t) * 100));
  return a`<div class="minmax">
    <div class="minmax-track">
      <div class="minmax-fill" style="left:0;width:${r}%"></div>
    </div>
    <input
      type="range"
      min=${t}
      max=${i}
      step=${s}
      .value=${String(e)}
      @input=${(o) => n(Number(o.target.value))}
    />
  </div>`;
}
function nt(e, t, i, s, n, r, o, d, l) {
  const u = (g) => (g - n) / (r - n) * 100;
  return a`<div class="field">
    <span class="field-head">
      <span>${e}</span>
      <b>${i}–${s}${t}</b>
    </span>
    ${l ? a`<div class="temp-gradient" style="background:${l}"></div>` : c}
    <div class="minmax">
      <div class="minmax-track">
        <div
          class="minmax-fill"
          style="left:${u(i)}%;width:${Math.max(0, u(s) - u(i))}%"
        ></div>
      </div>
      <input
        type="range"
        min=${n}
        max=${r}
        step=${o}
        .value=${String(i)}
        @input=${(g) => {
    const h = g.target, m = Math.min(Number(h.value), s);
    h.value = String(m), d(m, s);
  }}
      />
      <input
        type="range"
        min=${n}
        max=${r}
        step=${o}
        .value=${String(s)}
        @input=${(g) => {
    const h = g.target, m = Math.max(Number(h.value), i);
    h.value = String(m), d(i, m);
  }}
      />
    </div>
  </div>`;
}
function V(e, t, i, s, n, r) {
  const o = t === 0 && r ? r : Xt(t);
  return a`<label class="field">
    ${e}
    ${Qt(t, i, s, 60, n)}
    <span class="duration-preview">${o}</span>
  </label>`;
}
function ze(e, t, i) {
  return a`<label class="field"
    >${e}
    <input
      type="number"
      .value=${String(t)}
      @change=${(s) => i(Number(s.target.value))}
    />
  </label>`;
}
function zt(e, t, i, s) {
  return a`<label class="field"
    >${e}
    <input
      type="number"
      step="any"
      placeholder=${i}
      .value=${t != null ? String(t) : ""}
      @change=${(n) => {
    const r = n.target.value.trim(), o = Number(r);
    s(r === "" || !Number.isFinite(o) ? null : o);
  }}
    />
  </label>`;
}
function F(e, t, i, s, n, r, o, d) {
  return a`<label class="field">
    <span class="field-head">
      <span>${e}</span>
      <b>${t}${r}</b>
    </span>
    ${d ? a`<div class="temp-gradient" style="background:${d}"></div>` : c}
    ${Qt(t, i, s, n, o)}
  </label>`;
}
function jt(e, t, i) {
  return a`<label class="field"
    >${e}
    <input
      type="time"
      step="1"
      .value=${t ?? ""}
      @change=${(s) => i(s.target.value || null)}
    />
  </label>`;
}
function te(e, t, i) {
  return a`<label class="toggle">
    <input
      type="checkbox"
      .checked=${t}
      @change=${(s) => i(s.target.checked)}
    />
    ${e}
  </label>`;
}
function Ut(e, t, i, s) {
  return a`<label class="field inline"
    >${e}
    <select
      @change=${(n) => s(n.target.value)}
    >
      ${i.map(
    (n) => a`<option value=${n.value} ?selected=${n.value === t}>
            ${n.label}
          </option>`
  )}
    </select>
  </label>`;
}
var je = Object.defineProperty, Ue = Object.getOwnPropertyDescriptor, k = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? Ue(t, i) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (s ? o(t, i, n) : o(n)) || n);
  return s && n && je(t, i, n), n;
};
let $ = class extends w {
  constructor() {
    super(...arguments), this.lights = [], this.status = null, this.selected = null, this.selectedRow = null, this.previewHour = 12, this.scrollLocked = !1, this.previewActive = !1;
  }
  render() {
    if (!this.timeline)
      return a`<div class="card"><div class="empty">Loading timeline…</div></div>`;
    const e = Math.floor(this.previewHour) % 24;
    return a`<div class="card">
      ${this.previewActive ? this._scrubBar() : c}
      <div class="scroll ${this.scrollLocked ? "locked" : ""}">
        <div class="rows">
          ${this.previewActive ? this._scrubRow() : c}
          ${this._headerRow(e)}
          ${this._sunRow()}
          ${this._lightGroups().map(
      (t) => a`
              <div class="gridrow section-row">
                <div class="label section-label">${t.area}</div>
              </div>
              ${t.lights.map((i) => this._lightRow(i))}
            `
    )}
        </div>
        <div class="legend">
          <span class="legend-item"><span class="legend-dot overridden"></span>Overridden</span>
          <span class="legend-item"><span class="legend-dot selected"></span>Selected</span>
        </div>
      </div>
    </div>`;
  }
  get _clockLabel() {
    const e = Math.floor(this.previewHour), t = Math.round((this.previewHour - e) * 60);
    return `${String(e).padStart(2, "0")}:${String(t).padStart(2, "0")}`;
  }
  // Both scrubbers work in minutes with 5-minute steps.
  get _minutes() {
    return Math.round(this.previewHour * 60 / 5) * 5;
  }
  _slider() {
    return a`<input
      type="range"
      min="0"
      max="1435"
      step="5"
      .value=${String(this._minutes)}
      @input=${(e) => this._emit("scrub", Number(e.target.value) / 60)}
    />`;
  }
  // Desktop, while previewing: part of the grid, so the track lines up with
  // the hour columns.
  _scrubRow() {
    return a`<div class="gridrow scrubrow">
      <div class="label">
        <span class="clock">${this._clockLabel}</span>
        <button class="now-btn" @click=${this._jumpToNow} title="Jump to now">now</button>
      </div>
      <div class="track">${this._slider()}</div>
    </div>`;
  }
  // Mobile-only, shown while previewing: a full-width custom slider in the
  // min–max component's styling — whole hours, no readout (the playhead in
  // the charts shows the position).
  _scrubBar() {
    const e = this._minutes;
    return a`<div class="scrub-bar">
      <div class="minmax">
        <div class="minmax-track">
          <div
            class="minmax-fill"
            style="left:0;width:${e / 1435 * 100}%"
          ></div>
        </div>
        <input
          type="range"
          min="0"
          max="1435"
          step="5"
          .value=${String(e)}
          @input=${(t) => this._emit("scrub", Number(t.target.value) / 60)}
        />
      </div>
    </div>`;
  }
  _jumpToNow() {
    this._emit("scrub", ut());
  }
  _headerRow(e) {
    return a`<div class="gridrow headrow">
      <div class="label"></div>
      <div class="hours">
        ${dt.map(
      (t) => a`<div class="hourhead ${t === e ? "now" : ""}">
            ${Oe(t)}
          </div>`
    )}
      </div>
    </div>`;
  }
  /** Row-level playhead line at the currently shown time. */
  _playhead() {
    const e = this.previewHour % 24 / 24 * 100;
    return a`<div class="playhead" style="left:${e}%"></div>`;
  }
  _sunRow() {
    const e = this.timeline.sun, t = this.selectedRow === "sun" ? "rowselected" : "";
    return a`<div class="gridrow sunrow ${t}">
      <div
        class="label clickable"
        title="Edit the sun"
        @click=${() => this._emit("select-sun", null)}
      >
        <span class="text-col">
          <span class="lname">☀️ Sun</span>
        </span>
        ${Dt}
      </div>
      <div class="cells">
        ${dt.map((i) => this._cell(e[i], "readonly", !1, !1))}
        ${this._playhead()}
      </div>
    </div>`;
  }
  // Consecutive lights that share an area render under one area heading (the
  // backend sorts by area already); unassigned lights group under "Other".
  _lightGroups() {
    const e = [];
    for (const t of this.lights) {
      const i = t.area_name ?? "Other", s = e[e.length - 1];
      s && s.area === i ? s.lights.push(t) : e.push({ area: i, lights: [t] });
    }
    return e.length === 1 && e[0].area === "Other" && (e[0].area = "Lights"), e;
  }
  _lightRow(e) {
    const t = this.timeline.lights[e.entity_id] ?? [], i = this.selectedRow === e.entity_id ? "rowselected" : "";
    return a`<div class="gridrow lightrow ${i}">
      <div
        class="label clickable"
        title="Edit light range"
        @click=${() => this._emit("select-light", e.entity_id)}
      >
        <span class="text-col">
          <span class="lname">${e.name}</span>
        </span>
        ${this._statusTag(e.entity_id)} ${Dt}
      </div>
      <div class="cells">
        ${dt.map((s) => {
      const n = t[s], r = this.selected?.entityId === e.entity_id && this.selected?.hour === s;
      return this._cell(
        n,
        "",
        !!n?.explicit,
        r,
        () => this._emit("select-cell", { entityId: e.entity_id, hour: s }),
        !et(e)
      );
    })}
        ${this._playhead()}
      </div>
    </div>`;
  }
  // One pill beside the name. A light that's off or unavailable isn't being
  // driven, so its control mode says nothing useful — show the power state
  // instead. An on light is the reverse: "on" is evident from the row, the
  // mode isn't. Absent while the first status poll is in flight.
  _statusTag(e) {
    const t = this.status?.lights[e];
    if (!t) return c;
    if (t.state !== "on") {
      const i = t.state === "off";
      return a`<span class="tag idle">${i ? "Off" : "Unavailable"}</span>`;
    }
    return t.manual_control ? a`<span class="tag manual">Manual</span>` : a`<span class="tag">Auto</span>`;
  }
  _cell(e, t, i, s, n, r = !1) {
    const o = e ? e.brightness : 0, d = e ? Jt(e, r) : "transparent", l = [
      "cell",
      t,
      i ? "explicit" : "",
      s ? "selected" : ""
    ].join(" ");
    return a`<div
      class=${l}
      @click=${n}
      title=${e ? `${e.brightness}% · ${e.color_temp} K` : ""}
    >
      <div class="fill" style="height:${o}%;background:${d}"></div>
    </div>`;
  }
  _emit(e, t) {
    this.dispatchEvent(
      new CustomEvent(e, { detail: t, bubbles: !0, composed: !0 })
    );
  }
};
$.styles = [
  j,
  Wt,
  A`
      :host {
        display: block;
        height: 100%;
      }
      .card {
        box-sizing: border-box;
        height: 100%;
        margin-bottom: 0;
        display: flex;
        flex-direction: column;
      }
      .scroll {
        flex: 1;
        min-height: 0;
        max-width: 100%;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding-bottom: 6px;
      }
      .rows {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .gridrow {
        display: grid;
        /* Wide enough that the state tags don't eat into the light name. */
        grid-template-columns: 230px 1fr;
        gap: 1px;
        align-items: center;
      }
      /* Air between charts of the same room (desktop stacks them tightly). */
      @media (min-width: 961px) {
        .lightrow + .lightrow {
          margin-top: 6px;
        }
      }
      /* Thin light playhead at the currently shown time. */
      .cells .playhead {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--accent);
        opacity: 0.55;
        z-index: 4;
        pointer-events: none;
      }
      .hours {
        display: grid;
        grid-template-columns: repeat(24, 1fr);
        gap: 1px;
      }
      /* Above the rows' playheads (z-index 4) so scrolling content always
         passes underneath the hour numbers. */
      .headrow {
        position: sticky;
        top: 0;
        z-index: 6;
        background: var(--surface);
      }
      .label {
        z-index: 3;
        align-self: stretch;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--text);
        white-space: nowrap;
        overflow: hidden;
        padding-right: 4px;
      }
      .label .text-col {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .label .lname {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .label svg {
        width: 12px;
        height: 12px;
        flex: none;
        opacity: 0.4;
      }
      /* Live state beside the name — the same pill the Status sheet uses for
         Automatic/Manual. line-height 1.5 with 1px vertical padding keeps it
         inside the row's existing line box, so it can't change a row's
         height. */
      .tag {
        flex: none;
        /* No vertical padding: the pill has to stay shorter than the name's
           own line box, or it grows the row (it is its own line on mobile). */
        padding: 0 8px;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--accent-strong);
        font-size: 0.62rem;
        font-weight: 700;
        line-height: 1.5;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .tag.manual {
        background: var(--danger);
        color: var(--surface);
      }
      /* Off/unavailable: the light isn't being driven, so keep it quiet. */
      .tag.idle {
        background: transparent;
        color: var(--text-soft);
        box-shadow: inset 0 0 0 1px var(--border);
      }
      .label.clickable:hover svg {
        opacity: 0.9;
      }
      .label.clickable {
        cursor: pointer;
      }
      .sunrow .label {
        color: var(--accent-strong);
      }
      .gridrow.rowselected .label {
        color: var(--accent-strong);
      }
      /* Matches the form section headings (.section in baseStyles). */
      .label.section-label {
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--text);
        padding-top: 8px;
      }
      .hourhead {
        font-size: 0.7rem;
        text-align: center;
        color: var(--text-soft);
      }
      .hourhead.now {
        color: var(--accent-strong);
        font-weight: 700;
      }
      .scrubrow .track {
        grid-column: 2 / -1;
        display: flex;
        align-items: center;
      }
      .scrubrow input[type="range"] {
        width: 100%;
      }
      .clock {
        font-variant-numeric: tabular-nums;
        font-weight: 700;
        color: var(--accent-strong);
      }
      .now-btn {
        background: none;
        border: none;
        padding: 0;
        margin-left: auto;
        font-size: 0.7rem;
        color: var(--text-soft);
        cursor: pointer;
        text-transform: lowercase;
      }
      .now-btn:hover {
        color: var(--accent-strong);
      }
      .cell {
        height: 42px;
        cursor: pointer;
      }
      @media (max-width: 960px) {
        .cell {
          height: 52px;
        }
      }
      .cell.readonly {
        cursor: default;
      }
      .cell.selected {
        border: 2px var(--accent-strong) solid;
      }
      .legend {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        padding-top: 10px;
        font-size: 0.75rem;
        color: var(--text-soft);
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 2px;
      }
      .legend-dot.overridden {
        background: var(--border);
      }
      .legend-dot.selected {
        border: 2px var(--accent-strong) solid;
      }
      /* Preview-only scrub bar above the grid on small screens. */
      .scrub-bar {
        display: none;
      }
      @media (max-width: 960px) {
        :host {
          min-height: 0;
        }
        /* Edge to edge: the grid fits the width (no horizontal scrolling). */
        .card {
          padding: 0;
        }
        .scrub-bar {
          display: block;
          padding: 10px 14px 6px;
          flex: none;
        }
        .scrubrow {
          display: none;
        }
        .scroll {
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          /* The content scrolls clear of the iOS home indicator. */
          padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
        }
        /* The scrollview is edge to edge (indicator at the screen edge);
           the content re-applies the gutter. */
        .rows {
          padding: 0 12px;
        }
        .scroll.locked {
          overflow: hidden;
          touch-action: none;
        }
        /* Stacked rows: the name spans the full width and the 24 cells sit
           underneath, edge to edge. minmax(0, 1fr) so the cells can shrink
           below the hour digits' width. */
        .gridrow {
          grid-template-columns: minmax(0, 1fr);
          margin-bottom: 6px;
        }
        .cells,
        .hours {
          grid-template-columns: repeat(24, minmax(0, 1fr));
        }
        .gridrow .label {
          font-size: 0.8rem;
          padding: 4px 0 2px;
          margin-bottom: 3px;
        }
        .gridrow .label.section-label {
          padding-top: 10px;
        }
        /* Keep the room heading tight to the first light under it. */
        .section-row {
          margin-bottom: 0;
        }
        .section-row .label {
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .headrow .label {
          display: none;
        }
        .headrow {
          margin-bottom: 0;
          padding-bottom: 4px;
          background: var(--bg);
        }
        .hourhead {
          font-size: 0.55rem;
          overflow: hidden;
        }
        /* Scrolls with the content as its last item. */
        .legend {
          padding: 6px 12px 0;
        }
      }
    `
];
k([
  p({ attribute: !1 })
], $.prototype, "lights", 2);
k([
  p({ attribute: !1 })
], $.prototype, "timeline", 2);
k([
  p({ attribute: !1 })
], $.prototype, "status", 2);
k([
  p({ attribute: !1 })
], $.prototype, "selected", 2);
k([
  p({ attribute: !1 })
], $.prototype, "selectedRow", 2);
k([
  p({ type: Number })
], $.prototype, "previewHour", 2);
k([
  p({ type: Boolean })
], $.prototype, "scrollLocked", 2);
k([
  p({ type: Boolean })
], $.prototype, "previewActive", 2);
$ = k([
  R("sundial-timeline-grid")
], $);
var Be = Object.defineProperty, Ve = Object.getOwnPropertyDescriptor, $t = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? Ve(t, i) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (s ? o(t, i, n) : o(n)) || n);
  return s && n && Be(t, i, n), n;
};
let W = class extends w {
  constructor() {
    super(...arguments), this.cells = [], this.colorless = !1;
  }
  render() {
    return a`<div class="cells">
      ${this.cells.map(
      (e) => a`<div class="cell ${e.explicit ? "explicit" : ""}">
          <div
            class="fill"
            style="height:${e.brightness}%;background:${Jt(
        e,
        this.colorless
      )}"
          ></div>
        </div>`
    )}
    </div>`;
  }
};
W.styles = [
  Wt,
  A`
      :host {
        display: block;
      }
      .cells {
        height: 42px;
        overflow: hidden;
      }
    `
];
$t([
  p({ attribute: !1 })
], W.prototype, "cells", 2);
$t([
  p({ type: Boolean })
], W.prototype, "colorless", 2);
W = $t([
  R("sundial-row-preview")
], W);
var qe = Object.defineProperty, Fe = Object.getOwnPropertyDescriptor, ee = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? Fe(t, i) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (s ? o(t, i, n) : o(n)) || n);
  return s && n && qe(t, i, n), n;
};
const Y = 4 * 3600, Bt = 4 * 3600;
let rt = class extends w {
  render() {
    const e = this.sun;
    return a`
      ${_(
      "Brightness",
      "The sun drives every light's fallback: empty timeline cells follow it, scaled into each light's own range."
    )}
      ${nt(
      "Range",
      "%",
      e.min_brightness,
      e.max_brightness,
      0,
      100,
      1,
      (t, i) => this._patch({ min_brightness: t, max_brightness: i })
    )}
      ${e.min_brightness <= 0 ? a`<p class="warn">
            At 0% lights following the sun can turn off at night, and Sundial
            won't turn them back on automatically.
          </p>` : c}
      ${_("Color temperature")}
      ${nt(
      "Range",
      " K",
      e.min_color_temp,
      e.max_color_temp,
      L,
      T,
      50,
      (t, i) => this._patch({ min_color_temp: t, max_color_temp: i }),
      pt(L, T)
    )}
      ${_(
      "Sunrise & sunset",
      "Fixed times override the location-based calculation; offsets shift the calculated moment."
    )}
      <div class="pair">
        ${jt(
      "Fixed sunrise",
      e.sunrise_time,
      (t) => this._patch({ sunrise_time: t })
    )}
        ${jt(
      "Fixed sunset",
      e.sunset_time,
      (t) => this._patch({ sunset_time: t })
    )}
      </div>
      <div class="pair">
        ${V(
      "Sunrise offset",
      e.sunrise_offset,
      Math.min(-Y, e.sunrise_offset),
      Math.max(Y, e.sunrise_offset),
      (t) => this._patch({ sunrise_offset: t })
    )}
        ${V(
      "Sunset offset",
      e.sunset_offset,
      Math.min(-Y, e.sunset_offset),
      Math.max(Y, e.sunset_offset),
      (t) => this._patch({ sunset_offset: t })
    )}
      </div>
      ${_(
      "Ramp",
      "Width of the smooth brightness ramp around sunrise and sunset: the dark side eases in from night, the light side out into full day."
    )}
      <div class="pair">
        ${V(
      "Dark side",
      e.ramp_dark,
      0,
      Math.max(Bt, e.ramp_dark),
      (t) => this._patch({ ramp_dark: t })
    )}
        ${V(
      "Light side",
      e.ramp_light,
      0,
      Math.max(Bt, e.ramp_light),
      (t) => this._patch({ ramp_light: t })
    )}
      </div>
    `;
  }
  _patch(e) {
    this.dispatchEvent(
      new CustomEvent("sun-changed", {
        detail: { ...this.sun, ...e },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
rt.styles = j;
ee([
  p({ attribute: !1 })
], rt.prototype, "sun", 2);
rt = ee([
  R("sundial-sun-config")
], rt);
var Ke = Object.defineProperty, Ze = Object.getOwnPropertyDescriptor, lt = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? Ze(t, i) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (s ? o(t, i, n) : o(n)) || n);
  return s && n && Ke(t, i, n), n;
};
let z = class extends w {
  /** Run an API mutation and bubble the resulting config (or error) up. */
  async run(e) {
    try {
      const t = await e;
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: t,
          bubbles: !0,
          composed: !0
        })
      );
    } catch (t) {
      this._error(t);
    }
  }
  _error(e) {
    this.dispatchEvent(
      new CustomEvent("panel-error", {
        detail: String(e),
        bubbles: !0,
        composed: !0
      })
    );
  }
  async _export() {
    try {
      const e = await this.api.exportConfig(), t = new Blob([JSON.stringify(e, null, 2)], {
        type: "application/json"
      }), i = URL.createObjectURL(t), s = document.createElement("a");
      s.href = i, s.download = "sundial-config.json", s.click(), URL.revokeObjectURL(i);
    } catch (e) {
      this._error(e);
    }
  }
  async _onImportFile(e) {
    const t = e.target, i = t.files?.[0];
    if (t.value = "", !!i)
      try {
        const s = JSON.parse(await i.text());
        await this.run(this.api.importConfig(s));
      } catch (s) {
        this._error(s);
      }
  }
  render() {
    const e = this.config.settings, t = (i) => void this.run(this.api.updateSettings(i));
    return a`
      ${_("Adaptation")}
      <div class="grid">
        ${F(
      "Interval",
      e.interval,
      10,
      300,
      5,
      " s",
      (i) => t({ interval: i })
    )}
        ${F(
      "Transition",
      e.transition,
      0,
      300,
      1,
      " s",
      (i) => t({ transition: i })
    )}
        ${F(
      "Turn-on transition",
      e.initial_transition,
      0,
      300,
      1,
      " s",
      (i) => t({ initial_transition: i })
    )}
      </div>
      ${_(
      "Manual control",
      "When a light is changed by hand, Sundial pauses for it. Auto-reset hands control back after this many seconds (0 = never)."
    )}
      <div class="actions">
        ${te(
      "Pause when controlled manually",
      e.take_over_control,
      (i) => t({ take_over_control: i })
    )}
      </div>
      <div class="grid">
        ${V(
      "Auto-reset override",
      e.autoreset_control,
      0,
      3600,
      (i) => t({ autoreset_control: i }),
      "Never"
    )}
      </div>
      ${_(
      "Light commands",
      "Gap between the two turn-on calls for lights that get brightness and colour sent separately (e.g. IKEA)."
    )}
      <div class="grid">
        ${ze(
      "Split-command delay (ms)",
      e.send_split_delay,
      (i) => t({ send_split_delay: i })
    )}
      </div>
      ${_(
      "Location",
      "Coordinates used to calculate sunrise and sunset. Leave blank to use your home's location."
    )}
      <div class="pair">
        ${zt(
      "Latitude",
      e.sun_latitude,
      this.config.home_latitude.toFixed(4),
      (i) => t({ sun_latitude: i })
    )}
        ${zt(
      "Longitude",
      e.sun_longitude,
      this.config.home_longitude.toFixed(4),
      (i) => t({ sun_longitude: i })
    )}
      </div>
      ${_(
      "Backup",
      "Download the full configuration — every schema plus these settings — as a JSON file, or restore a previous export."
    )}
      <div class="pair">
        <button class="btn ghost" @click=${() => void this._export()}>
          Export
        </button>
        <button class="btn ghost" @click=${() => this._fileInput.click()}>
          Import
        </button>
      </div>
      <input
        type="file"
        accept=".json,application/json"
        hidden
        @change=${this._onImportFile}
      />
      <p class="about">Sundial · v${this.config.version}</p>
    `;
  }
};
z.styles = [
  j,
  A`
      .about {
        margin: 28px 0 2px;
        text-align: center;
        font-size: 0.72rem;
        color: var(--text-soft);
        opacity: 0.8;
      }
    `
];
lt([
  p({ attribute: !1 })
], z.prototype, "config", 2);
lt([
  p({ attribute: !1 })
], z.prototype, "api", 2);
lt([
  Ce("input[type=file]")
], z.prototype, "_fileInput", 2);
z = lt([
  R("sundial-settings-tab")
], z);
var Ge = Object.defineProperty, We = Object.getOwnPropertyDescriptor, U = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? We(t, i) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (s ? o(t, i, n) : o(n)) || n);
  return s && n && Ge(t, i, n), n;
};
const Je = {
  explicit_turn_on: "Adjusted manually",
  diverged: "Adjusted somewhere else",
  turned_on_while_scheduled_off: "Switched on outside its schedule",
  service: "Set to manual by an automation"
}, Xe = {
  applied: "Updated because of schedule",
  turned_off: "Turned off because of schedule",
  skipped_disabled: "Idle — Sundial is disabled",
  skipped_manual: "Idle — Manually controlled",
  skipped_at_target: "Idle — Current status is correct",
  skipped_light_off: "Idle — Light is off",
  skipped_no_state: "Idle — Light not found"
};
function Q(e, t) {
  if (!e) return "—";
  const i = Math.round((new Date(e).getTime() - t) / 1e3), s = Math.abs(i), n = s < 60 ? `${s}s` : Xt(s);
  return s < 5 ? "just now" : i < 0 ? `${n} ago` : `in ${n}`;
}
function Vt(e) {
  return e ? new Date(e).toLocaleTimeString(void 0, {
    hour: "2-digit",
    minute: "2-digit"
  }) : "—";
}
function ht(e) {
  if (!e) return "—";
  const t = [];
  if (e.brightness_pct !== null && t.push(`${e.brightness_pct}%`), e.color_temp_kelvin !== null && t.push(`${e.color_temp_kelvin} K`), e.rgb_color && t.push(`rgb(${e.rgb_color.join(", ")})`), !t.length) return "—";
  const i = e.rgb_color ? Yt(e.rgb_color) : e.color_temp_kelvin !== null ? wt(e.color_temp_kelvin) : null;
  return a`${i ? a`<i class="chip" style="background:${i}"></i>` : c}${t.join(" · ")}`;
}
let M = class extends w {
  constructor() {
    super(...arguments), this.status = null, this.entityId = null, this.open = !1, this._busy = !1, this._onToggle = (e) => {
      const t = e.target.open;
      t !== this.open && (this.open = t, this.dispatchEvent(
        new CustomEvent("status-toggle", {
          detail: t,
          bubbles: !0,
          composed: !0
        })
      ));
    };
  }
  render() {
    return a`<details
      class="section"
      ?open=${this.open}
      @toggle=${this._onToggle}
    >
      <summary>Status ${Ne}</summary>
      ${this.status ? this.entityId ? this._renderLight(this.entityId) : this._renderSun() : a`<p class="muted sub">Loading…</p>`}
    </details>`;
  }
  _row(e, t) {
    return a`<div class="row"><span>${e}</span><b>${t}</b></div>`;
  }
  _renderLight(e) {
    const t = this.status, i = t.lights[e];
    if (!i)
      return a`<p class="muted sub">
        Not controlled by Sundial — add it in the integration's options.
      </p>`;
    const s = new Date(t.now).getTime(), n = i.state === "on";
    return a`
      <div class="rows">
        ${this._row(
      "Control",
      a`<span class="badge ${i.manual_control ? "manual" : ""}"
            >${i.manual_control ? "Manual" : "Automatic"}</span
          >`
    )}
        ${i.manual_control ? a`
              ${this._row(
      "Reason",
      i.manual_reason ? Je[i.manual_reason] : "unknown"
    )}
              ${i.auto_reset_at ? this._row(
      "Back to automatic",
      Q(i.auto_reset_at, s)
    ) : c}
            ` : c}
        ${this._row("Target", ht(i.target))}
        ${this._row(
      "Reports",
      n ? ht(i.reported) : i.state ?? "not found"
    )}
        ${this._row(
      "Last run",
      i.last_outcome ? `${Xe[i.last_outcome]} · ${Q(i.last_evaluated_at, s)}` : "—"
    )}
        ${this._row("Next run", Q(t.global.next_pass_at, s))}
        ${i.group.kind === "group" ? this._row(
      "Group",
      `${i.group.members} lights · ${i.group.members_on} on`
    ) : c}
      </div>
      ${i.group.kind === "group" ? a`<p class="warn">
            Light groups can misbehave. Adding the individual lights is
            recommended.
          </p>` : c}
      ${i.manual_control ? a`<div class="actions">
            <button
              class="btn ghost small"
              ?disabled=${this._busy}
              @click=${() => this._returnToAutomatic(e)}
            >
              Return to automatic
            </button>
          </div>` : c}
    `;
  }
  _renderSun() {
    const e = this.status, { sun: t } = e, i = e.global, s = new Date(e.now).getTime();
    return a`
      <div class="rows">
        ${this._row(
      "Adaptation",
      a`<span class="badge ${i.enabled ? "" : "manual"}"
            >${i.enabled ? "Enabled" : "Disabled"}</span
          >`
    )}
        ${this._row(
      "Sun",
      `${t.is_day ? "day" : "night"} · up ${Vt(t.nearest_sunrise)} · down ${Vt(t.nearest_sunset)}`
    )}
        ${this._row("Sun now", ht(t.values))}
        ${this._row(
      "Next run",
      `${Q(i.next_pass_at, s)}${i.pass_running ? " · running" : ""}`
    )}
        ${this._row(
      "Lights",
      `${i.light_count} controlled · ${i.manual_count} manual` + (i.unavailable_count ? ` · ${i.unavailable_count} unavailable` : "")
    )}
      </div>
    `;
  }
  async _returnToAutomatic(e) {
    this._busy = !0;
    try {
      const t = await this.api.setManualControl(e, !1);
      this.dispatchEvent(
        new CustomEvent("status-changed", {
          detail: t,
          bubbles: !0,
          composed: !0
        })
      );
    } finally {
      this._busy = !1;
    }
  }
};
M.styles = [
  j,
  A`
      /* The chevron points down when collapsed, up when expanded. baseStyles
         already sizes and tints summary svg. */
      details.section summary svg {
        transition: transform 0.15s ease;
      }
      details.section[open] summary svg {
        transform: rotate(180deg);
      }
      /* The <details> carries .section's uppercase heading styling; only the
         summary should keep it, so undo it for the body (same trick as the
         details.section p rule in baseStyles). */
      .rows,
      .actions {
        font-weight: 400;
        text-transform: none;
        letter-spacing: normal;
      }
      /* Label left, value right — same rhythm as .field-head, but repeated
         for a whole list of read-only rows. */
      .rows {
        display: grid;
        gap: 3px;
        margin-top: 8px;
      }
      .row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        font-size: 0.8rem;
      }
      .row > span {
        color: var(--text-soft);
        flex: none;
      }
      .row > b {
        color: var(--accent-strong);
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        text-align: right;
        overflow-wrap: anywhere;
      }
      .badge {
        display: inline-block;
        padding: 1px 8px;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--accent-strong);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .badge.manual {
        background: var(--danger);
        color: var(--surface);
      }
      /* Small colour chip in front of a value. */
      .chip {
        display: inline-block;
        width: 9px;
        height: 9px;
        margin-right: 6px;
        border: 1px solid var(--border);
        border-radius: 50%;
        vertical-align: baseline;
      }
      .sub {
        margin: 8px 0 0;
        font-size: 0.78rem;
      }
    `
];
U([
  p({ attribute: !1 })
], M.prototype, "status", 2);
U([
  p({ attribute: !1 })
], M.prototype, "entityId", 2);
U([
  p({ attribute: !1 })
], M.prototype, "api", 2);
U([
  p({ type: Boolean })
], M.prototype, "open", 2);
U([
  b()
], M.prototype, "_busy", 2);
M = U([
  R("sundial-status-section")
], M);
var Ye = Object.defineProperty, Qe = Object.getOwnPropertyDescriptor, v = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? Qe(t, i) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (s ? o(t, i, n) : o(n)) || n);
  return s && n && Ye(t, i, n), n;
};
const ti = "(max-width: 960px)";
let f = class extends w {
  constructor() {
    super(...arguments), this.preview = !1, this._sel = null, this._previewHour = ut(), this._isMobile = !1, this._status = null, this._statusOpen = !1, this._onMqChange = (e) => {
      this._isMobile = e.matches;
    }, this._closeDrawer = () => {
      const e = this.renderRoot.querySelector("dialog.drawer");
      if (!e || !e.open || !e.classList.contains("shown")) return;
      const t = () => {
        window.clearTimeout(s), e.removeEventListener("transitionend", i), e.open && e.close();
      }, i = (n) => {
        n.target === e && n.propertyName === "transform" && t();
      };
      e.addEventListener("transitionend", i), e.classList.remove("shown");
      const s = window.setTimeout(t, 400);
    }, this._onDrawerCancel = (e) => {
      e.preventDefault(), this._closeDrawer();
    }, this._onDrawerClick = (e) => {
      e.target instanceof HTMLDialogElement && this._closeDrawer();
    }, this._setActive = () => {
      this.api.setActiveSchema(this._draft.id).then((e) => this._emit("config-changed", e)).catch((e) => this._emit("panel-error", String(e)));
    }, this._rename = () => {
      const e = window.prompt("Schema name", this._draft.name);
      if (e === null) return;
      const t = e.trim();
      !t || t === this._draft.name || this._patchSchema({ name: t });
    }, this._delete = () => {
      const e = this._draft.name || this._draft.id;
      window.confirm(`Delete schema "${e}"? This cannot be undone.`) && this._emit("schema-delete", this._draft.id);
    };
  }
  get _active() {
    return this.schema.id === this.config.active_schema_id;
  }
  connectedCallback() {
    super.connectedCallback(), this._mql = window.matchMedia(ti), this._isMobile = this._mql.matches, this._mql.addEventListener("change", this._onMqChange);
  }
  willUpdate(e) {
    e.has("schema") && (this._draft?.id !== this.schema.id ? (this._flushSave(), this._draft = structuredClone(this.schema), this._sel = null, this._loadTimeline()) : this._saveTimer === void 0 && JSON.stringify(this.schema) !== JSON.stringify(this._draft) && (this._draft = structuredClone(this.schema), this._loadTimeline())), e.has("preview") && e.get("preview") !== void 0 && (this.preview ? this._sendPreview() : (this._previewHour = ut(), this.api.apply()));
  }
  disconnectedCallback() {
    this._flushSave(), window.clearTimeout(this._previewTimer), window.clearTimeout(this._timelineTimer), this._stopStatusPolling(), this._mql?.removeEventListener("change", this._onMqChange), super.disconnectedCallback();
  }
  // The drawer is rendered only while something is selected on mobile; open
  // it as a modal (backdrop, Esc, focus trap for free) right after render.
  // The forced reflow between showModal and .shown makes the off-screen
  // start state stick, so the class change transitions instead of snapping.
  updated() {
    const e = this.renderRoot.querySelector("dialog.drawer");
    e && !e.open && (e.showModal(), e.getBoundingClientRect(), e.classList.add("shown"));
  }
  // --- live status ---------------------------------------------------------
  // Polled for as long as the editor is mounted: the Status section needs it
  // while a sheet is open, and the timeline's per-row on/off + auto/manual
  // tags need it all the time.
  firstUpdated() {
    this._loadStatus(), this._statusTimer = window.setInterval(() => void this._loadStatus(), 2e3);
  }
  _stopStatusPolling() {
    this._statusTimer !== void 0 && (window.clearInterval(this._statusTimer), this._statusTimer = void 0);
  }
  async _loadStatus() {
    try {
      this._status = await this.api.status();
    } catch {
    }
  }
  _renderStatus(e) {
    return a`<sundial-status-section
      .status=${this._status}
      .entityId=${e}
      .api=${this.api}
      .open=${this._statusOpen}
      @status-toggle=${(t) => this._statusOpen = t.detail}
      @status-changed=${(t) => this._status = t.detail}
    ></sundial-status-section>`;
  }
  // Render/preview the *draft* (unsaved) schema so edits are visible live.
  async _loadTimeline() {
    try {
      this._timeline = await this.api.timeline(this._draft);
    } catch {
      this._timeline = void 0;
    }
  }
  // Called after every edit: fast visual refresh + live preview, with a
  // slower debounce for the actual save.
  _afterEdit() {
    this._scheduleSave(), this._scheduleTimeline(), this.preview && this._sendPreview();
  }
  _scheduleTimeline() {
    window.clearTimeout(this._timelineTimer), this._timelineTimer = window.setTimeout(() => void this._loadTimeline(), 120);
  }
  // --- persistence ---------------------------------------------------------
  _scheduleSave() {
    window.clearTimeout(this._saveTimer), this._saveTimer = window.setTimeout(() => {
      this._saveTimer = void 0, this._saveAndRefresh();
    }, 400);
  }
  _flushSave() {
    this._saveTimer !== void 0 && (window.clearTimeout(this._saveTimer), this._saveTimer = void 0, this._saveAndRefresh());
  }
  async _saveAndRefresh() {
    try {
      const e = await this.api.saveSchema(this._draft);
      this._emit("config-changed", e);
    } catch (e) {
      this._emit("panel-error", String(e));
    }
  }
  _lightCfg(e) {
    const t = this._draft.lights[e];
    if (t) return t;
    const i = Te(), s = this._bulbCtRange(e);
    return s && (i.min_color_temp = s[0], i.max_color_temp = s[1]), i;
  }
  /** The bulb's supported colour-temperature range, normalised to the
   *  editor's 50 K slider grid and bounds; null when unknown/RGB-only. */
  _bulbCtRange(e) {
    const t = this._lightInfo(e);
    if (t?.min_color_temp_kelvin == null || t?.max_color_temp_kelvin == null)
      return null;
    const i = (s) => Math.min(T, Math.max(L, Math.round(s / 50) * 50));
    return [i(t.min_color_temp_kelvin), i(t.max_color_temp_kelvin)];
  }
  _patchSchema(e) {
    this._draft = { ...this._draft, ...e }, this._afterEdit();
  }
  _patchLight(e, t) {
    const i = { ...this._lightCfg(e), ...t };
    this._draft = {
      ...this._draft,
      lights: { ...this._draft.lights, [e]: i }
    }, this._afterEdit();
  }
  _setCell(e, t) {
    const s = [...this._lightCfg(e.entityId).hours];
    s[e.hour] = t, this._patchLight(e.entityId, { hours: s });
  }
  // --- render --------------------------------------------------------------
  render() {
    return a`
      <div class="head">
        <div class="switcher" title="Switch schema">
          <svg class="chev" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M8 10l4-4 4 4M8 14l4 4 4-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <select
            @change=${(e) => this._emit("schema-select", e.target.value)}
          >
            ${Object.values(this.config.schemas).map(
      (e) => a`<option
                value=${e.id}
                ?selected=${e.id === this.schema.id}
              >
                ${e.name}${e.id === this.config.active_schema_id ? " (active)" : ""}
              </option>`
    )}
          </select>
        </div>
        <span class="name">${this._draft.name}</span>
        <button
          class="icon-btn plain rename"
          title="Rename schema"
          @click=${this._rename}
        >
          ${Ie}
        </button>
        ${this._isMobile ? c : this._renderSchemaActions()}
        <span class="grow"></span>
        ${this._renderActions()}
      </div>

      <div class="layout">
        <div class="main">
          <sundial-timeline-grid
            .lights=${this.config.lights}
            .timeline=${this._timeline}
            .status=${this._status}
            .selected=${this._sel?.kind === "cell" ? this._sel.ref : null}
            .selectedRow=${this._selectedRow}
            .previewHour=${this._previewHour}
            .previewActive=${this.preview}
            .scrollLocked=${this._isMobile && this._sel !== null}
            @select-cell=${(e) => this._onSelectCell(e.detail)}
            @select-light=${(e) => this._sel = { kind: "light", entityId: e.detail }}
            @select-sun=${() => this._sel = { kind: "sun" }}
            @scrub=${(e) => this._onScrub(e.detail)}
          ></sundial-timeline-grid>
        </div>

        ${this._isMobile ? c : this._renderSide()}
      </div>

      ${this._isMobile && this._sel ? this._renderDrawer() : c}
    `;
  }
  // A fixed set of controls in a fixed order — unavailable ones are disabled
  // rather than hidden, so nothing shifts around.
  _renderActions() {
    const e = this._draft.id !== "default";
    return this._isMobile ? a`
      <button
        class="icon-btn"
        title="New schema"
        @click=${() => this._emit("schema-new", null)}
      >
        ${Ot}
      </button>
      <button
        class="icon-btn danger"
        ?disabled=${!e}
        title=${e ? "Delete schema" : "The default schema cannot be deleted"}
        @click=${this._delete}
      >
        ${It}
      </button>
      <button
        class="icon-btn ${this.preview ? "active" : ""}"
        title="Preview on lights"
        @click=${() => this._emit("preview-toggle", !this.preview)}
      >
        ${Rt}
      </button>
      <button
        class="icon-btn ${this._active ? "active" : ""}"
        ?disabled=${this._active}
        title=${this._active ? "This schema is active" : "Apply this schema"}
        @click=${this._setActive}
      >
        ${Ht}
      </button>
      <button
        class="icon-btn plain"
        title="Global settings"
        @click=${() => this._sel = { kind: "settings" }}
      >
        ${Nt}
      </button>
    ` : a`
        <button
          class="btn ${this.preview ? "" : "ghost"}"
          @click=${() => this._emit("preview-toggle", !this.preview)}
        >
          ${Rt} Preview
        </button>
        <button
          class="btn ghost"
          ?disabled=${this._active}
          title=${this._active ? "This schema is active" : "Apply this schema"}
          @click=${this._setActive}
        >
          ${Ht} ${this._active ? "Active" : "Apply"}
        </button>
        <button
          class="btn plain"
          title="Global settings"
          @click=${() => this._sel = { kind: "settings" }}
        >
          ${Nt} Settings
        </button>
      `;
  }
  // Desktop: schema-scoped actions sit next to the title; the rest of the
  // controls stay on the right.
  _renderSchemaActions() {
    const e = this._draft.id !== "default";
    return a`
      <button class="btn ghost" @click=${() => this._emit("schema-new", null)}>
        ${Ot} New
      </button>
      <button
        class="btn danger"
        ?disabled=${!e}
        title=${e ? "Delete schema" : "The default schema cannot be deleted"}
        @click=${this._delete}
      >
        ${It} Delete
      </button>
    `;
  }
  _renderSide() {
    if (!this._sel)
      return a`<div class="side">
        <div class="side-placeholder">
          ${He}
          <span>Select a light to configure it</span>
        </div>
      </div>`;
    const e = this._contextSubtitle();
    return a`<div class="side editing">
      <button class="close" title="Close" @click=${() => this._sel = null}>
        ✕
      </button>
      <h2>${this._contextTitle()}</h2>
      ${e ? a`<p class="subtitle">${e}</p>` : c}
      <div class="side-body">${this._renderContextBody()}</div>
    </div>`;
  }
  _renderDrawer() {
    const e = this._contextSubtitle();
    return a`<dialog
      class="drawer"
      @close=${() => this._sel = null}
      @cancel=${this._onDrawerCancel}
      @click=${this._onDrawerClick}
    >
      <div class="drawer-head">
        <div class="drawer-titles">
          <h2>${this._contextTitle()}</h2>
          ${e ? a`<span class="area">${e}</span>` : c}
        </div>
        <button class="close" title="Close" @click=${this._closeDrawer}>✕</button>
      </div>
      <div class="drawer-body">${this._renderContextBody()}</div>
    </dialog>`;
  }
  get _selectedRow() {
    const e = this._sel;
    return e?.kind === "sun" ? "sun" : e?.kind === "light" ? e.entityId : e?.kind === "cell" ? e.ref.entityId : null;
  }
  _lightInfo(e) {
    return this.config.lights.find((t) => t.entity_id === e);
  }
  _lightName(e) {
    return this._lightInfo(e)?.name ?? e;
  }
  _contextTitle() {
    const e = this._sel;
    if (e?.kind === "sun") return "☀️ Sun";
    if (e?.kind === "light") return this._lightName(e.entityId);
    if (e?.kind === "cell") {
      const t = String(e.ref.hour).padStart(2, "0");
      return `${this._lightName(e.ref.entityId)} · ${t}:00`;
    }
    return "Global settings";
  }
  /** The room (area) of the selected light, for the header subtitle. */
  _contextSubtitle() {
    const e = this._sel, t = e?.kind === "light" ? e.entityId : e?.kind === "cell" ? e.ref.entityId : null;
    return t ? this._lightInfo(t)?.area_name ?? null : null;
  }
  _renderContextBody() {
    const e = this._sel;
    return e?.kind === "sun" ? a`
        ${this._renderRowPreview(this._timeline?.sun)}
        <sundial-sun-config
          .sun=${this._draft.sun}
          @sun-changed=${(t) => this._patchSchema({ sun: t.detail })}
        ></sundial-sun-config>
        ${this._renderStatus(null)}
      ` : e?.kind === "light" ? a`
        ${this._renderRowPreview(this._timeline?.lights[e.entityId], e.entityId)}
        ${this._renderLightEditor(e.entityId)} ${this._renderStatus(e.entityId)}
      ` : e?.kind === "cell" ? this._renderCellEditor(e.ref) : a`<sundial-settings-tab
      .config=${this.config}
      .api=${this.api}
    ></sundial-settings-tab>`;
  }
  // The edited row's 24 cells, mirrored live above the editor.
  _renderRowPreview(e, t) {
    if (!e?.length) return c;
    const i = t !== void 0 && !et(this._lightInfo(t));
    return a`<sundial-row-preview
      .cells=${e}
      ?colorless=${i}
    ></sundial-row-preview>`;
  }
  _renderCellEditor(e) {
    const t = this._lightInfo(e.entityId), i = this._lightCfg(e.entityId).hours[e.hour], s = this._timeline?.lights[e.entityId]?.[e.hour], n = i?.brightness ?? s?.brightness ?? 50, r = i?.color_temp ?? s?.color_temp ?? 3e3, o = i?.rgb_color ?? null, d = (l) => this._setCell(e, {
      brightness: n,
      color_temp: r,
      rgb_color: o,
      ...l
    });
    return i ? a`
      ${F(
      "Brightness",
      n,
      0,
      100,
      1,
      "%",
      (l) => d({ brightness: l })
    )}
      ${n <= 0 ? a`<p class="warn">
            At 0% this light turns off at this hour, and Sundial won't turn it
            back on automatically.
          </p>` : c}
      ${et(t) ? F(
      "Color temp",
      r,
      L,
      T,
      50,
      "K",
      (l) => d({ color_temp: l }),
      pt(L, T)
    ) : c}
      ${t?.supports_rgb ? a`<label class="toggle">
              <input
                type="checkbox"
                .checked=${o !== null}
                @change=${(l) => d({
      rgb_color: l.target.checked ? o ?? [255, 255, 255] : null
    })}
              />
              RGB colour (overrides temp)
            </label>
            ${o !== null ? a`<input
                  type="color"
                  .value=${Yt(o)}
                  @input=${(l) => d({
      rgb_color: Re(l.target.value)
    })}
                />` : c}` : c}
      <div class="center-cta">
        <button class="btn ghost" @click=${() => this._setCell(e, null)}>
          Use sun
        </button>
      </div>
    ` : a`
        <div class="sun-indicator">
          <span class="sun-emoji">☀️</span>
          Following the sun
        </div>
        <div class="center-cta">
          <button class="btn" @click=${() => d({})}>Override</button>
        </div>
      `;
  }
  /** A one-tap reset when the configured range deviates from the bulb's. */
  _renderBulbRangeReset(e, t) {
    const i = this._bulbCtRange(e);
    return !i || t.min_color_temp === i[0] && t.max_color_temp === i[1] ? c : a`<div class="actions">
      <button
        class="btn ghost small"
        title="Set the bounds to ${i[0]}–${i[1]} K"
        @click=${() => this._patchLight(e, {
      min_color_temp: i[0],
      max_color_temp: i[1]
    })}
      >
        Use reported range
      </button>
    </div>`;
  }
  /** Colour-rendering choice, only for lights supporting both CT and RGB. */
  _renderRenderModeSelect(e, t) {
    const i = this._lightInfo(e);
    return !i?.supports_rgb || i.min_color_temp_kelvin == null ? c : Ut(
      "Rendering",
      t.render_mode,
      [
        { value: "auto", label: "Color temperature" },
        { value: "rgb", label: "RGB" }
      ],
      (s) => this._patchLight(e, { render_mode: s })
    );
  }
  _renderLightEditor(e) {
    const t = this._lightCfg(e);
    return a`
      ${_("Brightness")}
      ${nt(
      "Range",
      "%",
      t.min_brightness,
      t.max_brightness,
      0,
      100,
      1,
      (i, s) => this._patchLight(e, { min_brightness: i, max_brightness: s })
    )}
      ${t.min_brightness <= 0 ? a`<p class="warn">
            At 0% this light can turn off during the day, and Sundial won't
            turn it back on automatically.
          </p>` : c}
      ${et(this._lightInfo(e)) ? a`${_("Color temperature")}
          ${nt(
      "Range",
      " K",
      t.min_color_temp,
      t.max_color_temp,
      L,
      T,
      50,
      (i, s) => this._patchLight(e, {
        min_color_temp: i,
        max_color_temp: s
      }),
      pt(L, T)
    )}
          ${this._renderBulbRangeReset(e, t)}` : c}
      ${_(
      "Behaviour",
      "Cap keeps the light tracking the sun, clamped into its range; Scale sweeps the whole range across the day. Sending brightness and colour separately helps lights that drop combined commands (e.g. IKEA)."
    )}
      ${Ut(
      "Limits",
      t.limit_mode,
      [
        { value: "cap", label: "Cap (clamp to range)" },
        { value: "scale", label: "Scale (map onto range)" }
      ],
      (i) => this._patchLight(e, { limit_mode: i })
    )}
      ${this._renderRenderModeSelect(e, t)}
      <div class="actions">
        ${te(
      "Send brightness and colour separately",
      t.separate_turn_on_commands,
      (i) => this._patchLight(e, { separate_turn_on_commands: i })
    )}
      </div>
    `;
  }
  _onScrub(e) {
    this._previewHour = e, this.preview && this._sendPreview();
  }
  // Selecting an hour cell opens its editor; the playhead only follows the
  // selection while preview mode is on.
  _onSelectCell(e) {
    this._sel = { kind: "cell", ref: e }, this.preview && (this._previewHour = e.hour, this._sendPreview());
  }
  _sendPreview() {
    window.clearTimeout(this._previewTimer), this._previewTimer = window.setTimeout(() => {
      this.api.preview(this._draft, this._previewHour, !0);
    }, 150);
  }
  _emit(e, t) {
    this.dispatchEvent(
      new CustomEvent(e, { detail: t, bubbles: !0, composed: !0 })
    );
  }
};
f.styles = [
  j,
  A`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
      }
      .head {
        flex: none;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 14px;
      }
      .name {
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--text);
        min-width: 0;
        flex: 0 1 auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .icon-btn.rename {
        width: 30px;
        height: 30px;
      }
      .icon-btn.rename svg {
        width: 16px;
        height: 16px;
      }
      .switcher {
        position: relative;
        display: inline-flex;
        align-items: center;
        color: var(--text-soft);
      }
      .switcher .chev {
        width: 18px;
        height: 18px;
        pointer-events: none;
      }
      .switcher select {
        position: absolute;
        inset: 0;
        width: 100%;
        opacity: 0;
        cursor: pointer;
      }
      input[type="color"] {
        width: 52px;
        height: 34px;
        padding: 2px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface);
        cursor: pointer;
      }
      .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        flex: none;
        padding: 0;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        color: var(--accent-strong);
        cursor: pointer;
      }
      .icon-btn svg {
        width: 20px;
        height: 20px;
      }
      .icon-btn.active {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--on-accent);
      }
      .icon-btn.danger {
        color: var(--danger);
      }
      /* Borderless: visually separate from the schema actions. */
      .icon-btn.plain {
        border-color: transparent;
        background: transparent;
      }
      .icon-btn:disabled {
        opacity: 0.45;
        cursor: default;
      }
      /* Disabled because it's already applied — state, not a dead control. */
      .icon-btn.active:disabled {
        opacity: 0.9;
      }
      .layout {
        flex: 1;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        grid-template-rows: minmax(0, 1fr);
        gap: 16px;
        align-items: stretch;
      }
      /* Let both columns shrink below their content so each scrolls
         internally instead of growing the page. */
      .main,
      .side {
        min-width: 0;
        min-height: 0;
      }
      /* The side holds global settings flat by default; when something is
         selected it becomes a temporary editing card. */
      .side {
        position: relative;
        align-self: stretch;
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow: hidden;
      }
      .side.editing {
        background: var(--surface);
        border: 1px solid var(--accent);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: 18px;
      }
      /* The title row stays put; only the form below it scrolls. */
      .side-body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
      }
      .side h2 {
        margin: 0 0 4px;
        font-size: 1.05rem;
        font-weight: 650;
        padding-right: 28px;
      }
      /* Empty-selection state, centred across the card's full height. */
      .side-placeholder {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        color: var(--text-soft);
        text-align: center;
        font-size: 0.9rem;
      }
      .side-placeholder svg {
        width: 34px;
        height: 34px;
        opacity: 0.5;
      }
      .close {
        position: absolute;
        top: 12px;
        right: 12px;
        border: none;
        background: transparent;
        color: var(--text-soft);
        font-size: 1.1rem;
        line-height: 1;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
      }
      .close:hover {
        color: var(--accent-strong);
        background: var(--accent-soft);
      }
      .close:focus-visible {
        outline: 2px solid var(--accent);
      }

      /* "Following the sun" state of the hour-cell editor. */
      .sun-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 18px 0 4px;
        text-align: center;
        color: var(--text-soft);
        font-size: 0.9rem;
      }
      .sun-indicator .sun-emoji {
        font-size: 1.8rem;
      }
      .center-cta {
        display: flex;
        justify-content: center;
        margin-top: 14px;
      }

      sundial-row-preview {
        margin-bottom: 14px;
      }
      /* The strip provides the top spacing; the first heading after it
         shouldn't add its own. */
      sundial-row-preview + .section {
        margin-top: 0;
      }

      /* --- bottom drawer (native <dialog>, small screens only) ----------- */
      dialog.drawer {
        position: fixed;
        /* Pin to the bottom only — a top of 0 would stretch the box to the
           full viewport regardless of height: auto. */
        inset: auto 0 0 0;
        margin: 0;
        width: 100%;
        max-width: 100%;
        /* Size to the content; the body scrolls once this cap binds. */
        height: auto;
        max-height: calc(100vh - 40px);
        max-height: calc(100dvh - 40px);
        border: none;
        border-radius: 16px 16px 0 0;
        padding: 0;
        background: var(--surface);
        color: var(--text);
        box-shadow: 0 -8px 30px rgba(120, 80, 40, 0.3);
      }
      /* Class-driven transitions: the dialog opens off-screen, .shown slides
         it in; removing .shown slides it back out (and fades the backdrop)
         before _closeDrawer actually closes it. */
      dialog.drawer[open] {
        display: flex;
        flex-direction: column;
        transform: translateY(100%);
        transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1);
      }
      dialog.drawer[open].shown {
        transform: translateY(0);
      }
      dialog.drawer::backdrop {
        background: rgba(61, 44, 30, 0.4);
        opacity: 0;
        transition: opacity 240ms ease-out;
      }
      dialog.drawer[open].shown::backdrop {
        opacity: 1;
      }
      .drawer-head {
        flex: none;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 10px 10px 16px;
        border-bottom: 1px solid var(--surface-alt);
      }
      .drawer-titles {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .drawer-titles h2 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 650;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .drawer-titles .area {
        font-size: 0.75rem;
        color: var(--text-soft);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .drawer-head .close {
        position: static;
        flex: none;
        width: 44px;
        height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
      }
      .drawer-body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        overscroll-behavior: contain;
        padding: 18px 16px calc(18px + env(safe-area-inset-bottom, 0px));
      }
      /* Extra breathing room between stacked fields in the drawer. */
      .drawer-body .field,
      .drawer-body label.field {
        margin-bottom: 16px;
      }

      @media (max-width: 960px) {
        /* Fixed-height single-row sticky bar on a soft surface. */
        .head {
          position: sticky;
          top: 0;
          z-index: 20;
          background: var(--surface);
          box-shadow: var(--shadow);
          flex-wrap: nowrap;
          gap: 6px;
          /* Matches the Home Assistant app header height. */
          height: 56px;
          margin: 0 0 8px;
          padding: 0 12px;
        }
        .name {
          font-size: 1.05rem;
        }
        .layout {
          grid-template-columns: minmax(0, 1fr);
          gap: 0;
        }
      }
    `
];
v([
  p({ attribute: !1 })
], f.prototype, "schema", 2);
v([
  p({ attribute: !1 })
], f.prototype, "config", 2);
v([
  p({ attribute: !1 })
], f.prototype, "api", 2);
v([
  p({ type: Boolean })
], f.prototype, "preview", 2);
v([
  b()
], f.prototype, "_draft", 2);
v([
  b()
], f.prototype, "_timeline", 2);
v([
  b()
], f.prototype, "_sel", 2);
v([
  b()
], f.prototype, "_previewHour", 2);
v([
  b()
], f.prototype, "_isMobile", 2);
v([
  b()
], f.prototype, "_status", 2);
v([
  b()
], f.prototype, "_statusOpen", 2);
f = v([
  R("sundial-schema-editor")
], f);
var ei = Object.defineProperty, ii = Object.getOwnPropertyDescriptor, H = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? ii(t, i) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (s ? o(t, i, n) : o(n)) || n);
  return s && n && ei(t, i, n), n;
};
let y = class extends w {
  constructor() {
    super(...arguments), this.narrow = !1, this._preview = !1, this._loaded = !1, this._onSchemeChange = () => this._syncTheme();
  }
  connectedCallback() {
    super.connectedCallback(), this._mqDark = window.matchMedia("(prefers-color-scheme: dark)"), this._mqDark.addEventListener("change", this._onSchemeChange), this._syncTheme();
  }
  disconnectedCallback() {
    this._mqDark?.removeEventListener("change", this._onSchemeChange), super.disconnectedCallback();
  }
  // Home Assistant's own dark mode wins; the OS preference is the fallback
  // for the dev harness (and for a hass that doesn't report themes yet).
  // The attribute lands on this host, where the tokens live, so every child
  // picks the palette up through custom-property inheritance.
  _syncTheme() {
    const e = this.hass?.themes?.darkMode ?? this._mqDark?.matches ?? !1;
    this.toggleAttribute("dark", e);
  }
  updated() {
    this._syncTheme(), this.hass && (this._api ? this._api.setHass(this.hass) : this._api = new Me(this.hass), this._loaded || (this._loaded = !0, this._run(this._api.getConfig())));
  }
  get _currentId() {
    const e = this._config;
    return this._selectedId && e.schemas[this._selectedId] ? this._selectedId : e.active_schema_id;
  }
  _onConfigChanged(e) {
    this._config = e.detail, this._error = void 0;
  }
  _onError(e) {
    this._error = e.detail;
  }
  render() {
    if (!this._config)
      return a`<div class="wrap">
        <div class="empty">${this._error ?? "Loading…"}</div>
      </div>`;
    const e = this._config, t = this._currentId, i = e.schemas[t];
    return a`<div
      class="wrap"
      @config-changed=${this._onConfigChanged}
      @panel-error=${this._onError}
      @preview-toggle=${(s) => this._preview = s.detail}
      @schema-select=${(s) => this._selectedId = s.detail}
      @schema-new=${() => void this._new()}
    >
      ${this._error ? a`<div class="card error">${this._error}</div>` : c}

      ${i ? a`<sundial-schema-editor
            .schema=${i}
            .config=${e}
            .api=${this._api}
            .preview=${this._preview}
            @schema-delete=${this._onDelete}
          ></sundial-schema-editor>` : c}
    </div>`;
  }
  async _new() {
    const e = `schema_${Date.now().toString(36)}`;
    this._selectedId = e, await this._run(this._api.saveSchema(Pe(e, "New schema")));
  }
  async _onDelete(e) {
    this._selectedId = void 0, await this._run(this._api.deleteSchema(e.detail));
  }
  async _run(e) {
    try {
      this._config = await e, this._error = void 0;
    } catch (t) {
      this._error = String(t);
    }
  }
};
y.styles = [
  Ee,
  j,
  A`
      /* The panel is exactly as tall as the viewport; everything inside it
         scrolls in its own column rather than scrolling the page. */
      :host {
        display: flex;
        flex-direction: column;
        height: 100vh;
        height: 100dvh;
        overflow: hidden;
      }
      .wrap {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 18px 20px;
        overflow-x: clip;
      }
      .wrap > .card {
        flex: none;
      }
      sundial-schema-editor {
        flex: 1 1 auto;
        min-height: 0;
      }
      .error {
        border-color: var(--danger);
        color: var(--danger);
      }
      @media (max-width: 960px) {
        /* Additionally pin the host on small screens, so no drag anywhere
           can rubber-band the page. The explicit height matters: inside Home
           Assistant an ancestor with transform/contain can become the
           fixed-position containing block, and inset alone would then size
           the panel to that (possibly short) ancestor instead of the
           screen. */
        :host {
          position: fixed;
          inset: 0;
          overscroll-behavior: none;
        }
        /* Edge to edge: the timeline's scroll indicator should sit at the
           screen edge, so the gutter lives on the inner content instead. */
        .wrap {
          padding: 0;
          overscroll-behavior: none;
        }
        .wrap > .card {
          margin: 8px 12px 0;
        }
      }
    `
];
H([
  p({ attribute: !1 })
], y.prototype, "hass", 2);
H([
  p({ attribute: !1 })
], y.prototype, "narrow", 2);
H([
  b()
], y.prototype, "_config", 2);
H([
  b()
], y.prototype, "_error", 2);
H([
  b()
], y.prototype, "_selectedId", 2);
H([
  b()
], y.prototype, "_preview", 2);
y = H([
  R("sundial-panel")
], y);
export {
  y as SundialPanel
};

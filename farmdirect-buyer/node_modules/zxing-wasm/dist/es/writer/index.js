import { A as e, C as t, D as n, E as r, F as i, I as a, L as o, M as s, N as c, O as l, P as u, S as d, T as f, a as p, b as m, c as h, g, h as ee, i as te, j as ne, k as _, o as v, r as re, t as ie, w as ae, x as y, y as b } from "../share.js";
//#region src/writer/zxing_writer.js
async function x(e = {}) {
	var t, n, r, i = e, a = !!globalThis.window, o = typeof Bun < "u", s = !!globalThis.WorkerGlobalScope;
	(n = globalThis.process) != null && (n = n.versions) != null && n.node && ((r = globalThis.process) == null || r.type);
	var c = "./this.program", l, u = "";
	function d(e) {
		return i.locateFile ? i.locateFile(e, u) : u + e;
	}
	var f, p;
	if (a || s || o) {
		try {
			u = new URL(".", l).href;
		} catch {}
		s && (p = (e) => {
			var t = new XMLHttpRequest();
			return t.open("GET", e, !1), t.responseType = "arraybuffer", t.send(null), new Uint8Array(t.response);
		}), f = async (e) => {
			var t = await fetch(e, { credentials: "same-origin" });
			if (t.ok) return t.arrayBuffer();
			throw Error(t.status + " : " + t.url);
		};
	}
	var m = console.log.bind(console), h = console.error.bind(console), g, ee = !1, te, ne, _ = !1;
	function v() {
		var e = Q.buffer;
		T = new Int8Array(e), C = new Int16Array(e), i.HEAPU8 = O = new Uint8Array(e), E = new Uint16Array(e), w = new Int32Array(e), D = new Uint32Array(e), de = new Float32Array(e), fe = new Float64Array(e);
	}
	function re() {
		if (i.preRun) for (typeof i.preRun == "function" && (i.preRun = [i.preRun]); i.preRun.length;) _e(i.preRun.shift());
		pe(ge);
	}
	function ie() {
		_ = !0, $.oa();
	}
	function ae() {
		if (i.postRun) for (typeof i.postRun == "function" && (i.postRun = [i.postRun]); i.postRun.length;) he(i.postRun.shift());
		pe(me);
	}
	function y(e) {
		var t, n;
		(t = i.onAbort) == null || t.call(i, e), e = "Aborted(" + e + ")", h(e), ee = !0, e += ". Build with -sASSERTIONS for more info.";
		var r = new WebAssembly.RuntimeError(e);
		throw (n = ne) == null || n(r), r;
	}
	var b;
	function x() {
		return d("zxing_writer.wasm");
	}
	function S(e) {
		if (e == b && g) return new Uint8Array(g);
		if (p) return p(e);
		throw "both async and sync fetching of the wasm failed";
	}
	async function oe(e) {
		if (!g) try {
			var t = await f(e);
			return new Uint8Array(t);
		} catch {}
		return S(e);
	}
	async function se(e, t) {
		try {
			var n = await oe(e);
			return await WebAssembly.instantiate(n, t);
		} catch (e) {
			h(`failed to asynchronously prepare wasm: ${e}`), y(e);
		}
	}
	async function ce(e, t, n) {
		if (!e && WebAssembly.instantiateStreaming) try {
			var r = fetch(t, { credentials: "same-origin" });
			return await WebAssembly.instantiateStreaming(r, n);
		} catch (e) {
			h(`wasm streaming compile failed: ${e}`), h("falling back to ArrayBuffer instantiation");
		}
		return se(t, n);
	}
	function le() {
		return { a: xn };
	}
	async function ue() {
		function e(e, t) {
			return $ = e.exports, bn($), v(), $;
		}
		function t(t) {
			return e(t.instance);
		}
		var n = le();
		return i.instantiateWasm ? new Promise((t, r) => {
			i.instantiateWasm(n, (n, r) => {
				t(e(n, r));
			});
		}) : (b != null || (b = x()), t(await ce(g, b, n)));
	}
	var C, w, T, de, fe, E, D, O, pe = (e) => {
		for (; e.length > 0;) e.shift()(i);
	}, me = [], he = (e) => me.push(e), ge = [], _e = (e) => ge.push(e), k = (e) => fn(e), A = () => pn(), j = [], M = 0, ve = (e) => {
		var t = new be(e);
		return t.get_caught() || (t.set_caught(!0), M--), t.set_rethrown(!1), j.push(t), _n(e);
	}, N = 0, ye = () => {
		Z(0, 0);
		var e = j.pop();
		mn(e.excPtr), N = 0;
	};
	class be {
		constructor(e) {
			this.excPtr = e, this.ptr = e - 24;
		}
		set_type(e) {
			D[this.ptr + 4 >> 2] = e;
		}
		get_type() {
			return D[this.ptr + 4 >> 2];
		}
		set_destructor(e) {
			D[this.ptr + 8 >> 2] = e;
		}
		get_destructor() {
			return D[this.ptr + 8 >> 2];
		}
		set_caught(e) {
			e = +!!e, T[this.ptr + 12] = e;
		}
		get_caught() {
			return T[this.ptr + 12] != 0;
		}
		set_rethrown(e) {
			e = +!!e, T[this.ptr + 13] = e;
		}
		get_rethrown() {
			return T[this.ptr + 13] != 0;
		}
		init(e, t) {
			this.set_adjusted_ptr(0), this.set_type(e), this.set_destructor(t);
		}
		set_adjusted_ptr(e) {
			D[this.ptr + 16 >> 2] = e;
		}
		get_adjusted_ptr() {
			return D[this.ptr + 16 >> 2];
		}
	}
	var P = (e) => dn(e), xe = (e) => {
		var t = N;
		if (!t) return P(0), 0;
		var n = new be(t);
		n.set_adjusted_ptr(t);
		var r = n.get_type();
		if (!r) return P(0), t;
		for (var i of e) {
			if (i === 0 || i === r) break;
			var a = n.ptr + 16;
			if (gn(i, r, a)) return P(i), t;
		}
		return P(r), t;
	}, Se = () => xe([]), Ce = (e) => xe([e]), we = (e, t) => xe([e, t]), Te = () => {
		var e = j.pop();
		e || y("no exception to throw");
		var t = e.excPtr;
		throw e.get_rethrown() || (j.push(e), e.set_rethrown(!0), e.set_caught(!1), M++), hn(t), N = t, N;
	}, Ee = (e, t, n) => {
		throw new be(e).init(t, n), hn(e), N = e, M++, N;
	}, De = () => M, Oe = (e) => {
		throw N || (N = e), N;
	}, ke = globalThis.TextDecoder && new TextDecoder(), Ae = (e, t, n, r) => {
		var i = t + n;
		if (r) return i;
		for (; e[t] && !(t >= i);) ++t;
		return t;
	}, je = function(e) {
		let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, n = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0;
		var i = Ae(e, t, n, r);
		if (i - t > 16 && e.buffer && ke) return ke.decode(e.subarray(t, i));
		for (var a = ""; t < i;) {
			var o = e[t++];
			if (!(o & 128)) {
				a += String.fromCharCode(o);
				continue;
			}
			var s = e[t++] & 63;
			if ((o & 224) == 192) {
				a += String.fromCharCode((o & 31) << 6 | s);
				continue;
			}
			var c = e[t++] & 63;
			if (o = (o & 240) == 224 ? (o & 15) << 12 | s << 6 | c : (o & 7) << 18 | s << 12 | c << 6 | e[t++] & 63, o < 65536) a += String.fromCharCode(o);
			else {
				var l = o - 65536;
				a += String.fromCharCode(55296 | l >> 10, 56320 | l & 1023);
			}
		}
		return a;
	}, Me = (e, t, n) => e ? je(O, e, t, n) : "";
	function Ne(e, t, n) {
		return 0;
	}
	function Pe(e, t, n) {
		return 0;
	}
	var Fe = (e, t, n) => {};
	function Ie(e, t, n, r) {}
	var Le = (e, t) => {}, Re = () => y(""), F = {}, ze = (e) => {
		for (; e.length;) {
			var t = e.pop();
			e.pop()(t);
		}
	};
	function I(e) {
		return this.fromWireType(D[e >> 2]);
	}
	var L = {}, R = {}, z = {}, Be = class extends Error {
		constructor(e) {
			super(e), this.name = "InternalError";
		}
	}, Ve = (e) => {
		throw new Be(e);
	}, He = (e, t, n) => {
		e.forEach((e) => z[e] = t);
		function r(t) {
			var r = n(t);
			r.length !== e.length && Ve("Mismatched type converter count");
			for (var i = 0; i < e.length; ++i) H(e[i], r[i]);
		}
		var i = Array(t.length), a = [], o = 0;
		{
			let e = t;
			for (let t = 0; t < e.length; ++t) {
				let n = e[t];
				R.hasOwnProperty(n) ? i[t] = R[n] : (a.push(n), L.hasOwnProperty(n) || (L[n] = []), L[n].push(() => {
					i[t] = R[n], ++o, o === a.length && r(i);
				}));
			}
		}
		a.length === 0 && r(i);
	}, Ue = (e) => {
		var t = F[e];
		delete F[e];
		var n = t.rawConstructor, r = t.rawDestructor, i = t.fields, a = i.map((e) => e.getterReturnType).concat(i.map((e) => e.setterArgumentType));
		He([e], a, (e) => {
			var a = {};
			{
				let t = i;
				for (let n = 0; n < t.length; ++n) {
					let r = t[n], o = e[n], s = r.getter, c = r.getterContext, l = e[n + i.length], u = r.setter, d = r.setterContext;
					a[r.fieldName] = {
						read: (e) => o.fromWireType(s(c, e)),
						write: (e, t) => {
							var n = [];
							u(d, e, l.toWireType(n, t)), ze(n);
						},
						optional: o.optional
					};
				}
			}
			return [{
				name: t.name,
				fromWireType: (e) => {
					var t = {};
					for (var n in a) t[n] = a[n].read(e);
					return r(e), t;
				},
				toWireType: (e, t) => {
					for (var i in a) if (!(i in t) && !a[i].optional) throw TypeError(`Missing field: "${i}"`);
					var o = n();
					for (i in a) a[i].write(o, t[i]);
					return e !== null && e.push(r, o), o;
				},
				readValueFromPointer: I,
				destructorFunction: r
			}];
		});
	}, We = (e, t, n, r, i) => {}, B = (e) => {
		for (var t = "";;) {
			var n = O[e++];
			if (!n) return t;
			t += String.fromCharCode(n);
		}
	}, Ge = class extends Error {
		constructor(e) {
			super(e), this.name = "BindingError";
		}
	}, V = (e) => {
		throw new Ge(e);
	};
	function Ke(e, t) {
		let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
		var r = t.name;
		if (e || V(`type "${r}" must have a positive integer typeid pointer`), R.hasOwnProperty(e)) {
			if (n.ignoreDuplicateRegistrations) return;
			V(`Cannot register type '${r}' twice`);
		}
		if (R[e] = t, delete z[e], L.hasOwnProperty(e)) {
			var i = L[e];
			delete L[e], i.forEach((e) => e());
		}
	}
	function H(e, t) {
		return Ke(e, t, arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {});
	}
	var qe = (e, t, n, r) => {
		t = B(t), H(e, {
			name: t,
			fromWireType: function(e) {
				return !!e;
			},
			toWireType: function(e, t) {
				return t ? n : r;
			},
			readValueFromPointer: function(e) {
				return this.fromWireType(O[e]);
			},
			destructorFunction: null
		});
	}, Je = [], U = [
		0,
		1,
		,
		1,
		null,
		1,
		!0,
		1,
		!1,
		1
	], Ye = (e) => {
		e > 9 && --U[e + 1] === 0 && (U[e] = void 0, Je.push(e));
	}, W = {
		toValue: (e) => (e || V(`Cannot use deleted val. handle = ${e}`), U[e]),
		toHandle: (e) => {
			switch (e) {
				case void 0: return 2;
				case null: return 4;
				case !0: return 6;
				case !1: return 8;
				default: {
					let t = Je.pop() || U.length;
					return U[t] = e, U[t + 1] = 1, t;
				}
			}
		}
	}, Xe = {
		name: "emscripten::val",
		fromWireType: (e) => {
			var t = W.toValue(e);
			return Ye(e), t;
		},
		toWireType: (e, t) => W.toHandle(t),
		readValueFromPointer: I,
		destructorFunction: null
	}, Ze = (e) => H(e, Xe), Qe = (e, t) => {
		switch (t) {
			case 4: return function(e) {
				return this.fromWireType(de[e >> 2]);
			};
			case 8: return function(e) {
				return this.fromWireType(fe[e >> 3]);
			};
			default: throw TypeError(`invalid float width (${t}): ${e}`);
		}
	}, $e = (e, t, n) => {
		t = B(t), H(e, {
			name: t,
			fromWireType: (e) => e,
			toWireType: (e, t) => t,
			readValueFromPointer: Qe(t, n),
			destructorFunction: null
		});
	}, et = (e, t) => Object.defineProperty(t, "name", { value: e });
	function tt(e) {
		for (var t = 1; t < e.length; ++t) if (e[t] !== null && e[t].destructorFunction === void 0) return !0;
		return !1;
	}
	function nt(e, t, n, r, i, a) {
		var o = t.length;
		o < 2 && V("argTypes array size mismatch! Must at least get return value and 'this' types!");
		var s = t[1] !== null && n !== null, c = tt(t), l = !t[0].isVoid, u = o - 2, d = Array(u), f = [], p = [];
		return et(e, function() {
			p.length = 0;
			var e;
			f.length = s ? 2 : 1, f[0] = i, s && (e = t[1].toWireType(p, this), f[1] = e);
			for (var n = 0; n < u; ++n) d[n] = t[n + 2].toWireType(p, n < 0 || arguments.length <= n ? void 0 : arguments[n]), f.push(d[n]);
			var a = r(...f);
			function o(n) {
				if (c) ze(p);
				else for (var r = s ? 1 : 2; r < t.length; r++) {
					var i = r === 1 ? e : d[r - 2];
					t[r].destructorFunction !== null && t[r].destructorFunction(i);
				}
				if (l) return t[0].fromWireType(n);
			}
			return o(a);
		});
	}
	var rt = (e, t, n) => {
		if (e[t].overloadTable === void 0) {
			var r = e[t];
			e[t] = function() {
				var r = [...arguments];
				return e[t].overloadTable.hasOwnProperty(r.length) || V(`Function '${n}' called with an invalid number of arguments (${r.length}) - expects one of (${e[t].overloadTable})!`), e[t].overloadTable[r.length].apply(this, r);
			}, e[t].overloadTable = [], e[t].overloadTable[r.argCount] = r;
		}
	}, it = (e, t, n) => {
		i.hasOwnProperty(e) ? ((n === void 0 || i[e].overloadTable !== void 0 && i[e].overloadTable[n] !== void 0) && V(`Cannot register public name '${e}' twice`), rt(i, e, e), i[e].overloadTable.hasOwnProperty(n) && V(`Cannot register multiple overloads of a function with the same number of arguments (${n})!`), i[e].overloadTable[n] = t) : (i[e] = t, i[e].argCount = n);
	}, at = (e, t) => {
		for (var n = [], r = 0; r < e; r++) n.push(D[t + r * 4 >> 2]);
		return n;
	}, ot = (e, t, n) => {
		i.hasOwnProperty(e) || Ve("Replacing nonexistent public symbol"), i[e].overloadTable !== void 0 && n !== void 0 ? i[e].overloadTable[n] = t : (i[e] = t, i[e].argCount = n);
	}, G = {}, st = (e, t, n) => {
		e = e.replace(/p/g, "i");
		var r = G[e];
		return r(t, ...n);
	}, ct = [], K = (e) => {
		var t = ct[e];
		return t || (ct[e] = t = yn.get(e)), t;
	}, lt = function(e, t) {
		let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
		if (arguments.length > 3 && arguments[3] !== void 0 && arguments[3], e.includes("j")) return st(e, t, n);
		var r = K(t)(...n);
		function i(e) {
			return e;
		}
		return i(r);
	}, ut = function(e, t) {
		let n = arguments.length > 2 && arguments[2] !== void 0 && arguments[2];
		return function() {
			return lt(e, t, [...arguments], n);
		};
	}, q = function(e, t) {
		arguments.length > 2 && arguments[2] !== void 0 && arguments[2], e = B(e);
		function n() {
			return e.includes("j") ? ut(e, t) : K(t);
		}
		var r = n();
		return typeof r != "function" && V(`unknown function pointer with signature ${e}: ${t}`), r;
	};
	class dt extends Error {}
	var ft = (e) => {
		var t = ln(e), n = B(t);
		return X(t), n;
	}, pt = (e, t) => {
		var n = [], r = {};
		function i(e) {
			if (!r[e] && !R[e]) {
				if (z[e]) {
					z[e].forEach(i);
					return;
				}
				n.push(e), r[e] = !0;
			}
		}
		throw t.forEach(i), new dt(`${e}: ` + n.map(ft).join([", "]));
	}, mt = (e) => {
		e = e.trim();
		let t = e.indexOf("(");
		return t === -1 ? e : e.slice(0, t);
	}, ht = (e, t, n, r, i, a, o, s) => {
		var c = at(t, n);
		e = B(e), e = mt(e), i = q(r, i, o), it(e, function() {
			pt(`Cannot call ${e} due to unbound types`, c);
		}, t - 1), He([], c, (n) => {
			var r = [n[0], null].concat(n.slice(1));
			return ot(e, nt(e, r, null, i, a, o), t - 1), [];
		});
	}, gt = (e, t, n) => {
		switch (t) {
			case 1: return n ? (e) => T[e] : (e) => O[e];
			case 2: return n ? (e) => C[e >> 1] : (e) => E[e >> 1];
			case 4: return n ? (e) => w[e >> 2] : (e) => D[e >> 2];
			default: throw TypeError(`invalid integer width (${t}): ${e}`);
		}
	}, _t = (e, t, n, r, i) => {
		t = B(t);
		let a = r === 0, o = (e) => e;
		if (a) {
			var s = 32 - 8 * n;
			o = (e) => e << s >>> s, i = o(i);
		}
		H(e, {
			name: t,
			fromWireType: o,
			toWireType: (e, t) => t,
			readValueFromPointer: gt(t, n, r !== 0),
			destructorFunction: null
		});
	}, vt = (e, t, n) => {
		var r = [
			Int8Array,
			Uint8Array,
			Int16Array,
			Uint16Array,
			Int32Array,
			Uint32Array,
			Float32Array,
			Float64Array
		][t];
		function i(e) {
			var t = D[e >> 2], n = D[e + 4 >> 2];
			return new r(T.buffer, n, t);
		}
		n = B(n), H(e, {
			name: n,
			fromWireType: i,
			readValueFromPointer: i
		}, { ignoreDuplicateRegistrations: !0 });
	}, yt = (e, t, n, r) => {
		if (!(r > 0)) return 0;
		for (var i = n, a = n + r - 1, o = 0; o < e.length; ++o) {
			var s = e.codePointAt(o);
			if (s <= 127) {
				if (n >= a) break;
				t[n++] = s;
			} else if (s <= 2047) {
				if (n + 1 >= a) break;
				t[n++] = 192 | s >> 6, t[n++] = 128 | s & 63;
			} else if (s <= 65535) {
				if (n + 2 >= a) break;
				t[n++] = 224 | s >> 12, t[n++] = 128 | s >> 6 & 63, t[n++] = 128 | s & 63;
			} else {
				if (n + 3 >= a) break;
				t[n++] = 240 | s >> 18, t[n++] = 128 | s >> 12 & 63, t[n++] = 128 | s >> 6 & 63, t[n++] = 128 | s & 63, o++;
			}
		}
		return t[n] = 0, n - i;
	}, J = (e, t, n) => yt(e, O, t, n), bt = (e) => {
		for (var t = 0, n = 0; n < e.length; ++n) {
			var r = e.charCodeAt(n);
			r <= 127 ? t++ : r <= 2047 ? t += 2 : r >= 55296 && r <= 57343 ? (t += 4, ++n) : t += 3;
		}
		return t;
	}, xt = (e, t) => {
		t = B(t);
		var n = !0;
		H(e, {
			name: t,
			fromWireType(e) {
				var t = D[e >> 2], r = e + 4, i;
				if (n) i = Me(r, t, !0);
				else {
					i = "";
					for (var a = 0; a < t; ++a) i += String.fromCharCode(O[r + a]);
				}
				return X(e), i;
			},
			toWireType(e, t) {
				t instanceof ArrayBuffer && (t = new Uint8Array(t));
				var r, i = typeof t == "string";
				i || ArrayBuffer.isView(t) && t.BYTES_PER_ELEMENT == 1 || V("Cannot pass non-string to std::string"), r = n && i ? bt(t) : t.length;
				var a = un(4 + r + 1), o = a + 4;
				if (D[a >> 2] = r, i) {
					if (n) J(t, o, r + 1);
					else for (var s = 0; s < r; ++s) {
						var c = t.charCodeAt(s);
						c > 255 && (X(a), V("String has UTF-16 code units that do not fit in 8 bits")), O[o + s] = c;
					}
				} else O.set(t, o);
				return e !== null && e.push(X, a), a;
			},
			readValueFromPointer: I,
			destructorFunction(e) {
				X(e);
			}
		});
	}, St = globalThis.TextDecoder ? new TextDecoder("utf-16le") : void 0, Ct = (e, t, n) => {
		var r = e >> 1, i = Ae(E, r, t / 2, n);
		if (i - r > 16 && St) return St.decode(E.subarray(r, i));
		for (var a = "", o = r; o < i; ++o) {
			var s = E[o];
			a += String.fromCharCode(s);
		}
		return a;
	}, wt = (e, t, n) => {
		if (n != null || (n = 2147483647), n < 2) return 0;
		n -= 2;
		for (var r = t, i = n < e.length * 2 ? n / 2 : e.length, a = 0; a < i; ++a) {
			var o = e.charCodeAt(a);
			C[t >> 1] = o, t += 2;
		}
		return C[t >> 1] = 0, t - r;
	}, Tt = (e) => e.length * 2, Et = (e, t, n) => {
		for (var r = "", i = e >> 2, a = 0; !(a >= t / 4); a++) {
			var o = D[i + a];
			if (!o && !n) break;
			r += String.fromCodePoint(o);
		}
		return r;
	}, Dt = (e, t, n) => {
		if (n != null || (n = 2147483647), n < 4) return 0;
		for (var r = t, i = r + n - 4, a = 0; a < e.length; ++a) {
			var o = e.codePointAt(a);
			if (o > 65535 && a++, w[t >> 2] = o, t += 4, t + 4 > i) break;
		}
		return w[t >> 2] = 0, t - r;
	}, Ot = (e) => {
		for (var t = 0, n = 0; n < e.length; ++n) e.codePointAt(n) > 65535 && n++, t += 4;
		return t;
	}, kt = (e, t, n) => {
		n = B(n);
		var r, i, a;
		t === 2 ? (r = Ct, i = wt, a = Tt) : (r = Et, i = Dt, a = Ot), H(e, {
			name: n,
			fromWireType: (e) => {
				var n = D[e >> 2], i = r(e + 4, n * t, !0);
				return X(e), i;
			},
			toWireType: (e, r) => {
				typeof r != "string" && V(`Cannot pass non-string to C++ string type ${n}`);
				var o = a(r), s = un(4 + o + t);
				return D[s >> 2] = o / t, i(r, s + 4, o + t), e !== null && e.push(X, s), s;
			},
			readValueFromPointer: I,
			destructorFunction(e) {
				X(e);
			}
		});
	}, At = (e, t, n, r, i, a) => {
		F[e] = {
			name: B(t),
			rawConstructor: q(n, r),
			rawDestructor: q(i, a),
			fields: []
		};
	}, jt = (e, t, n, r, i, a, o, s, c, l) => {
		F[e].fields.push({
			fieldName: B(t),
			getterReturnType: n,
			getter: q(r, i),
			getterContext: a,
			setterArgumentType: o,
			setter: q(s, c),
			setterContext: l
		});
	}, Mt = (e, t) => {
		t = B(t), H(e, {
			isVoid: !0,
			name: t,
			fromWireType: () => void 0,
			toWireType: (e, t) => void 0
		});
	}, Nt = [], Pt = (e) => {
		var t = Nt.length;
		return Nt.push(e), t;
	}, Ft = (e, t) => {
		var n = R[e];
		return n === void 0 && V(`${t} has unknown type ${ft(e)}`), n;
	}, It = (e, t) => {
		for (var n = Array(e), r = 0; r < e; ++r) n[r] = Ft(D[t + r * 4 >> 2], `parameter ${r}`);
		return n;
	}, Lt = (e, t, n) => {
		var r = [], i = e(r, n);
		return r.length && (D[t >> 2] = W.toHandle(r)), i;
	}, Rt = {}, zt = (e) => {
		var t = Rt[e];
		return t === void 0 ? B(e) : t;
	}, Bt = (e, t, n) => {
		var [r, ...i] = It(e, t), a = r.toWireType.bind(r), o = i.map((e) => e.readValueFromPointer.bind(e));
		e--;
		var s = Array(e);
		return Pt(et(`methodCaller<(${i.map((e) => e.name)}) => ${r.name}>`, (t, r, i, c) => {
			for (var l = 0, u = 0; u < e; ++u) s[u] = o[u](c + l), l += 8;
			var d;
			switch (n) {
				case 0:
					d = W.toValue(t).apply(null, s);
					break;
				case 2:
					d = Reflect.construct(W.toValue(t), s);
					break;
				case 3:
					d = s[0];
					break;
				case 1: d = W.toValue(t)[zt(r)](...s);
			}
			return Lt(a, i, d);
		}));
	}, Vt = (e) => e ? (e = zt(e), W.toHandle(globalThis[e])) : W.toHandle(globalThis), Ht = (e) => {
		e > 9 && (U[e + 1] += 1);
	}, Ut = (e, t, n, r, i) => Nt[e](t, n, r, i), Wt = (e) => {
		ze(W.toValue(e)), Ye(e);
	}, Gt = (e, t, n, r) => {
		var i = (/* @__PURE__ */ new Date()).getFullYear(), a = new Date(i, 0, 1), o = new Date(i, 6, 1), s = a.getTimezoneOffset(), c = o.getTimezoneOffset(), l = Math.max(s, c);
		D[e >> 2] = l * 60, w[t >> 2] = Number(s != c);
		var u = (e) => {
			var t = e >= 0 ? "-" : "+", n = Math.abs(e);
			return `UTC${t}${String(Math.floor(n / 60)).padStart(2, "0")}${String(n % 60).padStart(2, "0")}`;
		}, d = u(s), f = u(c);
		c < s ? (J(d, n, 17), J(f, r, 17)) : (J(d, r, 17), J(f, n, 17));
	}, Kt = () => 2147483648, qt = (e, t) => Math.ceil(e / t) * t, Jt = (e) => {
		var t = (e - Q.buffer.byteLength + 65535) / 65536 | 0;
		try {
			return Q.grow(t), v(), 1;
		} catch {}
	}, Yt = (e) => {
		var t = O.length;
		e >>>= 0;
		var n = Kt();
		if (e > n) return !1;
		for (var r = 1; r <= 4; r *= 2) {
			var i = t * (1 + .2 / r);
			if (i = Math.min(i, e + 100663296), Jt(Math.min(n, qt(Math.max(e, i), 65536)))) return !0;
		}
		return !1;
	}, Xt = {}, Zt = () => c || "./this.program", Y = () => {
		if (!Y.strings) {
			var e, t, n = {
				USER: "web_user",
				LOGNAME: "web_user",
				PATH: "/",
				PWD: "/",
				HOME: "/home/web_user",
				LANG: ((e = (t = globalThis.navigator) == null ? void 0 : t.language) == null ? "C" : e).replace("-", "_") + ".UTF-8",
				_: Zt()
			};
			for (var r in Xt) Xt[r] === void 0 ? delete n[r] : n[r] = Xt[r];
			var i = [];
			for (var r in n) i.push(`${r}=${n[r]}`);
			Y.strings = i;
		}
		return Y.strings;
	}, Qt = (e, t) => {
		var n = 0, r = 0;
		for (var i of Y()) {
			var a = t + n;
			D[e + r >> 2] = a, n += J(i, a, Infinity) + 1, r += 4;
		}
		return 0;
	}, $t = (e, t) => {
		var n = Y();
		D[e >> 2] = n.length;
		var r = 0;
		for (var i of n) r += bt(i) + 1;
		return D[t >> 2] = r, 0;
	}, en = (e) => 52, tn = (e, t, n, r) => 52, nn = (e, t) => t + 2097152 >>> 0 < 4194305 - !!e ? (e >>> 0) + t * 4294967296 : NaN;
	function rn(e, t, n, r, i) {
		return nn(t, n), 70;
	}
	var an = [
		null,
		[],
		[]
	], on = (e, t) => {
		var n = an[e];
		t === 0 || t === 10 ? ((e === 1 ? m : h)(je(n)), n.length = 0) : n.push(t);
	}, sn = (e, t, n, r) => {
		for (var i = 0, a = 0; a < n; a++) {
			var o = D[t >> 2], s = D[t + 4 >> 2];
			t += 8;
			for (var c = 0; c < s; c++) on(e, O[o + c]);
			i += s;
		}
		return D[r >> 2] = i, 0;
	}, cn = (e) => e;
	if (i.noExitRuntime && i.noExitRuntime, i.print && (m = i.print), i.printErr && (h = i.printErr), i.wasmBinary && (g = i.wasmBinary), i.arguments && i.arguments, i.thisProgram && (c = i.thisProgram), i.preInit) for (typeof i.preInit == "function" && (i.preInit = [i.preInit]); i.preInit.length > 0;) i.preInit.shift()();
	var ln, un, X, Z, dn, fn, pn, mn, hn, gn, _n, vn, Q, yn;
	function bn(e) {
		ln = e.pa, un = i._malloc = e.ra, X = i._free = e.sa, Z = e.ta, dn = e.ua, fn = e.va, pn = e.wa, mn = e.xa, hn = e.ya, gn = e.za, _n = e.Aa, G.jiji = e.Ba, G.viijii = e.Ca, vn = G.jiiii = e.Da, G.iiiiij = e.Ea, G.iiiiijj = e.Fa, G.iiiiiijj = e.Ga, Q = e.na, yn = e.qa;
	}
	var xn = {
		t: ve,
		u: ye,
		a: Se,
		g: Ce,
		v: we,
		_: Te,
		p: Ee,
		Z: De,
		e: Oe,
		L: Ne,
		da: Pe,
		ba: Fe,
		ea: Ie,
		aa: Le,
		U: Re,
		ka: Ue,
		T: We,
		ia: qe,
		ga: Ze,
		M: $e,
		N: ht,
		s: _t,
		n: vt,
		ha: xt,
		E: kt,
		F: At,
		la: jt,
		ja: Mt,
		C: Bt,
		ma: Ye,
		Q: Vt,
		G: Ht,
		A: Ut,
		W: Wt,
		V: Gt,
		$: Yt,
		X: Qt,
		Y: $t,
		J: en,
		ca: tn,
		S: rn,
		K: sn,
		H: Bn,
		O: An,
		I: zn,
		l: Vn,
		b: On,
		c: En,
		f: kn,
		j: Pn,
		D: Fn,
		r: Ln,
		B: Rn,
		x: Un,
		R: Gn,
		k: Dn,
		i: Sn,
		d: wn,
		h: Tn,
		o: Cn,
		y: In,
		z: Mn,
		q: Hn,
		fa: Nn,
		m: jn,
		w: Wn,
		P: cn
	};
	function Sn(e, t) {
		var n = A();
		try {
			K(e)(t);
		} catch (e) {
			if (k(n), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Cn(e, t, n, r, i) {
		var a = A();
		try {
			K(e)(t, n, r, i);
		} catch (e) {
			if (k(a), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function wn(e, t, n) {
		var r = A();
		try {
			K(e)(t, n);
		} catch (e) {
			if (k(r), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Tn(e, t, n, r) {
		var i = A();
		try {
			K(e)(t, n, r);
		} catch (e) {
			if (k(i), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function En(e, t, n) {
		var r = A();
		try {
			return K(e)(t, n);
		} catch (e) {
			if (k(r), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Dn(e) {
		var t = A();
		try {
			K(e)();
		} catch (e) {
			if (k(t), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function On(e, t) {
		var n = A();
		try {
			return K(e)(t);
		} catch (e) {
			if (k(n), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function kn(e, t, n, r) {
		var i = A();
		try {
			return K(e)(t, n, r);
		} catch (e) {
			if (k(i), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function An(e, t, n, r, i, a) {
		var o = A();
		try {
			return K(e)(t, n, r, i, a);
		} catch (e) {
			if (k(o), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function jn(e, t, n, r, i, a, o, s, c, l, u) {
		var d = A();
		try {
			K(e)(t, n, r, i, a, o, s, c, l, u);
		} catch (e) {
			if (k(d), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Mn(e, t, n, r, i, a, o) {
		var s = A();
		try {
			K(e)(t, n, r, i, a, o);
		} catch (e) {
			if (k(s), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Nn(e, t, n, r, i, a, o, s, c) {
		var l = A();
		try {
			K(e)(t, n, r, i, a, o, s, c);
		} catch (e) {
			if (k(l), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Pn(e, t, n, r, i) {
		var a = A();
		try {
			return K(e)(t, n, r, i);
		} catch (e) {
			if (k(a), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Fn(e, t, n, r, i, a) {
		var o = A();
		try {
			return K(e)(t, n, r, i, a);
		} catch (e) {
			if (k(o), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function In(e, t, n, r, i, a) {
		var o = A();
		try {
			K(e)(t, n, r, i, a);
		} catch (e) {
			if (k(o), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Ln(e, t, n, r, i, a, o) {
		var s = A();
		try {
			return K(e)(t, n, r, i, a, o);
		} catch (e) {
			if (k(s), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Rn(e, t, n, r, i, a, o, s) {
		var c = A();
		try {
			return K(e)(t, n, r, i, a, o, s);
		} catch (e) {
			if (k(c), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function zn(e, t, n, r) {
		var i = A();
		try {
			return K(e)(t, n, r);
		} catch (e) {
			if (k(i), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Bn(e, t, n, r) {
		var i = A();
		try {
			return K(e)(t, n, r);
		} catch (e) {
			if (k(i), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Vn(e) {
		var t = A();
		try {
			return K(e)();
		} catch (e) {
			if (k(t), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Hn(e, t, n, r, i, a, o, s) {
		var c = A();
		try {
			K(e)(t, n, r, i, a, o, s);
		} catch (e) {
			if (k(c), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Un(e, t, n, r, i, a, o, s, c, l, u, d) {
		var f = A();
		try {
			return K(e)(t, n, r, i, a, o, s, c, l, u, d);
		} catch (e) {
			if (k(f), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Wn(e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h) {
		var g = A();
		try {
			K(e)(t, n, r, i, a, o, s, c, l, u, d, f, p, m, h);
		} catch (e) {
			if (k(g), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Gn(e, t, n, r, i) {
		var a = A();
		try {
			return vn(e, t, n, r, i);
		} catch (e) {
			if (k(a), e !== e + 0) throw e;
			Z(1, 0);
		}
	}
	function Kn() {
		re();
		function e() {
			var e, t;
			i.calledRun = !0, !ee && (ie(), (e = te) == null || e(i), (t = i.onRuntimeInitialized) == null || t.call(i), ae());
		}
		i.setStatus ? (i.setStatus("Running..."), setTimeout(() => {
			setTimeout(() => i.setStatus(""), 1), e();
		}, 1)) : e();
	}
	var $ = await ue();
	return Kn(), t = _ ? i : new Promise((e, t) => {
		te = e, ne = t;
	}), t;
}
//#endregion
//#region src/writer/index.ts
function S(e) {
	return p(x, e);
}
function oe() {
	return v(x);
}
function se(e) {
	return S({
		overrides: e,
		equalityFn: Object.is,
		fireImmediately: !0
	});
}
function ce(e) {
	S({
		overrides: e,
		equalityFn: Object.is,
		fireImmediately: !1
	});
}
async function le(e, t) {
	return h(x, e, t);
}
var ue = "d8bbaa9aa241d17c8f975b4b9b045d3db00fe05b9d3de84e6732dfff3005ef21";
//#endregion
export { b as BARCODE_FORMATS, m as BARCODE_HRI_LABELS, y as BARCODE_META_FORMATS, d as BARCODE_SYMBOLOGIES, ee as CHARACTER_SETS, t as CREATABLE_BARCODE_FORMATS, ae as GS1_BARCODE_FORMATS, f as INDUSTRIAL_BARCODE_FORMATS, r as LINEAR_BARCODE_FORMATS, n as MATRIX_BARCODE_FORMATS, l as READABLE_BARCODE_FORMATS, _ as RETAIL_BARCODE_FORMATS, re as ZXING_CPP_COMMIT, ue as ZXING_WASM_SHA256, te as ZXING_WASM_VERSION, e as barcodeFormats, g as characterSets, ie as defaultWriterOptions, ne as encodeFormat, s as encodeFormats, c as formatToLabel, u as formatToSymbology, se as getZXingModule, i as linearBarcodeFormats, a as matrixBarcodeFormats, S as prepareZXingModule, oe as purgeZXingModule, ce as setZXingModuleOverrides, o as symbologyToFormats, le as writeBarcode };

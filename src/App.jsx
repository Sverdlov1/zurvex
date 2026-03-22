import { useState, useMemo, useCallback } from "react";

const CATEGORIES = {
  Currency: {
    icon: "💱", units: {
      "USD $": 1, "EUR €": 0.92, "GBP £": 0.79, "TRY ₺": 38.5,
      "JPY ¥": 149.5, "CAD $": 1.44, "AUD $": 1.57, "CHF": 0.88,
      "CNY ¥": 7.24, "INR ₹": 83.9, "KRW ₩": 1345, "SAR": 3.75,
      "AED": 3.67, "BRL R$": 5.05, "RUB ₽": 92.5, "SEK": 10.42,
    }
  },
  Length: {
    icon: "📏", units: {
      Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001,
      Mile: 1609.344, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254,
    }
  },
  Weight: {
    icon: "⚖️", units: {
      Kilogram: 1, Gram: 0.001, Milligram: 1e-6, Pound: 0.453592,
      Ounce: 0.0283495, Ton: 1000, Stone: 6.35029,
    }
  },
  Temperature: {
    icon: "🌡️", units: { Celsius: "C", Fahrenheit: "F", Kelvin: "K" }
  },
  Speed: {
    icon: "💨", units: { "m/s": 1, "km/h": 0.277778, "mph": 0.44704, Knot: 0.514444 }
  },
  Area: {
    icon: "📐", units: {
      "m²": 1, "km²": 1e6, Hectare: 1e4, Acre: 4046.86, "ft²": 0.092903,
    }
  },
  Volume: {
    icon: "🧪", units: {
      Liter: 1, Milliliter: 0.001, Gallon: 3.78541, Pint: 0.473176,
      Cup: 0.24, "fl oz": 0.0295735,
    }
  },
  Data: {
    icon: "💾", units: { Byte: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 }
  },
  Time: {
    icon: "⏱️", units: {
      Second: 1, Minute: 60, Hour: 3600, Day: 86400, Week: 604800, Year: 31536000,
    }
  },
};

function convertTemp(v, from, to) {
  let c = from === "Celsius" ? v : from === "Fahrenheit" ? (v - 32) * 5 / 9 : v - 273.15;
  return to === "Celsius" ? c : to === "Fahrenheit" ? c * 9 / 5 + 32 : c + 273.15;
}

function convert(v, from, to, cat) {
  if (!v && v !== 0) return "";
  const n = parseFloat(v);
  if (isNaN(n)) return "";
  if (cat === "Temperature") return convertTemp(n, from, to);
  const u = CATEGORIES[cat].units;
  if (cat === "Currency") return (n / u[from]) * u[to];
  return (n * u[from]) / u[to];
}

function fmt(n) {
  if (n === "" || n === undefined) return "";
  const v = parseFloat(n);
  if (isNaN(v)) return "";
  if (Math.abs(v) >= 1e9 || (Math.abs(v) < 0.0001 && v !== 0)) return v.toExponential(4);
  if (Math.abs(v) >= 100) return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return parseFloat(v.toPrecision(8)).toString();
}

const KEYS = ["7","8","9","4","5","6","1","2","3",".","0","⌫"];

const lightTheme = {
  bg: "#f5f3f0", card: "#ffffff", cardBorder: "#e8e5e0",
  text: "#1a1a1a", textSec: "#6b6560", textTer: "#a09890",
  accent: "#e8593c", accentSoft: "#e8593c15", accentMed: "#e8593c30",
  pillBg: "#f0ede8", pillActive: "#1a1a1a", pillActiveText: "#ffffff",
  numBg: "#f0ede8", numText: "#1a1a1a", numDel: "#e8593c",
  shadow: "0 2px 12px rgba(0,0,0,0.06)",
  resultColor: "#e8593c",
};

const darkTheme = {
  bg: "#0e0e12", card: "#18181f", cardBorder: "#2a2a35",
  text: "#eae8e2", textSec: "#8a8780", textTer: "#555550",
  accent: "#e8593c", accentSoft: "#e8593c15", accentMed: "#e8593c30",
  pillBg: "#1e1e28", pillActive: "#e8593c", pillActiveText: "#ffffff",
  numBg: "#1e1e28", numText: "#eae8e2", numDel: "#e8593c",
  shadow: "0 2px 20px rgba(0,0,0,0.3)",
  resultColor: "#f0896e",
};

export default function Zurvex() {
  const [dark, setDark] = useState(true);
  const [cat, setCat] = useState("Currency");
  const [fromUnit, setFromUnit] = useState("USD $");
  const [toUnit, setToUnit] = useState("TRY ₺");
  const [input, setInput] = useState("1");
  const [field, setField] = useState("from");
  const [picker, setPicker] = useState(null);

  const T = dark ? darkTheme : lightTheme;
  const units = Object.keys(CATEGORIES[cat].units);

  const changeCat = useCallback((c) => {
    setCat(c);
    const u = Object.keys(CATEGORIES[c].units);
    setFromUnit(u[0]);
    setToUnit(u[1] || u[0]);
    setInput("1");
    setField("from");
  }, []);

  const swap = () => { setFromUnit(toUnit); setToUnit(fromUnit); };

  const tap = useCallback((k) => {
    if (k === "⌫") setInput(p => p.length <= 1 ? "0" : p.slice(0, -1));
    else if (k === ".") setInput(p => p.includes(".") ? p : p + ".");
    else setInput(p => p === "0" ? k : p + k);
  }, []);

  const result = useMemo(() => convert(
    input, field === "from" ? fromUnit : toUnit,
    field === "from" ? toUnit : fromUnit, cat
  ), [input, fromUnit, toUnit, cat, field]);

  const topVal = field === "from" ? input : fmt(result);
  const bottomVal = field === "from" ? fmt(result) : input;
  const formula = fmt(convert(1, fromUnit, toUnit, cat));

  if (picker) {
    return (
      <div style={{
        maxWidth: 430, margin: "0 auto", minHeight: "100vh",
        background: T.bg, fontFamily: "'DM Sans', 'Nunito', system-ui, sans-serif",
        color: T.text, display: "flex", flexDirection: "column",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", borderBottom: `1px solid ${T.cardBorder}`,
        }}>
          <span style={{ fontSize: 14, color: T.textSec }}>
            {picker === "from" ? "Convert from" : "Convert to"}
          </span>
          <button onClick={() => setPicker(null)} style={{
            background: "none", border: "none", color: T.accent,
            fontSize: 15, fontWeight: 600, cursor: "pointer",
          }}>Done</button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "8px 16px" }}>
          {units.map(u => {
            const sel = picker === "from" ? fromUnit === u : toUnit === u;
            return (
              <button key={u} onClick={() => {
                picker === "from" ? setFromUnit(u) : setToUnit(u);
                setPicker(null);
              }} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", padding: "15px 18px", marginBottom: 3,
                background: sel ? T.accentSoft : "transparent",
                border: sel ? `1px solid ${T.accentMed}` : "1px solid transparent",
                borderRadius: 12, cursor: "pointer", color: T.text,
                fontSize: 15, fontWeight: sel ? 600 : 400,
                transition: "all .15s",
              }}>
                <span>{u}</span>
                {sel && <span style={{ color: T.accent, fontSize: 17 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", minHeight: "100vh",
      background: T.bg, fontFamily: "'DM Sans', 'Nunito', system-ui, sans-serif",
      color: T.text, display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      <style>{`
        @keyframes blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar{width:0} *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px 6px",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{
            fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px",
            color: T.accent,
          }}>Zurvex</span>
          {cat === "Currency" && (
            <span style={{
              fontSize: 10, color: T.textTer, background: T.pillBg,
              padding: "3px 8px", borderRadius: 20,
            }}>approx. rates</span>
          )}
        </div>
        <button onClick={() => setDark(!dark)} style={{
          width: 38, height: 38, borderRadius: "50%",
          border: `1px solid ${T.cardBorder}`, background: T.card,
          cursor: "pointer", fontSize: 16, display: "flex",
          alignItems: "center", justifyContent: "center",
          boxShadow: T.shadow, color: T.text,
        }}>
          {dark ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Categories */}
      <div style={{
        display: "flex", gap: 6, padding: "10px 20px",
        overflowX: "auto", scrollbarWidth: "none",
      }}>
        {Object.entries(CATEGORIES).map(([name, { icon }]) => (
          <button key={name} onClick={() => changeCat(name)} style={{
            padding: "7px 13px", borderRadius: 20, whiteSpace: "nowrap",
            border: "none", flexShrink: 0,
            background: cat === name ? T.pillActive : T.pillBg,
            color: cat === name ? T.pillActiveText : T.textSec,
            fontSize: 12.5, fontWeight: cat === name ? 700 : 500,
            cursor: "pointer", transition: "all .2s",
          }}>
            {icon} {name}
          </button>
        ))}
      </div>

      {/* Converter Card */}
      <div style={{
        margin: "10px 16px 0", borderRadius: 20,
        background: T.card, border: `1px solid ${T.cardBorder}`,
        boxShadow: T.shadow, overflow: "hidden",
        animation: "fadeUp .3s ease",
      }}>
        {/* FROM */}
        <div
          onClick={() => setField("from")}
          style={{
            padding: "20px 20px 14px", cursor: "pointer",
            background: field === "from" ? T.accentSoft : "transparent",
            transition: "background .2s",
          }}
        >
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 10,
          }}>
            <button onClick={(e) => { e.stopPropagation(); setPicker("from"); }} style={{
              background: T.pillBg, border: `1px solid ${T.cardBorder}`,
              borderRadius: 10, color: T.accent, padding: "7px 14px",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {fromUnit} <span style={{ fontSize: 9, opacity: .5 }}>▼</span>
            </button>
            <span style={{
              color: T.textTer, fontSize: 11,
              textTransform: "uppercase", letterSpacing: 2,
            }}>From</span>
          </div>
          <div style={{
            fontSize: topVal.length > 12 ? 26 : 36,
            fontWeight: 700, letterSpacing: "-1px",
            color: field === "from" ? T.text : T.textSec,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minHeight: 46, display: "flex", alignItems: "center",
            transition: "all .2s",
          }}>
            {topVal || "0"}
            {field === "from" && (
              <span style={{
                display: "inline-block", width: 2, height: 34,
                background: T.accent, marginLeft: 2, borderRadius: 1,
                animation: "blink 1s infinite",
              }} />
            )}
          </div>
        </div>

        {/* Swap */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", position: "relative", height: 0,
        }}>
          <div style={{
            position: "absolute", left: 20, right: 20, height: 1,
            background: T.cardBorder,
          }} />
          <button onClick={swap} style={{
            width: 40, height: 40, borderRadius: "50%", zIndex: 2,
            border: `2px solid ${T.accentMed}`, cursor: "pointer",
            background: T.card, color: T.accent, fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: T.shadow, transition: "all .3s",
          }}
          onMouseOver={e => e.currentTarget.style.transform = "rotate(180deg) scale(1.1)"}
          onMouseOut={e => e.currentTarget.style.transform = "rotate(0) scale(1)"}
          >⇅</button>
        </div>

        {/* TO */}
        <div
          onClick={() => setField("to")}
          style={{
            padding: "14px 20px 20px", cursor: "pointer",
            background: field === "to" ? T.accentSoft : "transparent",
            transition: "background .2s",
          }}
        >
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 10,
          }}>
            <button onClick={(e) => { e.stopPropagation(); setPicker("to"); }} style={{
              background: T.pillBg, border: `1px solid ${T.cardBorder}`,
              borderRadius: 10, color: T.resultColor, padding: "7px 14px",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {toUnit} <span style={{ fontSize: 9, opacity: .5 }}>▼</span>
            </button>
            <span style={{
              color: T.textTer, fontSize: 11,
              textTransform: "uppercase", letterSpacing: 2,
            }}>To</span>
          </div>
          <div style={{
            fontSize: bottomVal.length > 12 ? 26 : 36,
            fontWeight: 700, letterSpacing: "-1px",
            color: field === "to" ? T.text : T.resultColor,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minHeight: 46, display: "flex", alignItems: "center",
            transition: "all .2s",
          }}>
            {bottomVal || "0"}
            {field === "to" && (
              <span style={{
                display: "inline-block", width: 2, height: 34,
                background: T.accent, marginLeft: 2, borderRadius: 1,
                animation: "blink 1s infinite",
              }} />
            )}
          </div>
        </div>
      </div>

      {/* Formula */}
      {input && result !== "" && (
        <div style={{
          margin: "10px 16px 0", padding: "10px 16px",
          background: T.card, borderRadius: 12,
          border: `1px solid ${T.cardBorder}`,
          textAlign: "center", fontSize: 12.5, color: T.textSec,
        }}>
          <span style={{ color: T.accent, fontWeight: 600 }}>1 {fromUnit}</span>
          {" = "}
          <span style={{ color: T.resultColor, fontWeight: 600 }}>{formula} {toUnit}</span>
        </div>
      )}

      {/* Numpad */}
      <div style={{ marginTop: "auto", padding: "14px 16px 20px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
        }}>
          {KEYS.map(k => (
            <button key={k} onClick={() => tap(k)}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.94)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              style={{
                height: 54, borderRadius: 14, border: "none",
                background: k === "⌫" ? T.accentSoft : T.numBg,
                color: k === "⌫" ? T.numDel : T.numText,
                fontSize: 21, fontWeight: 500, cursor: "pointer",
                transition: "transform .1s",
                fontFamily: k === "⌫" ? "system-ui" : "'JetBrains Mono', 'Fira Code', monospace",
              }}
            >{k}</button>
          ))}
        </div>
        <button onClick={() => setInput("0")} style={{
          width: "100%", marginTop: 8, height: 46,
          borderRadius: 12, border: `1px solid ${T.accentMed}`,
          background: T.accentSoft, color: T.accent,
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          letterSpacing: 1,
        }}>CLEAR</button>
      </div>
    </div>
  );
}

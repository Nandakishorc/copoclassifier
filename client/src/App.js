import React, { useState, useEffect, useRef, useReducer } from "react";
import axios from "axios";
import "./App.css";

const initialState = { classificationHistory: [] };
function reducer(state, action) {
  switch (action.type) {
    case "addResult":
      return { classificationHistory: [...state.classificationHistory, action.payload] };
    case "clearHistory":
      return { classificationHistory: [] };
    default:
      return state;
  }
}

const defaultRules = `CO1: loop, variable, function, array
CO2: stack, queue, linked list, tree, graph, sort, search
CO3: design, api, architecture, microservice, concurrency
CO4: neural, gradient, descent, model, training, overfitting, supervised, unsupervised, weights, update, updates
CO5: test, unit test, tdd, validation, verification, testcase, testcases`;

const defaultMap = `CO1:PO1,PO2
CO2:PO2,PO3
CO3:PO4,PO5
CO4:PO6,PO7
CO5:PO8`;

/**
 * Helpers to parse rules and find keyword matches in the question text.
 */
function parseRules(rulesText) {
  const map = {};
  const lines = rulesText.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const parts = line.split(":");
    if (parts.length < 2) continue;
    const co = parts[0].trim();
    const keywords = parts.slice(1).join(":").split(",").map((k) => k.trim()).filter(Boolean);
    map[co] = keywords;
  }
  return map;
}

function findMatchesInQuestion(question, rulesMap) {
  const q = (question || "").toLowerCase();
  const results = {};
  for (const co of Object.keys(rulesMap)) {
    const keywords = rulesMap[co] || [];
    const matched = new Set();
    for (let kw of keywords) {
      if (!kw) continue;
      kw = kw.toLowerCase();
      const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`\\b${esc}\\b`, "i");
      if (re.test(q)) matched.add(kw);
    }
    results[co] = Array.from(matched);
  }
  return results;
}

function App() {
  // build version stamp so you can verify prod build
  console.log("BUILD VERSION: v2 - formatted-result-enabled");

  const [rules, setRules] = useState(defaultRules);
  const [coPoMap, setCoPoMap] = useState(defaultMap);
  const [question, setQuestion] = useState("Explain gradient descent and how it updates weights");
  const questionRef = useRef(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (questionRef.current) questionRef.current.focus();
  }, []);

  const classify = async (save = false) => {
    const API = process.env.REACT_APP_API_URL || "/api/classify";
    try {
      setLoading(true);
      const res = await axios.post(API, { question, rules, map: coPoMap, save });
      setResult(res.data);
      dispatch({ type: "addResult", payload: res.data });
    } catch (e) {
      console.error("Classification error:", e);
      alert("Error: " + (e.response?.data || e.message));
    } finally {
      setLoading(false);
    }
  };

  // Local pretty-formatter to produce VS Code-like output
  const renderPrettyScores = (res) => {
    if (!res) return null;
    const rulesMap = parseRules(rules);
    const matches = findMatchesInQuestion(res.question || question, rulesMap);
    const scores = res.scores || {};
    const coKeys = Object.keys(rulesMap).length ? Object.keys(rulesMap) : Object.keys(scores);

    return (
      <div>
        <div style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", marginTop: 8 }}>
          {coKeys.map((co) => {
            const score = typeof scores[co] !== "undefined" ? scores[co] : (matches[co] ? matches[co].length : 0);
            const matched = matches[co] || [];
            if (!score || score === 0 || matched.length === 0) {
              return <div key={co}>{co}: {score} (no match)</div>;
            } else {
              return <div key={co}>{co}: {score} ({matched.join(", ")})</div>;
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <h1>? CO ? PO Classifier using MERN</h1>

      <div className="card">
        <h3>1) Edit keyword rules</h3>
        <textarea value={rules} onChange={e => setRules(e.target.value)} rows={6} />
      </div>

      <div className="card">
        <h3>2) CO ? PO Map</h3>
        <textarea value={coPoMap} onChange={e => setCoPoMap(e.target.value)} rows={3} />
      </div>

      <div className="card">
        <h3>3) Try a question</h3>
        <textarea ref={questionRef} value={question} onChange={e => setQuestion(e.target.value)} rows={3} />
        <div style={{ marginTop: 8 }}>
          <button onClick={() => classify(false)} disabled={loading}>{loading ? "Working..." : "Classify"}</button>{' '}
          <button onClick={() => classify(true)} disabled={loading}>{loading ? "Working..." : "Classify & Save"}</button>
        </div>
      </div>

      {result && (
        <div className="card">
          <h3>Result</h3>
          <p><strong>Question:</strong> {result.question}</p>
          <p><strong>Predicted CO:</strong> {result.bestCO} {result.bestScore ? `(score ${result.bestScore})` : ""}</p>
          <p><strong>Mapped PO(s):</strong> {(result.pos || []).join(", ")}</p>

          <details open>
            <summary>Show Scores (pretty)</summary>
            {renderPrettyScores(result)}
          </details>

          <details>
            <summary>Show raw JSON</summary>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}

      <div className="card">
        <h3>Classification History</h3>
        <button onClick={() => dispatch({ type: "clearHistory" })}>Clear History</button>
        <ul>
          {state.classificationHistory.map((r, i) => (<li key={i}>{r.question} ? {r.bestCO} [{(r.pos || []).join(", ")}]</li>))}
        </ul>
      </div>
    </div>
  );
}

export default App;

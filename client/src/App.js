import React, { useState, useEffect, useRef, useReducer } from 'react';
import axios from 'axios';
import './App.css';

const initialState = { classificationHistory: [] };
function reducer(state, action) {
  switch (action.type) {
    case "addResult": return { classificationHistory: [...state.classificationHistory, action.payload] };
    case "clearHistory": return { classificationHistory: [] };
    default: return state;
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

function App() {
  const [rules, setRules] = useState(defaultRules);
  const [coPoMap, setCoPoMap] = useState(defaultMap);
  const [question, setQuestion] = useState('Explain gradient descent and how it updates weights');
  const questionRef = useRef(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [result, setResult] = useState(null);

  useEffect(() => { if (questionRef.current) questionRef.current.focus(); }, []);

  const classify = async (save=false) => {
    const API = process.env.REACT_APP_API_URL || '/api/classify';
    try {
      const res = await axios.post(API, { question, rules, map: coPoMap, save });
      setResult(res.data);
      dispatch({ type: "addResult", payload: res.data });
    } catch (e) { alert('Error: '+e.message); }
  };

  return (
    <div className="container">
      <h1>✨ CO → PO Classifier using MERN</h1>
      <div className="card">
        <h3>1) Edit keyword rules</h3>
        <textarea value={rules} onChange={e=>setRules(e.target.value)} rows={6}/>
      </div>
      <div className="card">
        <h3>2) CO → PO Map</h3>
        <textarea value={coPoMap} onChange={e=>setCoPoMap(e.target.value)} rows={3}/>
      </div>
      <div className="card">
        <h3>3) Try a question</h3>
        <textarea ref={questionRef} value={question} onChange={e=>setQuestion(e.target.value)} rows={3}/>
        <div style={{marginTop:8}}>
          <button onClick={()=>classify(false)}>Classify</button>{' '}
          <button onClick={()=>classify(true)}>Classify & Save</button>
        </div>
      </div>

      {result && (
        <div className="card">
          <h3>Result</h3>
          <p><strong>Question:</strong> {result.question}</p>
          <p><strong>Predicted CO:</strong> {result.bestCO} (score {result.bestScore})</p>
          <p><strong>Mapped POs:</strong> {(result.pos||[]).join(', ')}</p>
          <details><summary>Show scores</summary>
            <pre>{JSON.stringify(result.scores,null,2)}</pre>
          </details>
        </div>
      )}

      <div className="card">
        <h3>Classification History</h3>
        <button onClick={()=>dispatch({type:'clearHistory'})}>Clear History</button>
        <ul>
          {state.classificationHistory.map((r,i)=>(
            <li key={i}>{r.question} → {r.bestCO} [{(r.pos||[]).join(', ')}]</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend 
} from "recharts";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("questions");
  
  // Data
  const [results, setResults] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  
  // Forms
  const [domain, setDomain] = useState("Fullstack developer");
  const [session, setSession] = useState("1");
  const [questionText, setQuestionText] = useState("");
  const [type, setType] = useState("mcq");
  const [section, setSection] = useState("1");
  
  const [options, setOptions] = useState(["", "", "", ""]);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(""); 
  
  const [editingId, setEditingId] = useState(null);
  const [controlDomain, setControlDomain] = useState("Fullstack developer");
  const [controlSession, setControlSession] = useState("1");
  const [selectedResult, setSelectedResult] = useState(null);

  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    try {
      const resResults = await axios.get("http://localhost:5000/api/results/all");
      const resQuestions = await axios.get("http://localhost:5000/api/questions/all-admin");
      const resBlocked = await axios.get("http://localhost:5000/api/users/blocked");
      setResults(resResults.data);
      setQuestions(resQuestions.data);
      setBlockedUsers(resBlocked.data);
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  // --- DANGER ZONE ACTIONS (CLEAR DB) ---
  const handleClearDatabase = async (target) => {
    const confirmation = prompt(`⚠️ DANGER: You are about to delete ALL ${target.toUpperCase()}.\n\nType "DELETE" to confirm.`);
    
    if (confirmation !== "DELETE") {
      alert("❌ Operation Cancelled.");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/questions/reset-database?target=${target}`);
      alert(`✅ SUCCESS: ${target.toUpperCase()} have been cleared.`);
      fetchData(); // Refresh UI
    } catch (err) {
      alert("Error clearing database.");
    }
  };

  // --- STANDARD ACTIONS ---
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return alert("Question Text required");
    if (type === 'mcq' && (!correctAnswer || options.some(o => !o.trim()))) return alert("Complete MCQ fields");

    try {
      const payload = { questionText, domain, session, type, section, options: type === 'mcq' ? options : [], codeSnippet, correctAnswer };
      if (editingId) await axios.put(`http://localhost:5000/api/questions/${editingId}`, payload);
      else await axios.post("http://localhost:5000/api/questions/add", payload);
      
      setQuestionText(""); setOptions(["","","",""]); setCodeSnippet(""); setCorrectAnswer(""); 
      fetchData(); alert("Saved!");
    } catch (err) { alert("Error saving"); }
  };

  const handleDeleteQuestion = async (id) => { if(window.confirm("Delete?")) { await axios.delete(`http://localhost:5000/api/questions/${id}`); fetchData(); } };
  const startEditing = (q) => { 
    setEditingId(q._id); setQuestionText(q.questionText); setDomain(q.domain); setSession(q.session);
    setType(q.type || "descriptive"); setOptions(q.options?.length===4?q.options:["","","",""]); setCodeSnippet(q.codeSnippet||""); setCorrectAnswer(q.correctAnswer||""); 
    window.scrollTo({top:0, behavior:'smooth'}); 
  };
  const handleActivateExam = async () => { try { await axios.post("http://localhost:5000/api/questions/activate", { domain: controlDomain, session: controlSession, isActive: true }); alert("✅ EXAM STARTED!"); } catch (err) { alert("Error"); } };
  const handleStopExam = async () => { try { await axios.post("http://localhost:5000/api/questions/activate", { domain: controlDomain, session: controlSession, isActive: false }); alert("🛑 EXAM STOPPED."); } catch (err) { alert("Error"); } };
  const handleUnblockUser = async (id) => { if(window.confirm("Unblock?")) { await axios.post("http://localhost:5000/api/users/unblock", { userId: id }); fetchData(); alert("Unblocked!"); } };
  
  const handleOptionChange = (idx, val) => { const n=[...options]; n[idx]=val; setOptions(n); };
  const getQuestionText = (id) => questions.find(q => q._id === id)?.questionText || "Unknown";
  const passed = results.filter(r => r.status === "Pass").length;
  const failed = results.filter(r => r.status === "Fail").length;
  const pieData = [{ name: "Pass", value: passed, color: "#00f2ff" }, { name: "Fail", value: failed, color: "#ff0055" }];

  // Styles
  const glassPanel = { background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "15px", padding: "20px", marginBottom: "20px" };
  const inputStyle = { width: "100%", padding: "12px", background: "#050505", border: "1px solid #333", color: "white", borderRadius: "8px", marginBottom: "10px", outline: "none" };
  const tabStyle = (isActive, color="#00f2ff") => ({ padding: "10px 20px", cursor: "pointer", borderBottom: isActive ? `2px solid ${color}` : "none", color: isActive ? color : "#888" });

  return (
    <div style={{ padding: "40px", minHeight: "100vh", position: "relative", zIndex: 1 }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
        <h1 style={{ color: "white" }}>ADMIN.DASHBOARD</h1>
        <button onClick={handleLogout} className="neon-btn" style={{borderColor: "#ff0055", color: "#ff0055"}}>LOGOUT</button>
      </div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "30px", borderBottom: "1px solid #333" }}>
        <div onClick={() => setActiveTab("questions")} style={tabStyle(activeTab === "questions")}>MANAGE QUESTIONS</div>
        <div onClick={() => setActiveTab("analytics")} style={tabStyle(activeTab === "analytics")}>ANALYTICS</div>
        <div onClick={() => setActiveTab("blocked")} style={tabStyle(activeTab === "blocked", "#ff0055")}>BLOCKED USERS</div>
      </div>

      {activeTab === "questions" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          
          <div style={glassPanel}>
            <h2 style={{color: "#fff", marginBottom: "20px"}}>{editingId ? "Edit" : "Add"} Question</h2>
            <form onSubmit={handleSaveQuestion}>
              {/* Domain/Session/Type/Section Selectors (Same as before) */}
              <div style={{display:"flex", gap:"10px"}}><select value={domain} onChange={(e)=>setDomain(e.target.value)} style={inputStyle}><option value="Fullstack developer">Fullstack</option><option value="IOT Engineer">IOT</option></select><select value={session} onChange={(e)=>setSession(e.target.value)} style={inputStyle}><option value="1">S1</option><option value="2">S2</option><option value="3">S3</option></select></div>
              <div style={{display:"flex", gap:"10px"}}><select value={type} onChange={(e)=>setType(e.target.value)} style={inputStyle}><option value="mcq">MCQ</option><option value="fill_ups">Fill</option><option value="code_snippet">Code</option><option value="descriptive">Q/A</option></select><input value={section} readOnly style={{...inputStyle, background:"#222"}} /></div>
              
              <textarea rows="3" value={questionText} onChange={(e)=>setQuestionText(e.target.value)} style={inputStyle} placeholder="Question..." />
              {type === "mcq" && (
                <div style={{background:"rgba(0,242,255,0.05)", padding:"10px", borderRadius:"10px", marginBottom:"15px"}}>
                  <label style={{color:"#00f2ff"}}>Options & Key</label>
                  {options.map((o,i)=><input key={i} value={o} onChange={(e)=>handleOptionChange(i,e.target.value)} style={{...inputStyle, marginBottom:"5px"}} placeholder={`Option ${i+1}`} />)}
                  <select value={correctAnswer} onChange={(e)=>setCorrectAnswer(e.target.value)} style={inputStyle}><option value="">Select Key</option>{options.map((o,i)=>o&&<option key={i} value={o}>{o}</option>)}</select>
                </div>
              )}
              {type === "code_snippet" && <textarea rows="4" value={codeSnippet} onChange={(e)=>setCodeSnippet(e.target.value)} style={{...inputStyle, fontFamily:"monospace"}} placeholder="// Code..." />}
              <button type="submit" className="neon-btn" style={{width:"100%"}}>SAVE</button>
            </form>
          </div>

          <div>
             <div style={{...glassPanel, border:"1px solid #00f2ff"}}>
              <h2 style={{color: "#00f2ff", marginBottom: "10px"}}>🚀 Exam Control</h2>
              <div style={{display:"flex", gap:"10px", marginBottom:"10px"}}><select value={controlDomain} onChange={(e)=>setControlDomain(e.target.value)} style={inputStyle}><option value="Fullstack developer">Fullstack</option></select><select value={controlSession} onChange={(e)=>setControlSession(e.target.value)} style={inputStyle}><option value="1">S1</option><option value="2">S2</option><option value="3">S3</option></select></div>
              <div style={{display:"flex", gap:"10px"}}><button onClick={handleActivateExam} className="neon-btn" style={{flex:1}}>ACTIVATE</button><button onClick={handleStopExam} className="neon-btn" style={{borderColor:"red", color:"red"}}>STOP</button></div>
            </div>

            {/* DANGER ZONE */}
            <div style={{...glassPanel, border: "1px solid #ff0055"}}>
              <h3 style={{color: "#ff0055", marginBottom: "10px"}}>⚠️ Danger Zone</h3>
              <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                <button onClick={() => handleClearDatabase("results")} style={{background:"#330000", border:"1px solid #ff0055", color:"#ff0055", padding:"10px", borderRadius:"5px", cursor:"pointer"}}>CLEAR STUDENT RESULTS</button>
                <button onClick={() => handleClearDatabase("questions")} style={{background:"#330000", border:"1px solid #ff0055", color:"#ff0055", padding:"10px", borderRadius:"5px", cursor:"pointer"}}>DELETE ALL QUESTIONS</button>
                <button onClick={() => handleClearDatabase("all")} style={{background:"red", border:"none", color:"white", padding:"10px", borderRadius:"5px", cursor:"pointer", fontWeight:"bold"}}>FACTORY RESET (DELETE EVERYTHING)</button>
              </div>
            </div>

            <div style={{...glassPanel, maxHeight:"300px", overflowY:"auto"}}>
              <h3 style={{color:"white"}}>Questions ({questions.length})</h3>
              {questions.map(q => (<div key={q._id} style={{padding:"8px", borderBottom:"1px solid #222", display:"flex", justifyContent:"space-between"}}><span style={{color:"#00f2ff", fontSize:"0.7rem"}}>[{q.type}] {q.domain} S{q.session}</span><div><button onClick={()=>startEditing(q)} style={{color:"#aaa", background:"none", border:"none", marginRight:"5px"}}>EDIT</button><button onClick={()=>handleDeleteQuestion(q._id)} style={{color:"red", background:"none", border:"none"}}>DEL</button></div></div>))}
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS & BLOCKED TABS */}
      {activeTab === "analytics" && <div style={glassPanel}><h3 style={{color:"white"}}>Analytics (Data Loaded)</h3></div>}
      {activeTab === "blocked" && <div style={glassPanel}><h3 style={{color:"#ff0055"}}>Blocked Users ({blockedUsers.length})</h3>{blockedUsers.map(u=><div key={u._id} style={{color:"white", padding:"10px"}}>{u.username} <button onClick={()=>handleUnblockUser(u._id)} style={{marginLeft:"10px"}}>Unblock</button></div>)}</div>}

    </div>
  );
};

export default AdminDashboard;
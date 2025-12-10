// client/src/pages/ExamPortal.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ExamPortal = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [examStarted, setExamStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  
  const isSubmittingRef = useRef(false);
  const navigate = useNavigate();
  
  // --- 1. GET USERNAME ---
  const currentUser = localStorage.getItem("username");

  // --- 2. IDENTITY CHECK (Run on load) ---
  useEffect(() => {
    if (!currentUser) {
      alert("⚠️ Error: User identity not found. Please login again.");
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // --- 3. STRICT BLOCKING LOGIC ---
  const handleViolation = async () => {
    if (isSubmittingRef.current) return;

    try {
      console.log(`🚨 BLOCKING USER: ${currentUser}`); // Debug Log
      
      // Send Block Request
      await axios.post("http://localhost:5000/api/users/block", { username: currentUser });
      
      alert(`⛔ SECURITY ALERT!\n\nUser '${currentUser}' has been BLOCKED for switching tabs.\nYou cannot log in again until an Admin unblocks you.`);
      
      // Cleanup
      localStorage.clear();
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      window.location.href = "/login";
      
    } catch (err) {
      console.error("Block failed:", err);
      // Fallback: Kick them out anyway
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  // --- 4. EVENT LISTENERS ---
  useEffect(() => {
    if (!examStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation();
    };
    
    // Strict Blur (Uncomment to block on taskbar clicks)
    const handleBlur = () => {
       handleViolation(); 
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur); 

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [examStarted]);

  // --- 5. EXAM SETUP ---
  const handleStartExam = () => {
    setExamStarted(true);
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
  };

  // --- 6. FETCH QUESTIONS ---
  const fetchQuestions = async () => {
    if (!selectedDomain) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/questions/student-fetch?domain=${selectedDomain.trim()}`);
      if (res.data.active) setQuestions(res.data.questions);
      else {
        setQuestions([]);
        if (examStarted) { alert("Exam Stopped by Admin"); setExamStarted(false); }
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 5000);
    return () => clearInterval(interval);
  }, [selectedDomain]);

  const handleAnswerChange = (qId, val) => setAnswers({ ...answers, [qId]: val });

  // --- 7. SUBMIT ---
  const handleSubmitExam = async () => {
    isSubmittingRef.current = true;
    setTimeout(async () => {
      if (!window.confirm("Submit Exam?")) { isSubmittingRef.current = false; return; }
      try {
        await axios.post("http://localhost:5000/api/results/submit", {
          username: currentUser,
          domain: selectedDomain,
          answers,
          violationCount: 0
        });
        alert("✅ Submitted!");
        if (document.exitFullscreen) document.exitFullscreen().catch(()=>{});
        navigate("/login");
      } catch (err) {
        alert("Error submitting");
        isSubmittingRef.current = false;
      }
    }, 200);
  };

  const glassInput = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "15px", borderRadius: "10px", width: "100%", fontSize: "1rem", outline: "none", marginTop: "10px" };
  const optionStyle = { background: "#050505", color: "white" };

  return (
    <div style={{ padding: "40px", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: examStarted ? "flex-start" : "center" }}>
      {!examStarted ? (
        <div className="glass-panel" style={{ padding: "40px", maxWidth: "500px", width: "100%", textAlign: "center" }}>
          <h1 style={{ color: "#00f2ff", marginBottom: "10px" }}>WELCOME, {currentUser}</h1>
          <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} style={{ ...glassInput, cursor: "pointer", marginBottom: "30px" }}>
            <option style={optionStyle} value="">-- Select Domain --</option>
            <option style={optionStyle} value="Fullstack developer">Fullstack developer</option>
            <option style={optionStyle} value="IOT Engineer">IOT Engineer</option>
            <option style={optionStyle} value="UI/UX Designer">UI/UX Designer</option>
            <option style={optionStyle} value="Game developer">Game developer</option>
            <option style={optionStyle} value="3D designer">3D designer</option>
            <option style={optionStyle} value="App Developer">App Developer</option>
          </select>
          {selectedDomain && (
             <div style={{marginBottom: "20px", color: questions.length > 0 ? "#00f2ff" : "#ff0055"}}>
                {questions.length > 0 ? "✅ Exam is LIVE." : "⏳ Waiting for Admin..."}
             </div>
          )}
          <button disabled={questions.length === 0} onClick={handleStartExam} className="neon-btn" style={{ width: "100%", opacity: questions.length > 0 ? 1 : 0.5 }}>START EXAM</button>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: "40px", maxWidth: "800px", width: "100%" }}>
          <div style={{ border: "1px solid #ff0055", padding: "10px", borderRadius: "5px", marginBottom: "20px", textAlign: "center", color: "#ff0055" }}>⚠️ DO NOT CLICK OUTSIDE</div>
          <h2 style={{ color: "#00f2ff", marginBottom: "20px" }}>{selectedDomain}</h2>
          {questions.map((q, i) => (
            <div key={q._id} style={{ marginBottom: "30px" }}>
              <h3>{i+1}. {q.questionText}</h3>
              <textarea rows="4" style={glassInput} onChange={(e) => handleAnswerChange(q._id, e.target.value)} />
            </div>
          ))}
          <button onClick={handleSubmitExam} className="neon-btn" style={{ width: "100%" }}>SUBMIT</button>
        </div>
      )}
    </div>
  );
};

export default ExamPortal;
import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("Ready to upload");

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");
    const formData = new FormData();
    formData.append('po_file', file);
    setMsg("Processing...");
    
    try {
      await axios.post('http://localhost:5000/upload', formData);
      setMsg("P.O. Processed Successfully!");
    } catch (err) {
      setMsg("Error processing P.O.");
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1 style={{ color: '#2c3e50' }}>Textile Merchandising OS</h1>
      <hr />
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        {/* Upload Box */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', flex: 1 }}>
          <h3><Upload size={18} /> Step 1: Upload P.O.</h3>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ margin: '15px 0', display: 'block' }} />
          <button onClick={handleUpload} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Process PDF
          </button>
          <p style={{ marginTop: '10px', color: '#7f8c8d' }}>Status: <strong>{msg}</strong></p>
        </div>

        {/* Download Box */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', flex: 1 }}>
          <h3><FileSpreadsheet size={18} /> Step 2: Get Summary</h3>
          <p>Once processed, download your Excel summary here.</p>
          <a href="http://localhost:5000/download" target="_blank" rel="noreferrer">
            <button style={{ padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px' }}>
              Download Excel
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
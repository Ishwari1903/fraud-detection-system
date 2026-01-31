import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [location, setLocation] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // पेज लोड झाल्यावर लगेच डेटा आणण्यासाठी
  useEffect(() => {
    fetchHistory();
  }, []);

  // १. नवीन ट्रान्झॅक्शन चेक करणे (Card Number आणि Location सह)
  const handleCheck = async () => {
    if (!amount || !cardNumber || !location) {
      alert("कृपया सर्व माहिती भरा!");
      return;
    }
    try {
      const response = await axios.post('http://localhost:8080/api/transactions', {
        amount: amount,
        cardNumber: cardNumber,
        location: location
      });
      setResult(response.data);
      setAmount(''); setCardNumber(''); setLocation(''); // फॉर्म रिसेट करा
      fetchHistory(); 
    } catch (error) {
      alert("Error: " + (error.response?.data?.amount || "Something went wrong"));
    }
  };

  // २. सर्व हिस्ट्री मिळवणे
  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/transactions/all');
      setHistory(response.data);
    } catch (error) {
      console.error("History fetch करताना एरर आला!", error);
    }
  };

  // ३. डिलीट करणे
  const handleDelete = async (id) => {
    if (window.confirm("तुम्हाला खात्री आहे की हा ट्रान्झॅक्शन डिलीट करायचा आहे?")) {
      try {
        await axios.delete(`http://localhost:8080/api/transactions/${id}`);
        fetchHistory();
      } catch (error) {
        alert("Delete करणे अपयशी ठरले!");
      }
    }
  };

  const filteredHistory = history.filter(t => 
    t.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <header>
        <h1>🔍 Fraud Detection Dashboard</h1>
        <p>Real-time Transaction Monitoring System</p>
      </header>
      
      <div className="input-card">
        <h3>New Transaction</h3>
        <div className="input-group">
          <input type="number" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <input type="text" placeholder="Card Number (XXXX-XXXX)" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
          <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <button className="btn-check" onClick={handleCheck}>Analyze</button>
        </div>
      </div>

      {result && (
        <div className={`result-box ${result.status === 'FRAUD' ? 'fraud' : 'safe'}`}>
          <h3>Analysis Result: {result.status}</h3>
          <p>Transaction ID: #{result.id} | Amount: ₹{result.amount}</p>
        </div>
      )}

      <div className="history-section">
        <div className="history-header">
          <h2>📜 Transaction History</h2>
          <div className="actions">
            <input 
              type="text" 
              placeholder="Filter by Status or Location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
            />
            <button onClick={fetchHistory} className="btn-refresh">🔄 Refresh</button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Time</th>
                <th>Card Number</th>
                <th>Location</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((t) => (
                <tr key={t.id} className={t.status === 'FRAUD' ? 'row-fraud' : ''}>
                  <td>{t.id}</td>
                  <td className="time-cell">{t.timestamp ? t.timestamp : 'Just now'}</td>
                  <td>{t.cardNumber}</td>
                  <td>{t.location}</td>
                  <td className="amount-cell">₹{t.amount}</td>
                  <td>
                    <span className={`status-badge ${t.status.toLowerCase()}`}>{t.status}</span>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(t.id)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
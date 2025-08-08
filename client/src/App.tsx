import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DealsList from './pages/DealsList';
import DealDetail from './pages/DealDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Login page */}
          <Route path="/login" element={<Login />} />
          
          {/* Deals list page */}
          <Route path="/deals" element={<DealsList />} />
          
          {/* Deal detail page with tabs */}
          <Route path="/deals/:dealId" element={<DealDetail />} />
          
          {/* Catch all route - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
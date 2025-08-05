// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PendientesForm from "./components/PendientesForm";
import Dashboard from "./pages/Dashboard";
import Actividades from "./components/Actividades";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PendientesForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/actividades" element={<Actividades />} />
      </Routes>
    </Router>
  );
}


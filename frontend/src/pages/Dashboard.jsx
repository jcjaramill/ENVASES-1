// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import MaintenanceCard from "../components/MaintenanceCard";

export default function Dashboard() {
  const [actividades, setActividades] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8002/pendientes");
        const data = await res.json();
        setActividades(data.ordenes);
      } catch (err) {
        console.error("Error al obtener actividades:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Actualiza cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Seguimiento de Actividades de Mantenimiento
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {actividades.map((actividad) => (
          <MaintenanceCard key={actividad.id} actividad={actividad} />
        ))}
      </div>
    </div>
  );
}

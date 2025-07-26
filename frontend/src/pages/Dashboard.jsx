import React, { useEffect, useState, useRef } from "react";
import MaintenanceCard from "../components/MaintenanceCard";
import { useWebSocket } from "../hooks/useWebScket";
import toast from "react-hot-toast";


const WS_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [ordenes, setOrdenes] = useState([]);
  const [ordenesPrevias, setOrdenesPrevias] = useState([]);
 
  
  const totalPendientes = ordenes.filter(o => o.status === "pendiente").length;
  const totalEnProceso = ordenes.filter(o => o.status === "en_proceso").length;
  const totalCompletadas = ordenes.filter(o => o.status === "completado").length;

  const contenedorRef = useRef();
  const scrollIntervalRef = useRef();

  useWebSocket({
    url: `${WS_URL}/ws/pendientes`,
    onMessage: (data) => setOrdenes(data),
  });

  useEffect(() => {
    if (!contenedorRef.current || ordenes.length === 0) return;

    const scrollPaso = 120; // píxeles por paso
    const intervalo = 3000; // milisegundos
    let direccion = 1;

    scrollIntervalRef.current = setInterval(() => {
      const el = contenedorRef.current;
      if (!el) return;

      el.scrollBy({ top: scrollPaso * direccion, behavior: "smooth" });

      const alFinal = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;
      const alInicio = el.scrollTop <= 0;

      if (alFinal) {
        direccion = -1;
      } else if (alInicio) {
        direccion = 1;
      }
    }, intervalo);

    return () => clearInterval(scrollIntervalRef.current);
  }, [ordenes.length]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl mb-6 text-center">
        Dashboard Actividades Mantenimiento Envases
      </h1>

      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-300">
        <div className="bg-gray-800 p-3 rounded shadow text-center">
          <p className="text-xs uppercase text-gray-400">Total</p>
          <p className="text-lg font-bold text-blue-400">{ordenes.length}</p>
        </div>
        <div className="bg-red-900 p-3 rounded shadow text-center">
          <p className="text-xs uppercase text-red-200">Pendientes</p>
          <p className="text-lg font-bold text-red-400">{totalPendientes}</p>
        </div>
        <div className="bg-yellow-900 p-3 rounded shadow text-center">
          <p className="text-xs uppercase text-yellow-200">En proceso</p>
          <p className="text-lg font-bold text-yellow-400">{totalEnProceso}</p>
        </div>
        <div className="bg-green-900 p-3 rounded shadow text-center">
          <p className="text-xs uppercase text-green-200">Completadas</p>
          <p className="text-lg font-bold text-green-400">{totalCompletadas}</p>
        </div>
      </div>

      <div
        ref={contenedorRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[75vh] overflow-y-auto scroll-smooth pr-2"
      >
        {ordenes.map((orden) => (
          <MaintenanceCard key={orden.id} actividad={orden} />
        ))}
      </div>
    </div>
  );
}

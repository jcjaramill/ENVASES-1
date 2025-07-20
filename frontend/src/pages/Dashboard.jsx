import React, { useEffect, useState, useRef } from "react";
import MaintenanceCard from "../components/MaintenanceCard";
import { useWebSocket } from "../hooks/useWebScket";

export default function Dashboard() {
  const [ordenes, setOrdenes] = useState([]);
  const contenedorRef = useRef();
  const scrollIntervalRef = useRef();

  useWebSocket({
    url: "ws://192.168.1.86:8002/ws/pendientes",
    onMessage: (data) => setOrdenes(data),
  });

  useEffect(() => {
    if (!contenedorRef.current || ordenes.length === 0) return;

    const scrollPaso = 120; // píxeles por paso
    const intervalo = 2000; // milisegundos
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
      <h1 className="text-2xl font-bold mb-6 text-center">
        Dashboard Actividades Mantenimiento Envases
      </h1>

      <div className="text-right text-sm text-gray-300 mb-4">
        Total de actividades: <span className="font-semibold text-blue-400">{ordenes.length}</span>
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

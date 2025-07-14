// src/components/MaintenanceCard.jsx
import React from "react";

const statusStyles = {
  pendiente: "border-red-500 bg-red-100 text-red-800",
  en_proceso: "border-yellow-500 bg-yellow-100 text-yellow-800",
  completado: "border-green-500 bg-green-100 text-green-800",
};

export default function MaintenanceCard({ actividad }) {
  const style = statusStyles[actividad.status] || "border-gray-300 bg-white";

  return (
    <div className={`border-l-4 p-4 rounded shadow ${style}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{actividad.trabajo}</h3>
        <span className="text-sm font-medium">{actividad.status}</span>
      </div>
      <p className="text-sm">Responsable: {actividad.tecnico}</p>
      <p className="text-sm">Fecha: {actividad.fecha}</p>
      {actividad.fecha_registro && (
        <p className="text-sm">Registrado: {actividad.fecha_registro} {actividad.hora_registro}</p>
      )}
    </div>
  );
}

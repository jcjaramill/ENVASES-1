import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { motion } from "framer-motion";

const statusStyles = {
  pendiente: "border-red-500 bg-red-950 text-red-300",
  en_proceso: "border-yellow-500 bg-yellow-900 text-yellow-200",
  completado: "border-green-500 bg-green-900 text-green-200",
};

/*const statusStyles = {
  pendiente: "border-red-500 bg-red-100 text-red-800",
  en_proceso: "border-yellow-500 bg-yellow-100 text-yellow-800",
  completado: "border-green-500 bg-green-100 text-green-800",
};*/

export default function MaintenanceCard({ actividad }) {
  const style = statusStyles[actividad.status] || "border-gray-500 bg-gray-800 text-white";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`border-l-6 p-4 rounded shadow-md ${style}`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{actividad.trabajo}</h3>
        <span className="text-xs uppercase px-2 py-1 bg-black/20 rounded-full">{actividad.status}</span>
      </div>
      <p className="text-sm">👨‍🔧 Responsable: {actividad.tecnico}</p>
      <p className="text-sm">🛠️ Máquina: {actividad.maquina_equipo}</p>
      <p className="text-sm">📍 Línea: {actividad.linea}</p>
      <p className="text-sm">
        🕒 Fecha: {dayjs(actividad.timestamp).locale("es").format("D MMM YYYY HH:mm")}
      </p>
    </motion.div>
  );
}

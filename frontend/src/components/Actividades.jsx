import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { useWebSocket } from "../hooks/useWebScket";
import toast from "react-hot-toast";

const WS_URL = import.meta.env.VITE_WS_URL;
const BASE_URL = import.meta.env.VITE_API_URL;

export default function Actividades() {
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [filtros, setFiltros] = useState({
    status: "",
    tecnico: "",
    linea: "",
    maquina_equipo: "",
  });

  // 🔄 Obtener datos
  useWebSocket({
      url: `${WS_URL}/ws/pendientes`,
      onMessage: (data) => setOrdenes(data),
  });    

  // 🎛️ Opciones únicas para filtros
  const tecnicos = [...new Set(ordenes.map(o => o.tecnico))];
  const lineas = [...new Set(ordenes.map(o => o.linea))];
  const maquinas = [...new Set(ordenes.map(o => o.maquina_equipo))];

  const actualizarFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  // 🧮 Aplicar filtros
  const ordenesFiltradas = ordenes.filter((o) =>
    (!filtros.status || o.status === filtros.status) &&
    (!filtros.tecnico || o.tecnico === filtros.tecnico) &&
    (!filtros.linea || o.linea === filtros.linea) &&
    (!filtros.maquina_equipo || o.maquina_equipo === filtros.maquina_equipo)
  );

  const totalActividades = ordenesFiltradas.length;

  // 🔁 Cambiar estado de orden
  const actualizarEstado = async (id, nuevoEstado) => {
    setCambiandoEstadoId(id);

    try {
      const timestampActual = new Date().toISOString();

      await fetch(`${BASE_URL}/pendientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nuevoEstado,
          timestamp: timestampActual
        }),
      });

      setOrdenes((prev) =>
        prev.map((orden) =>
          orden.id === id
            ? { ...orden, status: nuevoEstado, timestamp: timestampActual }
            : orden
        )
      );
      toast.success(`Actividad actualizada a "${nuevoEstado}"`);

    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }

    setCambiandoEstadoId(null);
  };


  // 🗑️ Eliminar orden completada
  const eliminarOrden = async (id) => {
    try {
      await fetch(`${BASE_URL}/pendientes/${id}`, {
        method: "DELETE",
      });
      setOrdenes((prev) => prev.filter((orden) => orden.id !== id));
    } catch (error) {
      console.error("Error al eliminar orden:", error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-200 min-h-screen text-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Actividades de Mantenimiento</h2>

      {/* 🎛️ Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <select name="status" value={filtros.status} onChange={actualizarFiltro} className="form-input bg-white border border-gray-300 text-gray-800">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En proceso</option>
          <option value="completado">Completado</option>
        </select>
        <select name="tecnico" value={filtros.tecnico} onChange={actualizarFiltro} className="form-input bg-white border border-gray-300 text-gray-800">
          <option value="">Todos los técnicos</option>
          {tecnicos.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select name="linea" value={filtros.linea} onChange={actualizarFiltro} className="form-input bg-white border border-gray-300 text-gray-800">
          <option value="">Todas las líneas</option>
          {lineas.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select name="maquina_equipo" value={filtros.maquina_equipo} onChange={actualizarFiltro} className="form-input bg-white border border-gray-300 text-gray-800">
          <option value="">Todas las máquinas</option>
          {maquinas.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* 📋 Totalizador */}
      <div className="mb-4 text-right text-gray-600 text-lg font-medium">
        Total de actividades: <span className="text-blue-600 font-bold">{totalActividades}</span>
      </div>

      {/* 📋 Actividades */}
      {ordenesFiltradas.map((orden) => (
        <div key={orden.id} className="bg-white p-4 rounded shadow-sm mb-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{orden.trabajo}</h3>
          <p className="text-sm text-gray-700"><strong>Asignado:</strong> {dayjs(orden.timestamp).locale("es").format("D MMM YYYY HH:mm")}</p>
          <p className="text-sm text-gray-700"><strong>Máquina:</strong> {orden.maquina_equipo}</p>
          <p className="text-sm text-gray-700"><strong>Línea:</strong> {orden.linea}</p>
          <p className="text-sm text-gray-700"><strong>Técnico:</strong> {orden.tecnico}</p>
          <p className="text-sm text-gray-700"><strong>Estado:</strong> <span className="font-bold text-blue-600">{orden.status}</span></p>

          <div className="flex gap-2 mt-4 flex-wrap">
            {["pendiente", "en_proceso", "completado"].map((estado) => (
              <button
                key={estado}
                onClick={() => actualizarEstado(orden.id, estado)}
                className={`px-3 py-1 text-sm rounded transition flex items-center justify-center gap-2 min-w-[130px] ${
                  orden.status === estado
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
                disabled={cambiandoEstadoId === orden.id}
              >
                {cambiandoEstadoId === orden.id ? (
                  <span className="w-4 h-4 border-2 border-t-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  `Marcar como ${estado}`
                )}
              </button>
            ))}

            {orden.status === "completado" && (
              <button
                onClick={() => eliminarOrden(orden.id)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Borrar actividad
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

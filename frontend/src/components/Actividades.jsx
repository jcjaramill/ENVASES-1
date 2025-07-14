import { useState, useEffect } from "react";

export default function Actividades() {
  const [ordenes, setOrdenes] = useState([]);
  const [filtros, setFiltros] = useState({
    status: "",
    tecnico: "",
    linea: "",
    maquina_equipo: "",
  });

  // 🔄 Obtener datos
    useEffect(() => {
    const socket = new WebSocket("ws://localhost:8002/ws/pendientes");

    socket.onopen = () => console.log("Conexión WebSocket abierta");
    socket.onmessage = (event) => {
        try {
        const nuevosDatos = JSON.parse(event.data);
        setOrdenes(nuevosDatos);
        } catch (err) {
        console.error("Error al procesar WebSocket:", err);
        }
    };
    socket.onerror = (err) => console.error("WebSocket error:", err);
    socket.onclose = () => console.log("Conexión WebSocket cerrada");

    return () => socket.close(); // solo cierra cuando el componente se desmonta
    }, []);
    

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

  // 🔁 Cambiar estado de orden
  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await fetch(`http://localhost:8002/pendientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nuevoEstado }),
      });

      setOrdenes((prev) =>
        prev.map((orden) =>
          orden.id === id ? { ...orden, status: nuevoEstado } : orden
        )
      );
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  // 🗑️ Eliminar orden completada
  const eliminarOrden = async (id) => {
    try {
      await fetch(`http://localhost:8002/pendientes/${id}`, {
        method: "DELETE",
      });
      setOrdenes((prev) => prev.filter((orden) => orden.id !== id));
    } catch (error) {
      console.error("Error al eliminar orden:", error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Actividades de Mantenimiento</h2>

      {/* 🎛️ Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <select name="status" value={filtros.status} onChange={actualizarFiltro} className="form-input">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En proceso</option>
          <option value="completado">Completado</option>
        </select>
        <select name="tecnico" value={filtros.tecnico} onChange={actualizarFiltro} className="form-input">
          <option value="">Todos los técnicos</option>
          {tecnicos.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select name="linea" value={filtros.linea} onChange={actualizarFiltro} className="form-input">
          <option value="">Todas las líneas</option>
          {lineas.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select name="maquina_equipo" value={filtros.maquina_equipo} onChange={actualizarFiltro} className="form-input">
          <option value="">Todas las máquinas</option>
          {maquinas.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* 📋 Actividades */}
      {ordenesFiltradas.map((orden) => (
        <div key={orden.id} className="bg-white p-4 rounded shadow mb-5 border">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{orden.trabajo}</h3>
          <p className="text-sm"><strong>Máquina:</strong> {orden.maquina_equipo}</p>
          <p className="text-sm"><strong>Línea:</strong> {orden.linea}</p>
          <p className="text-sm"><strong>Técnico:</strong> {orden.tecnico}</p>
          <p className="text-sm"><strong>Estado:</strong> <span className="font-bold text-blue-600">{orden.status}</span></p>

          <div className="flex gap-2 mt-4 flex-wrap">
            {["pendiente", "en_proceso", "completado"].map((estado) => (
              <button
                key={estado}
                onClick={() => actualizarEstado(orden.id, estado)}
                className={`px-3 py-1 text-sm rounded transition ${
                  orden.status === estado
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Marcar como {estado}
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

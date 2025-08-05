import { useFormActions } from "../hooks/useFormActions";
import { FormGroup } from "./FormGroup";
import { FormRow } from "./FormRow";
import { lineas, tecnicos } from "../data/opciones";
import dayjs from "dayjs";

export default function PendientesForm() {
  const { formData, handleChange, handleSubmit, maquinasDisponibles, errors, inputClasses, cargarCompletadas, mostrarLista, setMostrarLista, completadas, eliminarOrden } = useFormActions();

    return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl p-8 rounded-lg shadow-md">            
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Asignar Trabajo</h2>

            <div className="space-y-4">
                <div>
                    <label className="form-label">Trabajo a realizar</label>
                    <textarea name="trabajo" value={formData.trabajo} onChange={handleChange} rows={3} className={inputClasses("trabajo")} />
                    {errors.trabajo && <p className="text-sm text-red-600">{errors.trabajo}</p>}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:basis-1/2">
                    <label className="form-label">Línea de Producción</label>
                    <select name="linea" value={formData.linea} onChange={handleChange} className={inputClasses("linea")}>
                    <option value="">Seleccionar</option>
                    {lineas.map((linea) => <option key={linea}>{linea}</option>)}
                    </select>
                    {errors.linea && <p className="text-sm text-red-600">{errors.linea}</p>}
                </div>
                <div className="w-full md:basis-1/2">
                    <label className="form-label">Máquina / Equipo</label>
                    <select name="maquina_equipo" value={formData.maquina_equipo} onChange={handleChange} className={inputClasses("maquina_equipo")}>
                    <option value="">Seleccionar</option>
                    {maquinasDisponibles.map((maq) => <option key={maq}>{maq}</option>)}
                    </select>
                    {errors.maquina_equipo && <p className="text-sm text-red-600">{errors.maquina_equipo}</p>}
                </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:basis-1/2">
                    <label className="form-label">Estado</label>
                    <select name="status" value={formData.status} onChange={handleChange} className={inputClasses("status")}>
                    <option value="">Seleccionar</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="completado">Completado</option>
                    </select>
                    {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                </div>
                <div className="w-full md:basis-1/2">
                    <label className="form-label">Técnico Responsable</label>
                    <select name="tecnico" value={formData.tecnico} onChange={handleChange} className={inputClasses("tecnico")}>
                    <option value="">Seleccionar</option>
                    {tecnicos.map((tec) => <option key={tec}>{tec}</option>)}
                    </select>
                    {errors.tecnico && <p className="text-sm text-red-600">{errors.tecnico}</p>}
                </div>
                </div>

                <div>
                <label className="form-label">Observaciones (opcional)</label>
                <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows={2} className="form-input resize-none" />
                </div>

                <button type="submit" className="mt-6 w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded font-semibold transition">
                Registrar
                </button>
            </div>
        </form>


      {/* 🔴 Botón extra para consultar ordenes completadas */}
      {<div className="absolute top-4 right-4">
        <button
          onClick={cargarCompletadas}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
        >
          Trabajos Finalizados
        </button>
      </div>}


    {/* 🗂️ Modal simple para mostrar y borrar órdenes */}
    {mostrarLista && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
        <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-lg border border-gray-300 overflow-y-auto max-h-[80vh]">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Trabajos Finalizados</h3>
            <button
            onClick={() => setMostrarLista(false)}
            className="text-gray-500 hover:text-gray-700 transition text-sm"
            >
            ✕ Cerrar
            </button>
        </div>

        {completadas.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">No se encontraron trabajos finalizados.</p>
        ) : (
            <div className="space-y-4">
            {completadas.map((orden) => (
                <div
                key={orden.id}
                className="border-l-4 border-green-600 bg-green-50 text-green-900 p-5 rounded-md shadow-sm"
                >
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">{orden.trabajo}</h4>
                    <span className="text-xs font-medium bg-green-100 px-2 py-1 rounded-full border border-green-300">
                    ✅ Completado
                    </span>
                </div>
                <p className="text-sm mt-1">🛠️ <span className="font-medium">Máquina:</span> {orden.maquina_equipo}</p>
                <p className="text-sm">👨‍🔧 <span className="font-medium">Técnico:</span> {orden.tecnico}</p>
                <p className="text-sm">📍 <span className="font-medium">Línea:</span> {orden.linea}</p>
                <p className="text-sm">🕒 <span className="font-medium">Fecha:</span> {dayjs(orden.timestamp).locale("es").format("D MMM YYYY HH:mm")}</p>

                <button
                    onClick={() => eliminarOrden(orden.id)}
                    className="mt-3 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition"
                >
                    Eliminar y Archivar
                </button>
                </div>
            ))}
            </div>
        )}
        </div>
    </div>
    )}

    </div>
    );

}

import { useFormActions } from "../hooks/useFormActions";
import { FormGroup } from "./FormGroup";
import { FormRow } from "./FormRow";
import { lineas, tecnicos } from "../data/opciones";

export default function PendientesForm() {
  const { formData, handleChange, handleSubmit, maquinasDisponibles, errors, inputClasses } = useFormActions();

    return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Registrar Intervención</h2>

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
            Registrar Orden
            </button>
        </div>
        </form>
    </div>
    );

}

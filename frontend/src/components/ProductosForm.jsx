import { useFormActions } from "../hooks/useFormActions";
import { FormGroup } from "./FormGroup";
import { FormRow } from "./FormRow";
import { lineas, tecnicos } from "../data/opciones";
import dayjs from "dayjs";

export default function PendientesForm() {
  const { formData, handleChange, handleCheckboxChange, handleSubmit, maquinasDisponibles, errors, inputClasses, handleProductoChange, cargarCompletadas, 
    productosDisponibles, handleFormatoChange, handleSiguienteProductoChange, formatosDisponibles, formatosSiguienteDisponibles,
    mostrarLista, setMostrarLista, completadas, eliminarOrden } = useFormActions();
  
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200 px-4">
        <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Registrar Estado de Producción</h2>

            <div className="space-y-4">
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
                <label className="form-label">Responsable</label>
                <select name="responsable" value={formData.responsable} onChange={handleChange} className={inputClasses("responsable")}>
                    <option value="">Seleccionar</option>
                    {tecnicos.map((tec) => <option key={tec}>{tec}</option>)}
                </select>
                {errors.responsable && <p className="text-sm text-red-600">{errors.responsable}</p>}
                </div>
            </div>

<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:basis-1/2">
    <label className="form-label">Producto Actual</label>
    <select
      name="producto"
      value={formData.producto}
      onChange={handleProductoChange}
      className={inputClasses("producto")}
      disabled={!formData.linea}
    >
      <option value="">Seleccionar producto</option>
      {productosDisponibles.map((prod) => (
        <option key={prod.id} value={prod.id}>
          {prod.nombre}
        </option>
      ))}
    </select>
    {errors.producto && <p className="text-sm text-red-600">{errors.producto}</p>}
  </div>

<div className="w-full md:basis-1/2">
    <label className="form-label">Producto Siguiente</label>
    <select
      name="siguiente_producto"
      value={formData.siguiente_producto}
      onChange={handleSiguienteProductoChange}
      className={inputClasses("siguiente_producto")}
      disabled={!formData.linea}
    >
      <option value="">Seleccionar siguiente producto</option>
      {productosDisponibles.map((prod) => (
        <option key={prod.id} value={prod.id}>
          {prod.nombre}
        </option>
      ))}
    </select>
    {errors.siguiente_producto && <p className="text-sm text-red-600">{errors.siguiente_producto}</p>}
  </div>
</div>

<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:basis-1/2">
    <label className="form-label">Formato Actual</label>
    <select
      name="formato"
      value={formData.formato}
      onChange={handleFormatoChange}
      className={inputClasses("formato")}
      disabled={!formData.producto}
    >
      <option value="">Seleccionar formato</option>
      {formatosDisponibles.map((formato, index) => (
        <option key={index} value={formato}>
          {formato}
        </option>
      ))}
    </select>
    {errors.formato && <p className="text-sm text-red-600">{errors.formato}</p>}
  </div>

<div className="w-full md:basis-1/2">
    <label className="form-label">Formato Siguiente</label>
    <select
      name="siguiente_formato"
      value={formData.siguiente_formato}
      onChange={handleChange}
      className={inputClasses("siguiente_formato")}
      disabled={!formData.siguiente_producto}
    >
      <option value="">Seleccionar formato</option>
      {formatosSiguienteDisponibles.map((formato, index) => (
        <option key={index} value={formato}>
          {formato}
        </option>
      ))}
    </select>
    {errors.siguiente_formato && <p className="text-sm text-red-600">{errors.siguiente_formato}</p>}
  </div>
</div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:basis-1/2">
                <label className="form-label">Estatus</label>
                <select name="status" value={formData.status} onChange={handleChange} className={inputClasses("status")}>
                    <option value="">Seleccionar</option>
                    <option value="en_curso">En curso</option>
                    <option value="detenido">Detenido</option>
                    <option value="finalizado">Finalizado</option>
                </select>
                {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                </div>
                <div className="w-full md:basis-1/2 flex items-center gap-4">
                <label className="form-label">¿Cambio de Formato?</label>
                <input type="checkbox" name="cambio_formato" checked={formData.cambio_formato} onChange={handleCheckboxChange} />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <label className="form-label">¿Producción Activa?</label>
                <input type="checkbox" name="produccion" checked={formData.produccion} onChange={handleCheckboxChange} />
            </div>

            <div>
                <label className="form-label">Observaciones (opcional)</label>
                <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows={2} className="form-input resize-none" />
            </div>

            <button type="submit" className="mt-6 w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded font-semibold transition">
                Registrar Estado
            </button>
            </div>
        </form>
        </div>

    );

}

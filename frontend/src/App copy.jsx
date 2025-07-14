import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function PendientesForm() {
  const [formData, setFormData] = useState({
    trabajo: "",
    maquina_equipo: "",
    linea: "",
    status: "",
    tecnico: "",
    observaciones: "",
  });

  const [maquinasDisponibles, setMaquinasDisponibles] = useState([]);
  const [errors, setErrors] = useState({});

  const maquinasPorLinea = {
    "Línea 1": ["Blistera Uhlmann L1", "Estuchadora Uhlmann L1", "Balanza dinámica L1", "Encajonadora L1"],
    "Línea 2": ["Blistera M92 L2", "Estuchadora HV L2", "Balanza dinámica L2", "Enfajadora L2"],
    "Línea 3": ["Blistera blipack L3", "Estuchadora HV L3", "Balanza dinámica L3", "Tamper L3", "Enfajadora L3"],
    "Línea 4": ["Blistera blipack L4", "Estuchadora HV L4", "Balanza dinámica L4", "Enfajadora L4"],
    "Línea 5": ["Blistera NMX L5", "Estuchadora HV L5", "Balanza dinámica L5", "Encajonadora L5"],
    "Línea 6": ["Blistera Uhlmann L6", "Estuchadora Uhlmann L6", "Balanza dinámica L6", "Enfajadora L6"],
    "Línea 7": ["Blistera Uhlmann L7", "Estuchadora Uhlmann L7", "Balanza dinámica L7", "Enfajadora L7"],
    "Línea 8": ["Blistera Marchesini L8", "Estuchadora Marchesini L8", "Balanza dinámica L8", "Tamper L8"],
    "Línea 9": ["Blistera Uhlmann L9", "Estuchadora Uhlmann L9", "Balanza dinámica L9"],
    "Línea 10": ["Blistera M92 L10", "Estuchadora HV L10", "Balanza dinámica L10", "Enfajadora L10"],
  };

  const lineas = Object.keys(maquinasPorLinea);
  const tecnicos = ["Juan Bolivar", "Miguel Hidalgo", "Andres Muñoz", "Jorge Cardenas", "Jorge Pendola", "Ivan Delgado", "Kevin Nuñez", "Cristopher Martinez"];

  useEffect(() => {
    setMaquinasDisponibles(maquinasPorLinea[formData.linea] || []);
    setFormData({ ...formData, maquina_equipo: "" });
  }, [formData.linea]);

  const validateForm = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (!value && key !== "observaciones") newErrors[key] = "Este campo es obligatorio";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    if (!validateForm()) {
      toast.error("Por favor, completa todos los campos requeridos.");
      return;
    }

    const postData = { ...formData, timestamp };
    const sending = toast.loading("Registrando orden...");

    try {
      const response = await fetch("http://localhost:8002/pendientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        toast.success("Orden registrada con éxito", { id: sending });
        setFormData({ trabajo: "", maquina_equipo: "", linea: "", status: "", tecnico: "", observaciones: "" });
        setMaquinasDisponibles([]);
      } else {
        toast.error("Error al registrar la orden", { id: sending });
      }
    } catch (error) {
      toast.dismiss(sending);
      toast.error("Error de conexión");
      console.error("Error:", error);
    }
  };

  const inputClasses = (field) =>
    `form-input ${errors[field] ? "border-red-500" : ""}`;

  return (
    <form className="bg-white p-6 rounded shadow-md max-w-xl mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4 text-gray-800">Registrar Intervención</h2>

      <label className="form-label">Trabajo a realizar</label>
      <textarea name="trabajo" value={formData.trabajo} onChange={handleChange} rows={3} className={inputClasses("trabajo")} />
      {errors.trabajo && <p className="text-sm text-red-600">{errors.trabajo}</p>}

<div className="flex gap-4">
  <div className="basis-1/2">
    <label className="form-label">Línea de Producción</label>
    <select name="linea" value={formData.linea} onChange={handleChange} className={inputClasses("linea")}>
      <option value="">Seleccionar</option>
      {lineas.map((linea) => <option key={linea}>{linea}</option>)}
    </select>
    {errors.linea && <p className="text-sm text-red-600">{errors.linea}</p>}
  </div>
  <div className="basis-1/2">
    <label className="form-label">Máquina / Equipo</label>
    <select name="maquina_equipo" value={formData.maquina_equipo} onChange={handleChange} className={inputClasses("maquina_equipo")}>
      <option value="">Seleccionar</option>
      {maquinasDisponibles.map((maq) => <option key={maq}>{maq}</option>)}
    </select>
    {errors.maquina_equipo && <p className="text-sm text-red-600">{errors.maquina_equipo}</p>}
  </div>
</div>


      <div className="flex gap-4">
        <div className="basis-1/2">
          <label className="form-label">Estado</label>
          <select name="status" value={formData.status} onChange={handleChange} className={inputClasses("status")}>
            <option value="">Seleccionar</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En proceso</option>
            <option value="completado">Completado</option>
          </select>
          {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
        </div>
        <div className="basis-1/2">
          <label className="form-label">Técnico Responsable</label>
          <select name="tecnico" value={formData.tecnico} onChange={handleChange} className={inputClasses("tecnico")}>
            <option value="">Seleccionar</option>
            {tecnicos.map((tec) => <option key={tec}>{tec}</option>)}
          </select>
          {errors.tecnico && <p className="text-sm text-red-600">{errors.tecnico}</p>}
        </div>
      </div>

      <label className="form-label">Observaciones (opcional)</label>
      <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows={2} className="form-input resize-none" />

      <button type="submit" className="mt-6 w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-semibold transition">
        Registrar Orden
      </button>
    </form>
  );
}

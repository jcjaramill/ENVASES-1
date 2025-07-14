import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { maquinasPorLinea } from "../data/opciones";

export function useFormActions() {
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

  useEffect(() => {
    setMaquinasDisponibles(maquinasPorLinea[formData.linea] || []);
    setFormData(prev => ({ ...prev, maquina_equipo: "" }));
  }, [formData.linea]);

  const validateForm = () => {
    const newErrors = {};
    for (const key in formData) {
      if (!formData[key] && key !== "observaciones") {
        newErrors[key] = "Este campo es obligatorio";
      }
    }
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

    const sending = toast.loading("Registrando orden...");
    const postData = { ...formData, timestamp };

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
        setErrors({});
      } else {
        toast.error("Error al registrar la orden", { id: sending });
      }
    } catch (err) {
      toast.dismiss(sending);
      toast.error("Error de conexión");
    }
  };

  return { formData, handleChange, handleSubmit, maquinasDisponibles, errors, inputClasses: (f) => `form-input ${errors[f] ? "border-red-500" : ""}` };
}

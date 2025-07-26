import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { maquinasPorLinea } from "../data/opciones";

const BASE_URL = import.meta.env.VITE_API_URL;

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
  const [completadas, setCompletadas] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(false);

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
      const response = await fetch(`${BASE_URL}/pendientes`, {
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


  const cargarCompletadas = async () => {
    try {
      const res = await fetch(`${BASE_URL}/ordenes_completadas`);
      const data = await res.json();
      console.log(data)
      setCompletadas(data);
      setMostrarLista(true);
    } catch (err) {
      toast.error("No se pudieron cargar las órdenes completadas");
    }
  };

  const eliminarOrden = async (id) => {
    try {
      await fetch(`${BASE_URL}/ordenes_completadas/${id}`, {
        method: "DELETE",
      });

      setCompletadas((prev) => prev.filter((o) => o.id !== id));
      toast.success("Orden eliminada y archivada");
    } catch (err) {
      toast.error("Error al eliminar la orden");
    }
  };


  return { 
    formData, 
    handleChange, 
    handleSubmit,
     maquinasDisponibles, 
     errors,
     completadas,
     setMostrarLista,
     mostrarLista,
     cargarCompletadas,
     eliminarOrden, 
     inputClasses: (f) => `form-input ${errors[f] ? "border-red-500" : ""}` 
    };
}

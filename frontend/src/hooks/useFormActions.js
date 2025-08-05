import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { productosPorLinea } from "../data/opciones";

const BASE_URL = import.meta.env.VITE_API_URL;

export function useFormActions() {
  const [formData, setFormData] = useState({
    timestamp: "",
    producto: "",
    siguiente_producto: "",
    formato: "",
    siguiente_formato: "",
    linea: "",
    status: "",
    responsable: "",
    cambio_formato: false,
    produccion: false,
    observaciones: ""
  });

  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [formatosDisponibles, setFormatosDisponibles] = useState([]);
  const [formatosSiguienteDisponibles, setFormatosSiguienteDisponibles] = useState([]);
  const [errors, setErrors] = useState({});
  const [completadas, setCompletadas] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(false);

  // 🔄 Cargar productos al seleccionar línea
  useEffect(() => {
    const productos = productosPorLinea[formData.linea] || [];
    setProductosDisponibles(productos);
    setFormatosDisponibles([]);
    setFormData((prev) => ({
      ...prev,
      producto: "",
      formato: "",
      siguiente_producto: "",
      siguiente_formato: ""
    }));
  }, [formData.linea]);

  // ✅ Validación
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

  // 🖊️ Manejadores
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    const exclusividad = {
      cambio_formato: "produccion",
      produccion: "cambio_formato",
    };
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
      [exclusividad[name]]: checked ? false : prev[exclusividad[name]],
    }));
  };

  const handleProductoChange = (e) => {
    const selectedId = e.target.value;
    const producto = productosDisponibles.find(p => p.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      producto: selectedId,
      formato: "",
      siguiente_producto: "", // opcional: puedes predefinir el siguiente
      siguiente_formato: ""
    }));
    setFormatosDisponibles(producto?.formatos || []);
  };

  const handleFormatoChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      formato: e.target.value
    }));
  };

  const handleSiguienteProductoChange = (e) => {
    const selectedId = e.target.value;
    const producto = productosDisponibles.find(p => p.id === selectedId);

    setFormData((prev) => ({
      ...prev,
      siguiente_producto: selectedId,
      siguiente_formato: ""
    }));

    setFormatosSiguienteDisponibles(producto?.formatos || []);
  };
  

  // 🚀 Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    if (!validateForm()) {
      toast.error("Por favor, completa todos los campos requeridos.");
      return;
    }

    const sending = toast.loading("Registrando estado...");
    const postData = { ...formData, timestamp };

    try {
      const response = await fetch(`${BASE_URL}/pendientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        toast.success("Estado registrado con éxito", { id: sending });
        setFormData({
          producto: "",
          siguiente_producto: "",
          formato: "",
          siguiente_formato: "",
          linea: "",
          status: "",
          responsable: "",
          cambio_formato: false,
          produccion: false,
          observaciones: ""
        });
        setProductosDisponibles([]);
        setFormatosDisponibles([]);
        setErrors({});
      } else {
        toast.error("Error al registrar el estado", { id: sending });
      }
    } catch (err) {
      toast.dismiss(sending);
      toast.error("Error de conexión");
    }
  };

  // 📦 Cargar completadas
  const cargarCompletadas = async () => {
    try {
      const res = await fetch(`${BASE_URL}/ordenes_completadas`);
      const data = await res.json();
      setCompletadas(data);
      setMostrarLista(true);
    } catch (err) {
      toast.error("No se pudieron cargar las órdenes completadas");
    }
  };

  // 🗑️ Eliminar orden
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
    handleCheckboxChange,
    handleProductoChange,
    handleFormatoChange,
    handleSiguienteProductoChange,
    formatosSiguienteDisponibles,
    handleSubmit,
    productosDisponibles,
    formatosDisponibles,
    errors,
    completadas,
    setMostrarLista,
    mostrarLista,
    cargarCompletadas,
    eliminarOrden,
    inputClasses: (f) => `form-input ${errors[f] ? "border-red-500" : ""}`
  };
}

import { createContext, useContext, useState, useEffect } from "react";

const FormContext = createContext();
export const useForm = () => useContext(FormContext);

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    nombre_producto: "",
    hora: "",
    linea: "7",
    uc_planificado: 1000,
    nro_caja: "",
    uc_real: "",
    observaciones: "",
    responsable: "",
    status: ""
  });

  const [editandoUC, setEditandoUC] = useState(false);
  const [editandoProducto, setEditandoProducto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [problemaActivado, setProblemaActivado] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [descripcionProblema, setDescripcionProblema] = useState("");
  const [bloquesRegistrados, setBloquesRegistrados] = useState([]);
  const [editandoCajaInicial, setEditandoCajaInicial] = useState(false);
  const [historialCajas, setHistorialCajas] = useState([]);
  const [cajaInicialBloqueada, setCajaInicialBloqueada] = useState(false);
  const [tabla, setTabla] = useState([]);
  




  useEffect(() => {
    const uc = localStorage.getItem("uc_planificado");
    const nombre = localStorage.getItem("nombre_producto");
    setFormData(prev => ({
      ...prev,
      uc_planificado: uc ? parseInt(uc) : 1000,
      nombre_producto: nombre || ""
    }));
  }, []);

  useEffect(() => {
    const registrados = localStorage.getItem("bloquesRegistrados");
    if (registrados) {
      setBloquesRegistrados(JSON.parse(registrados));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem("bloquesRegistrados", JSON.stringify(bloquesRegistrados));
  }, [bloquesRegistrados]);
    
  

  return (
    <FormContext.Provider value={{
      formData, setFormData, editandoUC, setEditandoUC,
      editandoProducto, setEditandoProducto, mensaje, setMensaje,
      problemaActivado, setProblemaActivado, modalAbierto, setModalAbierto,
      descripcionProblema, setDescripcionProblema, bloquesRegistrados, setBloquesRegistrados,
      editandoCajaInicial, setEditandoCajaInicial, historialCajas, setHistorialCajas,
      cajaInicialBloqueada, setCajaInicialBloqueada, tabla, setTabla
    }}>
      {children}
    </FormContext.Provider>
  );
};

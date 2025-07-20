import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export function useWebSocket({ url, onMessage, maxRetries = 5 }) {
  const socketRef = useRef(null);
  const retriesRef = useRef(0);

  const conectar = () => {
    socketRef.current = new WebSocket(url);

    socketRef.current.onopen = () => {
      retriesRef.current = 0;

      // ✅ Cierra la notificación de reconexión si existe
      toast.dismiss("reconnect-toast");

      toast.success("🔗 Conexión WebSocket establecida");
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("Error al procesar WebSocket:", err);
      }
    };

    socketRef.current.onerror = (err) => {
      console.error("❌ Error en WebSocket:", err);
    };

    socketRef.current.onclose = () => {
      console.warn("⚠️ WebSocket cerrado");

      if (retriesRef.current < maxRetries) {
        const delay = Math.min(2000 * 2 ** retriesRef.current, 10000);
        retriesRef.current += 1;

        toast.loading(`🔄 Intentando reconectar (${retriesRef.current})...`, {
          id: "reconnect-toast",
        });

        setTimeout(() => conectar(), delay);
      } else {
        toast.error("🛑 Falló la reconexión WebSocket");
      }
    };
  };

  useEffect(() => {
    conectar();
    return () => socketRef.current?.close();
  }, []);
}

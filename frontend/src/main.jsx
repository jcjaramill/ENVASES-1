import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { FormProvider } from "./context/FormContext";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
    <FormProvider>
      <Toaster position="top-right" />
      <App />
    </FormProvider>
);

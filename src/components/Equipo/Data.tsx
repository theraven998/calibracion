import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelection } from "@/context/SelectionContext";

// Definimos la interfaz de los datos
export interface DataEquipment {
  marca: string;
  serie: string;
  modelo: string;
  ubicacion: string;
  observacion: string;
  codigoInventario: string;
  certificado: string;
  resolucion: string;
  rango?: string;
  unidad?: string;
}

// Definimos las props que recibirá el componente
interface DataProps {
  onDataChange: (data: DataEquipment) => void;
}

function Data({ onDataChange }: DataProps) {
  const { selectedId } = useSelection();

  // Datos iniciales
  const defaultData: DataEquipment = {
    marca: "",
    serie: "",
    modelo: "",
    ubicacion: "",
    observacion: "",
    codigoInventario: "",
    certificado: "",
    resolucion: "",
    rango: "",
    unidad: "",
  };

  const { register, handleSubmit, watch } = useForm<DataEquipment>({
    defaultValues: defaultData, // Cargamos los datos iniciales
  });

  // EFECTO: Suscripción a cambios en tiempo real
  useEffect(() => {
    // Enviamos los datos iniciales al montar el componente
    onDataChange(defaultData);

    // watch con callback crea una suscripción optimizada
    const subscription = watch((value) => {
      // 'value' contiene los campos del formulario. Hacemos cast a DataEquipment
      onDataChange(value as DataEquipment);
    });

    return () => subscription.unsubscribe();
  }, [watch, onDataChange]);

  const onSubmit = (data: DataEquipment) => {
    console.log("Datos enviados localmente:", data);
  };

  return (
    <div className="data-entry-container">
      <form onSubmit={handleSubmit(onSubmit)} className="entry-form">
        <header className="section-header">
          <h1>Registro de Datos Primarios</h1>
          <p>{selectedId} / Plataforma</p>
        </header>

        <section className="data-grid-section equipment-info">
          <h2>1. Identificación del Equipo</h2>
          <div className="info-grid">
            <div className="field-group">
              <label>Marca</label>
              <input {...register("marca")} placeholder="Ej: METTLER TOLEDO" />
            </div>
            <div className="field-group">
              <label>Modelo</label>
              <input {...register("modelo")} placeholder="Ej: BBA231" />
            </div>
            <div className="field-group">
              <label>Serie</label>
              <input {...register("serie")} placeholder="Ej: 12345678" />
            </div>
            <div className="field-group">
              <label>Ubicación</label>
              <input
                {...register("ubicacion")}
                placeholder="Ej: Área de Despacho"
              />
            </div>
            <div className="field-group">
              <label>Inventario</label>
              <input
                {...register("codigoInventario")}
                placeholder="Ej: ACT-001"
              />
            </div>
            <div className="field-group">
              <label>N° Certificado Anterior</label>
              <input
                {...register("certificado")}
                placeholder="Ej: CERT-2023-0001"
              />
            </div>
            <div className="field-group">
              <label>Resolución</label>
              <input
                {...register("resolucion")}
                placeholder="Ej: Resolución 0.01 KG"
              />
            </div>
            <div className="field-group full-width">
              <label>Observaciones</label>
              <input
                {...register("observacion")}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}

export default Data;

import { useForm } from "react-hook-form";
import { useState } from "react";
import "./CalibrationForm.css";

interface CalibrationFormData {
  // Información del Centro de Salud
  nombreCentro: string;
  fechaRecepcion: Date;
  fechaCalibacion: Date;
  direccion: string;
  metrologo: string;

  // Información del Sitio de Calibración
  temperaturaMinima: number;
  temperaturaMaxima: number;
  humedadMinima: number;
  humedadMaxima: number;
  presionBarometrica: number;
  temperaturaDuranteCalibacion: number;
  humedadDuranteCalibacion: number;

  // Notas adicionales
  notas?: string;
}

export default function CalibrationForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<CalibrationFormData>({
    defaultValues: {
      metrologo: "Ingeniera Alejandra Vargas",
    },
  });
  const [metrologos] = useState([
    "Ingeniera Alejandra Vargas",
    "Ingeniero Ruben Ospina",
    "Ingeniera Yury Moncada",
  ]);
  const [fechaRecepcionTexto, setFechaRecepcionTexto] = useState("");
  const [fechaCalibracionTexto, setFechaCalibracionTexto] = useState("");

  // Función para convertir fecha a texto
  const convertirFechaATexto = (fecha: Date): string => {
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${dia} de ${mes} del ${año}`;
  };

  // Manejar cambio de fecha de recepción
  const handleFechaRecepcionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fecha = new Date(e.target.value + "T00:00:00");
    setValue("fechaRecepcion", fecha);
    setFechaRecepcionTexto(convertirFechaATexto(fecha));
  };

  // Manejar cambio de fecha de calibración
  const handleFechaCalibracionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fecha = new Date(e.target.value + "T00:00:00");
    setValue("fechaCalibacion", fecha);
    setFechaCalibracionTexto(convertirFechaATexto(fecha));
  };

  const onSubmit = (data: CalibrationFormData) => {
    // Reemplazar valores vacíos con "N.R"
    const processedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === "" || value === null || value === undefined ? "N.R" : value,
      ])
    );

    console.log("Datos procesados:", processedData);
    console.log("Fecha recepción en texto:", fechaRecepcionTexto);
    console.log("Fecha calibración en texto:", fechaCalibracionTexto);

    // Aquí guardarías los datos en tu base de datos (MongoDB)
    // await saveToDatabase(processedData);
  };
  const continueWithouthData = (e?: React.FormEvent) => {
    e?.preventDefault();
    const currentValues = watch();
    const processedData = Object.fromEntries(
      Object.entries(currentValues).map(([key, value]) => [
        key,
        value === "" || value === null || value === undefined ? "N.R" : value,
      ])
    );
    localStorage.setItem("calibrationFormData", JSON.stringify(processedData));
    window.location.href = "/choose";
  };

  return (
    <div className="calibration-form-container">
      {/* <form onSubmit={handleSubmit(onSubmit)} className="calibration-form"> */}
      <form onSubmit={continueWithouthData} className="calibration-form">
        <h1>Información de Solicitud de Calibración</h1>

        {/* Sección: Información del Centro de Salud */}
        <section className="form-section">
          <h2>Información del Centro de Salud</h2>

          <div className="form-group">
            <label htmlFor="nombreCentro">Nombre del Centro de Salud</label>
            <input
              type="text"
              id="nombreCentro"
              {...register("nombreCentro", {
                required: "Este campo es requerido",
              })}
              placeholder="Ingrese el nombre (minúsculas y mayúsculas, no todo en mayúsculas)"
            />
            {errors.nombreCentro && (
              <span className="error">{errors.nombreCentro.message}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fechaRecepcion">Fecha de Recepción</label>
              <input
                type="date"
                id="fechaRecepcion"
                onChange={handleFechaRecepcionChange}
              />
              {fechaRecepcionTexto && (
                <span className="fecha-texto">{fechaRecepcionTexto}</span>
              )}
              {errors.fechaRecepcion && (
                <span className="error">{errors.fechaRecepcion.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fechaCalibacion">Fecha de Calibración</label>
              <input
                type="date"
                id="fechaCalibacion"
                onChange={handleFechaCalibracionChange}
              />
              {fechaCalibracionTexto && (
                <span className="fecha-texto">{fechaCalibracionTexto}</span>
              )}
              {errors.fechaCalibacion && (
                <span className="error">{errors.fechaCalibacion.message}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección</label>
            <input
              type="text"
              id="direccion"
              {...register("direccion", {
                required: "Este campo es requerido",
              })}
              placeholder="Dirección del centro de salud"
            />
            {errors.direccion && (
              <span className="error">{errors.direccion.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="metrologo">Metrólogo Responsable</label>
            <select
              id="metrologo"
              {...register("metrologo", {
                required: "Este campo es requerido",
              })}
              className="metrologo-select"
            >
              {metrologos.map((metrologo) => (
                <option key={metrologo} value={metrologo}>
                  {metrologo}
                </option>
              ))}
            </select>
            {errors.metrologo && (
              <span className="error">{errors.metrologo.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="notas">Notas (Opcional)</label>
            <textarea
              id="notas"
              {...register("notas")}
              placeholder="Ingrese notas adicionales"
              rows={3}
            />
          </div>
        </section>

        {/* Sección: Información del Sitio de Calibración */}
        <section className="form-section">
          <h2>Información del Sitio de Calibración</h2>

          <div className="form-subsection">
            <h3>Temperatura (°C)</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="temperaturaMinima">Mínima</label>
                <input
                  type="number"
                  step="0.1"
                  id="temperaturaMinima"
                  {...register("temperaturaMinima", {
                    required: "Este campo es requerido",
                    valueAsNumber: true,
                  })}
                  placeholder="Ej: 20.5"
                />
                {errors.temperaturaMinima && (
                  <span className="error">
                    {errors.temperaturaMinima.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="temperaturaMaxima">Máxima</label>
                <input
                  type="number"
                  step="0.1"
                  id="temperaturaMaxima"
                  {...register("temperaturaMaxima", {
                    required: "Este campo es requerido",
                    valueAsNumber: true,
                  })}
                  placeholder="Ej: 25.3"
                />
                {errors.temperaturaMaxima && (
                  <span className="error">
                    {errors.temperaturaMaxima.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="form-subsection">
            <h3>Humedad (%)</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="humedadMinima">Mínima</label>
                <input
                  type="number"
                  step="0.1"
                  id="humedadMinima"
                  {...register("humedadMinima", {
                    required: "Este campo es requerido",
                    valueAsNumber: true,
                  })}
                  placeholder="Ej: 45.0"
                />
                {errors.humedadMinima && (
                  <span className="error">{errors.humedadMinima.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="humedadMaxima">Máxima</label>
                <input
                  type="number"
                  step="0.1"
                  id="humedadMaxima"
                  {...register("humedadMaxima", {
                    required: "Este campo es requerido",
                    valueAsNumber: true,
                  })}
                  placeholder="Ej: 60.5"
                />
                {errors.humedadMaxima && (
                  <span className="error">{errors.humedadMaxima.message}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="presionBarometrica">
              Presión Barométrica (hPa)
            </label>
            <input
              type="number"
              step="0.1"
              id="presionBarometrica"
              {...register("presionBarometrica", {
                required: "Este campo es requerido",
                valueAsNumber: true,
              })}
              placeholder="Ej: 1013.2"
            />
            {errors.presionBarometrica && (
              <span className="error">{errors.presionBarometrica.message}</span>
            )}
          </div>

          <div className="form-subsection">
            <h3>Condiciones Durante la Calibración</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="temperaturaDuranteCalibacion">
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="temperaturaDuranteCalibacion"
                  {...register("temperaturaDuranteCalibacion", {
                    required: "Este campo es requerido",
                    valueAsNumber: true,
                  })}
                  placeholder="Ej: 22.8"
                />
                {errors.temperaturaDuranteCalibacion && (
                  <span className="error">
                    {errors.temperaturaDuranteCalibacion.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="humedadDuranteCalibacion">Humedad (%)</label>
                <input
                  type="number"
                  step="0.1"
                  id="humedadDuranteCalibacion"
                  {...register("humedadDuranteCalibacion", {
                    required: "Este campo es requerido",
                    valueAsNumber: true,
                  })}
                  placeholder="Ej: 52.5"
                />
                {errors.humedadDuranteCalibacion && (
                  <span className="error">
                    {errors.humedadDuranteCalibacion.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Guardar y Continuar
          </button>
        </div>

        <div className="form-info">
          <p>
            <strong>Nota:</strong> Los campos vacíos se registrarán
            automáticamente como "N.R"
          </p>
          <p>
            <strong>Importante:</strong> Todos los datos numéricos deben usar
            punto (.) como decimal (Ej: 1.1)
          </p>
        </div>
      </form>
    </div>
  );
}

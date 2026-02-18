import React, { useState } from "react";
import "./Choose.css";
import Basculas from "../Equipos/Basculas/Basculas";
import Termohigrometros from "../Equipos/Termohigrometros/Termohigrometros";
import HeaderChoose from "../Start/components/Header/HeaderChoose";
import { useSelection } from "@/context/SelectionContext";
import Tensiometros from "../Equipos/Tensiometros/Tensiometros";
import TensiometroDigital from "../Equipos/TensiometroDigital/TensiometroDigital";
import Pulsoximetro from "../Equipos/Pulsoximetro/Pulsoximetros";
import Electrocardiografo from "../Equipos/Electrocardiografo/Electrocardiografo";
import Infrarrojos from "../Equipos/Infrarrojo/Infrarrojo";
import Termometros from "../Equipos/Termometros/Termometros";
import BasculaPesaBebe from "../Equipos/PesaBebe/PesaBebe";
import Monitores from "../Equipos/Monitores/Monitor";
import Desfibriladores from "../Equipos/Desfibriladores/Desfibriladores";
// Definimos los tipos de equipos disponibles
// Esto podría venir de un JSON o base de datos en el futuro
const EQUIPMENT_TYPES = [
  {
    id: "bascula-piso",
    title: "Báscula de Piso",
    icon: "⚖️", // Puedes reemplazar con componentes de iconos reales (ej: Lucide React)
    description: "Plataformas de pesaje industrial y alto alcance.",
  },
  {
    id: "bascula-pesa-bebe",
    title: "Bascula Pesa Bebe",
    icon: "sasf",
    description: "Plataforma para pesar bebe",
  },
  {
    id: "tensiometro",
    title: "Tensiometro",
    icon: "💪",
    description: "Dispositivos para medir la presión arterial.",
  },
  {
    id: "desfibrilador",
    title: "Desfibrilador",
    icon: "",
    description: "Desfibrialdor",
  },
  {
    id: "tensiometro-digital",
    title: "Tensiómetro Digital",
    icon: "📟",
    description: "Dispositivo para medir la presión arterial de forma digital.",
  },
  {
    id: "electrocardiografo",
    title: "Electrocardiógrafo",
    icon: "❤️",
    description: "Equipos para registrar la actividad eléctrica del corazón.",
  },
  {
    id: "termometro",
    title: "Termómetro",
    icon: "🌡️",
    description: "Instrumentos para medir la temperatura corporal o ambiental.",
  },
  {
    id: "infrarrojo",
    title: "Termómetro Infrarrojo",
    icon: "🔥",
    description: "Medición de temperatura sin contacto físico.",
  },
  {
    id: "pulsoximetro",
    title: "Pulsoxímetro",
    description: "Dispositivos para medir la saturación de oxígeno en sangre.",
  },
  {
    id: "monitor-multiparametro",
    title: "Monitor Multiparámetro",
    description: "Monitoreo de múltiples signos vitales en pacientes.",
  },
  {
    id: "pipetas",
    title: "Pipetas",
    description:
      "Instrumentos de laboratorio para medir y transferir volúmenes precisos de líquidos.",
  },
  {
    id: "termohigrometro",
    title: "Termohigrómetros",
    description: "Dispositivos para medir la temperatura y humedad ambiental.",
  },
];

interface ChooseProps {
  onSelect?: (equipmentId: string) => void; // Callback opcional para avisar al padre
}

const renderScreenEquipment = (idEquipment: string) => {
  const content = (() => {
    switch (idEquipment) {
      case "bascula-piso":
        return <Basculas />;
      case "bascula-pesa-bebe":
        return <BasculaPesaBebe />;
      case "tensiometro":
        return <Tensiometros />;
      case "termohigrometro":
        return <Termohigrometros />;
      case "tensiometro-digital":
        return <TensiometroDigital />;
      case "pulsoximetro":
        return <Pulsoximetro />;
      case "electrocardiografo":
        return <Electrocardiografo />;
      case "infrarrojo":
        return <Infrarrojos />;
      case "termometro":
        return <Termometros />;
      case "monitor-multiparametro":
        return <Monitores />;
      case "desfibrilador":
        return <Desfibriladores />;
      default:
        return <h1>Equipo seleccionado: {idEquipment}</h1>;
    }
  })();

  return (
    <div className="equipment-screen">
      <HeaderChoose />
      <div className="equipment-content">{content}</div>
    </div>
  );
};

export default function Choose({ onSelect }: ChooseProps) {
  const { selectedId, setSelectedId } = useSelection();
  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (onSelect) onSelect(id);
  };

  if (selectedId === null) {
    return (
      <div style={{ width: "100%" }}>
        <section className="choose-container">
          <div className="equipment-grid">
            {EQUIPMENT_TYPES.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`equipment-card ${
                  selectedId === item.id ? "active" : ""
                }`}
                aria-pressed={selectedId === item.id}
              >
                <div className="card-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                {selectedId === item.id && (
                  <div className="active-indicator">●</div>
                )}
              </button>
            ))}
          </div>

          <div className="certificates-action">
            <button
              className="btn-highlight"
              onClick={() => {
                window.location.href = "/cloud";
              }}
              aria-label="Ver los certificados almacenados"
              title="Ver los certificados almacenados"
            >
              {/* SVG Icono de Nube (Cloud) simple */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5c0-2.31-1.75-4.22-4-4.45C17.65 6.45 14.65 4 11 4c-3.6 0-6.6 2.35-7.75 5.8A5.002 5.002 0 0 0 1 14.5C1 17.015 3.015 19 5.5 19h12z" />
              </svg>
              <span>Ver certificados en la nube</span>
            </button>
          </div>
        </section>
      </div>
    );
  }
  return renderScreenEquipment(selectedId!);
}

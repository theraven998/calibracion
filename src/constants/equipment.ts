// src/constants/equipment.ts

// Tipado literal para que TS conozca los ids exactos y propiedades
export const EQUIPMENT_OPTIONS = [
  {
    id: "bascula-piso",
    title: "Báscula de Piso",
    icon: "⚖️",
    description: "Plataformas de pesaje industrial y alto alcance.",
  },
  {
    id: "bascula-pesa-bebe",
    title: "Báscula Pesa Bebé",
    icon: "👶",
    description: "Plataforma para pesar bebés.",
  },
  {
    id: "tensiometro",
    title: "Tensiómetro",
    icon: "💪",
    description: "Dispositivos para medir la presión arterial.",
  },
  {
    id: "desfibrilador",
    title: "Desfibrilador",
    icon: "⚡",
    description:
      "Equipos para restaurar el ritmo cardíaco normal en casos de arritmia.",
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
] as const;

export type EquipmentId = (typeof EUIPMENT_OPTIONS)[number]["id"];

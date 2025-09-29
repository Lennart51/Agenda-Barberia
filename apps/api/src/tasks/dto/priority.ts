// Valores válidos de prioridad (runtime)
export const PriorityValues = ['LOW', 'MEDIUM', 'HIGH'] as const;
// Tipo TypeScript equivalente (union de literales)
export type Priority = (typeof PriorityValues)[number];
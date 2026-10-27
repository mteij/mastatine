/** The KLOK is our unit of height: 1 KLOK = 0.168 m. */
export const METRES_PER_KLOK = 0.168;

export function toKlok(metres: number): number {
  return Math.floor(metres / METRES_PER_KLOK);
}

export function toMetres(klok: number): number {
  return klok * METRES_PER_KLOK;
}

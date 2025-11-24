export type TileType = "plain" | "defense" | "resource" | "water" | "event";

export interface TileState {
  x: number;
  y: number;
  type: TileType;
  owner: string | null;
  capture: number;
}

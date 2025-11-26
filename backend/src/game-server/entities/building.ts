export type BuildingType =
  | "base"
  | "barracks"
  | "archery"
  | "heavy_factory"
  | "mage_tower"
  | "turret"
  | "mine"
  | "dock"
  | "airport";

export interface BuildingState {
  id: string;
  owner: string;
  type: BuildingType;
  x: number;
  y: number;
  hp: number;
  level: number;
}

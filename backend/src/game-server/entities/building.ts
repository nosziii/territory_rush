export type BuildingType =
  | "base"
  | "barracks"
  | "archery"
  | "factory"
  | "mage-tower"
  | "turret"
  | "mine"
  | "dock";

export interface BuildingState {
  id: string;
  owner: string;
  type: BuildingType;
  x: number;
  y: number;
  hp: number;
  level: number;
}

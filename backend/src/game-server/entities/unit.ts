export type UnitType = "melee" | "ranged" | "tank" | "mage" | "air" | "ship";

export interface UnitState {
  id: string;
  owner: string;
  type: UnitType;
  x: number;
  y: number;
  hp: number;
  targetX: number;
  targetY: number;
  dmg: number;
  range: number;
  canSail?: boolean;
  canFly?: boolean;
  speed?: number;
}

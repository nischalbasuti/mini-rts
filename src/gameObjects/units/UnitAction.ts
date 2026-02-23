import type { TreeResource } from "../resources/TreeResource";
import type { GoldResource } from "../resources/GoldResource";

export interface Attackable {
  currentHp: number;
  gameObject: { x: number; y: number };
}

export type UnitAction =
  | { type: "move" }
  | { type: "attack"; target: Attackable }
  | { type: "gather"; target: TreeResource | GoldResource };

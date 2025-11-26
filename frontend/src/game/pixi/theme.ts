export const PALETTE = {
  pink: { main: 0xf472b6, dark: 0xdb2777, tailwind: "pink", hex: "#f472b6" },
  green: { main: 0x4ade80, dark: 0x16a34a, tailwind: "green", hex: "#4ade80" },
  violet: { main: 0xa78bfa, dark: 0x7c3aed, tailwind: "violet", hex: "#a78bfa" },
  yellow: { main: 0xfacc15, dark: 0xca8a04, tailwind: "yellow", hex: "#facc15" },
  neutral: { main: 0x94a3b8, dark: 0x64748b, tailwind: "slate", hex: "#94a3b8" },
  water: { main: 0x38bdf8, dark: 0x0ea5e9 },
  resource: { main: 0xfcd34d, dark: 0xd97706 },
};

export type PlayerColor = "pink" | "green" | "violet" | "yellow";

export function getTheme(playerColor: PlayerColor) {
  const colors: PlayerColor[] = ["pink", "green", "violet", "yellow"];
  
  // Remove player color from pool
  const others = colors.filter(c => c !== playerColor);
  
  return {
    player: PALETTE[playerColor],
    ai1: PALETTE[others[0]],
    ai2: PALETTE[others[1]],
    ai3: PALETTE[others[2]],
    neutral: PALETTE.neutral,
    water: PALETTE.water,
    resource: PALETTE.resource,
  };
}

export function getOwnerColor(owner: string | null, playerColor: PlayerColor = "pink") {
  const theme = getTheme(playerColor);
  if (!owner) return theme.neutral;
  if (owner === "player") return theme.player;
  if (owner === "ai1") return theme.ai1;
  if (owner === "ai2") return theme.ai2;
  if (owner === "ai3") return theme.ai3;
  return theme.neutral;
}

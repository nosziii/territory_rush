export async function getProfile(userId: string) {
  // Placeholder profile until DB is wired
  return {
    id: userId,
    username: "Commander",
    level: 1,
    xp: 0,
    softCurrency: 1000,
    hardCurrency: 50,
  };
}

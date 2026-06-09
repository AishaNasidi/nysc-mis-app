import NaijaStates from "nigeria-states-lgas";

export function getAllStates() {
  return NaijaStates.all().map((s) => s.state);
}

export function getLGAsByState(stateName) {
  if (!stateName) return [];
  const found = NaijaStates.all().find(
    (s) => s.state.toLowerCase() === stateName.toLowerCase()
  );
  return found ? found.lgas : [];
}

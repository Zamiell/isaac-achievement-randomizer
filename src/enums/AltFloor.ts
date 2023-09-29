export enum AltFloor {
  CELLAR,
  BURNING_BASEMENT,
  CATACOMBS,
  FLOODED_CAVES,
  NECROPOLIS,
  DANK_DEPTHS,
  UTERO,
  SCARRED_WOMB,
  DROSS,
  ASHPIT,
  GEHENNA,
}

export function getAltFloorName(altFloor: AltFloor): string {
  switch (altFloor) {
    case AltFloor.CELLAR: {
      return "Cellar";
    }

    case AltFloor.BURNING_BASEMENT: {
      return "Burning Basement";
    }

    case AltFloor.CATACOMBS: {
      return "Catacombs";
    }

    case AltFloor.FLOODED_CAVES: {
      return "Flooded Caves";
    }

    case AltFloor.NECROPOLIS: {
      return "Necropolis";
    }

    case AltFloor.DANK_DEPTHS: {
      return "Dank Depths";
    }

    case AltFloor.UTERO: {
      return "Utero";
    }

    case AltFloor.SCARRED_WOMB: {
      return "Scarred Womb";
    }

    case AltFloor.DROSS: {
      return "Dross";
    }

    case AltFloor.ASHPIT: {
      return "Ashpit";
    }

    case AltFloor.GEHENNA: {
      return "Gehenna";
    }
  }
}

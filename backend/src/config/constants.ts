export const STATUTORY_LIMITS = {
  METHANE: {
    SAFE_MAX: 0.75, // DGMS Safe limit (% vol)
    ACTION_THRESHOLD: 1.25, // Power cutoff requirement
    CRITICAL_TRIP: 2.0,
  },
  CARBON_MONOXIDE: {
    SAFE_MAX: 25, // ppm
    WARNING_MAX: 50,
  },
  TEMPERATURE: {
    SAFE_MIN: 20,
    SAFE_MAX: 28,
    WARNING_MAX: 35,
  },
  HUMIDITY: {
    SAFE_MIN: 40,
    SAFE_MAX: 70,
    WARNING_MAX: 85,
  },
  OXYGEN: {
    CRITICAL_MIN: 19.5, // Hypoxia threshold
    SAFE_MIN: 20.8,
  },
  AIR_VELOCITY: {
    STAGNANT_MIN: 0.5, // m/s
    NORMAL_MAX: 2.5,
  },
};

/** Centralised user-goal constants.
 *  When multi-tenancy is added, read these from a `user_goals` table instead. */

export const GOALS = {
  swRatioTarget: 1.57,
  bodyFatRange: "12-18%",
  /** Baseline S/W ratio used for "% to go" calculation */
  swRatioBaseline: 1.0,
} as const;

// Feature flags.
//
// SPOV 7 ("the strategy is subtraction"): an extrinsic reward economy - points,
// badges, streak pressure - undermines intrinsic motivation, and the effect is
// worse for children (Deci, Koestner & Ryan, 1999). So by default the app leads
// with INFORMATIONAL competence feedback (progress toward mastery) and demotes
// the points/streak surfacing. This is a flag, not a deletion, so the change is
// reversible and A/B-testable: flip it on to restore the reward economy.
export const REWARDS_ENABLED = false;

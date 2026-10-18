// Illustrative graph with synthetic IDs — not data from the project.
export const NODES = {
  P01: [60, 190],
  P02: [175, 105],
  P03: [175, 275],
  P04: [295, 55],
  P05: [295, 190],
  P06: [295, 325],
  P07: [420, 85],
  P08: [420, 215],
  P09: [420, 330],
  P10: [545, 150],
  P11: [545, 290],
};
// Directed, acyclic connections: person_a → person_b
export const EDGES = [
  ['P01', 'P02'], ['P01', 'P03'], ['P02', 'P04'], ['P02', 'P05'], ['P03', 'P05'],
  ['P03', 'P06'], ['P04', 'P07'], ['P05', 'P08'], ['P06', 'P09'], ['P08', 'P10'],
  ['P07', 'P10'], ['P11', 'P06'], ['P11', 'P09'],
];

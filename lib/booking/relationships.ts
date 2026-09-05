export const RELATIONSHIPS = [
  { code: 1, label: "Father" }, { code: 2, label: "Mother" },
  { code: 3, label: "Husband" }, { code: 4, label: "Wife" },
  { code: 26, label: "Partner" }, { code: 5, label: "Son" },
  { code: 6, label: "Daughter" }, { code: 7, label: "Brother" },
  { code: 8, label: "Sister" }, { code: 9, label: "Friend" },
  { code: 10, label: "Cousin" }, { code: 11, label: "Uncle" },
  { code: 12, label: "Aunt" }, { code: 13, label: "Nephew" },
  { code: 14, label: "Niece" }, { code: 15, label: "Paternal Grandfather" },
  { code: 16, label: "Paternal Grandmother" }, { code: 17, label: "Maternal Grandfather" },
  { code: 18, label: "Maternal Grandmother" }, { code: 20, label: "Twin Brother" },
  { code: 21, label: "Twin Sister" }, { code: 22, label: "Stepbrother" },
  { code: 23, label: "Stepsister" }, { code: 24, label: "Grandson" },
  { code: 25, label: "Granddaughter" }, { code: 27, label: "Brother in Law" },
  { code: 28, label: "Sister in Law" }, { code: 19, label: "Other" },
] as const

export const RELATIONSHIP_CODE_BY_LABEL = Object.fromEntries(
  RELATIONSHIPS.map((r) => [r.label, r.code]),
) as Record<string, number>

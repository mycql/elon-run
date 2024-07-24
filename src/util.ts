export const half = (value: number): number => {
  return value / 2;
};

export const range = (size: number, startAt: number = 0): number[] => {
  return [...Array(size).keys()].map((i) => i + startAt);
};

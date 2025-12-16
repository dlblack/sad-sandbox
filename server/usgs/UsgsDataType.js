export const UsgsDataType = {
  DAILY: "daily",
  INSTANTANEOUS: "instantaneous",
  ANNUAL_PEAKS: "annualPeaks"
};

export const UsgsDataTypeId = {
  [UsgsDataType.DAILY]: "dv",
  [UsgsDataType.INSTANTANEOUS]: "iv",
  [UsgsDataType.ANNUAL_PEAKS]: "peak"
};

export function getUsgsServiceId(type) {
  return UsgsDataTypeId[type];
}

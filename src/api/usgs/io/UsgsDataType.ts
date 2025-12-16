export enum UsgsDataType {
  DAILY = "daily",
  INSTANTANEOUS = "instantaneous",
  ANNUAL_PEAKS = "annualPeaks",
}

export const UsgsDataTypeId: Record<UsgsDataType, string> = {
  [UsgsDataType.DAILY]: "dv",
  [UsgsDataType.INSTANTANEOUS]: "iv",
  [UsgsDataType.ANNUAL_PEAKS]: "peak",
};

export function getUsgsServiceId(type: UsgsDataType): string {
  return UsgsDataTypeId[type];
}

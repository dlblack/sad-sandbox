type MapsSection = "maps"
type DataSection = "data"
type AnalysesSection = "analyses"

export type SectionKey = MapsSection | DataSection | AnalysesSection;

export interface MapItem {
    name: string
    description?: string
    [key: string]: unknown
}

export type DataItem = {
    name: string
    description?: string
    dataFormat?: string
    structureType?: string
    filepath?: string
    [key: string]: unknown
}
export type DataRecord = Record<string, DataItem[]>

export type AnalysesItem = {
    name: string
    description?: string
    [key: string]: unknown
}
export type AnalysesRecord = Record<string, AnalysesItem[]>

export type DeleteArgs =
    | { section: MapsSection; pathArr: [number] }
    | { section: DataSection; pathArr: [string, number] }
    | { section: AnalysesSection; pathArr: [string, number] }

export type SaveAsArgs =
    | {
    section: MapsSection
    pathArr: [number]
    newName: string
    newDesc?: string
    item?: MapItem
}
    | {
    section: DataSection
    pathArr: [string, number]
    newName: string
    newDesc?: string
    item?: DataItem
}
    | {
    section: AnalysesSection
    pathArr: [string, number]
    newName: string
    newDesc?: string
    item?: AnalysesItem
}

export type RenameArgs =
    | { section: MapsSection; pathArr: [number]; newName: string }
    | { section: DataSection; pathArr: [string, number]; newName: string }
    | { section: AnalysesSection; pathArr: [string, number]; newName: string }

export type SaveAsHandler = (args: SaveAsArgs) => Promise<void> | void
export type RenameHandler = (args: RenameArgs) => Promise<void> | void
export type DataSaveHandler = (category: string, values: DataItem) => Promise<void> | void

export type DeleteHandler = (
    section: SectionKey,
    pathArr: [number] | [string, number],
    name?: string
) => Promise<void>;

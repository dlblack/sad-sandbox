export type Section = "maps" | "data" | "analyses";

export type PathArray = (string | number)[];

/** -------- Object-style argument shapes (preferred going forward) -------- */
export type SaveAsArgs = {
    section: Section;
    pathArr: PathArray;
    newName: string;
    newDesc?: string;
    item?: any;
};

export type RenameArgs = {
    section: Section;
    pathArr: PathArray;
    newName: string;
};

export type DeleteArgs = {
    section: Section;
    pathArr: PathArray;
    name?: string;
};

/** -------- Legacy positional function signatures (still supported) -------- */
export type SaveAsPositional = (
    section: Section,
    pathArr: PathArray,
    newName: string,
    newDesc?: string,
    item?: any
) => void | Promise<void>;

export type RenamePositional = (
    section: Section,
    pathArr: PathArray,
    newName: string
) => void | Promise<void>;

export type DeletePositional = (
    section: Section,
    pathArr: PathArray,
    name?: string
) => void | Promise<void>;

/** -------- Object-style function signatures -------- */
export type SaveAsObject = (args: SaveAsArgs) => void | Promise<void>;
export type RenameObject = (args: RenameArgs) => void | Promise<void>;
export type DeleteObject = (args: DeleteArgs) => void | Promise<void>;

/** -------- Public handler unions -------- */
export type SaveAsHandler = SaveAsObject | SaveAsPositional;
export type RenameHandler = RenameObject | RenamePositional;
export type DeleteHandler = DeleteObject | DeletePositional;

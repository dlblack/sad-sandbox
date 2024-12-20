export const standardToolbarHandlers = {
  handleCreate: () => console.log("Create New clicked!"),
  handleOpen: () => console.log("Open a Study clicked!"),
  handleClose: () => console.log("Close the Study clicked!"),
  handleSave: () => console.log("Save the Study clicked!"),
  handlePrint: () => console.log("Print clicked!"),
};

export const clipboardToolbarHandlers = {
  handleCopy: () => console.log("Copy clicked!"),
  handlePaste: () => console.log("Paste clicked!"),
  handleCut: () => console.log("Cut clicked!"),
};

export const mapsToolbarHandlers = {
  handleOpenMap: () => console.log("Open Map clicked!"),
  handleZoom: () => console.log("Zoom clicked!"),
};

export const dssVueHandlers = {
  handleOpenDssVue: () => console.log("HEC-DSSVue clicked!"),
};

import dssIcon from "../assets/images/dss.gif";
import { 
  standardToolbarHandlers, 
  clipboardToolbarHandlers, 
  mapsToolbarHandlers, 
  dssVueHandlers 
} from "../utils/toolbarHandlers";

export const toolbarsConfig = {
  standardtoolbar: [
    { label: "", icon: "create_new_folder", tooltip: "Create New...", onClick: standardToolbarHandlers.handleCreate },
    { label: "", icon: "file_open", tooltip: "Open a Study", onClick: standardToolbarHandlers.handleOpen },
    { label: "", icon: "close", tooltip: "Close the Study", onClick: standardToolbarHandlers.handleClose },
    { label: "", icon: "save", tooltip: "Save the Study", onClick: standardToolbarHandlers.handleSave },
    { label: "", icon: "print", tooltip: "Print", onClick: standardToolbarHandlers.handlePrint },
  ],
  clipboardtoolbar: [
    { label: "", icon: "content_copy", tooltip: "Copy", onClick: clipboardToolbarHandlers.handleCopy },
    { label: "", icon: "content_paste", tooltip: "Paste", onClick: clipboardToolbarHandlers.handlePaste },
    { label: "", icon: "content_cut", tooltip: "Cut", onClick: clipboardToolbarHandlers.handleCut },
  ],
  mapstoolbar: [
    { label: "", icon: "open_in_new", tooltip: "Open a new Map Window", onClick: mapsToolbarHandlers.handleOpenMap },
    { label: "", icon: "center_focus_strong", tooltip: "Set zoom level", onClick: mapsToolbarHandlers.handleZoom },
  ],
  dssvuetoolbar: [
    { label: "", icon: dssIcon, tooltip: "HEC-DSSVue", onClick: dssVueHandlers.handleOpenDssVue },
  ],
};

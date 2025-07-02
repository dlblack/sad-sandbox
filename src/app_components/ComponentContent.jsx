import React, { useContext } from "react";
import TreeNode from "./TreeNode";
import { StyleContext } from "../styles/StyleContext";

function ComponentContent({ analyses = {}, data = {}, maps = [], onSaveAsNode, onRenameNode, onDeleteNode }) {
  const { style } = useContext(StyleContext);

  return (
    <div className={`component-content-root component-content-card${style}`}>
      {/* Maps */}
      <TreeNode label="Maps" isTopLevel>
        {Array.isArray(maps) && maps.length > 0
          ? maps.map((mapObj, idx) => (
              <TreeNode
                key={mapObj.id || mapObj.name || idx}
                label={mapObj.name}
                canDelete={true}
                onDelete={() => onDeleteNode("maps", [idx])}
                onRename={(newName) => onRenameNode("maps", [idx], newName)}
              />
            ))
          : <TreeNode label="(No maps)" />}
      </TreeNode>
      {/* Data */}
      <TreeNode label="Data" isTopLevel>
        {Object.entries(data).map(([parameter, datasets]) => (
          <TreeNode key={parameter} label={parameter}>
            {(datasets || []).map((item, idx) => (
              <TreeNode
                key={item.__tempKey || `${item.name}-${idx}`}
                label={item.name}
                onSaveAs={(newName, newDesc) =>
                  onSaveAsNode("analyses", [parameter, idx], newName, newDesc, item)
                }
                type={parameter}
                description={item.description}
                onRename={(newName) => onRenameNode("data", [parameter, idx], newName)}
                canDelete={true}
                onDelete={() => onDeleteNode("data", [parameter, idx])}
              />
            ))}
          </TreeNode>
        ))}
      </TreeNode>
      {/* Analysis */}
      <TreeNode label="Analysis" isTopLevel>
        {Object.entries(analyses).map(([folder, items]) => (
          <TreeNode key={folder} label={folder}>
            {Array.isArray(items) && items.length
              ? items.map((item, idx) => (
                  <TreeNode
                    key={`${item.name}-${idx}`}
                    label={item.name}
                    onSaveAs={(newName, newDesc) =>
                      onSaveAsNode("analyses", [folder, idx], newName, newDesc, item)
                    }
                    type={folder}
                    description={item.description}
                    onRename={(newName) => onRenameNode("analyses", [folder, idx], newName)}
                    canDelete={true}
                    onDelete={() => onDeleteNode("analyses", [folder, idx])}
                  />
                ))
              : <TreeNode label="(No analyses)" />}
          </TreeNode>
        ))}
      </TreeNode>
    </div>
  );
}

export default ComponentContent;

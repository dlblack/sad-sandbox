import React, { useContext } from "react";
import TreeNode from "./TreeNode";
import { StyleContext } from "../styles/StyleContext";
// import { addEphemeralKeys } from "../utils/ephemeralKeys"; // Only needed if you use it in App

function ComponentContent({ analyses = {}, data = {} }) {
  const { style } = useContext(StyleContext);

  return (
    <div className={`${style}`}>
      {/* Maps */}
      <TreeNode label="Maps" isTopLevel>
        <TreeNode></TreeNode>
      </TreeNode>

      {/* Data */}
      <TreeNode label="Data" isTopLevel>
        {Object.entries(data).map(([parameter, datasets]) => (
          <TreeNode key={parameter} label={parameter}>
            {(datasets || []).map((item, idx) => (
              <TreeNode
                key={item.__tempKey || `${item.name}-${idx}`}
                label={item.name}
              />
            ))}
          </TreeNode>
        ))}
      </TreeNode>

      {/* Analysis */}
      <TreeNode label="Analysis" isTopLevel>
        {Object.entries(analyses).map(([folder, items]) => (
          <TreeNode key={folder} label={folder}>
            {Array.isArray(items) ? (
              items.map((item, idx) => (
                <TreeNode key={`${item.name}-${idx}`} label={item.name} />
              ))
            ) : (
              <TreeNode key="empty" label="(No analyses)" />
            )}
          </TreeNode>
        ))}
      </TreeNode>
    </div>
  );
}

export default ComponentContent;

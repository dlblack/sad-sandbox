import React, { useContext, useEffect, useState } from "react";
import TreeNode from "./TreeNode";
import { StyleContext } from "../styles/StyleContext";

function ComponentContent({ analyses = {} }) {
  const { style } = useContext(StyleContext);

  const [precipData, setPrecipData] = useState([]);
  useEffect(() => {
    fetch("Testing/precipData.json")
    .then((response) => response.json())
    .then((data) => setPrecipData(data))
    .catch(() => setPrecipData([]));
  }, []);

  const [dischargeData, setDischargeData] = useState([]);
  useEffect(() => {
    fetch("Testing/dischargeData.json")
    .then((response) => response.json())
    .then((data) => setDischargeData(data))
    .catch(() => setDischargeData([]));
  }, []);

  return (
    <div className={`${style}`}>
      {/* Maps */}
      <TreeNode label="Maps">
        <TreeNode></TreeNode>
      </TreeNode>

      {/* Data */}
      <TreeNode label="Data">
        <TreeNode label="Precipitation">
          {precipData.map((item, idx) => (
            <TreeNode key={idx} label={item.name} />
          ))}
        </TreeNode>
        <TreeNode label="Discharge">
          {dischargeData.map((item, idx) => (
            <TreeNode key={idx} label={item.name} />
          ))}
        </TreeNode>
      </TreeNode>

      {/* Analysis */}
      <TreeNode label="Analysis">
        {Object.entries(analyses).map(([folder, items]) => (
          <TreeNode key={folder} label={folder}>
            {Array.isArray(items) ? (
              items.map((item) => (
                <TreeNode key={item.name} label={item.name} />
              ))
            ) : (
              // fallback in case items is not an array
              <TreeNode key="empty" label="(No analyses)" />
            )}
          </TreeNode>
        ))}
      </TreeNode>
    </div>
  );
}

export default ComponentContent;

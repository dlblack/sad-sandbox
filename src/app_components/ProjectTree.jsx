import React from "react";
import TreeNode from "./TreeNode";

const ProjectTree = () => (
  <div className="project-tree">
    <TreeNode label="Project">
      <TreeNode label="src">
        <TreeNode label="components">
          <TreeNode label="Header.js" />
          <TreeNode label="Sidebar.js" />
          <TreeNode label="Footer.js" />
        </TreeNode>
        <TreeNode label="styles">
          <TreeNode label="main.css" />
        </TreeNode>
      </TreeNode>
      <TreeNode label="public">
        <TreeNode label="index.html" />
        <TreeNode label="favicon.ico" />
      </TreeNode>
      <TreeNode label="package.json" />
      <TreeNode label="README.md" />
    </TreeNode>
  </div>
);

export default ProjectTree;

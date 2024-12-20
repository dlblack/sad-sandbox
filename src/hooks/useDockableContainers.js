import { useState } from "react";

export function useDockableContainers(initialContainers) {
  const [containers, setContainers] = useState(initialContainers);

  const addComponent = (type) => {
    const existingKey = Object.keys(containers).find(
      (key) => containers[key].type === type
    );

    if (existingKey) {
      alert(`${type} is already open.`);
      return;
    }

    const newComponentId = `${type}-${Date.now()}`;
    const newComponent = {
      [newComponentId]: {
        x: 100,
        y: 100,
        width: type === "Map" ? 500 : 300,
        height: type === "Map" ? 500 : 300,
        type,
      },
    };

    setContainers((prev) => ({ ...prev, ...newComponent }));
  };

  const removeComponent = (id) => {
    setContainers((prev) => {
      const updatedContainers = { ...prev };
      delete updatedContainers[id];
      return updatedContainers;
    });
  };

  return { containers, addComponent, removeComponent };
}

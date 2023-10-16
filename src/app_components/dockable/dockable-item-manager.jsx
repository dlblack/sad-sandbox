class DockableItemManager {
  constructor() {
    this.items = [];
    this.logItemCount(); // Log the initial item count
  }

  addItem(content) {
    const id = this.generateId();
    this.items.push({ id, content });
    this.logItemCount(); // Log the updated item count
    return id;
  }

  removeItem(id) {
    this.items = this.items.filter((item) => item.id !== id);
    this.logItemCount(); // Log the updated item count
  }

  getItems() {
    return this.items;
  }

  generateId() {
    return this.items.length + 1;
  }

  logItemCount() {
    console.log(`Number of items managed: ${this.items.length}`);
  }
}

export default DockableItemManager;

export const registry = {
  components: {},
  controllers: {},
  registerComponent(name, comp) {
    this.components[name] = comp;
    console.log("Component registry:", registry.listComponents?.());
  },
  registerController(name, ctrl) {
    this.controllers[name] = ctrl;
  },
  getComponent(name) {
    return this.components[name];
  },
  getController(name) {
    return this.controllers[name];
  },
  listComponents() {
    return Object.keys(this.components);
  },
};

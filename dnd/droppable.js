import dragContext from './dragContext';

/**
 * DropOptions definition which can be used with v-droppable
 * @private
 * @author volkana
 * @typedef {DropOptions} DropOptions
 * @property {Array} allow
 *  Required - The string array to determine which type of elements can be dropped in the drop zone.
 * @property {string} indicatorClass
 *  This class will be appended to the DropZone if the type is allowed to drop here while dragging over.
 * @property {function} onDrop
 *  This function will be called with (DragOptions.value, DragOptions, DropEvent) when an allowed drop operation is done to the drop zone.
 */

export default class Droppable {
  constructor(el, dropOptions) {
    this.el = el;
    this.dropOptions = dropOptions;

    this.allowListener = this.allowListener.bind(this);
    this.dropListener = this.dropListener.bind(this);
    this.dragleaveListener = this.dragleaveListener.bind(this);

    this.bind();
  }

  allowListener(event) {
    if (!this.dropOptions.allow) {
      return;
    }

    const dropAllowed = this.dropOptions.allow.indexOf(dragContext.type) > -1;
    if (!dropAllowed) {
      return;
    }

    this.addIndicator();
    event.preventDefault();
  }

  addIndicator() {
    this.dropOptions.indicatorClass && this.el.classList.add(this.dropOptions.indicatorClass);
  }

  removeIndicator() {
    this.dropOptions.indicatorClass && this.el.classList.remove(this.dropOptions.indicatorClass);
  }

  dropListener(event) {
    this.removeIndicator();
    this.dropOptions.onDrop(dragContext.item, dragContext, event);
  }

  dragleaveListener() {
    this.removeIndicator();
  }

  bind() {
    this.el.addEventListener('dragover', this.allowListener);
    this.el.addEventListener('drop', this.dropListener);
    this.el.addEventListener('dragleave', this.dragleaveListener);
  }

  destroy() {
    this.el.removeEventListener('dragover', this.allowListener);
    this.el.removeEventListener('drop', this.dropListener);
    this.el.removeEventListener('dragleave', this.dragleaveListener);
    this.el = null;
  }
}

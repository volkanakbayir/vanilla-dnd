import dragContext from './dragContext';

/**
 * DragOptions definition which can be used with v-draggable
 * @private
 * @author volkana
 * @typedef {DragOptions} DragOptions
 * @property {Object} value
 *  Required - The value which will be passed to drop event.
 * @property {string} type
 *  Required - The drag type which will be used to determine allowed drop zones
 * @property {function} createGhost
 *  The generator function to create a ghost HTMLElement instead of default element.
 */

export default class Draggable {
  constructor(el, dragOptions) {
    this.el = el;
    this.dragOptions = dragOptions;
    this.ghost = null;

    this.dragStartListener = this.dragStartListener.bind(this);
    this.dragEndListener = this.dragEndListener.bind(this);

    this.bind();
  }

  dragStartListener(event) {
    const { value, type, createGhost } = this.dragOptions;
    dragContext.item = value;
    dragContext.type = type;
    dragContext.el = this.el;

    createGhost && this.createGhost(event);
  }

  createGhost(event) {
    if (typeof this.dragOptions.createGhost === 'function') {
      this.ghost = this.dragOptions.createGhost(event, dragContext);
    } else {
      this.ghost = event.currentTarget.cloneNode(true);
    }

    const ghostStyle = this.ghost.style;
    ghostStyle.position = 'absolute';
    ghostStyle.top = '0px';
    ghostStyle.left = '-9999px';
    event.dataTransfer.setDragImage && event.dataTransfer.setDragImage(this.ghost, 20, 20);
    document.body.appendChild(this.ghost);
  }

  dragEndListener() {
    dragContext.item = null;
    dragContext.type = null;
    dragContext.el = null;
    this.ghost && document.body.removeChild(this.ghost);
  }

  bind() {
    this.el.draggable = true;
    this.el.addEventListener('dragstart', this.dragStartListener);
    this.el.addEventListener('dragend', this.dragEndListener);
  }

  destroy() {
    this.el.draggable = false;
    this.ghost && this.ghost.remove();
    this.ghost = null;
    this.el.removeEventListener('dragstart', this.dragStartListener);
    this.el.removeEventListener('dragend', this.dragEndListener);
    this.el = null;
  }
}

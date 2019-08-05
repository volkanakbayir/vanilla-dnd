import Draggable from '../dnd/draggable'
import Droppable from '../dnd/droppable'

/**
 * Drag-Drop events DraggableDirective for VueJs.
 * Should be used width DroppableDirective
 * @see DragOptions
 * @author volkana
 * @example
 *  <someelement v-draggable="dragOptions"></someelement>
 */
export const DraggableDirective = {
  bind(el, binding, vnode) {
    vnode.__dragListener = new Draggable(el, binding.value);
  },
  update(el, _binding, vnode, oldVnode) {
    oldVnode.__dragListener && oldVnode.__dragListener.destroy();
    delete oldVnode.__dragListener;
    vnode.__dragListener = new Draggable(el, binding.value);
  },
  unbind(_el, _binding, vnode) {
    vnode.__dragListener && vnode.__dragListener.destroy();
    delete vnode.__dragListener;
  },
};

/**
 * Drag-Drop events DroppableDirective for VueJs.
 * Should be used width DraggableDirective
 * @see DropOptions
 * @author volkana
 * @example
 *  <someelement v-droppable="dropOptions"></someelement>
 */
export const DroppableDirective = {
  bind(el, binding, vnode) {
    vnode.__dropListener = new Droppable(el, binding.value);    
  },
  update(el, binding, vnode, oldVnode) {
    oldVnode.__dropListener && oldVnode.__dropListener.destroy();
    delete oldVnode.__dropListener;
    vnode.__dropListener = new Droppable(el, binding.value);
  },
  unbind(_el, _binding, vnode) {
    vnode.__dropListener && vnode.__dropListener.destroy();
    delete vnode.__dropListener;
  },
};

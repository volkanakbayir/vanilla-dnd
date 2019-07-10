import { expect } from 'chai';
import sinon from 'sinon';
import Draggable from '../../../../src/helpers/dnd/draggable';
import DragContext from '../../../../src/helpers/dnd/dragContext';

describe('Draggable Tests', () => {
  let mockElement;
  let mockRealElement;

  const createBubbledEvent = (type, props = {}) => {
    const event = new Event(type, { bubbles: true });
    Object.assign(event, props);
    return event;
  };

  beforeEach(() => {
    mockElement = {
      addEventListener: sinon.spy(),
      removeEventListener: sinon.spy(),
    };

    mockRealElement = document.createElement('div');
  });

  it('should register drag related events at construction', () => {
    new Draggable(mockElement, {});
    expect(mockElement.addEventListener.called).to.be.true;
    expect(mockElement.addEventListener.calledTwice).to.be.true;
    const registeredEvents = mockElement.addEventListener.getCalls().map(call => call.args[0]);

    expect(registeredEvents.indexOf('dragstart') > -1).to.be.true;
    expect(registeredEvents.indexOf('dragend') > -1).to.be.true;
  });

  it('should register drag related events at destroy', () => {
    const drg = new Draggable(mockElement, {});
    drg.destroy();
    expect(mockElement.removeEventListener.called).to.be.true;
    expect(mockElement.removeEventListener.calledTwice).to.be.true;
    const removedEvents = mockElement.removeEventListener.getCalls().map(call => call.args[0]);

    expect(removedEvents.indexOf('dragstart') > -1).to.be.true;
    expect(removedEvents.indexOf('dragend') > -1).to.be.true;
  });

  it('should remove references with dom after destroy event called', () => {
    const drg = new Draggable(mockElement, {});
    drg.ghost = document.createElement('div');
    expect(drg.el).to.be.ok;
    drg.destroy();
    expect(drg.el).to.be.not.ok;
    expect(drg.ghost).to.be.not.ok;
  });

  it('should use singleton dragContext in order to match with droppable', () => {
    DragContext.el = null;
    const drg = new Draggable(mockRealElement, {});
    mockRealElement.dispatchEvent(new Event('dragstart', {}));
    expect(drg.el).to.be.eql(DragContext.el);
  });

  it('should fill dragContext when dragstart happened', () => {
    const options = {
      value: {},
      type: 'sometype',
      createGhost: sinon.stub().returns(document.createElement('div')),
    };
    const drg = new Draggable(mockRealElement, options);

    mockRealElement.dispatchEvent(createBubbledEvent('dragstart', { clientX: 0, clientY: 0, dataTransfer: { setDragImage: sinon.spy() } }));
    expect(drg.el).to.be.eql(DragContext.el);
    expect(options.value).to.be.eql(DragContext.item);
    expect(options.type).to.be.eql(DragContext.type);
  });

  it('should remove dragContext values when dragend happened', () => {
    const options = {
      value: {},
      type: 'sometype',
    };
    new Draggable(mockRealElement, options);
    mockRealElement.dispatchEvent(createBubbledEvent('dragend', {}));
    expect(null).to.be.eql(DragContext.el);
    expect(null).to.be.eql(DragContext.item);
    expect(null).to.be.eql(DragContext.type);
  });

  it('should remove dragContext values when dragend happened', () => {
    const options = {
      value: {},
      type: 'sometype',
      createGhost: true,
    };
    new Draggable(mockRealElement, options);
    mockRealElement.dispatchEvent(createBubbledEvent('dragstart', { clientX: 0, clientY: 0, dataTransfer: { setDragImage: sinon.spy() } }));
    mockRealElement.dispatchEvent(createBubbledEvent('dragend', {}));
    expect(null).to.be.eql(DragContext.el);
    expect(null).to.be.eql(DragContext.item);
    expect(null).to.be.eql(DragContext.type);
  });

  it('should create a clone from the original element if no createGhost function given', () => {
    const options = {
      value: {},
      type: 'sometype',
      createGhost: true,
    };
    const drg = new Draggable(mockRealElement, options);

    mockRealElement.dispatchEvent(createBubbledEvent('dragstart', { clientX: 0, clientY: 0, dataTransfer: { setDragImage: sinon.spy() } }));
    expect(drg.ghost).to.be.ok;
  });
});

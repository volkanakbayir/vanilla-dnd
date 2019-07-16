import { expect } from 'chai';
import sinon from 'sinon';
import Droppable from './src/helpers/dnd/droppable';
import DragContext from './src/helpers/dnd/dragContext';

describe('Droppable Tests', () => {
  const DND_DROP_CLASS = 'dnd__drop-container';

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
      classList: {
        add: sinon.spy(),
        remove: sinon.spy(),
      },
    };
    mockRealElement = document.createElement('div');
  });

  it('should register drag related events at construction', () => {
    new Droppable(mockElement, {});
    expect(mockElement.addEventListener.calledThrice).to.be.true;
    const registeredEvents = mockElement.addEventListener.getCalls().map(call => call.args[0]);

    expect(registeredEvents.indexOf('dragover') > -1).to.be.true;
    expect(registeredEvents.indexOf('drop') > -1).to.be.true;
    expect(registeredEvents.indexOf('dragleave') > -1).to.be.true;
  });

  it('should register drag related events at destroy', () => {
    const drp = new Droppable(mockElement, {});
    drp.destroy();
    expect(mockElement.removeEventListener.calledThrice).to.be.true;
    const removedEvents = mockElement.removeEventListener.getCalls().map(call => call.args[0]);

    expect(removedEvents.indexOf('dragover') > -1).to.be.true;
    expect(removedEvents.indexOf('drop') > -1).to.be.true;
    expect(removedEvents.indexOf('dragleave') > -1).to.be.true;
  });

  it("should add indicatorClass the the related element's classList", () => {
    const drp = new Droppable(mockRealElement, {
      indicatorClass: 'test1',
    });
    drp.addIndicator();
    expect(mockRealElement.classList.contains('test1')).to.be.true;
  });

  it("should remove indicatorClass the the related element's classList", () => {
    const drp = new Droppable(mockRealElement, {
      indicatorClass: 'test1',
    });
    mockRealElement.classList.add('test1');
    drp.removeIndicator();
    expect(mockRealElement.classList.contains('test1')).to.be.false;
  });

  it('should remove indicatorClass dragLeave happened', () => {
    const drp = new Droppable(mockRealElement, {
      indicatorClass: 'test1',
    });
    drp.addIndicator();
    let shouldRemoveIndicatorStub = sinon.stub(drp, 'shouldRemoveIndicatorWhenDragLeave').returns(false);
    mockRealElement.dispatchEvent(createBubbledEvent('dragleave', {}));
    expect(mockRealElement.classList.contains('test1')).to.be.true;
    shouldRemoveIndicatorStub.returns(true);

    mockRealElement.dispatchEvent(createBubbledEvent('dragleave', {}));
    expect(mockRealElement.classList.contains('test1')).to.be.false;
  });

  it('should remove indicatorClass drop happened', () => {
    const drp = new Droppable(mockRealElement, {
      indicatorClass: 'test1',
      onDrop: sinon.spy(),
    });
    drp.addIndicator();
    mockRealElement.dispatchEvent(createBubbledEvent('drop', {}));
    expect(mockRealElement.classList.contains(DND_DROP_CLASS)).to.be.true;
  });

  it('should call onDrop when drop event happened', () => {
    DragContext.item = { someMockedObjectProp: 1 };
    const onDrop = sinon.spy();
    new Droppable(mockRealElement, {
      onDrop,
    });
    mockRealElement.dispatchEvent(createBubbledEvent('drop', {}));
    expect(onDrop.called).to.be.true;
    expect(onDrop.getCall(0).args[0]).to.be.eql(DragContext.item);
  });

  it('should not allow any drop if no allow types array given', () => {
    let defaultPrevented = false;
    const mockEvent = {
      preventDefault() {
        defaultPrevented = true;
      },
    };
    const drp = new Droppable(mockRealElement, {
      allow: null,
    });

    drp.allowListener(mockEvent);
    expect(defaultPrevented).to.be.false;
  });

  it('should prevent not allowed types to drop', () => {
    let defaultPrevented = false;
    const mockEvent = {
      preventDefault() {
        defaultPrevented = true;
      },
    };
    const drp = new Droppable(mockRealElement, {
      allow: ['allowing'],
    });
    DragContext.type = 'differenttype';
    drp.allowListener(mockEvent);
    expect(defaultPrevented).to.be.false;

    DragContext.type = 'allowing';
    drp.allowListener(mockEvent);
    expect(defaultPrevented).to.be.true;
  });

  it('should call onAllow callback if given and not prevent default if not allowed', () => {
    const onAllow = sinon.stub().returns(false);
    let defaultPrevented = false;
    const mockEvent = {
      preventDefault() {
        defaultPrevented = true;
      },
    };

    const drp = new Droppable(mockRealElement, {
      onAllow,
      allow: ['allowing'],
    });

    DragContext.type = 'allowing';
    drp.allowListener(mockEvent);
    expect(defaultPrevented).to.be.false;
    expect(onAllow.called).to.be.true;
  });

  it(`dragDrop container should have ${DND_DROP_CLASS} class`, () => {
    const mockElement = document.createElement('div');

    const drp = new Droppable(mockRealElement, {});

    let isDragDropContainer = drp.isDropContainer(mockElement);

    expect(isDragDropContainer).to.be.false;
    mockElement.classList.add(DND_DROP_CLASS);
    isDragDropContainer = drp.isDropContainer(mockElement);
    expect(isDragDropContainer).to.be.true;
  });

  it('should return true for descendant element', () => {
    const mockElement = document.createElement('div');
    const drp = new Droppable(mockRealElement, {});

    let isDescendant = drp.isDescendantElement(mockElement);
    expect(isDescendant).to.be.false;

    mockRealElement.appendChild(mockElement);

    isDescendant = drp.isDescendantElement(mockElement);
    expect(isDescendant).to.be.true;
  });

  it('isRootDraggable working properly', () => {
    const mockElement = document.createElement('div');
    const drp = new Droppable(mockRealElement, {});

    let isRoot = drp.isRootDraggable(mockRealElement);
    expect(isRoot).to.be.true;

    isRoot = drp.isRootDraggable(mockElement);
    expect(isRoot).to.be.false;
  });

  it('remove return indicator cases working correctly', () => {
    const drp = new Droppable(mockRealElement, {});
    const descendantStub = sinon.stub(drp, 'isDescendantElement').returns(false);
    const isRootStub = sinon.stub(drp, 'isRootDraggable').returns(false);
    const isDropContainerStub = sinon.stub(drp, 'isDropContainer').returns(false);

    let shouldRemoveIndicator = drp.shouldRemoveIndicatorWhenDragLeave({});
    expect(shouldRemoveIndicator).to.be.true;

    descendantStub.returns(true);

    shouldRemoveIndicator = drp.shouldRemoveIndicatorWhenDragLeave({});
    expect(shouldRemoveIndicator).to.be.false;

    isDropContainerStub.returns(true);

    shouldRemoveIndicator = drp.shouldRemoveIndicatorWhenDragLeave({});
    expect(shouldRemoveIndicator).to.be.true;

    descendantStub.returns(false);
    isRootStub.returns(true);
    shouldRemoveIndicator = drp.shouldRemoveIndicatorWhenDragLeave({});
    expect(shouldRemoveIndicator).to.be.false;
  });
});

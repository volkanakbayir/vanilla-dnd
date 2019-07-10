import { expect } from 'chai';
import sinon from 'sinon';
import Droppable from '../../../../src/helpers/dnd/droppable';
import DragContext from '../../../../src/helpers/dnd/dragContext';

describe('Droppable Tests', () => {
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
    expect(mockRealElement.className).to.eq('test1');
  });

  it("should remove indicatorClass the the related element's classList", () => {
    const drp = new Droppable(mockRealElement, {
      indicatorClass: 'test1',
    });
    mockElement.className = 'test1';
    drp.removeIndicator();
    expect(mockRealElement.className).to.eq('');
  });

  it('should remove indicatorClass dragLeave happened', () => {
    const drp = new Droppable(mockRealElement, {
      indicatorClass: 'test1',
    });
    drp.addIndicator();
    mockRealElement.dispatchEvent(createBubbledEvent('dragleave', {}));
    expect(mockRealElement.className).to.eq('');
  });

  it('should remove indicatorClass drop happened', () => {
    const drp = new Droppable(mockRealElement, {
      indicatorClass: 'test1',
      onDrop: sinon.spy(),
    });
    drp.addIndicator();
    mockRealElement.dispatchEvent(createBubbledEvent('drop', {}));
    expect(mockRealElement.className).to.eq('');
  });

  it('should call onDrop when drop event happened', () => {
    const onDrop = sinon.spy();
    new Droppable(mockRealElement, {
      onDrop,
    });
    mockRealElement.dispatchEvent(createBubbledEvent('drop', {}));
    expect(onDrop.called).to.be.true;
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
});

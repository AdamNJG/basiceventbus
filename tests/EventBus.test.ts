import { describe, expect, test, afterEach } from 'vitest';
import { EventBus } from '../src/EventBus';
import { Test1 } from './testClasses/testModule1';
import { Test2 } from './testClasses/testModule2';

afterEach(() => EventBus.getInstance().reset());

describe('EventBus module', () => {

  test('instantiate, has an empty eventBus', () => {
    // Given a new instantiation of EventBus
    const eventBus = EventBus.getInstance();

    // Then the events array should be empty
    expect(eventBus).not.toBe(undefined);
    expect(eventBus).not.toBe(null);
    expect(Object.keys(eventBus.getSubscriptions()).length).toBe(0);
  });

  test('subscribe, has subsription', () => {
    // Given an Event and an Event Bus
    const eventBus = EventBus.getInstance();
    const func = () => { console.log('hi'); };
    const topic = 'test';

    // When I add the event to the EventBus
    eventBus.subscribe(topic, func);

    // The EventBus array should contain the event
    expect(Object.keys(eventBus.getSubscriptions()).length).toBe(1);
    eventBus.getSubscriptions()[topic].forEach((f) => {
      expect(f).toStrictEqual(func);
    });
  });

  test('with two subscriptions, unsubscribe from one, keeps other subscription', () => {
    // Given two Events in an Event Bus
    const eventBus = EventBus.getInstance();

    const funcA = () => console.log('a');
    const funcB = () => console.log('b');
    const topicA = 'a';
    const topicB = 'b';

    eventBus.subscribe(topicA, funcA);
    eventBus.subscribe(topicB, funcB);

    // When Unsubsribing from an event
    eventBus.unsubscribe(topicA, funcA);

    // Then the event is removed from the eventBus
    expect(eventBus.getSubscriptions()[topicA].size).toBe(0);

    // And the other event is still in the eventBus
    expect(eventBus.getSubscriptions()[topicB].size).toBe(1);
  });

  test('unsubsribe from a named Subscription, keeps other subscriptions', () => {
    // Given three Events in an Event Bus 
    const eventBus = EventBus.getInstance();

    const funcA = () => console.log('a');
    const funcB = () => console.log('b');
    const topicA = 'a';
    const topicB = 'b';

    eventBus.subscribe(topicA, funcA);
    eventBus.subscribe(topicB, funcB);
    eventBus.subscribe(topicA, funcB);

    // when I unsubscribe from any topic called 'a'
    eventBus.unsubscribe(topicA);

    // then only topics that isn't called 'a' should be present
    expect(eventBus.getSubscriptions()[topicA].size).toBe(0);

    expect(eventBus.getSubscriptions()[topicB].size).toBe(1);
  });

  test('unsubsribe from subsription with function used in another subscription, keeps other subscriptions', () => {
    // Given four Events in an Event Bus
    const eventBus = EventBus.getInstance();

    const funcA = () => console.log('a');
    const funcB = () => console.log('b');
    const topicA = 'a';
    const topicB = 'b';

    eventBus.subscribe(topicA, funcA);
    eventBus.subscribe(topicB, funcB);
    eventBus.subscribe(topicA, funcB);
    eventBus.subscribe(topicB, funcA);

    // when I unsubscribe from any topic called 'b' with funcB as the function
    eventBus.unsubscribe(topicB, funcB);

    // Then the topics that didnt contain both 'b' and funcB will be present
    const events: {[topic: string]: Set<() => void>} = eventBus.getSubscriptions();
    expect(Object.keys(events).length).toBe(2);
    expect(events[topicA].size).toBe(2);
    expect(events[topicB].size).toBe(1);
    expect([...events[topicA]].find((f) => f === funcA)).toBe(funcA);
    expect([...events[topicA]].find((f) => f === funcB)).toBe(funcB);
    expect([...events[topicB]].find((f) => f === funcA)).toBe(funcA);
    expect([...events[topicB]].find((f) => f === funcB)).toBe(undefined);
  });

  test('emit an event', () => {
    // Given an Event in an EventBus with an event and a variable to be changed
    let variable = 1;
    const func = (data) => { variable = data; };
    const eventBus = EventBus.getInstance();
    eventBus.subscribe('test', func);

    // When I emit the event using the EventBus, passing the data in
    eventBus.emit('test', 25);

    // then the variable should have changed using the eventBus
    expect(variable).toBe(25);
  });
  
  test('check that eventbus is a singleton', () => {
    // Given an instance of eventBus with some events added to it
    const eventBus = EventBus.getInstance();

    const funcA = () => console.log('a');
    const funcB = () => console.log('b');
    const topicA = 'a';
    const topicB = 'b';

    eventBus.subscribe(topicA, funcA);
    eventBus.subscribe(topicB, funcB);

    // When I call getInstance again
    const eb = EventBus.getInstance();

    // Then the events should still be contained in the bus
    expect(Object.keys(eventBus.getSubscriptions()).length).toBe(2);
    expect(Object.keys(eb.getSubscriptions()).length).toBe(2);
    expect([...eb.getSubscriptions()[topicA]].find(f => f === funcA)).toBe(funcA);
    expect([...eb.getSubscriptions()[topicB]].find(f => f === funcB)).toBe(funcB);
  });
  
  test('reset event array', () => {
    // Given an event bus with an event
    const eventBus = EventBus.getInstance();
    eventBus.subscribe('test', () => console.log('stuff'));

    // When the event array is reset 
    eventBus.reset();

    // Then the event array will be empty
    expect(Object.keys(eventBus.getSubscriptions()).length).toBe(0);
  });

  test('check duplicates', () => {
    // Given an event bus
    const eventBus = EventBus.getInstance();

    // When duplicate eventbinders are added
    const funcA = () => console.log('a');
    const topic = 'a';
    eventBus.subscribe(topic, funcA);
    eventBus.subscribe(topic, funcA);

    // Then only one copy of the eventbinder exists in the Array
    expect(Object.keys(eventBus.getSubscriptions()).length).toBe(1);
    expect(eventBus.getSubscriptions()[topic].size).toBe(1);
  });

  test('check duplicates from seperate modules', () => {
    // Given two modules with identical functions
    const test1 = new Test1();
    const test2 = new Test2();
    const topic = 'test';

    // When they are both subscribed to the same subject
    const eventBus = EventBus.getInstance();
    eventBus.subscribe(topic, test1.func1);
    eventBus.subscribe(topic, test2.func1);

    // Then they will both be present
    expect(Object.keys(eventBus.getSubscriptions()).length).toBe(1);
    expect(eventBus.getSubscriptions()[topic].size).toBe(2);
  });

  test('check that the array cannot be modified without using subscribe', () => {
    // Given an eventBus with a subscription
    const eventBus = EventBus.getInstance();
    const testFunction = () => {
      console.log('test');
    };
    eventBus.subscribe('test', testFunction);

    // When I get the array from the event bus and try to push something to it
    const events = eventBus.getSubscriptions();
    const bobsFunction = () => {
      console.log('bobs function');
    };
    const bobTopic = 'bob';
    events[bobTopic] = new Set<() => void>();
    events[bobTopic].add(bobsFunction);

    // Then the array on the eventBus will not be edited
    expect(eventBus.getSubscriptions()[bobTopic]).toBe(undefined);
    expect(Object.keys(eventBus.getSubscriptions()).length).toBe(1);
  });
  
  test('When multiple arguments are passed, they are passed to the supplied function', () => {
    // Given a function with multiple arugments and an input array 
    const eventBus = EventBus.getInstance();

    let outputArray: string[] = [];

    const func = (...args) => {
      outputArray = args;
    };

    const inputArray = ['hello', 'world'];

    // When I subscribe and emit using the function and multiple arguments extracted from the array
    eventBus.subscribe('test', func);

    eventBus.emit('test', inputArray[0], inputArray[1]);

    // Then the input array and output array should be equal
    expect(inputArray).toStrictEqual(outputArray);
  });
  
  test('Duplicate Arrow functions', () => {
    const eventBus = EventBus.getInstance();

    let count = 0;

    const increment = () => {
      count++;
    };

    eventBus.subscribe('increment', increment);
    eventBus.subscribe('increment', increment);

    eventBus.emit('increment');

    expect(count).toBe(1);
  });

  test('OneMillionSubscriptions_annonymous_countUpdates', () => {
    const eventBus = EventBus.getInstance();

    let count = 0;

    for (let i = 1; i <= 1000000; i++) {
      eventBus.subscribe('increment', () => count++);
    }

    eventBus.emit('increment');

    expect(count).toBe(1000000);
  });
});


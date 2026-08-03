import { ClassifiedEvent } from './types';

class EventStore {
  private events: ClassifiedEvent[] = [];

  add(event: ClassifiedEvent): void {
    this.events.push(event);
  }

  getAll(): ClassifiedEvent[] {
    return this.events;
  }

  getRecent(windowMs: number): ClassifiedEvent[] {
    const cutoff = Date.now() - windowMs;
    return this.events.filter(e => new Date(e.timestamp).getTime() >= cutoff);
  }

  clear(): void {
    this.events = [];
  }
}

export const store = new EventStore();

import { Injectable } from '@angular/core';
import { CalendarEvent } from './calendarEvent.model';
import { JsonLoaderService } from '../../../tools/jsonLoader';
import inputData from '../../../files/input.json'

@Injectable({
  providedIn: 'root'
})
export class CalendarEventService {

  constructor(private jsonLoader: JsonLoaderService) {}

  getEvents(): Promise<CalendarEvent[]> {
    return this.jsonLoader.loadJson<CalendarEvent[]>(inputData);
  }
}
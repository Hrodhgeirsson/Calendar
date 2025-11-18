import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from "@angular/core";
import { CommonModule, isPlatformBrowser  } from '@angular/common';
import {CalendarEvent} from './calendarEvent.model';
import {CalendarEventService} from './calendarEventService'

@Component({
  selector: 'calendar',
   imports: [
    CommonModule
  ],
  templateUrl: 'calendar.component.html',
  styleUrl: 'calendar.css' 
})

export class CalendarComponent implements OnInit {
  events: CalendarEvent[] = []
  hours: number[] = []
  topOffset = 0  
  hourBorder = 1
  hourHeight = 0
  columnWidth = 0
  calendarHeight = 0

  constructor(
    private calendarEventService: CalendarEventService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit(): Promise<void> {
    this.events = await this.calendarEventService.getEvents()
    this.hours = Array.from({ length: 24 }, (_, i) => i)        

    if (isPlatformBrowser(this.platformId)) {
      this.columnWidth = window.innerWidth - 80 // Fix pas top pour éviter le dépassement en largeur (50 de timeline et 30 de marge)
      this.calendarHeight = window.innerHeight - 50
      this.hourHeight = this.calendarHeight / 24
    }    
    this.events = this.computeEventPositions(this.events, this.columnWidth)
  }

  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.columnWidth = window.innerWidth - 80 // Fix pas top pour éviter le dépassement en largeur (50 de timeline et 30 de marge)
      this.calendarHeight = window.innerHeight - 50
      this.hourHeight = this.calendarHeight / 24      
    }

    this.events = this.computeEventPositions(this.events, this.columnWidth)
  }

  getTop(start: string): number {
    const [h, m] = start.split(':').map(Number)
    return (
      this.topOffset +
      h * (this.hourHeight + this.hourBorder) +
      (m / 60) * this.hourHeight
    );
  }

  getHeight(duration: number): number {
    return (duration * this.hourHeight) / 60;
  }

  computeEventPositions(events: CalendarEvent[], columnWidth: number): CalendarEvent[] {
  events.sort((a, b) => this.getTop(a.start) - this.getTop(b.start))
  
  const groups: CalendarEvent[][] = []
  let currentGroup: CalendarEvent[] = []
  let currentGroupEnd = 0

  for (const event of events) {
    const top = this.getTop(event.start)
    const bottom = top + this.getHeight(event.duration)

    if (top >= currentGroupEnd) {
      if (currentGroup.length) groups.push(currentGroup)
      currentGroup = []
      currentGroupEnd = bottom
    }

    currentGroup.push(event)
    currentGroupEnd = Math.max(currentGroupEnd, bottom)
  }

  if (currentGroup.length) groups.push(currentGroup)
  
  for (const group of groups) {
    this.positionStackedGroup(group, columnWidth)
  }

  return events
}

private positionStackedGroup(group: CalendarEvent[], columnWidth: number) {
  if (!group.length) return
  
  const columns: CalendarEvent[][] = []

  for (const event of group) {
    let placed = false

    for (const col of columns) {
      const last = col[col.length - 1]
      if (!this.isOverlap(last, event)) {
        col.push(event)
        placed = true
        break
      }
    }

    if (!placed) {
      columns.push([event])
    }
  }

  const width = columnWidth / columns.length
  
  columns.forEach((col, colIndex) => {
    col.forEach(ev => {
      ev.top = this.getTop(ev.start)
      ev.height = this.getHeight(ev.duration)
      ev.width = width
      ev.left = colIndex * width + 50 // 50 = Largeur de la timeline (surement moyen de faire mieux)
    })
  })
}

  isOverlap(a: CalendarEvent, b: CalendarEvent): boolean {
    const aStart = this.getTop(a.start)
    const aEnd = aStart + this.getHeight(a.duration)
    const bStart = this.getTop(b.start)
    const bEnd = bStart + this.getHeight(b.duration)
    return aStart < bEnd && bStart < aEnd;
  }
}

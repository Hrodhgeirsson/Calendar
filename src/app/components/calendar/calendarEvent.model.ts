export interface CalendarEvent {
  id: number;
  start: string;
  duration: number;

  // tout en px
  top?: number;      
  height?: number;    
  left?: number;      
  width?: number;     
}
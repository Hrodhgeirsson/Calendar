import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JsonLoaderService {

  constructor() {}
  
  async loadJson<T>(jsonFile: T): Promise<T> {    
    return jsonFile;
  }
}

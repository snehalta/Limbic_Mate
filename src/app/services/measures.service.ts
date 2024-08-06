import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MeasuresService {
  private localStorageKey = 'emotionMeasures';

  constructor() { }

  saveMeasures(measures: any[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(measures));
  }

  getMeasures(): any[] {
    const storedMeasures = localStorage.getItem(this.localStorageKey);
    return storedMeasures ? JSON.parse(storedMeasures) : [];
  }
}

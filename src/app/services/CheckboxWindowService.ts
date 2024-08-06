import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CheckboxWindowService {
  isOpen: boolean = false;
  checkboxes: { checked: boolean, disabled: boolean }[] = [
    { checked: false, disabled: false },
    { checked: false, disabled: false },
    { checked: false, disabled: false },
    { checked: false, disabled: false },
    { checked: false, disabled: false }
  ];

  constructor() { }

  toggleCheckbox(index: number): void {
    if (this.isOpen) {
      const checkbox = this.checkboxes[index];
      if (!checkbox.checked) { // Only prompt if the checkbox is unchecked
          checkbox.checked = true;
          checkbox.disabled = true; // Disable the checkbox once it's checked
        }
      }
  }


  isAllChecked(): boolean {
    return this.checkboxes.every(checkbox => checkbox.checked === true);
  }


  resetCheckboxes() {
    this.checkboxes.forEach(checkbox => {
      checkbox.checked = false;
      checkbox.disabled = false;
    });
  }
}

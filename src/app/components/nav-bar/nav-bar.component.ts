import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CheckboxWindowService } from 'src/app/services/CheckboxWindowService';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
  constructor(private router: Router, private checkboxWindowService: CheckboxWindowService) {}
  // In your component class
clicked: boolean = false;

toggleClicked() {
  this.clicked = true;
}


  navigateToEmotionDetection(): void {
    if (this.checkboxWindowService.isAllChecked()) {
      this.checkboxWindowService.isOpen = false; // Close only if all checkboxes are checked
      this.router.navigate(['/emotion-detection']);
    } else {
      // Optionally, you can inform the user to complete all tasks before navigation
      alert("Please complete all tasks before navigating.");
    }
  }
  navigateToProfile(event: Event) {
    event.preventDefault(); // Prevent default link behavior

    this.clicked = true; // Set clicked state to true

    setTimeout(() => {
      this.router.navigate(['/profile']).then(() => {
        this.clicked = false; // Set clicked state to false after navigation is complete
      });
    }, 200); // Adjust timeout duration as needed
  }

}



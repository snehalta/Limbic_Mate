import { Component, OnInit} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/authService';
import { FirebaseConfigService } from 'src/app/services/firebase-config.service';
import { CheckboxWindowService } from 'src/app/services/CheckboxWindowService';
import { DocumentSnapshot } from '@angular/fire/compat/firestore';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})

export class HomePageComponent implements OnInit  {
  username:string = "";
  email: string = "";
  userDetails: any;

  constructor(private router: Router, public authService:AuthService,public firebaseConfigService:FirebaseConfigService, public checkboxWindowService: CheckboxWindowService){
  }
  ngOnInit(): void {
    this.username = this.authService.getCurrentLoggedInUserName() || "";
    console.log("Current username:", this.username);
    this.email = this.authService.getCurrentLoggedInUserEmail() ?? "";
    this.getUserDetails();
  }

  navigateToDiary(){
    this.router.navigateByUrl('/diary');
  }
  navigateToEmotionDetection(){
    this.router.navigateByUrl('/emotionDetection');
  }
  navigateToChatroom(){
    this.router.navigateByUrl('/chatRoom');
  }
  navigateRecommendations(){
    this.router.navigateByUrl('/recommendations');
  }
  getUserDetails(): void {
    this.firebaseConfigService.getUserDetails(this.email)
      .subscribe((userDetails: DocumentSnapshot<unknown> | undefined) => {
        if (userDetails) {
          this.userDetails = userDetails.data();
          console.log('User details:', this.userDetails);
        } else {
          console.log('User details not found');
        }
      }, error => {
        console.error('Error fetching user details:', error);
      });
  }

}




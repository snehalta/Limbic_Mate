import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/authService';
import { FirebaseConfigService } from 'src/app/services/firebase-config.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent {
  constructor(private route: ActivatedRoute,private router: Router,public authService:AuthService,public firebaseConfigService:FirebaseConfigService){

  }


  email: string = "";
  password: string = "";
  phone: string = "";
  name: string = "";
  selectedIntrest = "Sports";
  selectedSubIntrest = "Badminton";
  subIntrestsList = [
    "Badminton",
    "BasketBall",
    "Cricket",
    "Hockey",
    "MotoSports",
    "Soccer",
    "Wrestling"
  ]

  primaryIntrests = [
    "Sports",
    "Travelling",
    "Music",
    "Movies",
  ]

  music = [
    "Classical",
    "Hip-Hop",
    "Mood",
    "Party",
    "Pop"
  ]

  movies = [
    "Action",
    "Comedy",
    "Thriller",
    "Drama",
  ]
  sports = [
    "Badminton",
    "BasketBall",
    "Cricket",
    "Hockey",
    "MotoSports",
    "Soccer",
    "Wrestling"
  ]
  travelling = [
    "Goa",
    "Kerala",
    "Maharashtra",
    "Rajasthan",
    "Uttarakhand"
  ]

  primaryOptionSelected() {
    console.log("Pri: "+this.selectedIntrest);
    if(this.selectedIntrest == "Music"){
      this.subIntrestsList = this.music;
      this.selectedSubIntrest = this.subIntrestsList[0];
    }
    else if(this.selectedIntrest == "Sports"){
      this.subIntrestsList = this.sports;
      this.selectedSubIntrest = this.subIntrestsList[0];
    }
    else if(this.selectedIntrest == "Travelling"){
      this.subIntrestsList = this.travelling;
      this.selectedSubIntrest = this.subIntrestsList[0];
    }
    else if(this.selectedIntrest == "Movies"){
      this.subIntrestsList = this.movies;
      this.selectedSubIntrest = this.subIntrestsList[0];
    }

  }

  secondaryOptionSelected() {
    console.log("Sec: "+this.selectedSubIntrest);
  }


  async register(){
    console.log("Registering user");
    console.log("Name:", this.name); // Check if name is being received correctly
    let userDataMap = {
      "name": this.name,
      "email": this.email,
      "phone": this.phone,
      "password": this.password,
      "primaryIntrest": this.selectedIntrest,
      "secondaryIntrest": this.selectedSubIntrest,
      "diaryText": "",
      "emotionDetectedScore": 0,
    }
    this.authService.SignUp(this.email, this.password, this.name)
    .then((success) => {
      if (success) {
        console.log("Sign up success.");
        console.log("Stored name:", localStorage.getItem('username')); // Log stored name
        this.firebaseConfigService.registerUserInDb(userDataMap);
        this.router.navigate(['/loginPage']);
      } else {
        console.error("Sign up failed.");
        // Handle signup failure, if needed
      }
    })
    .catch((error) => {
      console.error("Sign up error:", error);
      // Handle signup error, if needed
    });
}


}

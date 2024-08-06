import { Component , OnInit} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RecommendationsDataModel } from 'src/app/models/recommendationsDataModel';
import { AuthService } from 'src/app/services/authService';
import { FirebaseConfigService } from 'src/app/services/firebase-config.service';
import { Router } from '@angular/router';
import { CheckboxWindowService } from 'src/app/services/CheckboxWindowService';


@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css']
})
export class RecommendationsComponent implements OnInit{
  ngOnInit(): void {
    this.getUserRecommendationData();
  }

  constructor(public firebaseConfigService:FirebaseConfigService, public authService:AuthService,private sanitizer: DomSanitizer, public router: Router,
    public checkboxWindowService: CheckboxWindowService){}
  primaryIntrest = "";
  secondaryIntrest = "";
  recommendationsList:RecommendationsDataModel[] = [];
  loggedInUserEmail:string = "";
  randomYouTubeUrls: string[] = [
    "https://www.youtube.com/watch?v=ABCDEFG",
    "https://www.youtube.com/watch?v=HIJKLMN",
    "https://www.youtube.com/watch?v=OPQRSTUV",
    "https://www.youtube.com/watch?v=WXYZ123",
    "https://www.youtube.com/watch?v=456ABCDEF",
    "https://www.youtube.com/watch?v=GHIJKLMNOP",
    "https://www.youtube.com/watch?v=QRSTUVWX",
    "https://www.youtube.com/watch?v=YZ123456",
    "https://www.youtube.com/watch?v=ABCDEF12",
    "https://www.youtube.com/watch?v=345GHIJKL"
];
navigateToEmotionDetection(): void {
  if (!this.checkboxWindowService.isOpen) {
    this.router.navigate(['/emotion-detection']);
  }
}
// Function to display the list of random YouTube URLs
displayRandomYouTubeUrls(urls: string[]) {
    const container: HTMLUListElement | null = document.getElementById('random-urls') as HTMLUListElement | null;
    if (container) {
        urls.forEach(url => {
            const listItem: HTMLLIElement = document.createElement('li');
            listItem.textContent = url;
            container.appendChild(listItem);
        });
    } else {
        console.error("Container not found.");
    }
}

isStringMatchingIgnoreCase(str1: string, str2: string): boolean {
  return str1.toLowerCase() === str2.toLowerCase();
}

getYouTubeUrl(videoId: string): SafeResourceUrl {
  const url = `https://www.youtube.com/embed/${videoId}?controls=0`;
  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}
async getUserRecommendationData(){
  this.loggedInUserEmail = this.authService.getCurrentLoggedInUserEmail()??"NA";
  let userIntrestsMap = await this.firebaseConfigService.getUserRecommendations(this.loggedInUserEmail);
  this.primaryIntrest = userIntrestsMap["primary"];
  this.secondaryIntrest = userIntrestsMap["secondary"];
  this.recommendationsList = await this.firebaseConfigService.getRecommendationsData(this.primaryIntrest.toLowerCase(),this.secondaryIntrest);
}

}

import { Component, OnInit, AfterViewInit} from '@angular/core';
import { AuthService } from 'src/app/services/authService';
import { FirebaseConfigService } from 'src/app/services/firebase-config.service';
import { DocumentSnapshot } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit {
  username: string = "";
  useremail : string = "";
  phone:string = "";
  showBarGraph: boolean = false;
  showPieChart: boolean = false;
  showPersonalDetails: boolean = true;
  activeBarGraph: boolean = false;
  activePieChart: boolean = false;
  activePersonal: boolean = true;
  activeButton: string = 'personal';
  buttonText: string = 'Show Recent';
  buttontext: string = 'Edit Profile';
  activebutton: boolean = false;
  Activebutton: boolean = false;
  userDetails: any;
  emotionsData: { emotion: string, value: number }[] = [];
  constructor(public authService: AuthService, public firebaseConfigService: FirebaseConfigService) { }

  ngOnInit(): void {
    this.useremail = this.authService.getCurrentLoggedInUserEmail() || "";
    this.getUserDetails();
  }

  ngAfterViewInit(): void {
  }

  logout():void{
    this.authService.SignOut();
  }
  getUserDetails(): void {
    this.firebaseConfigService.getUserDetails(this.useremail)
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

  async toggleChart(chartType: string): Promise<void> {
    if (chartType === 'bar') {
      this.activeBarGraph = true;
      this.activePieChart = false;
      this.showBarGraph = true;
      this.showPieChart = false;
      this.activePersonal = false;
      this.showPersonalDetails = false;
      this.activeButton = 'bar';
      const { recentEmotionsData } = await this.getRecentEmotions(this.useremail);
      this.drawBarGraph(recentEmotionsData);
      this.getRecentEmotionsAndCalculateAverage(this.useremail);
      this.buttonText = this.buttonText === 'Show Overall' ? 'Show Recent' : 'Show Overall';

    } else if (chartType === 'pie') {
      this.activeBarGraph = false;
      this.activePieChart = true;
      this.showBarGraph = false;
      this.showPieChart = true;
      this.activePersonal = false;
      this.showPersonalDetails = false;
      this.activeButton = 'bar';
      this.buttonText = this.buttonText === 'Show Recent' ? 'Show Overall' : 'Show Recent';
      const { allEmotionsData } = await this.getRecentEmotions(this.useremail);
      this.drawPieChart(allEmotionsData);

    } else if (chartType === 'personal') {
      this.activeBarGraph = false;
      this.activePieChart = false;
      this.activeButton = 'personal';
      this.activePersonal = true;
      this.showPersonalDetails = true;
      this.getUserDetails();
    } else if(chartType === 'edit'){
      this.buttontext = this.buttontext === 'Edit Profile' ? 'Save Changes' : 'Edit Profile';
      this.activebutton = true;
      this.Activebutton = true;
      this.getUserDetails();
      this.username = this.userDetails?.name;
      this.selectedIntrest = this.userDetails?.primaryIntrest;
      this.selectedSubIntrest = this.userDetails?.secondaryIntrest;
    }else if(chartType === 'view'){
      this.buttontext = this.buttontext === 'Save Changes' ? 'Edit Profile' : 'Save Changes';
      this.activebutton = true;
      this.Activebutton = false;
      this.getUserDetails();
      try {
        // Call a method to update user details in the database
        await this.updateUser();
        console.log('User details updated successfully.');
      } catch (error) {
        console.error('Error updating user details:', error);
      }
    }else if(chartType === 'cancel'){
      this.buttontext = this.buttontext === 'Save Changes' ? 'Edit Profile' : 'Save Changes';
      this.activebutton = false;
      this.Activebutton = false;
    }

  }

  async getRecentEmotions(userEmail: string): Promise<{ recentEmotionsData: any, allEmotionsData: any }> {
    try {
      const recentEmotions = await this.firebaseConfigService.getRecentEmotions(userEmail);
      console.log("Recent emotions for user " + userEmail + ":", recentEmotions.slice(0, 10));

      // Calculate emotion counts for recent 10 emotions
      const totalSadCount = recentEmotions.slice(0, 10).filter(emotion => emotion === 'Sad').length;
      const totalHappyCount = recentEmotions.slice(0, 10).filter(emotion => emotion === 'Happy').length;
      const totalNeutralCount = recentEmotions.slice(0, 10).filter(emotion => emotion === 'Neutral').length;

      // Create data for bar graph using recent 10 emotions
      const recentEmotionsData = [
        { emotion: 'Sad', value: totalSadCount },
        { emotion: 'Happy', value: totalHappyCount },
        { emotion: 'Neutral', value: totalNeutralCount }
      ];

      // Fetch all emotions for pie chart
      const allUserEmotions = await this.firebaseConfigService.getRecentEmotions(userEmail);

      // Calculate emotion counts for all emotions
      const totalSadCountAll = allUserEmotions.filter(emotion => emotion === 'Sad').length;
      const totalHappyCountAll = allUserEmotions.filter(emotion => emotion === 'Happy').length;
      const totalNeutralCountAll = allUserEmotions.filter(emotion => emotion === 'Neutral').length;

      // Create data for pie chart using all emotions
      const allEmotionsData = [
        { emotion: 'Sad', value: totalSadCountAll },
        { emotion: 'Happy', value: totalHappyCountAll },
        { emotion: 'Neutral', value: totalNeutralCountAll }
      ];

      return { recentEmotionsData, allEmotionsData }; // Return the data

    } catch (error) {
      console.error('Error fetching recent emotions:', error);
      throw error;
    }
  }

  async getRecentEmotionsAndCalculateAverage(userEmail: string): Promise<void> {
    try {
      const recentEmotions = await this.firebaseConfigService.getRecentEmotions(userEmail);
      if (recentEmotions.length < 5) {
        console.log("User does not have enough recent emotions.");
        return;
      }
      // Get recent emotions for the user
      console.log("Recent emotions for user " + userEmail + ":", recentEmotions.slice(0, 10));

      // Calculate total counts of each emotion
      const totalSadCount = recentEmotions.slice(0, 10).filter(emotion => emotion === 'Sad').length;
      const totalHappyCount = recentEmotions.slice(0, 10).filter(emotion => emotion === 'Happy').length;
      const totalNeutralCount = recentEmotions.slice(0, 10).filter(emotion => emotion === 'Neutral').length;

      const totalEmotionsCount = recentEmotions.length;

      // Calculate the average emotion
      let averageEmotion: string;
      if (totalSadCount >= totalHappyCount && totalSadCount >= totalNeutralCount) {
        averageEmotion = "Sad";
      } else if (totalHappyCount >= totalSadCount && totalHappyCount >= totalNeutralCount) {
        averageEmotion = "Happy";
      } else {
        averageEmotion = "Neutral";
      }

      // Log the total counts of each emotion
      console.log("Total Sad Count:", totalSadCount);
      console.log("Total Happy Count:", totalHappyCount);
      console.log("Total Neutral Count:", totalNeutralCount);

      // Log the average emotion to the console
      console.log("Average emotion for user " + userEmail + ":", averageEmotion);

      // Display a message based on the average emotion
      if (averageEmotion === "Sad") {
        window.alert("Since the last analysis, user seems to be Sad. It is suggested to consult a doctor.");
      } else if (averageEmotion === "Happy") {
        window.alert("Since the last analysis, user seems to be Happy. Stay like this throughout life.");
      } else {
        window.alert("Since the last analysis, user seems to be Neutral. It's good to see you like this.");
      }
    } catch (error) {
      console.error('Error fetching recent emotions:', error);
      throw error;
    }
  }
  drawBarGraph(emotionsData: { emotion: string, value: number }[]): void {
    const canvas = <HTMLCanvasElement>document.getElementById('emotionCanvas');
    const context = canvas?.getContext('2d');
    if (!context) {
      console.error('Canvas context not found.');
      return;
    }

    const maxBarWidth = canvas.width - 100; // Maximum width for bars
    const barHeight = 50; // Height of each bar
    const gap = 80; // Gap between bars
    const startX = 100; // X-coordinate to start drawing bars
    const startY = 100; // Y-coordinate to start drawing bars

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw heading
    context.font = 'bold 30px Arial';
    context.fillStyle = '#000';
    context.textAlign = 'center'; // Center align text
    context.fillText('Recent Reports', canvas.width / 2, 40); // Place heading at the top center

    // Define colors for bars
    const colors = ['#112e4b', '#164a7f', '#2279d0'];
    const defaultColor = '#000'; // Color for remaining bars

    // Draw bars
    for (let i = 0; i < emotionsData.length; i++) {
      const barWidth = (emotionsData[i].value / 10) * maxBarWidth;
      const x = startX;
      const y = startY + (barHeight + gap) * i+50; // Move bars down by startY

      // Set the fill style for the current bar
      context.fillStyle = i < colors.length ? colors[i] : defaultColor;

      // Draw the bar
      context.fillRect(x, y, barWidth, barHeight);

      // Draw bar labels
      context.font = '20px Arial';
      context.fillStyle = '#000';
      const labelX = x - 60;
      const labelY = y + barHeight / 2 + 10;
      context.fillText(emotionsData[i].emotion, labelX, labelY);
    }
}



  drawPieChart(emotionsData: { emotion: string, value: number }[]): void {
    const canvas = <HTMLCanvasElement>document.getElementById('emotionCanvas');
    const context = canvas?.getContext('2d'); // Null check added here
    if (!context) {
      console.error('Canvas context not found.');
      return;
    }

    const centerX = canvas.width / 2;
    const centerY = (canvas.height / 2)+35;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 50;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate total value of all emotions
    const totalValue = emotionsData.reduce((sum, emotion) => sum + emotion.value, 0);

    let startAngle = -Math.PI / 2; // Start angle at the top
    let endAngle = 0;
    context.font = 'bold 30px Arial';
    context.fillStyle = '#000';
    context.textAlign = 'center'; // Center align text
    context.fillText('Overall Reports', canvas.width / 2, 40);

    // Define an array of colors
    const colors = ['#112e4b', '#164a7f', '#2279d0'];

    // Display count of each emotion
    let offsetY = 100;
    for (let i = 0; i < emotionsData.length; i++) {
      context.fillStyle = '#000';
      context.font = '20px Arial';
      context.textAlign = 'left';
      context.fillText(`${emotionsData[i].emotion}: ${emotionsData[i].value}`, 20, offsetY+50);
      offsetY += 30;
    }

    // Display total count of all emotions
    const totalCount = emotionsData.reduce((sum, emotion) => sum + emotion.value, 0);
    context.fillText(`Total Count: ${totalCount}`, 20, offsetY + 70);

    for (let i = 0; i < emotionsData.length; i++) {
      const slicePercentage = (emotionsData[i].value / totalValue) * 100; // Calculate percentage
      const sliceAngle = (slicePercentage / 100) * 2 * Math.PI; // Convert percentage to radians

      // Set the color based on index
      context.fillStyle = colors[i];

      context.beginPath();
      context.moveTo(centerX, centerY);
      context.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      context.closePath();
      context.fill();

      // Calculate text position for the percentage
      const sliceMiddleAngle = startAngle + sliceAngle / 2;
      const sliceTextX = centerX + (radius / 2) * Math.cos(sliceMiddleAngle);
      const sliceTextY = centerY + (radius / 2) * Math.sin(sliceMiddleAngle);
      context.fillStyle = '#000';
      context.font = '20px Arial';
      context.textAlign = 'center';
      context.fillText(slicePercentage.toFixed(2) + '%', sliceTextX, sliceTextY); // Display percentage

      // Draw legend
      const legendX = canvas.width - 150;
      const legendY = 120 + i * 30;
      context.fillStyle = colors[i]; // Use color from the array
      context.fillRect(legendX, legendY, 20, 20);
      context.fillStyle = '#000';
      context.fillText(emotionsData[i].emotion, legendX + 55, legendY + 18);

      startAngle += sliceAngle;
    }
  }

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
    console.log("Pri: "+this.selectedIntrest);
  }

  secondaryOptionSelected() {
    console.log("Sec: "+this.selectedSubIntrest);
  }


  async updateUser() {
    const userEmail = this.useremail; // User's email address
    let userDetails = {
      "name": this.username,
      "email": this.useremail,
      "primaryIntrest": this.selectedIntrest,
      "secondaryIntrest": this.selectedSubIntrest,
    }

    try {
      await this.firebaseConfigService.updateUserDetails(userEmail, userDetails);
      console.log('User details updated successfully.');
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  }
}

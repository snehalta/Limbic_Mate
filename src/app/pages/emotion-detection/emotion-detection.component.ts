import { Component, ElementRef, OnDestroy, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { HappyList, SadList } from './questions';
import { QuestionsDataModel } from 'src/app/models/quesstionsDataModel';
import { FirebaseConfigService } from './../../services/firebase-config.service';
import { AuthService } from 'src/app/services/authService';
import { Router } from '@angular/router';
import { CheckboxWindowService } from 'src/app/services/CheckboxWindowService';
import { checkboxmeasures } from './checkboxMeasures';
import { MeasuresService } from 'src/app/services/measures.service';
import * as faceapi from 'face-api.js';
@Component({
  selector: 'app-emotion-detection',
  templateUrl: './emotion-detection.component.html',
  styleUrls: ['./emotion-detection.component.css']
})
export class EmotionDetectionComponent implements OnInit, OnDestroy {
  emotions: string[] = [];
  showCheckboxWindow: boolean = false;
  checkbox1: boolean = false;
  checkbox2: boolean = false;
  checkbox3: boolean = false;
  checkbox4: boolean = false;
  checkbox5: boolean = false;
  measures : string [] = [];
  userEmaill: string = "";
  private videoRef!: HTMLVideoElement;
  private canvasRef!: HTMLCanvasElement;
  private errorMessageRef!: HTMLElement;
  private intervalId!: ReturnType<typeof setInterval>;



  constructor(
    public authService: AuthService,
    public firebaseConfigService: FirebaseConfigService,
    private elementRef: ElementRef,
    private router: Router,
    public checkboxWindowService: CheckboxWindowService,
    private measuresService : MeasuresService,
    private cdr : ChangeDetectorRef,
  ) {

   }

  questions: any[] = [];
  selectedQuestions: QuestionsDataModel[] = [];
  userEmail: string = "";

  currentQuestion: string = "";
  currentQuestionIndex: number = 1;

  async loadModels(): Promise<void> {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/assets/models/');
  }

  ngOnDestroy(): void {
    this.measuresService.saveMeasures(this.measures);
    clearInterval(this.intervalId);
    this.stopCamera();
  }

  async ngOnInit(): Promise<void> {
    this.videoRef = document.getElementById('video') as HTMLVideoElement;
    this.canvasRef = document.getElementById('canvas') as HTMLCanvasElement;
    this.errorMessageRef = document.getElementById('error-message') as HTMLElement;
    this.getQuestions();
    this.measures = this.measuresService.getMeasures();
    await this.loadModels();
    this.setupCamera();
    this.userEmaill = this.authService.getCurrentLoggedInUserEmail()||"";
  }
  setupCamera(): void{
    navigator.mediaDevices.getUserMedia({
      video: { width: 750, height: 500 },
      audio: false
    }).then(stream => {
      console.log(stream);
      this.videoRef.srcObject = stream;
      this.videoRef.onloadedmetadata = () => {
        this.videoRef.play();
      };
    }).catch(error => {
      console.error('Error accessing camera: ', error);
      this.errorMessageRef.textContent = 'Error accessing camera';
    });
  }

  async setupEventListeners(): Promise<string | null> {
    try {
      const detectedFaces = await faceapi.detectAllFaces(this.videoRef, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
      if (detectedFaces.length > 0) {
        const expressions = detectedFaces[0].expressions;
        const maxExpression = this.getMaxExpression(expressions);
        console.log('Detected emotion:', maxExpression);
        this.saveToDatabase(maxExpression);
        return maxExpression;
      } else {
        window.alert('Face not Detected');
        return null;
      }
    } catch (error) {
      console.error('Error detecting faces:', error);
      return null;
    }
  }

  getMaxExpression(expressions: faceapi.FaceExpressions): string {
    return Object.keys(expressions).reduce((a, b) =>
      (expressions as any)[a] > (expressions as any)[b] ? a : b
    );
  }
  saveToDatabase(expression: string): void {
    // Implement the function to save the expression to the database

    console.log('Saving to database:', expression);
    this.firebaseConfigService.storeFaceEmotions(this.userEmaill, expression);
  }


  stopCamera(): void {
    const stream = this.videoRef.srcObject as MediaStream;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      this.videoRef.srcObject = null;
    }
  }
  openCheckboxWindow(): void {
    this.checkboxWindowService.isOpen = true;
    console.log("window is visible again");

  }

  checkboxChanged(checkboxNumber: number, event: Event) {
    // Check if the checkbox window is visible
    if (this.checkboxWindowService.isOpen) {
      const target = event.target as HTMLInputElement;
      const isChecked = target.checked;

      if (isChecked) { // Only prompt if the checkbox is unchecked
        const confirmed = window.confirm("Are you sure you have completed the task?");
        if (!confirmed) { // If the user cancels the confirmation dialog, uncheck the checkbox
          target.checked = false;
        } else { // If the user confirms, toggle the checkbox and disable it
          this.checkboxWindowService.toggleCheckbox(checkboxNumber);
        }
      }


      // Check if all checkboxes are ticked
    if (this.checkboxWindowService.isAllChecked()) {
        // If all checkboxes are ticked, hide the window\
        this.showCheckboxWindow = false;
        this.checkboxWindowService.isOpen = false;
        this.checkboxWindowService.resetCheckboxes();

        window.alert("You have Completed all the task, now you can proceed further!!");
    }
    }
  }



  getRandomQuestions1(count: number): any[] {
    const shuffled = HappyList['questions'].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  getRandomQuestions2(count: number): any[] {
    const shuffled = SadList['questions'].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async getQuestions(): Promise<void> {
    let happyQuestions: any[] = this.getRandomQuestions1(3);
    let sadQuestions: any[] = this.getRandomQuestions2(3);

    // Concatenate the arrays of happy and sad questions
    let randomQuestions3: any[] = [...happyQuestions, ...sadQuestions];
    const randomQuestions = randomQuestions3.sort(() => 0.5 - Math.random());

    randomQuestions.forEach((questionJson, index) => {
      this.selectedQuestions.push(new QuestionsDataModel(
        questionJson["id"],
        questionJson["question"],
        false,
        0,
        index
      ));
    });

    console.log("SELECTED QUESTIONS:" + JSON.stringify(this.selectedQuestions));
  }

  recordAnswer(questionIndex: number, rating: number): void {
    console.log("Question Index Recorded" + questionIndex);
    console.log("Rating" + rating);

    this.selectedQuestions[questionIndex].questionRecordedAnswer = rating;
    this.selectedQuestions[questionIndex].questionAnswered = true;
  }

  async submit(): Promise<void> {
    const allSubmitted = this.selectedQuestions.every(question => question.questionAnswered);
    if (allSubmitted) {
      console.log('All questions are submitted.');
      const emotion = await this.setupEventListeners();
      if(emotion){
        this.emotion = emotion;
        let happySelectedQuestions = this.selectedQuestions.filter(question => question.questionId <= 15);
        let sadSelectedQuestions = this.selectedQuestions.filter(question => question.questionId > 15);
        let happyAverageRating = Math.round(happySelectedQuestions.reduce((sum, question) => sum + question.questionRecordedAnswer, 0) / 3);
        let sadAverageRating = Math.round(sadSelectedQuestions.reduce((sum, question) => sum + question.questionRecordedAnswer, 0) / 3);

      // Compare the average ratings
        if (happyAverageRating > sadAverageRating) {
          console.log("The user seems happier.");
          this.emotion = "Happy";
        } else if (sadAverageRating > happyAverageRating) {
          console.log("The user seems sadder.");
          this.emotion = "Sad";
        } else {
          console.log("The user seems neutral");
          this.emotion = "Neutral";
        }

        window.alert("Emotions Analysis complete.");
        window.alert("You seem to be " + this.emotion);
        const answer = this.emotion;
        if(answer == "Happy"){
          this.measures = this.getRandomMeasures1(5);
        }else if(answer == "Sad"){
          this.measures = this.getRandomMeasures2(5);
        }else{
          this.measures = this.getRandomMeasures3(5);
        }
   // Example emotion (replace with actual emotion answer)

          this.updateEmotionsInDb(this.emotion).then(() => {
          this.showWindow();
          this.openCheckboxWindow();// Show the checkbox window after updating emotions in the database
        });
        this.questions = [];
        this.selectedQuestions = [];
        this.getQuestions();
      }else{
       console.log('Face not detected');
      }
    }else {
      console.log('Not all questions are submitted.');
      window.alert('All questions must be answered');
    }
  }

  getRandomMeasures1(count: number): any[] {
    const shuffled = checkboxmeasures['Happy'].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  getRandomMeasures2(count: number): any[] {
    const shuffled = checkboxmeasures['Sad'].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  getRandomMeasures3(count: number): any[] {
    const shuffled = checkboxmeasures['Neutral'].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  showWindow() {
    this.showCheckboxWindow = true;
    if (!this.checkboxWindowService.isOpen) {
      this.openCheckboxWindow();
    }
    console.log("the window is visible");
  }


  async updateEmotionsInDb(emotion: string): Promise<void> {
    const userEmail = this.authService.getCurrentLoggedInUserEmail() ?? 'NA';
    await this.firebaseConfigService.storeEmotions(userEmail, emotion); // Store emotion with user email
    console.log("Emotion stored in database for user " + userEmail + ": " + emotion);
    // Calculate average for the user
  }



  emotion: string = "";

}

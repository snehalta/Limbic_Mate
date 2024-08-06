import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ProfileComponent } from './pages/profile/profile.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RouterModule } from '@angular/router';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { DiaryComponent } from './pages/diary/diary.component';
import { EditorModule } from '@tinymce/tinymce-angular';
import { EmotionDetectionComponent } from './pages/emotion-detection/emotion-detection.component';
import { ChatRoomComponent } from './pages/chat-room/chat-room.component';
import { RecommendationsComponent } from './pages/recommendations/recommendations.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { AngularFireModule } from '@angular/fire/compat';



const firebaseConfig = {
  apiKey: "AIzaSyBiinky0p3EfcdV4GIEQZUiTWGcfLteP_c",
  authDomain: "limbic-mate.firebaseapp.com",
  projectId: "limbic-mate",
  storageBucket: "limbic-mate.appspot.com",
  messagingSenderId: "129039397899",
  appId: "1:129039397899:web:0292f0ea1978428a2c430e",
};

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    RegisterPageComponent,
    HomePageComponent,
    DiaryComponent,
    EmotionDetectionComponent,
    ChatRoomComponent,
    RecommendationsComponent,
    NavBarComponent,
    ProfileComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    EditorModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(firebaseConfig),
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

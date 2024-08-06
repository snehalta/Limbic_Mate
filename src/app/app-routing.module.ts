import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { DiaryComponent } from './pages/diary/diary.component';
import { EmotionDetectionComponent } from './pages/emotion-detection/emotion-detection.component';
import { ChatRoomComponent } from './pages/chat-room/chat-room.component';
import { RecommendationsComponent } from './pages/recommendations/recommendations.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthGuard } from './AuthGuard';

const routes: Routes = [
  { path: 'loginPage', component: LoginPageComponent },
  { path: 'registerPage', component: RegisterPageComponent},
  { path: 'homePage', component: HomePageComponent, canActivate: [AuthGuard]},
  { path: 'diary', component: DiaryComponent},
  { path: 'emotionDetection', component: EmotionDetectionComponent},
  { path: 'chatRoom', component: ChatRoomComponent},
  { path: 'recommendations', component: RecommendationsComponent},
  { path: 'profile', component:ProfileComponent},
  { path: '', redirectTo: '/loginPage', pathMatch: 'full' },
  { path: '**', redirectTo: '/loginPage' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

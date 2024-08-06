import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedIn:boolean= false;
  loggedInUserEmail:string = "";
  loggedInUserName:string = "";

  constructor(
    public afAuth: AngularFireAuth,
    public router: Router,
    private route: ActivatedRoute,
  ) {
    this.isLoggedIn = !!localStorage.getItem('user');
    this.loggedInUserEmail = localStorage.getItem('user') || "";
    this.loggedInUserName = localStorage.getItem('username') || "";
    console.log("Stored username:", this.loggedInUserName);
  }

  SignUp(email: string, password: string, name: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.afAuth.createUserWithEmailAndPassword(email, password)
        .then((result) => {
          // Set display name for the user
          result.user?.updateProfile({
            displayName: name
          }).then(() => {
            window.alert("User registered:" + result.user?.email);
            console.log("Display name set:", name); // Log the display name
            localStorage.setItem('user', email);
            localStorage.setItem('username', name); // Store username using 'username' key
            resolve(true); // Resolve with true indicating successful signup
          }).catch((error) => {
            window.alert(error.message);
            reject(false); // Reject with false indicating failed signup
          });
        }).catch((error) => {
          window.alert(error.message);
          reject(false); // Reject with false indicating failed signup
        });
    });
  }




  async SignIn(email:string, password:string) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then(async (result) => {
        this.isLoggedIn = true;
        console.log("Login Result:", result.user?.email);
        console.log("Current username:", result.user?.displayName); // Log current username
        localStorage.setItem('user', email);
        localStorage.setItem('username', result.user?.displayName || ''); // Update stored username
        this.router.navigate(['/homePage'], { state: { data: email } });
        this.router.navigate(['/homePage'], { relativeTo: this.route });
      }).catch((error) => {
        window.alert(error.message)
      })
  }


  SignOut() {
    this.afAuth
      .signOut();
    console.log('Signed Out')
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    // Remove username from session storage
    this.isLoggedIn = false;
    localStorage.removeItem('authToken');
    this.router.navigate(['/loginPage'],{ relativeTo: this.route });
  }

  getCurrentLoggedInUserEmail(){
    return localStorage.getItem('user');
  }

  getCurrentLoggedInUserName(){
    return localStorage.getItem('username');
  }
  isAuthenticated(): boolean {
    return this.isLoggedIn;
    return !!localStorage.getItem('authToken');
  }
}



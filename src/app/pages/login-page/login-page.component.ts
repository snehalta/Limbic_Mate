import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/authService';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  loginForm!: FormGroup;
  captchaQuestion!: string;
  correctCaptchaAnswer!: number;
  constructor(private authService: AuthService,private readonly router: Router,private route: ActivatedRoute, private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      captchaAnswer: ['', Validators.required]
    });

    this.generateCaptcha();
  }
  generateCaptcha(): void {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const operator = Math.random() < 0.5 ? '+' : '-';

    if (operator === '+') {
      this.captchaQuestion = `${num1}  +  ${num2} = `;
      this.correctCaptchaAnswer = num1 + num2;
    } else {
      this.captchaQuestion = `${num1}  -  ${num2} = `;
      this.correctCaptchaAnswer = num1 - num2;
    }
  }


  async login(loginForm: FormGroup): Promise<void> {
    if (this.loginForm.invalid) {
      console.log('Form is invalid');
      window.alert('Please enter the CAPTCHA')
      return;
    }

    const captchaAnswer = +this.loginForm.get('captchaAnswer')?.value;
    if (captchaAnswer !== this.correctCaptchaAnswer) {
      console.log('CAPTCHA is incorrect');
      alert('CAPTCHA is incorrect. Please try again.');
      this.generateCaptcha(); // Regenerate CAPTCHA question
      return;
    }

    console.log('Logging in User');
    sessionStorage.clear();
    await this.authService.SignIn(loginForm.get('email')?.value, loginForm.get('password')?.value);
  }
}

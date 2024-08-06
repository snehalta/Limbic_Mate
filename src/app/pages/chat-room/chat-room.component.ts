import { Component,OnInit } from '@angular/core';
import { MessageDataModel } from 'src/app/models/messageDataModel';
import { AuthService } from 'src/app/services/authService';
import { FirebaseConfigService } from 'src/app/services/firebase-config.service';
import { CheckboxWindowService } from 'src/app/services/CheckboxWindowService';
import { Router } from '@angular/router';
@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit{
  messageList:MessageDataModel[] = [];
  loggedInUserEmail:string = "";
  textMessage:string = "";
  showEmoji: boolean = false;
  emojis: string[] = ['😀','😃','😄','😁','😆','😅','😂','🤣'
  ,'🥲'
  ,'🥹'
  ,'😊'
  ,'😇'
  ,'🙂'
  ,'🙃'
  ,'😉'
  ,'😌'
  ,'😍'
  ,'🥰'
  ,'😘'
  ,'😗'
  ,'😙'
  ,'😚'
  ,'😋'
  ,'😛'
  ,'😝'
  ,'😜'
  ,'🤪'
  ,'🤨'
  ,'🧐'
  ,'🤓'
  ,'😎'
  ,'🥸'
  ,'🤩'
  ,'🥳'
  ,'😏'
  ,'😒'
  ,'😞'
  ,'😔'
  ,'😟'
  ,'😕'
  ,'🙁'
  ,'☹️'
  ,'😣'
  ,'😖'
  ,'😫'
  ,'😩'
  ,'🥺'
  ,'😢'
  ,'😭'
  ,'😮‍💨'
  ,'😤'
  ,'😠'
  ,'😡'
  ,'🤬'
  ,'🤯'
  ,'😳'
  ,'🥵'
  ,'🥶'
  ,'😱'
  ,'😨'
  ,'😥'
  ,'😓'
  ,'🫣'
  ,'🤗'
  ,'🫡'
  ,'🤔'
  ,'🫢'
  ,'🤭'
  ,'🤫'
  ,'🤥'
  ,'😶'
  ,'😶‍🌫️'
  ,'😐'
  ,'😑'
  ,'😬'
  ,'🫨'
  ,'🫠'
  ,'🙄'
  ,'😯'
  ,'😦'
  ,'😧'
  ,'😮'
  ,'😲'
  ,'🥱'
  ,'😴'
  ,'🤤'
  ,'😪'
  ,'😵'
  ,'😵‍💫'
  ,'🫥'
  ,'🤐'
  ,'🥴'
  ,'🤢'
  ,'🤮'
  ,'🤧'
  ,'😷'
  ,'🤒'
  ,'🤕'
  ,'🤑'
  ,'🤠'
 ];
  ngOnInit(): void {
    this.getChats();
  }

  getUserEmail(){
    this.loggedInUserEmail = this.authService.getCurrentLoggedInUserEmail()??"NA";
  }

  constructor(public firebaseConfigService:FirebaseConfigService, public authService:AuthService,public checkboxWindowService: CheckboxWindowService, public router: Router){
    this.getUserEmail();
  }
  navigateToEmotionDetection(): void {
    if (!this.checkboxWindowService.isOpen) {
      this.router.navigate(['/emotion-detection']);
    }
  }
  async getChats(): Promise<void> {
    const chats = await this.firebaseConfigService.getChats();
    this.messageList = chats.map((individualChat: any) => MessageDataModel.fromJson(individualChat));
  }


  async sendMessage(){
    if(this.textMessage != ""){
      let chatEntryMap = {
        "sender":this.loggedInUserEmail,
        "text": this.textMessage,
        "timeStamp" : this.getCurrentTimestamp()
      }
      await this.firebaseConfigService.addChat(chatEntryMap);
        this.textMessage = ''; // Clear the input field after sending message
        await this.getChats(); // Fetch the updated messages
        this.scrollToBottom(); // Scroll to the bottom after a short delay
      }
    }
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
  toggleEmoji(): void {
    this.showEmoji = !this.showEmoji; // Toggle the boolean value
  }
  selectEmoji(emoji: string): void {
    this.textMessage += emoji; // Append selected emoji to the message
    this.showEmoji = false; // Hide emojis after selection
  }
  get emojiRows(): number[] {
    const totalEmojis = this.emojis.length;
    const rows = Math.ceil(totalEmojis / 10); // Calculate number of rows needed
    return Array.from({ length: rows }, (_, i) => i); // Generate array with row indices
  }
  scrollToBottom(): void {
    setTimeout(() => {
      const container = document.getElementById('container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0); // Adjust delay as needed
  }




  // getMasterChainList(){
  //   this.firebaseConfigService.getMasterBlockChainList().subscribe(
  //     (actionArray: any[]) =>{
  //       this.masterChainList = actionArray.map((item: any) =>{
  //         var recvdData = JSON.parse(JSON.stringify(item,this.firebaseConfigService.getCircularReplacer() ));
  //         console.log("Item:"+JSON.stringify(item,this.firebaseConfigService.getCircularReplacer() ));
  //         return new MasterChainModel(
  //           recvdData['nonce'],
  //           recvdData['schemeTitle'],
  //           recvdData['schemeDescription'],
  //           recvdData['applicantType'],
  //           recvdData['prevHash'],
  //           recvdData['hash'],
  //           recvdData['timeStamp'],
  //           recvdData['schemeFund'],
  //         )
  //           }
  //         );
  //     }
  //   );
  // }

  getCurrentTimestamp(): string {
    const currentDate = new Date();

    // Get date components
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear().toString();

    // Get time components
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');

    // Combine date and time components
    const formattedTimestamp = `${day}-${month}-${year} | ${hours}:${minutes}:${seconds}`;

    return formattedTimestamp;
  }

}

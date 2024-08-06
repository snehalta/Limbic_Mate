import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument, QueryDocumentSnapshot, DocumentData,DocumentSnapshot } from '@angular/fire/compat/firestore'
import { Observable, Subject ,takeUntil} from 'rxjs';
import { RecommendationsDataModel } from '../models/recommendationsDataModel';
import { getFirestore,collection, addDoc,doc,setDoc, serverTimestamp, query, where, getDocs, QuerySnapshot,orderBy,Timestamp,limit, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { DiaryEntry } from '../pages/diary/interfaces';
// Import necessary functions
@Injectable({
  providedIn: 'root'
})
export class FirebaseConfigService {
  firestoree = getFirestore();

  constructor(public firestore:AngularFirestore) { }

  async registerUserInDb(registrationMap:any){
    await this.firestore.collection('Users').doc(registrationMap["email"]).set(registrationMap);
  }
  getUserDetails(userEmail: string): Observable<DocumentSnapshot<unknown> | undefined> {
    return this.firestore.doc(`Users/${userEmail}`).get() as Observable<DocumentSnapshot<unknown> | undefined>;
  }


  async storeDiaryContent(userEmail: string,fileName:string, content: string, backgroundClass: string): Promise<void> {
    const diaryRef = doc(this.firestoree, 'diary', userEmail, 'entries', fileName);
    await setDoc(diaryRef, {
      userEmail,
      fileName,
      content,
      backgroundClass,
      timestamp: new Date()
    }, { merge: true });
  }
  async getDiaryEntryContent(userEmail: string, fileName: string): Promise<string | null> {
    const diaryEntryRef = doc(this.firestoree, 'diary', userEmail, 'entries', fileName);
    const docSnapshot = await getDoc(diaryEntryRef);
    if (docSnapshot.exists()) {
      const data = docSnapshot.data() as DocumentData;
      return data['content'];
    } else {
      console.error('No such diary entry!');
      return null;
    }
  }



  async getDiaryContent(userEmail: string): Promise<string[]> {
    const q = query(collection(this.firestoree, 'diary', userEmail, 'entries'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    const diaryContents: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      diaryContents.push(data['content']);
    });

    return diaryContents;
  }
  async getAllDiaryEntries(userEmail: string): Promise<DiaryEntry[]> {
    const entriesCollection = collection(this.firestoree, 'diary', userEmail, 'entries');
    const q = query(entriesCollection, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    const diaryEntries: DiaryEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      diaryEntries.push({
        fileName: data['fileName'],
        date: (data['timestamp'] as Timestamp).toDate(),
        time: (data['timestamp'] as Timestamp).toDate(),
        content: data['content'],
        backgroundClass: data['backgroundClass']
      });
    });

    return diaryEntries;
  }
  async getLatestDiaryEntry(userEmail: string): Promise<DiaryEntry | null> {
    const entriesCollection = collection(this.firestoree, 'diary', userEmail, 'entries');
    const q = query(entriesCollection, orderBy('timestamp', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const latestDoc = querySnapshot.docs[0];
      const latestEntryData = latestDoc.data();
      return {
        fileName: latestEntryData['fileName'],
        date: latestEntryData['timestamp'].toDate(),
        time: latestEntryData['timestamp'].toDate(),
        content: latestEntryData['content'],
        backgroundClass: latestEntryData['backgroundClass']
      } as DiaryEntry;
    } else {
      return null;
    }
  }



  async updateDiaryContent(fileName: string, userEmail:string, content: string, backgroundClass: string): Promise<void> {
    const diaryEntryRef = doc(this.firestoree, 'diary',userEmail, 'entries', fileName);
    await setDoc(diaryEntryRef, {
      content,
      backgroundClass,
      timestamp: new Date()
    }, { merge: true });
  }

  async deleteDiaryEntry(userEmail: string, fileName: string): Promise<void> {
    const entryRef = doc(this.firestoree, 'diary', userEmail, 'entries', fileName);
    await deleteDoc(entryRef);
  }


  getChats():Promise<any> {
    return new Promise((resolve) => {
      const chatsDoc = this.firestore.collection('Chats').doc("chatsList").get();
      const unsubscribe$ = new Subject<void>();
      chatsDoc.pipe(
        takeUntil(unsubscribe$)
      ).subscribe((docData:any)=>{

        let chatsListJson = JSON.parse(JSON.stringify(docData.data()));
        console.log("Chats Data"+JSON.stringify(chatsListJson));
        resolve(chatsListJson['0']);
      })
    });
  }

  addChat(newMap: any): Promise<void> {
    return new Promise((resolve) => {
      const chatsDoc = this.firestore.collection('Chats').doc("chatsList").get();
      const unsubscribe$ = new Subject<void>();
      chatsDoc.pipe(
        takeUntil(unsubscribe$)
      ).subscribe((docData:any)=>{
        let chatsListJson = JSON.parse(JSON.stringify(docData.data()));
        console.log("Chats Data"+JSON.stringify(chatsListJson));
        let previousMapList = chatsListJson['0'] as any[];
        previousMapList.push(newMap)
        let chatsListMap = {"0":previousMapList}
        this.firestore.collection('Chats').doc("chatsList").update(chatsListMap);
        resolve();
      })
    });
  }

  async getUserRecommendations(userEmail:string):Promise<any>{
    return new Promise((resolve) => {
      const userData = this.firestore.collection('Users').doc(userEmail).get();
      const unsubscribe$ = new Subject<void>();
      userData.pipe(
        takeUntil(unsubscribe$)
      ).subscribe((docData:any)=>{

        let userDataJson = JSON.parse(JSON.stringify(docData.data()));
        // console.log("data"+JSON.stringify(userDataJson));
        resolve({
          "primary":userDataJson['primaryIntrest'],
          "secondary":userDataJson['secondaryIntrest']
        });
      })
    });
  }


  async getRecommendationsData(primaryIntrest: string, secondaryIntrest: string): Promise<RecommendationsDataModel[]> {
    return new Promise((resolve, reject) => {
      this.firestore.collection('Recommendations').doc(primaryIntrest).get().subscribe(
        (docData: any) => {
          if (docData.exists) {
            let recommendationDataJson = JSON.parse(JSON.stringify(docData.data()));
            let selectedRecommendationsList = recommendationDataJson[secondaryIntrest.toLowerCase()] as any[];

            // Ensure we handle the list correctly
            selectedRecommendationsList = this.shuffleArray(selectedRecommendationsList).slice(0, 3);

            let userRecommendations: RecommendationsDataModel[] = selectedRecommendationsList.map(map => RecommendationsDataModel.fromJson(map));

            resolve(userRecommendations);
          } else {
            reject("Recommendations not found");
          }
        },
        (error) => reject(error)
      );
    });
  }

  // Utility function to shuffle an array
  shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }



  async updateEmotions(dataMap:any,userEmail:string){
    await this.firestore.collection('Users').doc(userEmail).update(dataMap);
  }
  async storeEmotions(userEmail: string, emotion: string): Promise<void> {
    try {
      const firestore = getFirestore(); // Get Firestore instance

      // Add the emotion data along with timestamp and user email
      await addDoc(collection(firestore, 'emotions'), {
        userEmail,
        emotion,
        timestamp: serverTimestamp() // Use serverTimestamp() to get the server timestamp
      });

      console.log('Emotion stored successfully for user ' + userEmail + ':', emotion);
    } catch (error) {
      console.error('Error storing emotion:', error);
      throw error;
    }
  }
  async storeFaceEmotions(userEmail: string, emotion: string): Promise<void> {
    try {
      const firestore = getFirestore(); // Get Firestore instance

      // Add the emotion data along with timestamp and user email
      await addDoc(collection(firestore, 'Face_emotions'), {
        userEmail,
        emotion,
        timestamp: serverTimestamp() // Use serverTimestamp() to get the server timestamp
      });

      console.log('Emotion stored successfully for user ' + userEmail + ':', emotion);
    } catch (error) {
      console.error('Error storing emotion:', error);
      throw error;
    }
  }

async getRecentEmotions(userEmail: string): Promise<string[]> {
  try {
    const querySnapshot = await this.firestore.collection('emotions', ref => ref.where('userEmail', '==', userEmail).orderBy('timestamp', 'desc')).get().toPromise();
    const recentEmotions: string[] = [];
    if (querySnapshot && !querySnapshot.empty) { // Check if querySnapshot is not undefined and not empty
      querySnapshot.forEach((doc: QueryDocumentSnapshot<any>) => {
        const data = doc.data();
        if (data && 'emotion' in data) {
          recentEmotions.push(data['emotion']);
        }
      });
    }
    console.log("Query Snapshot:", querySnapshot);

    console.log("Recent emotions for user " + userEmail + ":", recentEmotions);
    return recentEmotions;
  } catch (error) {
    console.error('Error fetching recent emotions:', error);
    throw error;
  }
}

async getRecentFaceEmotions(userEmail: string): Promise<string[]> {
  try {
    const querySnapshot = await this.firestore.collection('Face_emotions', ref => ref.where('userEmail', '==', userEmail).orderBy('timestamp', 'desc').limit(1)).get().toPromise();
    const recentEmotions: string[] = [];
    if (querySnapshot && !querySnapshot.empty) { // Check if querySnapshot is not undefined and not empty
      querySnapshot.forEach((doc: QueryDocumentSnapshot<any>) => {
        const data = doc.data();
        if (data && 'emotion' in data) {
          recentEmotions.push(data['emotion']);
        }
      });
    }
    console.log("Query Snapshot:", querySnapshot);

    console.log("Recent emotions for user " + userEmail + ":", recentEmotions);
    return recentEmotions;
  } catch (error) {
    console.error('Error fetching recent emotions:', error);
    throw error;
  }
}


  async updateUserDetails(userEmail: string, userDetails: any): Promise<void> {
    try {
      await this.firestore.collection('Users').doc(userEmail).update(userDetails);
      console.log('User details updated successfully for user ' + userEmail);
    } catch (error) {
      console.error('Error updating user details:', error);
      throw error;
    }
  }

}

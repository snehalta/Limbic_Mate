import { Component, OnInit } from '@angular/core';
import { FirebaseConfigService } from 'src/app/services/firebase-config.service';
import { Router } from '@angular/router';
import { CheckboxWindowService } from 'src/app/services/CheckboxWindowService';
import { AuthService } from 'src/app/services/authService';
import { DiaryEntry } from './interfaces';

@Component({
  selector: 'app-diary',
  templateUrl: './diary.component.html',
  styleUrls: ['./diary.component.css']
})
export class DiaryComponent implements OnInit {
  diaryContent: string = '';
  savedEntries: DiaryEntry[] = [];
  userEmail: string = '';
  selectedBackgroundClass: string = 'bacground1';
  showBackgroundOptions: boolean = false;
  isModalVisible: boolean = false;
  newFileName: string = '';
  currentFileName: string = '';
  autoSaveTimer: any;
  findText: string = '';
  occurrenceCount: number = 0;
  currentOccurrenceIndex: number = 0;
  occurrences: Range[] = [];
  isSearching: boolean = false;
  searchButtonText: string = 'Search';
  isBoldApplied: boolean = false;
  isItalicApplied: boolean = false;
  isSubscriptApplied: boolean = false;
  isSuperscriptApplied: boolean = false;
  isStrikethroughApplied: boolean = false;
  isUnderlineApplied: boolean = false;



  constructor(
    public firebaseConfigService: FirebaseConfigService,
    public router: Router,
    public checkboxWindowService: CheckboxWindowService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userEmail = this.authService.getCurrentLoggedInUserEmail() ?? 'NA';
    this.loadSavedEntries();
    this.getUserDiaryData();
  }
  toggleBold(): void {
    document.execCommand('bold');
    this.checkFormatting();
  }

  toggleItalic(): void {
    document.execCommand('italic');
    this.checkFormatting();
  }

  toggleSubscript(): void {
    document.execCommand('subscript');
    this.checkFormatting();
  }

  toggleSuperscript(): void {
    document.execCommand('superscript');
    this.checkFormatting();
  }

  toggleStrikethrough(): void {
    document.execCommand('strikeThrough');
    this.checkFormatting();
  }

  toggleUnderline(): void {
    document.execCommand('underline');
    this.checkFormatting();
  }

  checkFormatting(): void {
    const diaryContentDiv = document.querySelector('.diary-textarea');
    if (diaryContentDiv) {
      this.isBoldApplied = document.queryCommandState('bold');
      this.isItalicApplied = document.queryCommandState('italic');
      this.isSubscriptApplied = document.queryCommandState('subscript');
      this.isSuperscriptApplied = document.queryCommandState('superscript');
      this.isStrikethroughApplied = document.queryCommandState('strikeThrough');
      this.isUnderlineApplied = document.queryCommandState('underline');
    }
  }

  getUserDiaryData(): void {
    this.firebaseConfigService.getLatestDiaryEntry(this.userEmail)
      .then((latestEntry: DiaryEntry | null) => {
        if (latestEntry) {
          this.loadDiaryEntry(latestEntry);
        } else {
          this.diaryContent = "<p>No diary entries found. Create a new page to start writing.</p>";
          this.currentFileName = '';
          this.selectedBackgroundClass = 'background1';

          const diaryContentDiv = document.querySelector('.diary-textarea');
          if (diaryContentDiv) {
            diaryContentDiv.innerHTML = this.diaryContent;
            diaryContentDiv.className = `diary-textarea ${this.selectedBackgroundClass}`;
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching user diary data:', error);
        this.diaryContent = "<p>Error fetching diary content. Please try again later.</p>";
      });
  }

  saveDiary(): void {
    // Get the diary content from the div
    const diaryContentDiv = document.querySelector('.diary-textarea');
    if (diaryContentDiv) {
      const diaryContent = diaryContentDiv.innerHTML; // Get the text content of the div
      const currentDate = new Date()
      if (this.currentFileName) {
        // If editing an existing entry, find and update it
        const existingEntryIndex = this.savedEntries.findIndex(entry => entry.fileName === this.currentFileName);
        if (existingEntryIndex !== -1) {
          this.savedEntries[existingEntryIndex].content = diaryContent;
          this.savedEntries[existingEntryIndex].date = currentDate;
          this.savedEntries[existingEntryIndex].time = currentDate;
          this.savedEntries[existingEntryIndex].backgroundClass = this.selectedBackgroundClass;

        }
      }

    else {
      const newEntry: DiaryEntry = {
        fileName: `Diary_Entry_${currentDate.getTime()}`,
        date: currentDate,
        time: currentDate,
        content: diaryContent,
        backgroundClass: this.selectedBackgroundClass // Use the text content obtained from the div
      };
      this.savedEntries.unshift(newEntry);
      this.currentFileName = newEntry.fileName;
     } // Add new entry to the beginning of the list

      // Save the diary content to the database
      this.firebaseConfigService.storeDiaryContent(this.userEmail,this.currentFileName, diaryContent, this.selectedBackgroundClass);
    }
  }
  autoSave(): void {
    clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      this.saveDiary();
    }, 1000); // Save after 1 second of inactivity
  }

  clearDiary(): void {
    this.diaryContent = '';
  }

  editEntry(entry: DiaryEntry): void {
    this.currentFileName = entry.fileName;
    this.firebaseConfigService.getDiaryEntryContent(this.userEmail, entry.fileName)
      .then((content: string | null) => {
        if (content !== null) {
          this.diaryContent = content;
          this.selectedBackgroundClass = entry.backgroundClass || 'background1';
          const diaryContentDiv = document.querySelector('.diary-textarea');
          if (diaryContentDiv) {
            diaryContentDiv.innerHTML = this.diaryContent;
            diaryContentDiv.className = 'diary-textarea ${this.selectedBackgroundClass}'
          }
        } else {
          console.error('Error fetching diary entry content.');
          this.diaryContent = "<p>Error fetching diary entry content. Please try again later.</p>";
        }
      })
      .catch((error) => {
        console.error('Error fetching diary entry content:', error);
        this.diaryContent = "<p>Error fetching diary entry content. Please try again later.</p>";
      });
  }

  async deleteEntry(entry: DiaryEntry): Promise<void> {
    try {
      await this.firebaseConfigService.deleteDiaryEntry(this.userEmail, entry.fileName);
      this.savedEntries = this.savedEntries.filter(e => e.fileName !== entry.fileName);
      if (this.currentFileName === entry.fileName) {
        this.clearDiary();
        this.currentFileName = '';
      }
    } catch (error) {
      console.error('Error deleting diary entry:', error);
    }
  }
  loadDiaryEntry(entry: DiaryEntry): void {
    this.currentFileName = entry.fileName;
    this.diaryContent = entry.content || '';
    this.selectedBackgroundClass = entry.backgroundClass || 'background1';
    const diaryContentDiv = document.querySelector('.diary-textarea');
    if (diaryContentDiv) {
      diaryContentDiv.innerHTML = this.diaryContent;
      diaryContentDiv.className = `diary-textarea ${this.selectedBackgroundClass}`;
    }
  }

  async loadSavedEntries(): Promise<void> {
    try {
      this.savedEntries = await this.firebaseConfigService.getAllDiaryEntries(this.userEmail);
    } catch (error) {
      console.error('Error loading saved entries:', error);
    }
  }
  navigateToEmotionDetection(): void {
    if (!this.checkboxWindowService.isOpen) {
      this.router.navigate(['/emotion-detection']);
    }
  }

  selectBackground(event: Event): void {
    const target = event.target as HTMLSelectElement;

    if (target && target.value) {
      const selectedBackgroundClass = target.value;
      this.selectedBackgroundClass = selectedBackgroundClass;
      this.autoSave();
    }
  }

  applyFont(event: Event): void {
    const target = event.target as HTMLSelectElement | null;

    if (target && target.value) {
      const selectedFont = target.value;
      console.log(selectedFont);

      // Get the diary content element
      const diaryContentElement = document.querySelector('.diary-textarea') as HTMLElement;

      // Update the font style of the diary content
      if (diaryContentElement) {
        diaryContentElement.style.fontFamily = selectedFont;
      }
    }
}
applyFontSize(event: Event): void {
  const target = event.target as HTMLSelectElement | null;

  if (target && target.value) {
    const selectedFontSize = target.value;
    console.log(selectedFontSize);

    // Get the diary content element
    const diaryContentElement = document.querySelector('.diary-textarea') as HTMLElement;

    // Update the font size style of the diary content
    if (diaryContentElement) {
      diaryContentElement.style.fontSize = selectedFontSize + 'px';
    }
  }
}

startSearch(): void {
  this.isSearching = true;
  this.currentOccurrenceIndex = 0;
  this.occurrences = [];
  this.findOccurrences();
  if (this.occurrences.length > 0) {
    this.highlightCurrentOccurrence();
    this.searchButtonText = 'Next';
  }
}

findOccurrences(): void {
  const diaryContentElement = document.querySelector('.diary-textarea') as HTMLElement;
  if (diaryContentElement && this.findText) {
    const regex = new RegExp(this.findText, 'gi');
    const textNodes = this.getTextNodes(diaryContentElement);

    textNodes.forEach(node => {
      let match;
      while ((match = regex.exec(node.textContent!)) !== null) {
        const range = document.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        this.occurrences.push(range);
      }
    });

    this.occurrenceCount = this.occurrences.length;
    console.log(this.occurrenceCount);
  }
}

getTextNodes(element: HTMLElement): Text[] {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }
  return textNodes;
}

highlightCurrentOccurrence(): void {
  this.clearHigh();
  if (this.occurrences.length > 0) {
    const range = this.occurrences[this.currentOccurrenceIndex];
    const mark = document.createElement('mark');
    range.surroundContents(mark);
    mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

nextOccurrence(): void {
  if (this.occurrences.length > 0) {
    this.currentOccurrenceIndex = (this.currentOccurrenceIndex + 1) % this.occurrences.length;
    this.highlightCurrentOccurrence();
  }
}
clearHigh():void{
  const marks = document.querySelectorAll('mark');
  marks.forEach(mark => {
    const parent = mark.parentNode;
    if (parent) {
      parent.replaceChild(mark.firstChild!, mark);
      parent.normalize();
    }
  });
}

clearHighlights(): void {
  const diaryContentElement = document.querySelector('.diary-textarea') as HTMLElement;
  const innerHTML = diaryContentElement.innerHTML.replace(/<\/?mark[^>]*>/g, ''); // Remove all mark tags
  diaryContentElement.innerHTML = innerHTML;
}

cancelSearch(): void {
  this.clearHighlights();
  this.isSearching = false;
  this.findText = '';
  this.occurrences = [];
  this.occurrenceCount = 0;
  this.currentOccurrenceIndex = 0;
  this.searchButtonText = 'Search';
}

  showNewPageModal(): void {
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
  }

  createNewPage(): void {
    const currentDate = new Date();
    this.currentFileName = this.newFileName;
    this.diaryContent = ''; // Initial content
    this.selectedBackgroundClass = 'background1'; // Default background
    this.closeModal();

    // Create a new entry and add it to the saved entries
    const newEntry: DiaryEntry = {
      fileName: this.currentFileName,
      date: currentDate,
      time: currentDate,
      content: this.diaryContent,
      backgroundClass: this.selectedBackgroundClass
    };
    this.savedEntries.unshift(newEntry);

    // Save the new file to the database
    this.firebaseConfigService.storeDiaryContent(this.userEmail, this.currentFileName, this.diaryContent, this.selectedBackgroundClass)
      .then(() => {
        console.log('New page created and saved successfully.');
        this.newFileName = '';
        this.loadDiaryEntry(newEntry);
      })
      .catch((error) => {
        console.error('Error creating new page:', error);
      });
  }
}

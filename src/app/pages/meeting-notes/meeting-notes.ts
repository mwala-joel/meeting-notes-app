import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';

type MeetingNote = {
  id: number;
  title: string;
  notes: string;
  createdAt: string;
};

@Component({
  selector: 'app-meeting-notes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './meeting-notes.html',
  styleUrl: './meeting-notes.css',
})
export class MeetingNotes {
  title = '';
  notes = '';
  searchText = '';

  meetingNotes: MeetingNote[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.loadMeetingNotes();
  }

  isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  get filteredMeetingNotes(): MeetingNote[] {
    const search = this.searchText.toLowerCase();

    return this.meetingNotes.filter((meeting) => {
      return (
        meeting.title.toLowerCase().includes(search) || meeting.notes.toLowerCase().includes(search)
      );
    });
  }

  addMeetingNote() {
    if (!this.title.trim() || !this.notes.trim()) {
      return;
    }

    const newMeeting: MeetingNote = {
      id: Date.now(),
      title: this.title,
      notes: this.notes,
      createdAt: new Date().toLocaleString(),
    };

    this.meetingNotes.unshift(newMeeting);

    this.title = '';
    this.notes = '';

    this.saveMeetingNotes();
  }

  deleteMeetingNote(id: number) {
    this.meetingNotes = this.meetingNotes.filter((meeting) => {
      return meeting.id !== id;
    });

    this.saveMeetingNotes();
  }

  clearSearch() {
    this.searchText = '';
  }

  saveMeetingNotes() {
    if (!this.isBrowser()) {
      return;
    }

    localStorage.setItem('meetingNotes', JSON.stringify(this.meetingNotes));
  }

  loadMeetingNotes() {
    if (!this.isBrowser()) {
      return;
    }

    const savedNotes = localStorage.getItem('meetingNotes');

    if (savedNotes) {
      this.meetingNotes = JSON.parse(savedNotes);
    }
  }
}

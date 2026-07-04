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

})
export class MeetingNotes {
  title = '';
  notes = '';

  meetingNotes: MeetingNote[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.loadMeetingNotes();
  }

  isBrowser() {
    return isPlatformBrowser(this.platformId);
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

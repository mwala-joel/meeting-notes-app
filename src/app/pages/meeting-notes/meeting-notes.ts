import { Component } from '@angular/core';
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
  }
}

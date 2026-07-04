import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-meeting-notes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './meeting-notes.html',
})
export class MeetingNotes {
  title = '';
  notes = '';

  addMeetingNote() {
    console.log('Meeting title:', this.title);
    console.log('Meeting notes:', this.notes);
  }
}

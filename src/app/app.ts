import { Component } from '@angular/core';
import { MeetingNotes } from './pages/meeting-notes/meeting-notes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MeetingNotes],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}

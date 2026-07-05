import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

type MeetingNote = {
  id: number;
  title: string;
  notes: string;
  transcript?: string;
  createdAt: string;
};

type GeneratedMeetingNote = {
  title: string;
  notes: string;
  transcript: string;
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
  searchText = signal('');

  isRecording = signal(false);
  isProcessing = signal(false);
  statusMessage = signal('');

  meetingNotes = signal<MeetingNote[]>([]);

  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];

  filteredMeetingNotes = computed(() => {
    const search = this.searchText().toLowerCase();

    return this.meetingNotes().filter((meeting) => {
      return (
        meeting.title.toLowerCase().includes(search) ||
        meeting.notes.toLowerCase().includes(search) ||
        meeting.transcript?.toLowerCase().includes(search)
      );
    });
  });

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

    this.createMeetingNote(this.title, this.notes);

    this.title = '';
    this.notes = '';
  }

  createMeetingNote(title: string, notes: string, transcript = '') {
    const newMeeting: MeetingNote = {
      id: Date.now(),
      title,
      notes,
      transcript,
      createdAt: new Date().toLocaleString(),
    };

    this.meetingNotes.update((currentMeetings) => {
      return [newMeeting, ...currentMeetings];
    });

    this.saveMeetingNotes();
  }

  deleteMeetingNote(id: number) {
    this.meetingNotes.update((currentMeetings) => {
      return currentMeetings.filter((meeting) => meeting.id !== id);
    });

    this.saveMeetingNotes();
  }

  clearSearch() {
    this.searchText.set('');
  }

  async startRecording() {
    if (!this.isBrowser()) {
      return;
    }

    this.isRecording.set(true);
    this.isProcessing.set(false);
    this.statusMessage.set('Recording...');

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    this.audioChunks = [];

    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
  }

  async stopRecording() {
    if (!this.mediaRecorder) {
      return;
    }

    this.isRecording.set(false);
    this.isProcessing.set(true);
    this.statusMessage.set('Transcribing and creating meeting notes...');

    const audioBlob = await this.stopRecorderAndGetAudio();

    const generatedMeeting = await this.sendAudioToApi(audioBlob);

    this.createMeetingNote(
      generatedMeeting.title,
      generatedMeeting.notes,
      generatedMeeting.transcript,
    );

    this.isProcessing.set(false);
    this.statusMessage.set('Meeting note created.');
    this.mediaRecorder = null;
  }

  stopRecorderAndGetAudio(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(new Blob([], { type: 'audio/webm' }));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, {
          type: 'audio/webm',
        });

        this.mediaRecorder?.stream.getTracks().forEach((track) => {
          track.stop();
        });

        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  async sendAudioToApi(audioBlob: Blob): Promise<GeneratedMeetingNote> {
    const formData = new FormData();

    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch('${environment.apiUrl}/api/transcribe-meeting', {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  saveMeetingNotes() {
    if (!this.isBrowser()) {
      return;
    }

    localStorage.setItem('meetingNotes', JSON.stringify(this.meetingNotes()));
  }

  loadMeetingNotes() {
    if (!this.isBrowser()) {
      return;
    }

    const savedNotes = localStorage.getItem('meetingNotes');

    if (savedNotes) {
      this.meetingNotes.set(JSON.parse(savedNotes));
    }
  }
}

import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessageResponse, ChatSessionResponse } from '../../../core/services/chat.service';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    FormsModule, MessageBubbleComponent, LoadingSpinnerComponent,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatListModule, MatSnackBarModule, DatePipe
  ],
  template: `
    <div class="chat-page">
      <aside class="sessions-panel">
        <div class="panel-header">
          <h3>Chat Sessions</h3>
          <button mat-icon-button (click)="newSession()">
            <mat-icon>add</mat-icon>
          </button>
        </div>
        <mat-nav-list>
          @for (session of sessions(); track session.id) {
            <a mat-list-item [class.active]="session.id === activeSessionId()"
               (click)="loadSession(session.id)">
              <mat-icon matListItemIcon>chat</mat-icon>
              <span matListItemTitle>{{ session.title }}</span>
              <span matListItemLine>{{ session.messageCount }} messages</span>
            </a>
          }
          @if (sessions().length === 0) {
            <p class="no-sessions">No sessions yet. Ask a question to start.</p>
          }
        </mat-nav-list>
      </aside>

      <main class="chat-main">
        <div class="messages" #messagesContainer>
          @if (loadingMessages()) {
            <app-loading-spinner />
          } @else {
            @for (msg of messages(); track msg.id) {
              <app-message-bubble [message]="msg" />
            }
            @if (messages().length === 0 && !activeSessionId()) {
              <div class="welcome">
                <mat-icon class="welcome-icon">smart_toy</mat-icon>
                <h2>Ask anything about your documents</h2>
                <p>Start a conversation by typing a question below</p>
              </div>
            }
          }
        </div>
        <div class="input-area">
          <mat-form-field appearance="outline" class="full-width">
            <input matInput [(ngModel)]="question" placeholder="Ask a question..."
                   (keyup.enter)="sendMessage()" [disabled]="sending()" />
          </mat-form-field>
          <button mat-fab color="primary" (click)="sendMessage()" [disabled]="!question().trim() || sending()">
            <mat-icon>{{ sending() ? 'hourglass_empty' : 'send' }}</mat-icon>
          </button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .chat-page { display: flex; height: calc(100vh - 64px); }
    .sessions-panel {
      width: 300px; border-right: 1px solid var(--border);
      background: var(--bg-card); overflow-y: auto;
    }
    .panel-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; }
    .panel-header h3 { margin: 0; }
    .no-sessions { color: var(--text-secondary); text-align: center; padding: 24px; font-size: 0.9rem; }
    .active { background: var(--bg-dark) !important; }
    .chat-main { flex: 1; display: flex; flex-direction: column; }
    .messages { flex: 1; overflow-y: auto; padding: 24px; }
    .input-area { display: flex; align-items: center; gap: 12px; padding: 16px 24px; border-top: 1px solid var(--border); }
    .full-width { flex: 1; }
    .welcome {
      text-align: center; padding: 80px 24px;
      display: flex; flex-direction: column; align-items: center;
    }
    .welcome-icon { font-size: 64px; width: 64px; height: 64px; color: var(--accent); }
    .welcome h2 { margin: 16px 0 8px; }
    .welcome p { color: var(--text-secondary); }
  `]
})
export class ChatComponent implements OnInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private chatService = inject(ChatService);
  private snackBar = inject(MatSnackBar);

  sessions = signal<ChatSessionResponse[]>([]);
  messages = signal<ChatMessageResponse[]>([]);
  activeSessionId = signal<string | null>(null);
  question = signal('');
  sending = signal(false);
  loadingMessages = signal(false);

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.chatService.getSessions().subscribe({
      next: res => this.sessions.set(res.data)
    });
  }

  loadSession(sessionId: string): void {
    this.activeSessionId.set(sessionId);
    this.loadingMessages.set(true);
    this.chatService.getSession(sessionId).subscribe({
      next: res => {
        this.messages.set(res.data);
        this.loadingMessages.set(false);
        this.scrollToBottom();
      },
      error: () => this.loadingMessages.set(false)
    });
  }

  newSession(): void {
    this.activeSessionId.set(null);
    this.messages.set([]);
  }

  sendMessage(): void {
    const q = this.question().trim();
    if (!q) return;
    this.sending.set(true);

    const userMsg: ChatMessageResponse = {
      id: crypto.randomUUID(),
      role: 'USER',
      content: q,
      sourceChunks: [],
      createdAt: new Date().toISOString()
    };
    this.messages.update(msgs => [...msgs, userMsg]);
    this.question.set('');
    this.scrollToBottom();

    this.chatService.chat({
      question: q,
      sessionId: this.activeSessionId() ?? undefined
    }).subscribe({
      next: res => {
        this.activeSessionId.set(res.data.sessionId);
        const assistantMsg: ChatMessageResponse = {
          id: crypto.randomUUID(),
          role: 'ASSISTANT',
          content: res.data.answer,
          sourceChunks: res.data.sources,
          createdAt: new Date().toISOString()
        };
        this.messages.update(msgs => [...msgs, assistantMsg]);
        this.sending.set(false);
        this.loadSessions();
        this.scrollToBottom();
      },
      error: (err) => {
        this.sending.set(false);
        this.snackBar.open(err.error?.message || 'Failed to get response', 'Close', { duration: 3000 });
      }
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 100);
  }
}

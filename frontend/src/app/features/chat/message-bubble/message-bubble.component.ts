import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChatMessageResponse } from '../../../core/services/chat.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [MatIconModule, DatePipe],
  template: `
    <div class="message" [class.user]="message().role === 'USER'" [class.assistant]="message().role === 'ASSISTANT'">
      <div class="avatar">
        <mat-icon>{{ message().role === 'USER' ? 'person' : 'smart_toy' }}</mat-icon>
      </div>
      <div class="bubble">
        <div class="content">{{ message().content }}</div>
        @if (message().sourceChunks?.length) {
          <div class="sources">
            <span class="sources-label">Sources:</span>
            @for (source of message().sourceChunks; track source.chunkId; let i = $index) {
              <span class="source-chip">[{{ i + 1 }}]</span>
            }
          </div>
        }
        <span class="timestamp">{{ message().createdAt | date:'shortTime' }}</span>
      </div>
    </div>
  `,
  styles: [`
    .message { display: flex; gap: 12px; margin-bottom: 16px; max-width: 80%; }
    .message.user { margin-left: auto; flex-direction: row-reverse; }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: var(--border); flex-shrink: 0;
    }
    .message.assistant .avatar { background: var(--accent); color: white; }
    .bubble {
      padding: 12px 16px; border-radius: 12px;
      background: var(--bg-card); border: 1px solid var(--border);
    }
    .message.user .bubble { background: var(--primary); border-color: var(--primary-light); }
    .content { white-space: pre-wrap; line-height: 1.5; }
    .sources { margin-top: 8px; display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
    .sources-label { font-size: 0.8rem; color: var(--text-secondary); }
    .source-chip {
      font-size: 0.75rem; background: var(--bg-dark); padding: 2px 6px;
      border-radius: 4px; color: var(--accent);
    }
    .timestamp { font-size: 0.75rem; color: var(--text-secondary); display: block; margin-top: 4px; }
  `]
})
export class MessageBubbleComponent {
  message = input.required<ChatMessageResponse>();
}

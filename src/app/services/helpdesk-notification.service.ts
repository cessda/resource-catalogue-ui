import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HelpdeskTicketResponse } from '../../lib/domain/eic-model';

interface TicketReadState {
  updatedAt: string;
  agentArticleIds: string[];
  stateId: number;
}

// Zammad state IDs considered significant enough to add an extra notification.
// new(1) → open(2) is excluded because Zammad sets it automatically on any agent reply.
const SIGNIFICANT_STATE_IDS = [4, 7]; // closed, pending close

@Injectable({ providedIn: 'root' })
export class HelpdeskNotificationService {
  private readonly STORAGE_KEY = 'helpdesk_read_state';

  private _totalUnread = new BehaviorSubject<number>(0);
  readonly totalUnread$ = this._totalUnread.asObservable();

  private getState(): Record<string, TicketReadState> {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  private saveState(state: Record<string, TicketReadState>): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  private getAgentArticleIds(ticket: HelpdeskTicketResponse): string[] {
    return (ticket.articles || [])
      .filter(a => a.sender === 'Agent')
      .map(a => String(a.id));
  }

  /**
   * Called on list load for each ticket.
   * Stores created_at as the baseline, no seen agent articles, and the
   * ticket's ACTUAL current state_id so subsequent comparisons are accurate.
   */
  initIfUnseen(ticket: HelpdeskTicketResponse): void {
    if (!ticket.id) return;
    const ticketId = String(ticket.id);
    const state = this.getState();
    if (!state[ticketId]) {
      state[ticketId] = {
        updatedAt: ticket.created_at,
        agentArticleIds: [],
        stateId: ticket.state_id ?? 1
      };
      this.saveState(state);
    }
  }

  /**
   * Returns the number of unread changes for a ticket:
   * - New Agent articles since last read (falls back to 1 when articles are
   *   not included in the list API response but updated_at has advanced)
   * - +1 only for significant status changes: closed or pending-close
   *   (new→open is excluded because Zammad sets it automatically on any reply)
   */
  getUnreadCount(ticket: HelpdeskTicketResponse): number {
    if (!ticket.id) return 0;
    const ticketId = String(ticket.id);
    const storedAll = this.getState();
    const stored = storedAll[ticketId];
    if (!stored) return 0;
    if (ticket.updated_at <= stored.updatedAt) return 0;

    let count = 0;

    // Count new agent articles (fallback to 1 when list API omits articles)
    const currentAgentIds = this.getAgentArticleIds(ticket);
    if (currentAgentIds.length === 0) {
      count += 1;
    } else {
      const newCount = currentAgentIds.filter(id => !stored.agentArticleIds.includes(id)).length;
      count += newCount > 0 ? newCount : 1;
    }

    // +1 only for meaningful status changes (closed / pending-close)
    const currentStateId = ticket.state_id ?? 0;
    if (
      currentStateId > 0 &&
      currentStateId !== stored.stateId &&
      SIGNIFICANT_STATE_IDS.includes(currentStateId)
    ) {
      count += 1;
    }

    return count;
  }

  /**
   * Called when the user opens a ticket modal.
   * Stores the latest updated_at, agent article IDs and state_id.
   */
  markAsRead(ticket: HelpdeskTicketResponse): void {
    if (!ticket.id) return;
    const ticketId = String(ticket.id);
    const state = this.getState();
    state[ticketId] = {
      updatedAt: ticket.updated_at,
      agentArticleIds: this.getAgentArticleIds(ticket),
      stateId: ticket.state_id ?? 0
    };
    this.saveState(state);
  }

  /**
   * Recomputes the total unread count across all tickets and emits it
   * via totalUnread$ so the tab badge stays in sync.
   */
  updateTotals(tickets: HelpdeskTicketResponse[]): void {
    const total = tickets.reduce((sum, t) => sum + this.getUnreadCount(t), 0);
    this._totalUnread.next(total);
  }
}

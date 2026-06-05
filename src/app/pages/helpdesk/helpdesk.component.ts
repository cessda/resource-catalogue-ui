import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { HelpdeskNotificationService } from '../../services/helpdesk-notification.service';
import { HelpdeskService } from '../../services/helpdesk.service';

@Component({
    selector: 'app-helpdesk',
    templateUrl: './helpdesk.component.html',
    styleUrls: ['./helpdesk.component.css'],
    standalone: false
})
export class HelpdeskComponent implements OnInit, OnDestroy {
  totalUnread = 0;
  private _sub: Subscription | null = null;
  private _ticketSub: Subscription | null = null;

  constructor(
    private notificationService: HelpdeskNotificationService,
    private helpdeskService: HelpdeskService
  ) {}

  ngOnInit(): void {
    this._sub = this.notificationService.totalUnread$.subscribe(n => {
      this.totalUnread = n;
    });

    // Seed the notification badge immediately, regardless of which tab is active.
    // TicketListComponent will refresh this again when the user visits "My Tickets".
    this._ticketSub = this.helpdeskService.getUserTickets().subscribe({
      next: tickets => {
        if (!tickets) return;
        const list = Array.isArray(tickets) ? tickets : [];
        list.forEach(t => this.notificationService.initIfUnseen(t));
        this.notificationService.updateTotals(list);
      },
      error: () => { /* badge stays at 0 on error, non-critical */ }
    });
  }

  ngOnDestroy(): void {
    this._sub?.unsubscribe();
    this._ticketSub?.unsubscribe();
  }
}

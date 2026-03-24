import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import {
  HelpdeskTicketResponse,
  HelpdeskArticle,
} from "../../../../lib/domain/eic-model";
import { HelpdeskService } from "../../../services/helpdesk.service";

@Component({
  selector: "app-ticket-modal",
  templateUrl: "./ticket-modal.component.html",
  styleUrls: ["./ticket-modal.component.css"],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class TicketModalComponent implements OnInit, OnChanges {
  @Input() ticket: HelpdeskTicketResponse | null = null;
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  replyForm: FormGroup;
  submittingReply: boolean = false;
  replyError: string = "";

  constructor(
    private formBuilder: FormBuilder,
    private helpdeskService: HelpdeskService
  ) {
    this.replyForm = this.formBuilder.group({
      body: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpen"]) {
      console.log("🔄 Modal isOpen changed:", changes["isOpen"].currentValue);
      // Reset form when modal opens/closes
      if (!changes["isOpen"].currentValue) {
        // Modal is closing - reset form
        this.replyForm.reset();
        this.replyError = "";
      }
    }
    if (changes["ticket"]) {
      const ticket = changes["ticket"].currentValue;
      console.log("🎫 Modal ticket changed:", ticket);
      
      // Reset form when ticket changes to ensure each ticket has its own form state
      this.replyForm.reset();
      this.replyError = "";
      
      if (ticket) {
        console.log("📅 Ticket timestamps:", {
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
          close_at: ticket.close_at,
        });
      }
    }
  }

  onClose(): void {
    console.log("❌ Modal close requested");
    // Reset form when closing modal
    this.replyForm.reset();
    this.replyError = "";
    this.submittingReply = false;
    this.closeModal.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getStatusClass(status: string | undefined): string {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "new":
        return "status-new";
      case "open":
        return "status-open";
      case "pending close":
        return "status-pending-close";
      case "pending reminder":
        return "status-pending-reminder";
      case "closed":
        return "status-closed";
      default:
        return "status-default";
    }
  }

  getStatusIcon(status: string | undefined): string {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "new":
        return "fa fa-plus-circle";
      case "open":
        return "fa fa-exclamation-circle";
      case "pending close":
        return "fa fa-clock";
      case "pending reminder":
        return "fa fa-bell";
      case "closed":
        return "fa fa-check-circle";
      default:
        return "fa fa-question-circle";
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) {
      return "";
    }
    const date = new Date(dateString);
    // Use UTC methods to get the time as it appears in the ISO string (UTC timezone)
    const day = date.getUTCDate();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year} at ${hours}:${minutes}`;
  }

  formatTime(dateString: string | undefined): string {
    if (!dateString) {
      return "";
    }
    const date = new Date(dateString);
    // Use UTC methods to get the time as it appears in the ISO string (UTC timezone)
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  /**
   * Converts state_id to state name
   * state_id: 1 --> "new"
   * state_id: 2 --> "open"
   * state_id: 3 --> "pending reminder"
   * state_id: 4 --> "closed"
   * state_id: 7 --> "pending close"
   */
  getStateFromId(stateId: number | undefined): string {
    if (!stateId) {
      return "";
    }
    switch (stateId) {
      case 1:
        return "new";
      case 2:
        return "open";
      case 3:
        return "pending reminder";
      case 4:
        return "closed";
      case 7:
        return "pending close";
      default:
        return "";
    }
  }

  /**
   * Gets the state name from a ticket, checking state_id first, then state
   */
  getTicketState(ticket: HelpdeskTicketResponse | null): string {
    if (!ticket) {
      return "";
    }
    if (ticket.state_id !== undefined) {
      return this.getStateFromId(ticket.state_id);
    }
    return ticket.state || "";
  }

  /**
   * Strips leading <br> tags from HTML content
   */
  cleanBodyHtml(html: string | undefined): string {
    if (!html) {
      return "";
    }
    // Remove leading <br> or <br/> tags (case insensitive, with optional attributes)
    return html.replace(/^(<br\s*\/?>)+/i, "");
  }

  /**
   * Determines if an article is from EPOT (Agent) or User (Customer)
   * @param article The article to check
   * @returns true if the article is from EPOT (Agent), false if from User (Customer)
   */
  isEpotMessage(article: HelpdeskArticle): boolean {
    return article.sender === "Agent";
  }

  /**
   * Gets the message originator label
   * @param article The article to check
   * @returns "EPOT" if from Agent, "USER" if from Customer
   */
  getMessageOriginator(article: HelpdeskArticle): string {
    return this.isEpotMessage(article) ? "EPOT" : "USER";
  }

  /**
   * Checks if the ticket is closed
   * @returns true if ticket state is "closed"
   */
  isTicketClosed(): boolean {
    if (!this.ticket) {
      return false;
    }
    const state = this.getTicketState(this.ticket);
    return state.toLowerCase() === "closed";
  }

  /**
   * Handles reply form submission
   */
  onSubmitReply(): void {
    if (this.replyForm.valid && this.ticket && this.ticket.id) {
      this.submittingReply = true;
      this.replyError = "";

      const ticketId = String(this.ticket.id);
      const replyBody = this.replyForm.value.body;

      this.helpdeskService.addReply(ticketId, replyBody).subscribe({
        next: () => {
          console.log("✅ Reply submitted successfully");
          this.replyForm.reset();
          
          // Re-fetch the full ticket to get updated articles/conversation
          this.helpdeskService.getTicket(ticketId).subscribe({
            next: (fullTicket) => {
              // Handle case where API returns an array instead of a single object
              const ticketData = Array.isArray(fullTicket) ? fullTicket[0] : fullTicket;
              this.ticket = ticketData;
              this.submittingReply = false;
              console.log("✅ Ticket refreshed with updated conversation");
            },
            error: (fetchErr) => {
              console.error("⚠️ Reply sent but failed to refresh ticket:", fetchErr);
              // Reply was sent successfully, just couldn't refresh
              this.submittingReply = false;
            }
          });
        },
        error: (err) => {
          console.error("❌ Error submitting reply:", err);
          console.error("❌ Error details:", {
            status: err.status,
            statusText: err.statusText,
            message: err.message,
            error: err.error,
            url: err.url
          });
          
          // Provide more specific error message
          if (err.status === 500) {
            this.replyError = "Server error. Please contact support if the issue persists.";
          } else if (err.status === 404) {
            this.replyError = "Ticket not found. Please refresh and try again.";
          } else if (err.status === 400) {
            this.replyError = "Invalid request. Please check your message and try again.";
          } else {
            this.replyError = "Failed to send reply. Please try again.";
          }
          this.submittingReply = false;
        },
      });
    }
  }

  /**
   * Gets error message for form validation
   */
  getErrorMessage(field: string): string {
    const control = this.replyForm.get(field);
    if (control?.hasError("required")) {
      return `${field} is required`;
    }
    return "";
  }
}

import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { Component, OnInit, OnDestroy } from '@angular/core';
=======
import { Component, OnInit } from '@angular/core';
>>>>>>> 7ecf3261aaebf7546535d59d93d63362eb813bf2
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { NotificationService, Toast } from '../../../../services/notification.service';

export interface DiagnosticNotification {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  targetUserId: string;
  relatedOrderId?: string;
  isRead: boolean;
  isAcknowledged: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  imports: [CommonModule, RouterModule, DropdownComponent, DropdownItemComponent]
})
<<<<<<< HEAD
export class NotificationDropdownComponent implements OnInit, OnDestroy {

  private baseUrl = 'http://localhost:8070/diagnostic/notifications';

  // ⚠️ Remplacez par votre AuthService si vous en avez un
  currentUserId = 'lab_user';

  isOpen    = false;
  notifying = false;   // contrôle le point orange sur la cloche

  notifications: DiagnosticNotification[] = [];
  private pollSub!: Subscription;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Polling toutes les 30 secondes
    this.pollSub = interval(30_000).pipe(
      startWith(0),
      switchMap(() =>
        this.http.get<DiagnosticNotification[]>(
          `${this.baseUrl}/user/${this.currentUserId}`
        )
      )
    ).subscribe({
      next: data => {
        this.notifications = data;
        // Allumer le point orange s'il y a des non lues
        this.notifying = data.some(n => !n.isRead);
      },
      error: err => console.error('Notification error', err)
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.unreadCount > 0) {
      this.markAllRead();
=======
export class NotificationDropdownComponent implements OnInit {
  isOpen = false;
  notifying = false;
  toasts: Toast[] = [];
  unreadCount = 0;

  constructor(private notif: NotificationService) {}

  ngOnInit(): void {
    this.notif.toasts.subscribe((t: Toast[]) => {
      this.toasts = t;
      this.unreadCount = t.filter(n => !n.read).length;
      this.notifying = this.unreadCount > 0;
    });
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.notif.markAllRead();
      this.notifying = false;
>>>>>>> 7ecf3261aaebf7546535d59d93d63362eb813bf2
    }
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

<<<<<<< HEAD
  // ── Marquer toutes lues ──────────────────────────────────
  markAllRead(): void {
    this.http.put<void>(`${this.baseUrl}/user/${this.currentUserId}/read-all`, null)
      .subscribe(() => {
        this.notifications.forEach(n => n.isRead = true);
        this.notifying = false;
      });
  }

  // ── Acquitter une notif critique ─────────────────────────
  acknowledge(notif: DiagnosticNotification, event: MouseEvent): void {
    event.stopPropagation();
    this.http.put<DiagnosticNotification>(
      `${this.baseUrl}/${notif.id}/acknowledge`,
      null,
      { params: { by: this.currentUserId } }
    ).subscribe(() => {
      notif.isAcknowledged = true;
      notif.isRead = true;
    });
  }

  // ── Getters utiles pour le template ─────────────────────
  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  get hasCritical(): boolean {
    return this.notifications.some(
      n => n.severity === 'CRITICAL' && !n.isAcknowledged
    );
  }

  // ── Helpers affichage ────────────────────────────────────
  severityIcon(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return '🚨';
      case 'HIGH':     return '⚡';
      case 'MEDIUM':   return '⚠️';
      default:         return '📋';
    }
  }

  severityDotClass(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH':     return 'bg-orange-500';
      case 'MEDIUM':   return 'bg-yellow-400';
      default:         return 'bg-gray-400';
    }
  }

  timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60)    return 'À l\'instant';
    if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
    return `${Math.floor(diff / 86400)} j ago`;
=======
  remove(id: string, event: Event): void {
    event.stopPropagation();
    this.notif.remove(id);
  }

  clearAll(): void {
    this.notif.clearAll();
  }

  timeAgo(date: Date): string {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  iconFor(type: string): string {
    const icons: Record<string, string> = {
      success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️'
    };
    return icons[type] || '🔔';
  }

  bgFor(type: string): string {
    const colors: Record<string, string> = {
      success: 'bg-green-100 dark:bg-green-500/10',
      error:   'bg-red-100 dark:bg-red-500/10',
      warning: 'bg-yellow-100 dark:bg-yellow-500/10',
      info:    'bg-blue-100 dark:bg-blue-500/10'
    };
    return colors[type] || 'bg-gray-100';
  }

  borderFor(type: string): string {
    const borders: Record<string, string> = {
      success: 'border-l-4 border-green-400',
      error:   'border-l-4 border-red-400',
      warning: 'border-l-4 border-yellow-400',
      info:    'border-l-4 border-blue-400'
    };
    return borders[type] || '';
>>>>>>> 7ecf3261aaebf7546535d59d93d63362eb813bf2
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DialysisService } from '../services/dialysis.service';

@Component({
  selector: 'app-dialysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialysis.component.html',
  styleUrls: ['./dialysis.component.css']
})
export class DialysisComponent implements OnInit {

  treatment: any = null;
  sessions: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private dialysisService: DialysisService) {}

  ngOnInit(): void {
    this.loadMyData();
  }

  loadMyData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      treatments: this.dialysisService.getMyTreatment(),
      history: this.dialysisService.getMyHistory()
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ treatments, history }) => {
          const list = Array.isArray(treatments) ? treatments : [];
          this.treatment =
            list.find((t: any) => t?.status === 'ACTIVE') ??
            (list.length ? list[0] : null);

          this.sessions = (history ?? []).slice().sort((a, b) => {
            const da = new Date(a.sessionDate).getTime();
            const db = new Date(b.sessionDate).getTime();
            return db - da;
          });
        },
        error: (err) => {
          console.error('Dialysis load error:', err);
          this.error = 'Unable to load your dialysis data.';
        }
      });
  }
}

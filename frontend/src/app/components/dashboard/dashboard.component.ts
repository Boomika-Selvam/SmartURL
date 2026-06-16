import { Component, OnInit } from '@angular/core';
import { SmartUrl } from '../../models/url.model';
import { UrlService } from '../../services/url.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  urls: SmartUrl[] = [];
  loading = false;
  message = '';

  constructor(private urlService: UrlService) { }

  ngOnInit(): void {
    this.loadUrls();
  }

  loadUrls(): void {
    this.loading = true;
    this.urlService.getHistory().subscribe(
      response => {
        this.loading = false;
        this.urls = response.urls;
      },
      error => {
        this.loading = false;
        this.message = error.error && error.error.message ? error.error.message : 'Could not load URL history.';
      }
    );
  }

  copy(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.message = 'Short URL copied.';
      setTimeout(() => this.message = '', 1800);
    });
  }

  deleteUrl(id: string): void {
    if (!confirm('Delete this short URL?')) {
      return;
    }

    this.urlService.deleteUrl(id).subscribe(
      () => {
        this.urls = this.urls.filter(url => url._id !== id);
      },
      error => {
        this.message = error.error && error.error.message ? error.error.message : 'Could not delete URL.';
      }
    );
  }
}


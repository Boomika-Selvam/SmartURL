import { Component } from '@angular/core';
import { UrlService } from '../../services/url.service';
import { SmartUrl } from '../../models/url.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  longUrl = '';
  customAlias = '';
  suggestions: string[] = [];
  selectedAlias = '';
  aliasFromSuggestion = false;
  createdUrl: SmartUrl | null = null;
  loadingSuggestions = false;
  creating = false;
  message = '';
  copyMessage = '';

  constructor(private urlService: UrlService) { }

  analyze(): void {
    if (!this.longUrl.trim()) {
      this.message = 'Paste a long URL first.';
      return;
    }

    this.loadingSuggestions = true;
    this.message = '';
    this.createdUrl = null;
    this.selectedAlias = '';
    this.customAlias = '';
    this.aliasFromSuggestion = false;

    this.urlService.suggest(this.longUrl.trim()).subscribe(
      response => {
        this.loadingSuggestions = false;
        this.suggestions = response.suggestions;
        this.selectedAlias = '';
        this.customAlias = '';
        this.aliasFromSuggestion = false;
      },
      error => {
        this.loadingSuggestions = false;
        this.message = error.error && error.error.message ? error.error.message : 'Could not analyze this URL.';
      }
    );
  }

  choose(alias: string): void {
  if (this.selectedAlias === alias && this.aliasFromSuggestion) {
    this.selectedAlias = '';
    this.aliasFromSuggestion = false;
    return;
  }

  this.selectedAlias = alias;
  this.customAlias = '';
  this.aliasFromSuggestion = true;
}

 create(): void {
  const alias = (this.aliasFromSuggestion ? this.selectedAlias : this.customAlias).trim();

  if (!this.longUrl.trim() || !alias) {
    this.message = 'Enter a URL and choose or type an alias.';
    return;
  }

  this.creating = true;
  this.message = '';
  this.copyMessage = '';

  this.urlService.create(this.longUrl.trim(), alias).subscribe(
    response => {
      this.creating = false;
      this.createdUrl = response.url;
    },
    error => {
      this.creating = false;
      this.message = error.error && error.error.message ? error.error.message : 'Could not create short URL.';
    }
  );
}

  copy(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.copyMessage = 'Copied to clipboard.';
    });
  }
}
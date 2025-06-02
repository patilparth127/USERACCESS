import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AccessService } from '../../../core/services/access.service';

@Component({
  selector: 'app-general-settings',
    standalone: false,
  template: `
    <div class="container">
      <h2>General Settings</h2>
      <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
        <div class="mb-3">
          <label for="siteName" class="form-label">Site Name</label>
          <input type="text" class="form-control" id="siteName" formControlName="siteName">
        </div>
        <div class="mb-3">
          <label for="siteDescription" class="form-label">Site Description</label>
          <textarea class="form-control" id="siteDescription" formControlName="siteDescription" rows="3"></textarea>
        </div>
        <div class="mb-3">
          <label for="contactEmail" class="form-label">Contact Email</label>
          <input type="email" class="form-control" id="contactEmail" formControlName="contactEmail">
        </div>
        <div class="mb-3 form-check">
          <input type="checkbox" class="form-check-input" id="enableNotifications" formControlName="enableNotifications">
          <label class="form-check-label" for="enableNotifications">Enable Email Notifications</label>
        </div>
        <div class="mb-3">
          <label for="defaultLanguage" class="form-label">Default Language</label>
          <select class="form-control" id="defaultLanguage" formControlName="defaultLanguage">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="!canUpdateSettings">Save Settings</button>
      </form>
    </div>
  `
})
export class GeneralSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  canUpdateSettings = false;
  
  constructor(
    private fb: FormBuilder,
    private accessService: AccessService
  ) {
    this.settingsForm = this.fb.group({
      siteName: ['RBAC Demo Application'],
      siteDescription: ['Role-based access control demonstration application'],
      contactEmail: ['admin@example.com'],
      enableNotifications: [true],
      defaultLanguage: ['en']
    });
  }
  
  ngOnInit() {
    // Load permissions for this module
    this.accessService.loadModulePermissions(['Settings']).subscribe();
    
    // Check if user can update settings
    this.accessService.hasPermission('Settings.UpdateSettings').subscribe(
      can => {
        this.canUpdateSettings = can;
        if (!can) {
          this.settingsForm.disable();
        }
      }
    );
    
    // Normally would fetch settings from a service here
  }
  
  saveSettings() {
    if (this.settingsForm.valid) {
      console.log('Saving settings:', this.settingsForm.value);
      // Would typically call a service to save the settings
      alert('Settings saved successfully!');
    }
  }
}

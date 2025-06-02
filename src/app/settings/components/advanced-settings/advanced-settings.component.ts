import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AccessService } from '../../../core/services/access.service';

@Component({
  selector: 'app-advanced-settings',
    standalone: false,
  template: `
    <div class="container">
      <h2>Advanced Settings</h2>
      <div *ngIf="!canManageAdvancedSettings" class="alert alert-warning">
        You do not have permission to manage advanced settings.
      </div>
      <form [formGroup]="advancedForm" (ngSubmit)="saveSettings()" *ngIf="canManageAdvancedSettings">
        <div class="mb-3">
          <label for="cacheTimeout" class="form-label">Cache Timeout (seconds)</label>
          <input type="number" class="form-control" id="cacheTimeout" formControlName="cacheTimeout">
        </div>
        <div class="mb-3">
          <label for="logLevel" class="form-label">Log Level</label>
          <select class="form-control" id="logLevel" formControlName="logLevel">
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="apiThrottling" class="form-label">API Rate Limit (requests per minute)</label>
          <input type="number" class="form-control" id="apiThrottling" formControlName="apiThrottling">
        </div>
        <div class="mb-3 form-check">
          <input type="checkbox" class="form-check-input" id="enableDebugMode" formControlName="enableDebugMode">
          <label class="form-check-label" for="enableDebugMode">Enable Debug Mode</label>
        </div>
        <div class="mb-3">
          <label for="maintenanceMode" class="form-label">Maintenance Mode</label>
          <div class="form-check">
            <input class="form-check-input" type="radio" formControlName="maintenanceMode" id="maintenanceOff" value="off">
            <label class="form-check-label" for="maintenanceOff">
              Off
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" formControlName="maintenanceMode" id="maintenanceScheduled" value="scheduled">
            <label class="form-check-label" for="maintenanceScheduled">
              Scheduled
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" formControlName="maintenanceMode" id="maintenanceOn" value="on">
            <label class="form-check-label" for="maintenanceOn">
              On
            </label>
          </div>
        </div>
        
        <button type="submit" class="btn btn-primary">Save Advanced Settings</button>
      </form>
    </div>
  `
})
export class AdvancedSettingsComponent implements OnInit {
  advancedForm: FormGroup;
  canManageAdvancedSettings = false;
  
  constructor(
    private fb: FormBuilder,
    private accessService: AccessService
  ) {
    this.advancedForm = this.fb.group({
      cacheTimeout: [300],
      logLevel: ['info'],
      apiThrottling: [60],
      enableDebugMode: [false],
      maintenanceMode: ['off']
    });
  }
  
  ngOnInit() {
    // Load permissions for this module
    this.accessService.loadModulePermissions(['Settings']).subscribe();
    
    // Check advanced settings permission
    this.accessService.hasPermission('Settings.ManageAdvancedSettings').subscribe(
      can => {
        this.canManageAdvancedSettings = can;
        if (!can) {
          this.advancedForm.disable();
        }
      }
    );
  }
  
  saveSettings() {
    if (this.advancedForm.valid) {
      console.log('Saving advanced settings:', this.advancedForm.value);
      // Would typically call a service to save the settings
      alert('Advanced settings saved successfully!');
    }
  }
}

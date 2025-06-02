import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralSettingsComponent } from './components/general-settings/general-settings.component';
import { AdvancedSettingsComponent } from './components/advanced-settings/advanced-settings.component';
import { PermissionGuard } from '../core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'general',
    pathMatch: 'full'
  },
  {
    path: 'general',
    component: GeneralSettingsComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'Settings.ViewSettings' }
  },
  {
    path: 'advanced',
    component: AdvancedSettingsComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'Settings.ManageAdvancedSettings' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }

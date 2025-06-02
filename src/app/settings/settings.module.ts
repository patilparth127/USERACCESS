import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { GeneralSettingsComponent } from './components/general-settings/general-settings.component';
import { AdvancedSettingsComponent } from './components/advanced-settings/advanced-settings.component';

const routes: Routes = [
  { path: 'general', component: GeneralSettingsComponent },
  { path: 'advanced', component: AdvancedSettingsComponent },
  { path: '', redirectTo: 'general', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    GeneralSettingsComponent,
    AdvancedSettingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class SettingsModule { }

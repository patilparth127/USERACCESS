import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

interface PermissionGroup {
  moduleName: string;
  permissions: string[];
}

@Component({
  selector: 'app-user-permissions',
  standalone: false,
  templateUrl: './user.permissions.component.html'
})
export class UserPermissionsComponent implements OnInit {
  userId: string = '';
  user: any = {};
  permissionsForm!: FormGroup;
  loading = false;

  // Module-grouped permissions structure
  permissionModules: any[] = [
    {
      name: 'UserManagement',
      displayName: 'User Management',
      permissions: [
        { name: 'View Users', value: 'User.ViewUsers' },
        { name: 'Create User', value: 'User.CreateUser' },
        { name: 'Update User', value: 'User.UpdateUser' },
        { name: 'Delete User', value: 'User.DeleteUser' }
      ]
    },
    {
      name: 'ReportManagement',
      displayName: 'Report Management',
      permissions: [
        { name: 'View Reports', value: 'Report.ViewReports' },
        { name: 'Create Report', value: 'Report.CreateReport' },
        { name: 'Update Report', value: 'Report.UpdateReport' },
        { name: 'Delete Report', value: 'Report.DeleteReport' },
        { name: 'View Report Detail', value: 'Report.ViewReportDetail' }
      ]
    },
    {
      name: 'FileManagement',
      displayName: 'File Management',
      permissions: [
        { name: 'View Files', value: 'File.ViewFiles' },
        { name: 'Upload File', value: 'File.UploadFile' },
        { name: 'Delete File', value: 'File.DeleteFile' }
      ]
    },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId') || '';
    this.initForm();

    if (this.userId) {
      this.loadUserData();
    } else {
      this.router.navigate(['/users/manage']);
    }
  }

  initForm(): void {
    this.permissionsForm = this.fb.group({
      modulePermissions: this.fb.array(this.permissionModules.map(module =>
        this.fb.group({
          moduleName: [module.name],
          displayName: [module.displayName],
          permissions: [[], Validators.required]
        })
      ))
    });
  }

  loadUserData(): void {
    this.loading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (response: any) => {
        this.user = response.data.user;
        this.patchPermissionValues();
        this.loading = false;
      },
      error: (error) => {
        this.router.navigate(['/users/manage']);
        this.loading = false;
      }
    });
  }

  // Update form with user's permissions
  patchPermissionValues(): void {
    if (!this.user.permissions || !Array.isArray(this.user.permissions)) {
      return;
    }

    // Get the form array
    const modulePermissionsArray = this.permissionsForm.get('modulePermissions') as any;

    // Update each module group with their permissions
    this.user.permissions.forEach((permGroup: PermissionGroup) => {
      // Find the matching form group
      const formGroupIndex = this.permissionModules.findIndex(m =>
        m.name === permGroup.moduleName);

      if (formGroupIndex !== -1 && modulePermissionsArray.at(formGroupIndex)) {
        // Set the permissions for this module
        modulePermissionsArray.at(formGroupIndex).get('permissions')?.setValue(
          permGroup.permissions || []
        );
      }
    });
  }

  submitForm(): void {
    if (this.permissionsForm.invalid) {
      return;
    }

    // Convert form value to expected API format
    const modulePermissions = this.permissionsForm.get('modulePermissions')?.value || [];
    const permissions = modulePermissions
      .filter((module: any) => module.permissions && module.permissions.length > 0)
      .map((module: any) => ({
        moduleName: module.moduleName,
        permissions: module.permissions
      }));

    this.loading = true;
    this.userService.updateUserPermissions(this.userId, permissions).subscribe({
      next: () => {
        this.router.navigate(['/users/manage']);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }

  // Helper methods for bulk permission selection
  selectAllModulePermissions(moduleIndex: number): void {
    const moduleFormGroup = (this.permissionsForm.get('modulePermissions') as any).at(moduleIndex);
    const module = this.permissionModules[moduleIndex];

    const currentPermissions = [...moduleFormGroup.get('permissions')?.value || []];
    const modulePermissionValues = module.permissions.map((p: any) => p.value);

    // Check if all permissions in this module are already selected
    const allSelected = modulePermissionValues.every((p: string) => currentPermissions.includes(p));

    if (allSelected) {
      // If all are selected, deselect all
      moduleFormGroup.get('permissions')?.setValue([]);
    } else {
      // Add all module permissions
      moduleFormGroup.get('permissions')?.setValue([...modulePermissionValues]);
    }
  }

  isModuleFullySelected(moduleIndex: number): boolean {
    const moduleFormGroup = (this.permissionsForm.get('modulePermissions') as any).at(moduleIndex);
    const module = this.permissionModules[moduleIndex];

    const currentPermissions = moduleFormGroup.get('permissions')?.value || [];
    return module.permissions.every((p: any) => currentPermissions.includes(p.value));
  }

  isModulePartiallySelected(moduleIndex: number): boolean {
    const moduleFormGroup = (this.permissionsForm.get('modulePermissions') as any).at(moduleIndex);
    const module = this.permissionModules[moduleIndex];

    const currentPermissions = moduleFormGroup.get('permissions')?.value || [];
    const modulePermissionValues = module.permissions.map((p: any) => p.value);

    const hasAny = modulePermissionValues.some((p: string) => currentPermissions.includes(p));
    const hasAll = modulePermissionValues.every((p: string) => currentPermissions.includes(p));

    return hasAny && !hasAll;
  }

  cancel(): void {
    this.router.navigate(['/users/manage']);
  }

  togglePermission(moduleIndex: number, permissionValue: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const moduleFormGroup = (this.permissionsForm.get('modulePermissions') as any).at(moduleIndex);
    const permissions = moduleFormGroup.get('permissions')?.value || [];

    if (checkbox.checked) {
      // Add permission if not already present
      if (!permissions.includes(permissionValue)) {
        moduleFormGroup.get('permissions')?.setValue([...permissions, permissionValue]);
      }
    } else {
      // Remove permission
      moduleFormGroup.get('permissions')?.setValue(
        permissions.filter((p: string) => p !== permissionValue)
      );
    }
  }

  // Helper to check if a module has any permissions selected
  hasModulePermissions(moduleIndex: number): boolean {
    const moduleFormGroup = (this.permissionsForm.get('modulePermissions') as any).at(moduleIndex);
    const permissions = moduleFormGroup.get('permissions')?.value || [];
    return permissions.length > 0;
  }

  // Get all selected permissions in flat array for summary display
  getAllSelectedPermissions(): string[] {
    const modulePermissions = this.permissionsForm.get('modulePermissions')?.value || [];
    let allPermissions: string[] = [];

    modulePermissions.forEach((module: any) => {
      if (module.permissions && Array.isArray(module.permissions)) {
        allPermissions = [...allPermissions, ...module.permissions];
      }
    });

    return allPermissions;
  }

  // Add this helper method to check if a permission is selected
  isPermissionSelected(moduleIndex: number, permValue: string): boolean {
    const modulePermissions = this.permissionsForm.get('modulePermissions') as FormArray;
    if (!modulePermissions || !modulePermissions.at(moduleIndex)) {
      return false;
    }

    const permissions = modulePermissions.at(moduleIndex).get('permissions')?.value || [];
    return permissions.includes(permValue);
  }
}

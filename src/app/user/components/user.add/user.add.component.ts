import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

interface PermissionGroup {
  moduleName: string;
  permissions: string[];
}

@Component({
  selector: 'app-user-add',
  standalone: false,
  templateUrl: './user.add.component.html',
})

export class UserAddComponent implements OnInit {
  userId: string = '';
  operation = 'Add';
  btnName = 'Add User';
  userForm!: FormGroup;

  // Define the permission modules here
  permissionModules: any[] = [
    {
      name: 'UserManagement',
      displayName: 'User Management',
      permissions: [
        { name: 'View Users', value: 'Users.ViewUsers' },
        { name: 'Create User', value: 'Users.CreateUser' },
        { name: 'Update User', value: 'Users.UpdateUser' },
        { name: 'Delete User', value: 'Users.DeleteUser' }
      ]
    },
    {
      name: 'RoleManagement',
      displayName: 'Role Management',
      permissions: [
        { name: 'View Roles', value: 'Roles.ViewRoles' },
        { name: 'Create Role', value: 'Roles.CreateRole' },
        { name: 'Update Role', value: 'Roles.UpdateRole' },
        { name: 'Delete Role', value: 'Roles.DeleteRole' }
      ]
    },
    {
      name: 'ReportManagement',
      displayName: 'Report Management',
      permissions: [
        { name: 'View Reports', value: 'Reports.ViewReports' },
        { name: 'Create Report', value: 'Reports.CreateReport' },
        { name: 'Update Report', value: 'Reports.UpdateReport' },
        { name: 'Delete Report', value: 'Reports.DeleteReport' },
        { name: 'View Report Detail', value: 'Reports.ViewReportDetail' }
      ]
    },
    {
      name: 'FileManagement',
      displayName: 'File Management',
      permissions: [
        { name: 'View Files', value: 'Files.ViewFiles' },
        { name: 'Upload File', value: 'Files.UploadFile' },
        { name: 'Delete File', value: 'Files.DeleteFile' }
      ]
    },
    {
      name: 'SettingsManagement',
      displayName: 'Settings Management',
      permissions: [
        { name: 'View Settings', value: 'Settings.ViewSettings' },
        { name: 'Manage Advanced Settings', value: 'Settings.ManageAdvancedSettings' }
      ]
    }
  ];
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userId = this.route.snapshot.paramMap.get('userId') || '';
  }

  ngOnInit(): void {
    this.initializeForm();
    
    if (this.userId) {
      this.operation = 'Edit';
      this.btnName = 'Update User';
      this.loadUserData();
    }
  }

  initializeForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: [
        { value: '', disabled: this.operation === 'Edit' }, 
        [Validators.required, Validators.email],
      ], 
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      date_of_birth: ['', Validators.required],
      modulePermissions: this.fb.array(this.permissionModules.map(module => 
        this.fb.group({
          moduleName: [module.name],
          permissions: [[]]
        })
      )),
      is_active: [true],
    });
  }
  
  loadUserData(): void {
    this.userService.getUserById(this.userId).subscribe({
      next: (res: any) => {
        const userData = res.data.user;
        
        // Patch basic user data
        this.userForm.patchValue({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          date_of_birth: userData.date_of_birth,
          is_active: userData.is_active
        });
        
        // Handle permissions
        if (userData.permissions && Array.isArray(userData.permissions)) {
          this.patchPermissions(userData.permissions);
        }
      },
      error: (err) => {
        this.message.error('Failed to fetch user: ' + err.message);
        this.router.navigate(['/users/manage']);
      }
    });
  }
  
  patchPermissions(permissionGroups: PermissionGroup[]): void {
    // Get the form array
    const modulePermissionsArray = this.userForm.get('modulePermissions') as FormArray;
    
    // Update each module group with their permissions
    permissionGroups.forEach(permGroup => {
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

  // Add this helper method to check if a permission is selected
  isPermissionSelected(moduleIndex: number, permValue: string): boolean {
    const modulePermissions = this.userForm.get('modulePermissions') as FormArray;
    if (!modulePermissions || !modulePermissions.at(moduleIndex)) {
      return false;
    }
    
    const permissions = modulePermissions.at(moduleIndex).get('permissions')?.value || [];
    return permissions.includes(permValue);
  }

  submitForm(): void {
    if (this.userForm.invalid) {
      Object.values(this.userForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    // Format the permissions into the expected format for the API
    const formValue = {...this.userForm.getRawValue()};
    
    // Convert modulePermissions array to expected API format
    const modulePermissions = formValue.modulePermissions || [];
    formValue.permissions = modulePermissions
      .filter((module: {moduleName: string; permissions: string[]}) => module.permissions && module.permissions.length > 0)
      .map((module: {moduleName: string; permissions: string[]}) => ({
        moduleName: module.moduleName,
        permissions: module.permissions
      }));
    
    // Remove the modulePermissions property before sending
    delete formValue.modulePermissions;

    switch (this.operation) {
      case 'Add':
        this.userService.createUser(formValue).subscribe({
          next: () => {
            this.userForm.reset();
            this.initializeForm(); // Reset with fresh form groups
            this.message.success('User created successfully');
          },
          error: (err) => {
            this.message.error('Failed to create user: ' + err.message);
          },
        });
        break;

      case 'Edit':
        this.userService.updateUser(this.userId, formValue).subscribe({
          next: () => {
            this.router.navigate(['/users/manage']);
            this.message.success('User updated successfully');
          },
          error: (err) => {
            this.message.error('Failed to update user: ' + err.message);
          },
        });
        break;
    }
  }

  cancel(): void {
    this.router.navigate(['/users/manage']);
  }

  getTitle(): string {
    return this.operation === 'Add' ? 'Add User' : 'Update User';
  }
  
  // Helper methods for permission handling
  selectAllModulePermissions(moduleIndex: number): void {
    const moduleFormGroup = (this.userForm.get('modulePermissions') as FormArray).at(moduleIndex);
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
    const moduleFormGroup = (this.userForm.get('modulePermissions') as FormArray).at(moduleIndex);
    const module = this.permissionModules[moduleIndex];
    
    const currentPermissions = moduleFormGroup.get('permissions')?.value || [];
    return module.permissions.every((p: any) => currentPermissions.includes(p.value));
  }
  
  isModulePartiallySelected(moduleIndex: number): boolean {
    const moduleFormGroup = (this.userForm.get('modulePermissions') as FormArray).at(moduleIndex);
    const module = this.permissionModules[moduleIndex];
    
    const currentPermissions = moduleFormGroup.get('permissions')?.value || [];
    const modulePermissionValues = module.permissions.map((p: any) => p.value);
    
    const hasAny = modulePermissionValues.some((p: string) => currentPermissions.includes(p));
    const hasAll = modulePermissionValues.every((p: string) => currentPermissions.includes(p));
    
    return hasAny && !hasAll;
  }
  
  togglePermission(moduleIndex: number, permValue: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const moduleFormGroup = (this.userForm.get('modulePermissions') as FormArray).at(moduleIndex);
    const permissions = moduleFormGroup.get('permissions')?.value || [];
    
    if (checkbox.checked) {
      // Add permission if not already present
      if (!permissions.includes(permValue)) {
        moduleFormGroup.get('permissions')?.setValue([...permissions, permValue]);
      }
    } else {
      // Remove permission
      moduleFormGroup.get('permissions')?.setValue(
        permissions.filter((p: string) => p !== permValue)
      );
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

interface PermissionGroup {
  moduleName: string;
  permissions: string[];
}

@Component({
  selector: 'app-role-add',
  standalone: false,
  templateUrl: './role.add.component.html',
})

export class RoleAddComponent implements OnInit {
  roleId: string = '';
  operation = 'Add';
  btnName = 'Add Role';
  roleForm!: FormGroup;
  
  // Updated permissions structure with module grouping
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
    private roleService: RoleService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.roleId = this.route.snapshot.paramMap.get('roleId') || '';
  }

  ngOnInit(): void {
    this.initializeForm();
    
    if (this.roleId) {
      this.operation = 'Edit';
      this.btnName = 'Update Role';
      this.loadRoleData();
    }
  }

  initializeForm(): void {
    this.roleForm = this.fb.group({
      name: [
        { value: '', disabled: this.operation === 'Edit' },
        [Validators.required, Validators.minLength(3)],
      ],
      role: ['', [Validators.required, Validators.minLength(3)]],
      is_active: [true],
      modulePermissions: this.fb.array(this.permissionModules.map(module => 
        this.fb.group({
          moduleName: [module.name],
          permissions: [[]]
        })
      )),
      remarks: ['']
    });
  }
  
  loadRoleData(): void {
    this.roleService.getRoleById(this.roleId).subscribe({
      next: (res: any) => {
        const roleData = res.data.role;
        
        // Patch basic role data
        this.roleForm.patchValue({
          name: roleData.name,
          role: roleData.role,
          is_active: roleData.is_active,
          remarks: roleData.remarks
        });
        
        // Handle permissions
        if (roleData.permissions && Array.isArray(roleData.permissions)) {
          this.patchPermissions(roleData.permissions);
        }
      },
      error: (err) => {
        this.message.error('Failed to fetch role: ' + err.message);
        this.router.navigate(['/roles/manage']);
      },
    });
  }
  
  patchPermissions(permissionGroups: PermissionGroup[]): void {
    // Get the form array
    const modulePermissionsArray = this.roleForm.get('modulePermissions') as FormArray;
    
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
    const modulePermissions = this.roleForm.get('modulePermissions') as FormArray;
    if (!modulePermissions || !modulePermissions.at(moduleIndex)) {
      return false;
    }
    
    const permissions = modulePermissions.at(moduleIndex).get('permissions')?.value || [];
    return permissions.includes(permValue);
  }

  submitForm(): void {
    if (this.roleForm.invalid) {
      Object.values(this.roleForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    // Format the permissions into the expected format for the API
    const formValue = {...this.roleForm.getRawValue()};
    
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
        this.roleService.createRole(formValue).subscribe({
          next: () => {
            this.roleForm.reset();
            this.initializeForm(); // Reset with fresh form groups
            this.message.success('Role created successfully');
          },
          error: (err) => {
            this.message.error('Failed to create role: ' + err.message);
          }
        });
        break;

      case 'Edit':
        this.roleService.updateRole(this.roleId, formValue).subscribe({
          next: () => {
            this.router.navigate(['/roles/manage']);
            this.message.success('Role updated successfully');
          },
          error: (err) => {
            this.message.error('Failed to update role: ' + err.message);
          }
        });
        break;
    }
  }

  cancel(): void {
    this.router.navigate(['/roles/manage']);
  }

  getTitle(): string {
    return this.operation === 'Add' ? 'Add Role' : 'Update Role';
  }
  
  // Helper methods for permission handling
  selectAllModulePermissions(moduleIndex: number): void {
    const moduleFormGroup = (this.roleForm.get('modulePermissions') as FormArray).at(moduleIndex);
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
    const moduleFormGroup = (this.roleForm.get('modulePermissions') as FormArray).at(moduleIndex);
    const module = this.permissionModules[moduleIndex];
    
    const currentPermissions = moduleFormGroup.get('permissions')?.value || [];
    return module.permissions.every((p: any) => currentPermissions.includes(p.value));
  }
  
  isModulePartiallySelected(moduleIndex: number): boolean {
    const moduleFormGroup = (this.roleForm.get('modulePermissions') as FormArray).at(moduleIndex);
    const module = this.permissionModules[moduleIndex];
    
    const currentPermissions = moduleFormGroup.get('permissions')?.value || [];
    const modulePermissionValues = module.permissions.map((p: any) => p.value);
    
    const hasAny = modulePermissionValues.some((p: string) => currentPermissions.includes(p));
    const hasAll = modulePermissionValues.every((p: string) => currentPermissions.includes(p));
    
    return hasAny && !hasAll;
  }
  
  togglePermission(moduleIndex: number, permValue: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const moduleFormGroup = (this.roleForm.get('modulePermissions') as FormArray).at(moduleIndex);
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
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


  patchPermissionValues(): void {
    if (!this.user.permissions || !Array.isArray(this.user.permissions)) {
      return;
    }


    const modulePermissionsArray = this.permissionsForm.get('modulePermissions') as any;


    this.user.permissions.forEach((permGroup: PermissionGroup) => {

      const formGroupIndex = this.permissionModules.findIndex(m =>
        m.name === permGroup.moduleName);

      if (formGroupIndex !== -1 && modulePermissionsArray.at(formGroupIndex)) {

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


  selectAllModulePermissions(moduleIndex: number): void {
    const moduleFormGroup = (this.permissionsForm.get('modulePermissions') as any).at(moduleIndex);
    const module = this.permissionModules[moduleIndex];

    const currentPermissions = [...moduleFormGroup.get('permissions')?.value || []];
    const modulePermissionValues = module.permissions.map((p: any) => p.value);


    const allSelected = modulePermissionValues.every((p: string) => currentPermissions.includes(p));

    if (allSelected) {

      moduleFormGroup.get('permissions')?.setValue([]);
    } else {

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

      if (!permissions.includes(permissionValue)) {
        moduleFormGroup.get('permissions')?.setValue([...permissions, permissionValue]);
      }
    } else {

      moduleFormGroup.get('permissions')?.setValue(
        permissions.filter((p: string) => p !== permissionValue)
      );
    }
  }


  hasModulePermissions(moduleIndex: number): boolean {
    const moduleFormGroup = (this.permissionsForm.get('modulePermissions') as any).at(moduleIndex);
    const permissions = moduleFormGroup.get('permissions')?.value || [];
    return permissions.length > 0;
  }


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


  isPermissionSelected(moduleIndex: number, permValue: string): boolean {
    const modulePermissions = this.permissionsForm.get('modulePermissions') as FormArray;
    if (!modulePermissions || !modulePermissions.at(moduleIndex)) {
      return false;
    }

    const permissions = modulePermissions.at(moduleIndex).get('permissions')?.value || [];
    return permissions.includes(permValue);
  }
}

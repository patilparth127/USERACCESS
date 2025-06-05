import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
  validating = {
    email: false,
    phone: false,
    name: false,
    employeeId: false
  };
  errorMessages = {
    email: '',
    phone: '',
    name: '',
    employeeId: ''
  };

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
    } else {
      this.setupValidationListeners();
    }
  }
  initializeForm(): void {
    this.userForm = this.fb.group({
      // Personal Information
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      displayName: ['', [Validators.required]], // Combined name for display
      email: [
        { value: '', disabled: this.operation === 'Edit' },
        [Validators.required, Validators.email],
      ],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      date_of_birth: ['', Validators.required],
      gender: ['', Validators.required],

      // Address Information
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]],
        country: ['', Validators.required]
      }),

      // Employment Information
      employeeId: [''],
      department: [''],
      position: [''],
      joiningDate: [''],

      // Authentication
      password: [
        '',
        this.operation === 'Add' ? [Validators.required, Validators.minLength(6)] : []
      ],
      confirm_password: [
        '',
        this.operation === 'Add' ? [Validators.required, Validators.minLength(6)] : []
      ],

      // Permissions & Status
      modulePermissions: this.fb.array(this.permissionModules.map(module =>
        this.fb.group({
          moduleName: [module.name],
          permissions: [[]]
        })
      )),
      is_active: [true],
    });

    // Auto-populate display name when first or last name changes
    this.userForm.get('firstName')?.valueChanges.subscribe(() => this.updateDisplayName());
    this.userForm.get('lastName')?.valueChanges.subscribe(() => this.updateDisplayName());
  }

  updateDisplayName(): void {
    const firstName = this.userForm.get('firstName')?.value || '';
    const lastName = this.userForm.get('lastName')?.value || '';
    const displayName = `${firstName} ${lastName}`.trim();
    this.userForm.get('displayName')?.setValue(displayName);
  }

  setupValidationListeners(): void {
    // Email validation
    this.userForm.get('email')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(email => {
        if (!email || email === '') return of(null);

        this.validating.email = true;
        this.errorMessages.email = '';

        return this.userService.checkEmailExists(email).pipe(
          finalize(() => {
            this.validating.email = false;
          }),
          catchError(() => {
            this.errorMessages.email = 'Error checking email availability';
            return of({ exists: false });
          })
        );
      })
    ).subscribe(response => {
      if (response && response.exists) {
        this.errorMessages.email = 'This email is already in use';
        this.userForm.get('email')?.setErrors({ emailExists: true });
      }
    });

    // Phone validation
    this.userForm.get('phone')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(phone => {
        if (!phone || phone === '') return of(null);

        this.validating.phone = true;
        this.errorMessages.phone = '';

        return this.userService.checkPhoneExists(phone).pipe(
          finalize(() => {
            this.validating.phone = false;
          }),
          catchError(() => {
            this.errorMessages.phone = 'Error checking phone availability';
            return of({ exists: false });
          })
        );
      })
    ).subscribe(response => {
      if (response && response.exists) {
        this.errorMessages.phone = 'This phone number is already in use';
        this.userForm.get('phone')?.setErrors({ phoneExists: true });
      }
    });

    // Name validation (if username uniqueness is required)
    this.userForm.get('name')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(name => {
        if (!name || name === '') return of(null);

        this.validating.name = true;
        this.errorMessages.name = '';

        return this.userService.checkNameExists(name).pipe(
          finalize(() => {
            this.validating.name = false;
          }),
          catchError(() => {
            this.errorMessages.name = 'Error checking username availability';
            return of({ exists: false });
          })
        );
      })
    ).subscribe(response => {
      if (response && response.exists) {
        this.errorMessages.name = 'This username is already taken';
        this.userForm.get('name')?.setErrors({ nameExists: true });
      }
    });

    // Employee ID validation (assuming it must be unique)
    this.userForm.get('employeeId')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(employeeId => {
        if (!employeeId || employeeId === '') return of(null);

        this.validating['employeeId'] = true;
        this.errorMessages['employeeId'] = '';

        return this.userService.checkEmployeeIdExists(employeeId).pipe(
          finalize(() => {
            this.validating['employeeId'] = false;
          }),
          catchError(() => {
            this.errorMessages['employeeId'] = 'Error checking employee ID';
            return of({ exists: false });
          })
        );
      })
    ).subscribe(response => {
      if (response && response.exists) {
        this.errorMessages['employeeId'] = 'This employee ID is already in use';
        this.userForm.get('employeeId')?.setErrors({ employeeIdExists: true });
      }
    });
  }

  loadUserData(): void {
    this.userService.getUserById(this.userId).subscribe({
      next: (res: any) => {
        const userData = res.data.user;

        // Redirect if trying to edit super admin
        if (userData.isSuperAdmin) {
          this.message.error('Super Admin user cannot be modified');
          this.router.navigate(['/users/manage']);
          return;
        }

        // Extract address fields if they exist
        const address = userData.address || {};

        this.userForm.patchValue({
          firstName: userData.firstName || '',
          middleName: userData.middleName || '',
          lastName: userData.lastName || '',
          displayName: userData.displayName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          date_of_birth: userData.date_of_birth || '',
          gender: userData.gender || '',
          address: {
            street: address.street || '',
            city: address.city || '',
            state: address.state || '',
            zipCode: address.zipCode || '',
            country: address.country || ''
          },
          employeeId: userData.employeeId || '',
          department: userData.department || '',
          position: userData.position || '',
          joiningDate: userData.joiningDate || '',
          is_active: userData.is_active
        });

        // Handle permissions patching
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

    const modulePermissionsArray = this.userForm.get('modulePermissions') as FormArray;


    permissionGroups.forEach(permGroup => {

      const formGroupIndex = this.permissionModules.findIndex(m =>
        m.name === permGroup.moduleName);

      if (formGroupIndex !== -1 && modulePermissionsArray.at(formGroupIndex)) {

        modulePermissionsArray.at(formGroupIndex).get('permissions')?.setValue(
          permGroup.permissions || []
        );
      }
    });
  }


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

    // Additional validation before submission
    const formValue = {...this.userForm.getRawValue()};

    // First validate the unique fields if this is an Add operation
    if (this.operation === 'Add') {
      this.validateUniqueFields(formValue).then(isValid => {
        if (isValid) {
          this.saveUser(formValue);
        }
      });
    } else {
      // For edit, we can proceed directly as fields that shouldn't change are disabled
      this.saveUser(formValue);
    }
  }

  validateUniqueFields(formValue: any): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      // Check all unique fields in parallel
      const email = formValue.email;
      const phone = formValue.phone;
      const name = formValue.name;

      let validationPromises = [];

      if (email) {
        validationPromises.push(
          this.userService.checkEmailExists(email).toPromise()
            .then(response => {
              if (response && response.exists) {
                this.errorMessages.email = 'This email is already in use';
                this.userForm.get('email')?.setErrors({ emailExists: true });
                return false;
              }
              return true;
            })
            .catch(() => {
              this.message.error('Error checking email availability');
              return false;
            })
        );
      }

      if (phone) {
        validationPromises.push(
          this.userService.checkPhoneExists(phone).toPromise()
            .then(response => {
              if (response && response.exists) {
                this.errorMessages.phone = 'This phone number is already in use';
                this.userForm.get('phone')?.setErrors({ phoneExists: true });
                return false;
              }
              return true;
            })
            .catch(() => {
              this.message.error('Error checking phone availability');
              return false;
            })
        );
      }

      if (name) {
        validationPromises.push(
          this.userService.checkNameExists(name).toPromise()
            .then(response => {
              if (response && response.exists) {
                this.errorMessages.name = 'This username is already taken';
                this.userForm.get('name')?.setErrors({ nameExists: true });
                return false;
              }
              return true;
            })
            .catch(() => {
              this.message.error('Error checking username availability');
              return false;
            })
        );
      }

      // Wait for all validations to complete
      Promise.all(validationPromises)
        .then(results => {
          // If any validation failed, return false
          const isValid = results.every(result => result === true);
          resolve(isValid);
        })
        .catch(() => {
          this.message.error('Error during validation');
          resolve(false);
        });
    });
  }

  saveUser(formValue: any): void {
    // Process modulePermissions
    const modulePermissions = formValue.modulePermissions || [];
    formValue.permissions = modulePermissions
      .filter((module: {moduleName: string; permissions: string[]}) => module.permissions && module.permissions.length > 0)
      .map((module: {moduleName: string; permissions: string[]}) => ({
        moduleName: module.moduleName,
        permissions: module.permissions
      }));

    delete formValue.modulePermissions;

    // Combine name fields for backwards compatibility
    formValue.name = formValue.displayName;

    switch (this.operation) {
      case 'Add':
        this.userService.createUser(formValue).subscribe({
          next: () => {
            this.userForm.reset();
            this.initializeForm();
            this.message.success('User created successfully');
          },
          error: (err) => {
            if (err.error && err.error.message) {
              this.message.error(err.error.message);
            } else {
              this.message.error('Failed to create user: ' + err.message);
            }
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
            if (err.error && err.error.message) {
              this.message.error(err.error.message);
            } else {
              this.message.error('Failed to update user: ' + err.message);
            }
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


  selectAllModulePermissions(moduleIndex: number): void {
    const moduleFormGroup = (this.userForm.get('modulePermissions') as FormArray).at(moduleIndex);
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

      if (!permissions.includes(permValue)) {
        moduleFormGroup.get('permissions')?.setValue([...permissions, permValue]);
      }
    } else {

      moduleFormGroup.get('permissions')?.setValue(
        permissions.filter((p: string) => p !== permValue)
      );
    }
  }
}

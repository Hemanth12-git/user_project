import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { UsersService, User } from './users.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    PasswordModule,
    DatePickerModule,
    TableModule
  ],
  providers: [UsersService],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  roleFilter: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  statusFilter: 'active' | 'inactive' | '' = '';
  totalUsers: number = 0;
  loading: boolean = false;
  error: string = '';

  // Dialog and form
  displayAddUserDialog = false;
  edit = false;
  isView = false;
  selectedUserId: string | null = null;
  userForm: FormGroup;
  userTypes = [
    { label: 'Internal', value: 'internal' },
    { label: 'Customers', value: 'customers' }
  ];

  // Dropdown options
  userRoles = [
    { label: 'Admin', value: 'ADMIN' },
    { label: 'User', value: 'USER' },
    { label: 'Manager', value: 'MANAGER' },
  ];
  currencies = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'INR', value: 'INR' },
  ];
  numberFormats = [
    { label: '1,000,000.00 (English)', value: 'english' },
    { label: '1.000.000,00 (European)', value: 'european' },
  ];

  get totalPages(): number[] {
    const pageCount = Math.ceil(this.totalUsers / this.pageSize);
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  constructor(private usersService: UsersService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]], // instead of 'email'
      phoneNumber: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      userType: [null, Validators.required], // add thisthis.passwordMatchValidator
      userRole: [null, Validators.required],
      userCurrency: ['INR', Validators.required], // add this
      numberFormat: ['english', Validators.required],
      invalid: true,
    });

  }

  ngOnInit() {
    this.fetchUsers();
  }

  onSubmit() {
    if (this.edit) {
      this.editUser();
    } else {
      this.createUser();
    }
  }


  private passwordMatchValidator(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    console.log(pass, confirm)
    return pass === confirm ? null : { mismatch: true };
  }

  openAddUserDialog(mode: 'create' | 'edit' | 'view', user?: User) {
    this.edit = mode === 'edit';
    this.isView = mode === 'view';
    this.displayAddUserDialog = true;

    if ((this.edit || this.isView) && user) {
      this.selectedUserId = user.id ?? null;

      this.userForm.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        password: '',
        userRole: user.role,
        currency: user.currency || 'INR',
        numberFormat: user.numberFormat || 'english',
        status: user.status || 'Active',
        invalid: true,
      });

      Object.keys(this.userForm.controls).forEach((controlName) => {
        this.userForm.get(controlName)?.disable();
      });

    } else {
      this.selectedUserId = null;

      this.userForm.reset({
        currency: 'INR',
        numberFormat: 'english'
      });

      Object.keys(this.userForm.controls).forEach((controlName) => {
        this.userForm.get(controlName)?.enable();
      });
    }
  }

  createUser() {
    if (this.userForm.invalid) {
      return;
    }
    const dateOnly = new Date().toISOString().split('T')[0];
    const formValue = this.userForm.value;
    const newUser: User = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phoneNumber: formValue.phoneNumber,
      password: formValue.password,
      role: formValue.userRole,
      currency: formValue.currency,
      numberFormat: formValue.numberFormat,
      createdOn: dateOnly,
      status: 'Active',
    };

    this.usersService.createUser(newUser).subscribe({
      next: (createdUser) => {
        // The backend returns { id: ObjectId } for POST; fetch the list again
        this.fetchUsers();
        this.displayAddUserDialog = false;
      },
      error: () => {
        this.error = 'Failed to create user';
      },
    });
  }

  editUser() {
    const formValue = this.userForm.value;

    const updatedUser: Partial<User> = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phoneNumber: formValue.phoneNumber,
      role: formValue.userRole,
      currency: formValue.currency,
      numberFormat: formValue.numberFormat,
      status: formValue.status || 'Active',
    };
    this.usersService.updateUser(this.selectedUserId!, updatedUser).subscribe({
      next: () => {
        this.fetchUsers();
        this.displayAddUserDialog = false;
      },
      error: () => {
        this.error = 'Failed to update user';
      }
    });
  }

  fetchUsers(page: number = 1) {
    this.loading = true;
    this.error = '';
    this.currentPage = page;
    
    this.usersService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.users = res.data;
        this.filteredUsers = res.data;
        this.totalUsers = res.totalUsers;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load users.';
        this.loading = false;
      },
    });
  }

  applyFilters() {
    this.filteredUsers = this.users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.phoneNumber.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole =
        !this.roleFilter ||
        user.role.toLowerCase().includes(this.roleFilter.toLowerCase());

      const matchesStatus =
        !this.statusFilter ||
        user.status.toLowerCase() === this.statusFilter.toLowerCase();

      let matchesDateRange = true;
      if (this.fromDate || this.toDate) {
        const userDate = new Date(user.createdOn);
        if (this.fromDate) {
          matchesDateRange =
            matchesDateRange && userDate >= new Date(this.fromDate);
        }
        if (this.toDate) {
          matchesDateRange =
            matchesDateRange && userDate <= new Date(this.toDate);
        }
      }

      return (
        matchesSearch && matchesRole && matchesStatus && matchesDateRange
      );
    });
  }

  onSearchChange() {
    setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  onRoleFilterChange() {
    setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onDateRangeChange() {
    this.applyFilters();
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.roleFilter = '';
    this.statusFilter = '';
    this.fromDate = null;
    this.toDate = null;
    this.filteredUsers = this.users;
  }

  viewUser(user: User) {
    this.usersService.getUserById(user.id!).subscribe({
      next: (userData) => {
        console.log('User details:', userData);
        // Display user data in a modal or separate view
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
      },
    });
  }

  deleteUser(user: User) {
    if (!user.id) {
      return;
    }
    if (
      confirm(
        `Are you sure you want to delete user "${user.firstName} ${user.lastName}"?`
      )
    ) {
      this.loading = true;
      this.usersService.deleteUser(user.id!).subscribe({
        next: () => {
          this.users = this.users.filter((u) => u.id !== user.id);
          this.applyFilters();
          this.totalUsers = this.users.length;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.error = 'Failed to delete user';
          this.loading = false;
        },
      });
    }
  }
  
}
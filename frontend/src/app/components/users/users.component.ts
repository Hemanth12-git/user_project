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
  fromDate: Date | null = null;
  toDate: Date | null = null;
  statusFilter: 'active' | 'inactive' | '' = '';
  totalUsers: number = 0;
  loading: boolean = false;
  error: string = '';

  // Dialog and form
  displayAddUserDialog = false;
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

  constructor(private usersService: UsersService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]], // instead of 'email'
      phoneNumber: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      userType: [null, Validators.required], // add this
      userRole: [null, Validators.required],
      userCurrency: ['INR', Validators.required], // add this
      numberFormat: ['english', Validators.required],
      invalid: this.passwordMatchValidator
    });

  }

  ngOnInit() {
    this.fetchUsers();
  }

  private passwordMatchValidator(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  openAddUserDialog() {
    this.userForm.reset({
      currency: 'INR',
      numberFormat: 'english',
    });
    this.displayAddUserDialog = true;
  }

  createUser() {
    if (this.userForm.invalid) {
      return;
    }
    const dateOnly = new Date().toISOString().split('T')[0];
    const formValue = this.userForm.value;
    console.log(formValue)
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

  fetchUsers() {
    this.loading = true;
    this.error = '';
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        console.log(data)
        this.filteredUsers = data;
        this.totalUsers = data.length;
        this.applyFilters();
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

  editUser(user: User) {
    console.log('Edit user:', user);
    // You can prefill the form and call updateUser() once implemented
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

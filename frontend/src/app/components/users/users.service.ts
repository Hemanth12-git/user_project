import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
  currency: string;
  numberFormat: string;
  createdOn: string;
  status: string;
}


export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  totalCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIyIiwianRpIjoiNzY2YzgwZjUzMDQzNWFhNjE0YTE5MDUxZjRmYmE1NjRjYjJmYWQyOGVkNTQ4OGU3OGFjYmRhZTZlZTQ4YmNkZWY4NTAyY2ExMDMyOWMwZjMiLCJpYXQiOjE3NDc2NDk3ODYuMTYxNTcsIm5iZiI6MTc0NzY0OTc4Ni4xNjE1NywiZXhwIjoxNzQ4OTQ1Nzg2LCJzdWIiOiJlYWRhOTg5MC0wZWJmLTExZjAtYjY0ZS1kMTY4ZjM0ZjdlNzkiLCJzY29wZXMiOltdLCJ2ZW5kb3JJZCI6IjM1MjgiLCJwZXJtaXNzaW9uIjoiMTE5ODU0ODk5OTc0NzUxNzExMjU4MDQwNzIyMzExMTM0NjQ2NTg0MTQ1NDg5MDg3NTQ5NzQwNzgzOTEwMzE5MDM4MTE3NDYxNTAwNDA0MDgxMjYyMzI5ODU1In0.V6MIn4ZZzzaqwIjU3Wky9RmhVW7uh5H6UehQV_v7I8YVXOnC_LUfqDXPEaNJuBymatTi8NUCt_bZezoCmrRbCyRuDLmsJOhGy-HiYWIJEpIsWvYTZSN_URHWtTNX7Owa3OGited81seSKOCBfIDiAc9NxBhG8mjls41XO4q7rzR6NWNpg7FgzRplrREoyK9-CpAX6ZXHtNsNLDkjEQg3DapCUIeVuNV1kYpmiukFmjARJdjXxO5Ihw9K9hfauHEJO1UGC0EQM6pFf0GcGg8veGD4wtEBXyk6ZloDyolY5hUflCBMYIBxAwNqHkOQj8S0oYTjbVGWimccpRdw9fZLhlYELSCDYHcdZpec1G9GinfKFZOxA-_QFgLUd9t00P6m3hRqfG_Nu5tYybAKPk10T76K0M2il0fBtEe-Fr178L5vIoqOvqjm7Q9QebYiO7waQOHbqxKc_dmEChALTWKILTNVM-bKxKXOwx17wd899WXUujtjGMmgjL646e_4Y86tkGfIwBufP359Z_I6J0de5zHTz9yGBy4h_vhO1aTtjMWqdJwdcF5nEEFtaKdhN0ylQC1nuaM2W0LU5bVYMTb7PfopZNE_Hl__ZNlS0RDB2rTlnzDe_7fnimmeN7uVg75pcX9rBkkZ2cc2LHBQCKp4bEaFYie8Ptb5UaA1_ghRf4E',
      })
    };
  }

//   private getAuthToken(): string {
//     // Implement your token retrieval logic here
//     return localStorage.getItem('authToken') || '';
//   }

  /**
   * Fetch all users from the API
   */
  getUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/users`, this.getHttpOptions())
      .pipe(
        map(response => {
          if (response && response.data) {
            return response.data;
          }
          throw new Error('Failed to fetch users');
        }),
        catchError(this.handleError)
      );
  }


  /**
   * Get users with filtering and pagination
   */
  getUsersWithFilters(filters: any): Observable<User[]> {
    const params = new URLSearchParams();
    
    if (filters.userType) params.append('userType', filters.userType);
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const url = `${this.apiUrl}/users?${params.toString()}`;
    
    return this.http.get<ApiResponse<User[]>>(url, this.getHttpOptions())
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch filtered users');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Create a new user
   */
  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/users`, user, this.getHttpOptions())
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to create user');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update an existing user
   */
  updateUser(userId: string, user: Partial<User>): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/users/${userId}`, user, this.getHttpOptions())
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to update user');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete a user
   */
  deleteUser(userId: string): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/users/${userId}`, this.getHttpOptions())
      .pipe(
        map(response => {
          if (response.success) {
            return true;
          }
          throw new Error(response.message || 'Failed to delete user');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get a specific user by ID
   */
  getUserById(userId: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/${userId}`, this.getHttpOptions())
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch user');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Import users from CSV/Excel
   */
  importUsers(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIyIiwianRpIjoiNzY2YzgwZjUzMDQzNWFhNjE0YTE5MDUxZjRmYmE1NjRjYjJmYWQyOGVkNTQ4OGU3OGFjYmRhZTZlZTQ4YmNkZWY4NTAyY2ExMDMyOWMwZjMiLCJpYXQiOjE3NDc2NDk3ODYuMTYxNTcsIm5iZiI6MTc0NzY0OTc4Ni4xNjE1NywiZXhwIjoxNzQ4OTQ1Nzg2LCJzdWIiOiJlYWRhOTg5MC0wZWJmLTExZjAtYjY0ZS1kMTY4ZjM0ZjdlNzkiLCJzY29wZXMiOltdLCJ2ZW5kb3JJZCI6IjM1MjgiLCJwZXJtaXNzaW9uIjoiMTE5ODU0ODk5OTc0NzUxNzExMjU4MDQwNzIyMzExMTM0NjQ2NTg0MTQ1NDg5MDg3NTQ5NzQwNzgzOTEwMzE5MDM4MTE3NDYxNTAwNDA0MDgxMjYyMzI5ODU1In0.V6MIn4ZZzzaqwIjU3Wky9RmhVW7uh5H6UehQV_v7I8YVXOnC_LUfqDXPEaNJuBymatTi8NUCt_bZezoCmrRbCyRuDLmsJOhGy-HiYWIJEpIsWvYTZSN_URHWtTNX7Owa3OGited81seSKOCBfIDiAc9NxBhG8mjls41XO4q7rzR6NWNpg7FgzRplrREoyK9-CpAX6ZXHtNsNLDkjEQg3DapCUIeVuNV1kYpmiukFmjARJdjXxO5Ihw9K9hfauHEJO1UGC0EQM6pFf0GcGg8veGD4wtEBXyk6ZloDyolY5hUflCBMYIBxAwNqHkOQj8S0oYTjbVGWimccpRdw9fZLhlYELSCDYHcdZpec1G9GinfKFZOxA-_QFgLUd9t00P6m3hRqfG_Nu5tYybAKPk10T76K0M2il0fBtEe-Fr178L5vIoqOvqjm7Q9QebYiO7waQOHbqxKc_dmEChALTWKILTNVM-bKxKXOwx17wd899WXUujtjGMmgjL646e_4Y86tkGfIwBufP359Z_I6J0de5zHTz9yGBy4h_vhO1aTtjMWqdJwdcF5nEEFtaKdhN0ylQC1nuaM2W0LU5bVYMTb7PfopZNE_Hl__ZNlS0RDB2rTlnzDe_7fnimmeN7uVg75pcX9rBkkZ2cc2LHBQCKp4bEaFYie8Ptb5UaA1_ghRf4E`
      // Don't set Content-Type for FormData, let the browser set it
    });

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/users/import`, formData, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to import users');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Export users to CSV/Excel
   */
  exportUsers(filters?: any): Observable<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
    }

    const url = `${this.apiUrl}/users/export?${params.toString()}`;
    
    return this.http.get(url, {
      ...this.getHttpOptions(),
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get available roles
   */
  getRoles(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/roles`, this.getHttpOptions())
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch roles');
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('UsersService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
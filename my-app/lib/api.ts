const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data as T;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Dashboard
    getDashboardStats(): Promise<any> { return this.request('/dashboard/stats'); }
    getDepartmentDistribution(): Promise<any> { return this.request('/dashboard/departments/distribution'); }
    getAttendanceTrends(): Promise<any> { return this.request('/dashboard/attendance/trends'); }
    getLeaveTrends(): Promise<any> { return this.request('/dashboard/leave/trends'); }

    // Employees
    getEmployees(params: Record<string, string> = {}): Promise<any[]> {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/employees${queryString ? `?${queryString}` : ''}`);
    }
    getEmployee(id: number | string): Promise<any> { return this.request(`/employees/${id}`); }
    createEmployee(data: any): Promise<any> { return this.request('/employees', { method: 'POST', body: JSON.stringify(data) }); }
    updateEmployee(id: number | string, data: any): Promise<any> { return this.request(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
    deleteEmployee(id: number | string): Promise<any> { return this.request(`/employees/${id}`, { method: 'DELETE' }); }

    // Departments
    getDepartments(): Promise<any[]> { return this.request('/departments'); }
    getDepartment(id: number | string): Promise<any> { return this.request(`/departments/${id}`); }
    createDepartment(data: any): Promise<any> { return this.request('/departments', { method: 'POST', body: JSON.stringify(data) }); }
    updateDepartment(id: number | string, data: any): Promise<any> { return this.request(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
    deleteDepartment(id: number | string): Promise<any> { return this.request(`/departments/${id}`, { method: 'DELETE' }); }

    // Attendance
    getAttendance(params: Record<string, string> = {}): Promise<any[]> {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/attendance${queryString ? `?${queryString}` : ''}`);
    }
    getTodayAttendance(): Promise<any> { return this.request('/attendance/today'); }
    markAttendance(data: any): Promise<any> { return this.request('/attendance', { method: 'POST', body: JSON.stringify(data) }); }
    updateAttendance(id: number | string, data: any): Promise<any> { return this.request(`/attendance/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
    deleteAttendance(id: number | string): Promise<any> { return this.request(`/attendance/${id}`, { method: 'DELETE' }); }
    getAttendanceStats(date: string = ''): Promise<any> { return this.request(`/attendance/stats/summary${date ? `?date=${date}` : ''}`); }

    // Leave
    getLeaveRequests(params: Record<string, string> = {}): Promise<any[]> {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/leave${queryString ? `?${queryString}` : ''}`);
    }
    getLeaveRequest(id: number | string): Promise<any> { return this.request(`/leave/${id}`); }
    createLeave(data: any): Promise<any> { return this.request('/leave', { method: 'POST', body: JSON.stringify(data) }); }
    updateLeaveStatus(id: number | string, status: string): Promise<any> { return this.request(`/leave/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); }
    updateLeaveRequest(id: number | string, data: any): Promise<any> { return this.request(`/leave/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
    deleteLeaveRequest(id: number | string): Promise<any> { return this.request(`/leave/${id}`, { method: 'DELETE' }); }
    getLeaveStats(): Promise<any> { return this.request('/leave/stats/summary'); }

    // Payroll
    getPayrollRecords(params: Record<string, string> = {}): Promise<any[]> {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/payroll${queryString ? `?${queryString}` : ''}`);
    }
    getPayrollRecord(id: number | string): Promise<any> { return this.request(`/payroll/${id}`); }
    createPayrollRecord(data: any): Promise<any> { return this.request('/payroll', { method: 'POST', body: JSON.stringify(data) }); }
    updatePayrollRecord(id: number | string, data: any): Promise<any> { return this.request(`/payroll/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
    processPayroll(id: number | string, paymentDate: string): Promise<any> { return this.request(`/payroll/${id}/process`, { method: 'PATCH', body: JSON.stringify({ payment_date: paymentDate }) }); }
    revertPayroll(id: number | string): Promise<any> { return this.request(`/payroll/${id}/revert`, { method: 'PATCH' }); }
    deletePayrollRecord(id: number | string): Promise<any> { return this.request(`/payroll/${id}`, { method: 'DELETE' }); }
    generatePayroll(month: number, year: number): Promise<any> { return this.request('/payroll/generate', { method: 'POST', body: JSON.stringify({ month, year }) }); }
    getPayrollStats(): Promise<any> { return this.request('/payroll/stats/summary'); }

    // Salary Advances
    getSalaryAdvances(params: Record<string, string> = {}): Promise<any[]> {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/salary-advances${queryString ? `?${queryString}` : ''}`);
    }
    createSalaryAdvance(data: any): Promise<any> { return this.request('/salary-advances', { method: 'POST', body: JSON.stringify(data) }); }

    // Announcements
    getAnnouncements(priority?: string): Promise<any[]> { return this.request(`/announcements${priority ? `?priority=${priority}` : ''}`); }
    getAnnouncement(id: number | string): Promise<any> { return this.request(`/announcements/${id}`); }
    createAnnouncement(data: any): Promise<any> { return this.request('/announcements', { method: 'POST', body: JSON.stringify(data) }); }
    updateAnnouncement(id: number | string, data: any): Promise<any> { return this.request(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
    deleteAnnouncement(id: number | string): Promise<any> { return this.request(`/announcements/${id}`, { method: 'DELETE' }); }
}

const api = new ApiClient();
export default api;
export { api };

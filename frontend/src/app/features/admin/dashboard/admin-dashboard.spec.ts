import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboard } from './admin-dashboard';

describe('AdminDashboard', () => {
  let component: AdminDashboard;
  let fixture: ComponentFixture<AdminDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the admin dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should expose default header and greeting texts', () => {
    expect(component.pageTitle).toBe('Tổng quan hệ thống');
    expect(component.pageSubtitle).toBe('Chúc bạn một ngày làm việc hiệu quả');
    expect(component.greetingTitle).toBe('Xin chào, Quản trị viên!');
    expect(component.greetingDescription).toBe(
      'Chào mừng bạn đến với hệ thống quản trị Home Care.'
    );
  });

  it('should render page title, subtitle, and greeting in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent ?? '';

    expect(text).toContain('Tổng quan hệ thống');
    expect(text).toContain('Chúc bạn một ngày làm việc hiệu quả');
    expect(text).toContain('Xin chào, Quản trị viên!');
    expect(text).toContain('Chào mừng bạn đến với hệ thống quản trị Home Care.');
  });

  it('should update rendered content when component properties change', () => {
    const updatedFixture = TestBed.createComponent(AdminDashboard);
    const updatedComponent = updatedFixture.componentInstance;

    updatedComponent.pageTitle = 'Bảng điều khiển Home Care';
    updatedComponent.greetingTitle = 'Xin chào, Admin!';
    updatedFixture.detectChanges();

    const compiled = updatedFixture.nativeElement as HTMLElement;
    const text = compiled.textContent ?? '';

    expect(text).toContain('Bảng điều khiển Home Care');
    expect(text).toContain('Xin chào, Admin!');
  });
});
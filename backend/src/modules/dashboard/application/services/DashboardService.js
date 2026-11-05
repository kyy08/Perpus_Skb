export class DashboardService {
  constructor({ dashboardRepository }) {
    this.dashboardRepository = dashboardRepository;
  }

  getSummary() {
    return this.dashboardRepository.getSummary();
  }
}

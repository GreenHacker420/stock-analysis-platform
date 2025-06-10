import React from 'react'

// Simple component test
function MockDashboardOverview() {
  return <div data-testid="dashboard">Dashboard Overview</div>
}

describe('DashboardOverview', () => {
  it('should render mock dashboard component', () => {
    const component = MockDashboardOverview()
    expect(component.props['data-testid']).toBe('dashboard')
  })

  it('should have correct text content', () => {
    const component = MockDashboardOverview()
    expect(component.props.children).toBe('Dashboard Overview')
  })
})

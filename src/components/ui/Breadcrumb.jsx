import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = () => {
  const location = useLocation();
  
  const breadcrumbMap = {
    '/customer-dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
    '/account-details': { label: 'Account Details', icon: 'CreditCard' },
    '/transfer-money': { label: 'Transfer Money', icon: 'ArrowRightLeft' },
    '/loan-application': { label: 'Loan Application', icon: 'FileText' },
    '/customer-support-chat': { label: 'Customer Support', icon: 'MessageCircle' },
  };

  const generateBreadcrumbs = () => {
    const pathSegments = location?.pathname?.split('/')?.filter(segment => segment);
    const breadcrumbs = [];

    // Always start with Dashboard as home
    if (location?.pathname !== '/customer-dashboard') {
      breadcrumbs?.push({
        label: 'Dashboard',
        path: '/customer-dashboard',
        icon: 'LayoutDashboard',
        isActive: false
      });
    }

    // Add current page
    const currentPage = breadcrumbMap?.[location?.pathname];
    if (currentPage) {
      breadcrumbs?.push({
        label: currentPage?.label,
        path: location?.pathname,
        icon: currentPage?.icon,
        isActive: true
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs?.length <= 1 && location?.pathname === '/customer-dashboard') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <Icon name="Home" size={16} />
      {breadcrumbs?.map((crumb, index) => (
        <React.Fragment key={crumb?.path}>
          {index > 0 && (
            <Icon name="ChevronRight" size={14} className="text-border" />
          )}
          {crumb?.isActive ? (
            <div className="flex items-center space-x-1">
              <Icon name={crumb?.icon} size={16} className="text-primary" />
              <span className="font-medium text-foreground">{crumb?.label}</span>
            </div>
          ) : (
            <Link
              to={crumb?.path}
              className="flex items-center space-x-1 hover:text-foreground banking-transition"
            >
              <Icon name={crumb?.icon} size={16} />
              <span>{crumb?.label}</span>
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
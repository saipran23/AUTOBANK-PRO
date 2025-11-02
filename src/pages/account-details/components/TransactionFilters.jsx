import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TransactionFilters = ({ onFilterChange, onExport, totalTransactions }) => {
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    type: 'all',
    amountMin: '',
    amountMax: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const transactionTypes = [
    { value: 'all', label: 'All Transactions' },
    { value: 'deposit', label: 'Deposits' },
    { value: 'withdrawal', label: 'Withdrawals' },
    { value: 'transfer', label: 'Transfers' },
    { value: 'payment', label: 'Payments' },
    { value: 'fee', label: 'Fees' },
    { value: 'interest', label: 'Interest' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      dateFrom: '',
      dateTo: '',
      type: 'all',
      amountMin: '',
      amountMax: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => 
    value !== '' && value !== 'all'
  );

  return (
    <div className="bg-card rounded-lg border border-border banking-shadow-sm p-4 mb-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Icon name="Filter" size={20} className="text-muted-foreground" />
          <h3 className="font-medium text-foreground">Transaction Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalTransactions} transactions
          </span>
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={onExport}
          >
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Less' : 'More'}
          </Button>
        </div>
      </div>
      {/* Search Bar - Always Visible */}
      <div className="mb-4">
        <div className="relative">
          <Icon 
            name="Search" 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
          />
          <Input
            type="text"
            placeholder="Search transactions by description, amount, or reference..."
            value={filters?.search}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
            className="pl-10"
          />
        </div>
      </div>
      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-border">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="From Date"
              value={filters?.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
            />
            <Input
              type="date"
              label="To Date"
              value={filters?.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
            />
          </div>

          {/* Transaction Type and Amount Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Transaction Type
              </label>
              <select
                value={filters?.type}
                onChange={(e) => handleFilterChange('type', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {transactionTypes?.map(type => (
                  <option key={type?.value} value={type?.value}>
                    {type?.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              type="number"
              label="Min Amount ($)"
              placeholder="0.00"
              value={filters?.amountMin}
              onChange={(e) => handleFilterChange('amountMin', e?.target?.value)}
            />
            <Input
              type="number"
              label="Max Amount ($)"
              placeholder="10000.00"
              value={filters?.amountMax}
              onChange={(e) => handleFilterChange('amountMax', e?.target?.value)}
            />
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              iconPosition="left"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              Clear All Filters
            </Button>
            <div className="text-sm text-muted-foreground">
              Use filters to narrow down your transaction history
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;
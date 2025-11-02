import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TransactionTable = ({ transactions, onTransactionClick }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
        return { icon: 'ArrowDown', color: 'text-success' };
      case 'withdrawal':
        return { icon: 'ArrowUp', color: 'text-error' };
      case 'transfer':
        return { icon: 'ArrowRightLeft', color: 'text-primary' };
      case 'payment':
        return { icon: 'CreditCard', color: 'text-warning' };
      case 'fee':
        return { icon: 'Minus', color: 'text-error' };
      case 'interest':
        return { icon: 'Plus', color: 'text-success' };
      default:
        return { icon: 'Circle', color: 'text-muted-foreground' };
    }
  };

  const getAmountColor = (amount) => {
    return amount >= 0 ? 'text-success' : 'text-error';
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTransactions = React.useMemo(() => {
    let sortableTransactions = [...transactions];
    if (sortConfig?.key) {
      sortableTransactions?.sort((a, b) => {
        if (sortConfig?.key === 'amount') {
          return sortConfig?.direction === 'asc' 
            ? a?.amount - b?.amount 
            : b?.amount - a?.amount;
        }
        if (sortConfig?.key === 'date') {
          return sortConfig?.direction === 'asc'
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }
        if (a?.[sortConfig?.key] < b?.[sortConfig?.key]) {
          return sortConfig?.direction === 'asc' ? -1 : 1;
        }
        if (a?.[sortConfig?.key] > b?.[sortConfig?.key]) {
          return sortConfig?.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTransactions;
  }, [transactions, sortConfig]);

  const SortButton = ({ column, children }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(column)}
      className="h-auto p-1 font-medium text-left justify-start"
    >
      <span>{children}</span>
      {sortConfig?.key === column && (
        <Icon 
          name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
          size={16} 
          className="ml-1"
        />
      )}
    </Button>
  );

  return (
    <div className="bg-card rounded-lg border border-border banking-shadow-sm overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left p-4">
                <SortButton column="date">Date</SortButton>
              </th>
              <th className="text-left p-4">
                <SortButton column="description">Description</SortButton>
              </th>
              <th className="text-left p-4">
                <SortButton column="type">Type</SortButton>
              </th>
              <th className="text-right p-4">
                <SortButton column="amount">Amount</SortButton>
              </th>
              <th className="text-right p-4">
                <SortButton column="balance">Balance</SortButton>
              </th>
              <th className="text-center p-4">Status</th>
              <th className="text-center p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions?.map((transaction) => {
              const { icon, color } = getTransactionIcon(transaction?.type);
              return (
                <tr 
                  key={transaction?.id} 
                  className="border-b border-border hover:bg-muted/30 banking-transition cursor-pointer"
                  onClick={() => onTransactionClick(transaction)}
                >
                  <td className="p-4">
                    <div className="text-sm font-medium text-foreground">
                      {formatDate(transaction?.date)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(transaction.date)?.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full bg-muted ${color}`}>
                        <Icon name={icon} size={14} />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {transaction?.description}
                        </div>
                        {transaction?.reference && (
                          <div className="text-xs text-muted-foreground">
                            Ref: {transaction?.reference}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
                      {transaction?.type}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className={`font-semibold ${getAmountColor(transaction?.amount)}`}>
                      {transaction?.amount >= 0 ? '+' : '-'}{formatCurrency(transaction?.amount)}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-medium text-foreground">
                      {formatCurrency(transaction?.balance)}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction?.status === 'completed' 
                        ? 'bg-success/10 text-success' 
                        : transaction?.status === 'pending' ?'bg-warning/10 text-warning' :'bg-error/10 text-error'
                    }`}>
                      {transaction?.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Eye"
                      onClick={(e) => {
                        e?.stopPropagation();
                        onTransactionClick(transaction);
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3 p-4">
        {sortedTransactions?.map((transaction) => {
          const { icon, color } = getTransactionIcon(transaction?.type);
          return (
            <div
              key={transaction?.id}
              className="bg-muted/30 rounded-lg p-4 banking-transition hover:bg-muted/50 cursor-pointer"
              onClick={() => onTransactionClick(transaction)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-card ${color}`}>
                    <Icon name={icon} size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {transaction?.description}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(transaction?.date)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${getAmountColor(transaction?.amount)}`}>
                    {transaction?.amount >= 0 ? '+' : '-'}{formatCurrency(transaction?.amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Balance: {formatCurrency(transaction?.balance)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
                    {transaction?.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction?.status === 'completed' 
                      ? 'bg-success/10 text-success' 
                      : transaction?.status === 'pending' ?'bg-warning/10 text-warning' :'bg-error/10 text-error'
                  }`}>
                    {transaction?.status}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="ChevronRight"
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Empty State */}
      {transactions?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Receipt" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Transactions Found</h3>
          <p className="text-muted-foreground">
            No transactions match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
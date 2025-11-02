import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExpenseInsights = ({ transactions = [] }) => {
    const [timeFrame, setTimeFrame] = useState('month'); // 'week', 'month', 'year'
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Realistic transaction data based on actual spending patterns
    const defaultTransactions = [
        { id: 1, type: 'debit', category: 'Food & Dining', amount: 87.45, date: '2025-10-23', merchant: 'Whole Foods Market' },
        { id: 2, type: 'debit', category: 'Food & Dining', amount: 45.20, date: '2025-10-22', merchant: 'Starbucks' },
        { id: 3, type: 'debit', category: 'Food & Dining', amount: 32.50, date: '2025-10-21', merchant: 'Chipotle' },
        { id: 4, type: 'debit', category: 'Food & Dining', amount: 120.75, date: '2025-10-20', merchant: 'Dinner Restaurant' },
        { id: 5, type: 'debit', category: 'Transportation', amount: 45.20, date: '2025-10-23', merchant: 'Shell Gas Station' },
        { id: 6, type: 'debit', category: 'Transportation', amount: 12.50, date: '2025-10-22', merchant: 'Uber' },
        { id: 7, type: 'debit', category: 'Transportation', amount: 85.00, date: '2025-10-21', merchant: 'Car Maintenance' },
        { id: 8, type: 'debit', category: 'Entertainment', amount: 120.00, date: '2025-10-23', merchant: 'Movie Theater & Popcorn' },
        { id: 9, type: 'debit', category: 'Entertainment', amount: 60.00, date: '2025-10-20', merchant: 'Netflix Subscription' },
        { id: 10, type: 'debit', category: 'Entertainment', amount: 50.00, date: '2025-10-19', merchant: 'Spotify Premium' },
        { id: 11, type: 'debit', category: 'Utilities', amount: 150.00, date: '2025-10-18', merchant: 'Electric Company' },
        { id: 12, type: 'debit', category: 'Utilities', amount: 80.00, date: '2025-10-18', merchant: 'Internet Provider' },
        { id: 13, type: 'debit', category: 'Utilities', amount: 65.00, date: '2025-10-18', merchant: 'Water Department' },
        { id: 14, type: 'debit', category: 'Shopping', amount: 250.00, date: '2025-10-21', merchant: 'Target' },
        { id: 15, type: 'debit', category: 'Shopping', amount: 180.00, date: '2025-10-19', merchant: 'Amazon' },
        { id: 16, type: 'debit', category: 'Shopping', amount: 95.00, date: '2025-10-17', merchant: 'H&M' },
        { id: 17, type: 'debit', category: 'Healthcare', amount: 120.00, date: '2025-10-20', merchant: 'Pharmacy' },
        { id: 18, type: 'debit', category: 'Healthcare', amount: 250.00, date: '2025-10-15', merchant: 'Doctor Appointment' },
        { id: 19, type: 'debit', category: 'Fitness', amount: 65.00, date: '2025-10-18', merchant: 'Gym Membership' },
        { id: 20, type: 'credit', category: 'Income', amount: 3250.00, date: '2025-10-22', merchant: 'ABC Corporation' },
    ];

    const transactionData = transactions.length > 0 ? transactions : defaultTransactions;

    // Calculate expenses by category
    const expensesByCategory = useMemo(() => {
        return transactionData
            .filter(t => t.type === 'debit')
            .reduce((acc, transaction) => {
                const existing = acc.find(item => item.category === transaction.category);
                if (existing) {
                    existing.value += transaction.amount;
                    existing.count += 1;
                } else {
                    acc.push({
                        category: transaction.category,
                        value: transaction.amount,
                        count: 1
                    });
                }
                return acc;
            }, [])
            .sort((a, b) => b.value - a.value);
    }, [transactionData]);

    // Calculate daily spending trend
    const dailySpending = useMemo(() => {
        const spending = {};
        transactionData
            .filter(t => t.type === 'debit')
            .forEach(transaction => {
                const date = new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (spending[date]) {
                    spending[date] += transaction.amount;
                } else {
                    spending[date] = transaction.amount;
                }
            });
        return Object.entries(spending)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, amount]) => ({
                date,
                amount: parseFloat(amount.toFixed(2))
            }));
    }, [transactionData]);

    // Calculate total and average spending
    const totalExpenses = useMemo(() => {
        return transactionData
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactionData]);

    const averageDaily = useMemo(() => {
        const uniqueDates = new Set(transactionData.filter(t => t.type === 'debit').map(t => t.date));
        return (totalExpenses / uniqueDates.size).toFixed(2);
    }, [transactionData, totalExpenses]);

    // Get category color
    const getCategoryColor = (index) => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
        return colors[index % colors.length];
    };

    // Get category icon
    const getCategoryIcon = (category) => {
        const icons = {
            'Food & Dining': 'UtensilsCrossed',
            'Transportation': 'Car',
            'Entertainment': 'Music',
            'Utilities': 'Zap',
            'Shopping': 'ShoppingBag',
            'Healthcare': 'Heart',
            'Fitness': 'Activity',
            'Income': 'TrendingUp'
        };
        return icons[category] || 'DollarSign';
    };

    // Get top spending category
    const topCategory = expensesByCategory[0];
    const topCategoryPercentage = ((topCategory?.value / totalExpenses) * 100).toFixed(1);

    // Filter transactions by selected category
    const filteredTransactions = selectedCategory
        ? transactionData.filter(t => t.category === selectedCategory && t.type === 'debit')
        : [];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        })?.format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 banking-shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <Icon name="TrendingDown" size={24} color="var(--color-primary)" />
                        <h2 className="text-2xl font-bold text-foreground">Expense Insights</h2>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={timeFrame === 'week' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTimeFrame('week')}
                        >
                            Week
                        </Button>
                        <Button
                            variant={timeFrame === 'month' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTimeFrame('month')}
                        >
                            Month
                        </Button>
                        <Button
                            variant={timeFrame === 'year' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTimeFrame('year')}
                        >
                            Year
                        </Button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(totalExpenses)}</p>
                        <p className="text-xs text-success mt-1">📊 Tracked this month</p>
                    </div>
                    <div className="bg-card/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Daily Average</p>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(averageDaily)}</p>
                        <p className="text-xs text-muted-foreground mt-1">📅 Per day</p>
                    </div>
                    <div className="bg-card/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Transactions</p>
                        <p className="text-2xl font-bold text-foreground">{transactionData.filter(t => t.type === 'debit').length}</p>
                        <p className="text-xs text-muted-foreground mt-1">💳 Total count</p>
                    </div>
                    <div className="bg-card/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Top Category</p>
                        <p className="text-2xl font-bold text-foreground">{topCategoryPercentage}%</p>
                        <p className="text-xs text-muted-foreground mt-1">{topCategory?.category}</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expense by Category - Pie Chart */}
                <div className="bg-card border border-border rounded-lg p-6 banking-shadow-md">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Spending by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={expensesByCategory}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ category, value }) => `${category} $${value.toFixed(0)}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {expensesByCategory.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={getCategoryColor(index)}
                                        onClick={() => setSelectedCategory(entry.category)}
                                        style={{ cursor: 'pointer', opacity: selectedCategory === entry.category ? 1 : 0.7 }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-sm text-muted-foreground text-center">
                        Click on a category to see detailed transactions
                    </div>
                </div>

                {/* Daily Spending Trend - Line Chart */}
                <div className="bg-card border border-border rounded-lg p-6 banking-shadow-md">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Daily Spending Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailySpending}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis
                                dataKey="date"
                                stroke="var(--color-muted-foreground)"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="var(--color-muted-foreground)"
                                style={{ fontSize: '12px' }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="var(--color-primary)"
                                strokeWidth={2}
                                dot={{ fill: 'var(--color-primary)', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Breakdown - Bar Chart */}
            <div className="bg-card border border-border rounded-lg p-6 banking-shadow-md">
                <h3 className="text-lg font-semibold text-foreground mb-6">Category Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={expensesByCategory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis
                            dataKey="category"
                            stroke="var(--color-muted-foreground)"
                            style={{ fontSize: '12px' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            stroke="var(--color-muted-foreground)"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
                        />
                        <Bar dataKey="value" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Category Details List */}
            <div className="bg-card border border-border rounded-lg p-6 banking-shadow-md">
                <h3 className="text-lg font-semibold text-foreground mb-6">Category Details</h3>
                <div className="space-y-3">
                    {expensesByCategory.map((item, index) => (
                        <div
                            key={item.category}
                            className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 banking-transition cursor-pointer"
                            onClick={() => setSelectedCategory(selectedCategory === item.category ? null : item.category)}
                        >
                            <div className="flex items-center space-x-3 flex-1">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getCategoryColor(index) }}
                                ></div>
                                <div className="flex items-center space-x-2">
                                    <Icon name={getCategoryIcon(item.category)} size={18} />
                                    <div>
                                        <p className="font-medium text-foreground">{item.category}</p>
                                        <p className="text-xs text-muted-foreground">{item.count} transactions</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-foreground">{formatCurrency(item.value)}</p>
                                <p className="text-xs text-muted-foreground">
                                    {((item.value / totalExpenses) * 100).toFixed(1)}% of total
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detailed Transactions for Selected Category */}
            {selectedCategory && (
                <div className="bg-card border border-border rounded-lg p-6 banking-shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground">
                            {selectedCategory} Transactions ({filteredTransactions.length})
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCategory(null)}
                            iconName="X"
                        >
                            Clear Filter
                        </Button>
                    </div>
                    <div className="divide-y divide-border">
                        {filteredTransactions.map((transaction) => (
                            <div key={transaction.id} className="py-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Icon name={getCategoryIcon(transaction.category)} size={20} color="var(--color-primary)" />
                                    <div>
                                        <p className="font-medium text-foreground">{transaction.merchant}</p>
                                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                                    </div>
                                </div>
                                <p className="font-semibold text-foreground">{formatCurrency(transaction.amount)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Insights & Recommendations */}
            <div className="bg-success/10 border border-success/20 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                    <Icon name="Lightbulb" size={20} color="var(--color-success)" />
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">💡 Smart Insight</h4>
                        <p className="text-sm text-muted-foreground">
                            Your top spending category is <strong>{topCategory?.category}</strong> with {formatCurrency(topCategory?.value)}.
                            Consider setting a budget limit to optimize your spending.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseInsights;

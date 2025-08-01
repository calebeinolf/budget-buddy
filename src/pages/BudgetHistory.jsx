import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useAppData } from "../contexts/AppDataContext";
import TransactionCard from "../components/TransactionCard";
import { formatCurrency } from "../utils/formatCurrency";

const BudgetHistory = () => {
  const navigate = useNavigate();
  const { transactions, getMonthSpending } = useAppData();
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    // Get unique months from transactions
    const monthsSet = new Set();
    const now = new Date();

    transactions.forEach((transaction) => {
      const date = transaction.date?.toDate();
      if (date) {
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        // Only include past months, not current month
        if (
          date.getFullYear() < now.getFullYear() ||
          (date.getFullYear() === now.getFullYear() &&
            date.getMonth() < now.getMonth())
        ) {
          monthsSet.add(monthYear);
        }
      }
    });

    // Convert to array and sort by date (most recent first)
    const monthsArray = Array.from(monthsSet)
      .map((monthYear) => {
        const [year, month] = monthYear.split("-").map(Number);
        const spending = getMonthSpending(year, month);
        // Get budget for that month from transactions (stored in budgetForMonth field)
        const monthTransactions = transactions.filter((t) => {
          const tDate = t.date?.toDate();
          return (
            tDate && tDate.getFullYear() === year && tDate.getMonth() === month
          );
        });
        const budget =
          monthTransactions.length > 0
            ? monthTransactions[0].budgetForMonth
            : 500;

        return {
          year,
          month,
          spending,
          budget,
          isOverBudget: spending > budget,
          date: new Date(year, month),
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

    setMonthlyData(monthsArray);
  }, [transactions, getMonthSpending]);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <h1 className="pt-[15vh] text-3xl font-medium text-gray-900 text-center">
        Spending History
      </h1>

      {/* Main Content */}
      <main className="px-4 py-6 pt-20">
        <div className="max-w-md mx-auto">
          <div
            className="mb-4 font-medium flex items-center justify-between p-4 px-6 text-xl rounded-full bg-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate("/all-transactions")}
          >
            <p>All Transactions</p>
            <ChevronRight />
          </div>
          <h3 className="text-2xl font-medium text-gray-900 text-center py-6">
            Past Months
          </h3>
          {monthlyData.length > 0 ? (
            <div className="space-y-3">
              {monthlyData.map((data) => (
                <TransactionCard
                  key={`${data.year}-${data.month}`}
                  isMonthCard={true}
                  transaction={{
                    date: data.date,
                    spent: data.spending,
                    budget: data.budget,
                    isOverBudget: data.isOverBudget,
                  }}
                  onClick={() =>
                    navigate(`/history/${data.year}/${data.month}`)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl text-center border border-gray-100">
              <p className="text-gray-500 mb-4">No budget history yet</p>
              <p className="text-sm text-gray-400">
                Start adding transactions to see your monthly spending history
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BudgetHistory;

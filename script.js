document.addEventListener('DOMContentLoaded', () => {
    const transactionForm = document.getElementById('transaction-form');
    const transactionList = document.getElementById('transaction-list');
    const balanceDisplay = document.getElementById('balance');
    const totalAmountDisplay = document.getElementById('total-amount');
    const totalIncomeDisplay = document.getElementById('total-income');
    const totalExpenseDisplay = document.getElementById('total-expense');
    const exportBtn = document.getElementById('export-btn');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    const addTransactionDOM = (transaction, index) => {
        const row = document.createElement('tr');
        row.classList.add(transaction.type === 'income' ? 'table-success' : 'table-danger');
        row.innerHTML = `
            <td>${transaction.docNumber}</td>
            <td>${transaction.docDate}</td>
            <td>${transaction.description}</td>
            <td>${transaction.amount}</td>
            <td>${transaction.type === 'income' ? 'إيرادات' : 'مصروفات'}</td>
            <td><span class="delete-btn" data-index="${index}"><i class="fas fa-trash-alt"></i></span></td>
        `;
        transactionList.appendChild(row);
    };

    const updateLocalStorage = () => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    };

    const updateBalanceAndTotal = () => {
        let totalIncome = 0;
        let totalExpense = 0;

        const balance = transactions.reduce((acc, transaction) => {
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
                return acc + transaction.amount;
            } else {
                totalExpense += transaction.amount;
                return acc - transaction.amount;
            }
        }, 0);

        const totalAmount = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);

        balanceDisplay.textContent = balance;
        totalAmountDisplay.textContent = totalAmount;
        totalIncomeDisplay.textContent = totalIncome;
        totalExpenseDisplay.textContent = totalExpense;

        if (balance > 0) {
            balanceDisplay.classList.remove('balance-negative', 'balance-neutral');
            balanceDisplay.classList.add('balance-positive');
        } else if (balance < 0) {
            balanceDisplay.classList.remove('balance-positive', 'balance-neutral');
            balanceDisplay.classList.add('balance-negative');
        } else {
            balanceDisplay.classList.remove('balance-positive', 'balance-negative');
            balanceDisplay.classList.add('balance-neutral');
        }

        if (totalAmount > 0) {
            totalAmountDisplay.classList.remove('total-negative', 'total-neutral');
            totalAmountDisplay.classList.add('total-positive');
        } else if (totalAmount < 0) {
            totalAmountDisplay.classList.remove('total-positive', 'total-neutral');
            totalAmountDisplay.classList.add('total-negative');
        } else {
            totalAmountDisplay.classList.remove('total-positive', 'total-negative');
            totalAmountDisplay.classList.add('total-neutral');
        }
    };

    const addTransaction = (event) => {
        event.preventDefault();
        const docNumber = document.getElementById('docNumber').value;
        const docDate = document.getElementById('docDate').value;
        const description = document.getElementById('description').value;
        const amount = +document.getElementById('amount').value;
        const type = document.getElementById('type').value;

        const transaction = {
            docNumber,
            docDate,
            description,
            amount,
            type
        };

        transactions.push(transaction);
        addTransactionDOM(transaction, transactions.length - 1);
        updateLocalStorage();
        updateBalanceAndTotal();
        transactionForm.reset();
    };

    const deleteTransaction = (index) => {
        transactions.splice(index, 1);
        updateLocalStorage();
        renderTransactions();
        updateBalanceAndTotal();
    };

    const renderTransactions = () => {
        transactionList.innerHTML = '';
        transactions.forEach((transaction, index) => {
            addTransactionDOM(transaction, index);
        });
    };

    transactionForm.addEventListener('submit', addTransaction);

    transactionList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn') || event.target.parentElement.classList.contains('delete-btn')) {
            const index = event.target.getAttribute('data-index') || event.target.parentElement.getAttribute('data-index');
            deleteTransaction(index);
        }
    });

    exportBtn.addEventListener('click', () => {
        const headers = ["رقم المستند", "تاريخ المستند", "الوصف", "المبلغ", "النوع"];
        const rows = transactions.map(transaction => [
            transaction.docNumber,
            transaction.docDate,
            transaction.description,
            transaction.amount,
            transaction.type === 'income' ? 'إيرادات' : 'مصروفات'
        ]);
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");
        XLSX.writeFile(wb, "transactions.xlsx");
    });

    renderTransactions();
    updateBalanceAndTotal();
});

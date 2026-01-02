// ===== GLOBAL VARIABLES =====
let lastUpdateTime = new Date();
let marketOpen = true;
let currentBalance = 2568914.37;
let transactions = [];
let filteredTransactions = [];
let currentPage = 0;
const transactionsPerPage = 20;

// ===== UNIQUE VERIFICATION CODES FOR 2FA =====
const VALID_2FA_CODES = {
  sms: [
    '749326', '518943', '682517', '935284', '246791',
    '853169', '427358', '169834', '582746', '913527'
  ],
  email: [
    '385492', '926481', '571839', '248765', '693214',
    '827359', '164937', '432685', '759321', '281456'
  ],
  app: [
    '637824', '189456', '452973', '824167', '315798',
    '967235', '241683', '578912', '896341', '123567'
  ]
};

// ===== UTILITY FUNCTIONS =====
function showNotification(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  } else {
    alert(message);
  }
}

function updateTimeDisplay() {
  const now = new Date();
  const options = { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  };
  const timeString = now.toLocaleTimeString('en-US', options);
  
  const updateTimeElement = document.getElementById('updateTime');
  if (updateTimeElement) {
    updateTimeElement.textContent = timeString;
  }
}

function formatDate(date) {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function getRandomLocation() {
  const cities = ['PALMDALE CA', 'LOS ANGELES CA', 'NEW YORK NY', 'CHICAGO IL', 'HOUSTON TX', 'PHOENIX AZ'];
  return cities[Math.floor(Math.random() * cities.length)];
}

function generateTransactionId() {
  return 'TRX_' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// ===== BALANCE PAGE FUNCTIONS =====
function redirectToTransactionPage() {
  showNotification('Loading transaction details for BOA Checking account 4400...');
  
  const accountElement = event.currentTarget;
  accountElement.style.opacity = '0.7';
  accountElement.style.backgroundColor = '#f0f0f0';
  
  setTimeout(() => {
    window.location.href = 'transaction.html';
  }, 800);
}

function toggleAccountDetails(accountType) {
  showNotification(`Viewing details for ${accountType} account`);
  
  const account = event.currentTarget;
  account.style.opacity = '0.7';
  
  setTimeout(() => {
    account.style.opacity = '1';
  }, 300);
}

function refreshAccounts() {
  const refreshBtn = document.getElementById('refreshAccounts');
  if (refreshBtn) {
    const originalText = refreshBtn.textContent;
    refreshBtn.textContent = 'Refreshing...';
    refreshBtn.style.opacity = '0.7';
    
    setTimeout(() => {
      refreshBtn.textContent = originalText;
      refreshBtn.style.opacity = '1';
      showNotification('Account balances refreshed');
      updateTimeDisplay();
    }, 1500);
  }
}

// ===== TRANSACTION PAGE FUNCTIONS =====
function generateTransactions() {
  transactions = [];
  
  // Generate March 2025 daily $100 debits
  for (let i = 29; i >= 25; i--) {
    const date = new Date(2025, 2, i);
    const balanceBefore = currentBalance + (100 * (29 - i + 1));
    
    transactions.push({
      date: formatDate(date),
      description: 'Daily Service Charge',
      details: 'Automatic monthly maintenance fee',
      type: 'fee',
      status: 'C',
      amount: -100.00,
      balance: balanceBefore,
      id: generateTransactionId()
    });
  }
  
  // Generate November 2024 transactions
  let runningBalance = currentBalance + 500;
  
  // Large deposit on Nov 15
  runningBalance -= 12450;
  transactions.push({
    date: '11/15/2024',
    description: 'Interest Payment',
    details: 'Monthly interest deposit',
    type: 'deposit',
    status: 'C',
    amount: 12450.00,
    balance: runningBalance,
    id: generateTransactionId()
  });
  
  // Generate daily transactions for November 2024
  for (let day = 30; day >= 1; day--) {
    if (day === 15) continue;
    
    const date = `11/${day.toString().padStart(2, '0')}/2024`;
    const isBusinessDay = day % 7 !== 0 && day % 7 !== 6;
    
    if (isBusinessDay) {
      const numTransactions = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numTransactions; i++) {
        const isDeposit = Math.random() > 0.7;
        let amount, type, description;
        
        if (isDeposit) {
          amount = Math.random() * 5000 + 1000;
          type = 'deposit';
          description = 'Deposit';
        } else {
          amount = -(Math.random() * 500 + 10);
          const types = ['shopping', 'food', 'gas', 'entertainment', 'payment'];
          type = types[Math.floor(Math.random() * types.length)];
          description = 'Purchase';
        }
        
        runningBalance += amount;
        
        transactions.push({
          date: date,
          description: description,
          details: getRandomLocation(),
          type: type,
          status: 'C',
          amount: parseFloat(amount.toFixed(2)),
          balance: parseFloat(runningBalance.toFixed(2)),
          id: generateTransactionId()
        });
      }
    }
  }
  
  // Sort transactions by date (newest first)
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  filteredTransactions = [...transactions];
}

function displayTransactions() {
  const container = document.getElementById('transactionsContainer');
  if (!container) return;
  
  const start = currentPage * transactionsPerPage;
  const end = start + transactionsPerPage;
  const pageTransactions = filteredTransactions.slice(start, end);
  
  container.innerHTML = '';
  
  let lastMonth = '';
  
  pageTransactions.forEach((txn, index) => {
    const date = new Date(txn.date);
    const currentMonth = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (currentMonth !== lastMonth) {
      const statementDiv = document.createElement('div');
      statementDiv.className = 'statement';
      statementDiv.textContent = `Statement as of ${txn.date} (view statements)`;
      container.appendChild(statementDiv);
      lastMonth = currentMonth;
    }
    
    const row = document.createElement('div');
    row.className = 'row' + (index % 5 === 0 ? ' highlight' : '');
    row.id = txn.id;
    
    const amountClass = txn.amount >= 0 ? 'amount-positive' : 'amount-negative';
    
    row.innerHTML = `
      <div>${txn.date}</div>
      <div>
        <a onclick="viewTransactionDetails('${txn.id}')">${txn.description}</a><br>
        <span class="muted">${txn.details}</span>
      </div>
      <div class="icon-container">
        <svg class="transaction-icon" style="color: ${txn.amount >= 0 ? '#4CAF50' : '#F44336'}">
          <use xlink:href="#${txn.type}"></use>
        </svg>
      </div>
      <div>${txn.status}</div>
      <div class="${amountClass}">${txn.amount >= 0 ? '+' : ''}$${Math.abs(txn.amount).toFixed(2)}</div>
      <div>$${txn.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    `;
    
    container.appendChild(row);
  });
  
  if (filteredTransactions.length > end) {
    const loadMoreDiv = document.createElement('div');
    loadMoreDiv.className = 'row';
    loadMoreDiv.style.textAlign = 'center';
    loadMoreDiv.style.padding = '15px';
    loadMoreDiv.innerHTML = `<a onclick="loadMoreTransactions()" style="cursor: pointer;">Load More Transactions (${filteredTransactions.length - end} remaining)</a>`;
    container.appendChild(loadMoreDiv);
  }
  
  updatePaginationInfo();
}

function filterTransactions() {
  const searchInput = document.getElementById('searchTransactions');
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.toLowerCase();
  
  if (!searchTerm) {
    filteredTransactions = [...transactions];
  } else {
    filteredTransactions = transactions.filter(txn => {
      return txn.description.toLowerCase().includes(searchTerm) ||
             txn.details.toLowerCase().includes(searchTerm) ||
             txn.date.includes(searchTerm) ||
             Math.abs(txn.amount).toString().includes(searchTerm);
    });
  }
  
  currentPage = 0;
  displayTransactions();
}

function loadMoreTransactions() {
  currentPage++;
  displayTransactions();
}

function updatePaginationInfo() {
  // Could display pagination info if needed
}

function sortNewest() {
  filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  currentPage = 0;
  displayTransactions();
}

function sortOldest() {
  filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
  currentPage = 0;
  displayTransactions();
}

function nextPage() {
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  if (currentPage < totalPages - 1) {
    currentPage++;
    displayTransactions();
  }
}

function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    displayTransactions();
  }
}

function toggleDeals() {
  const toggle = document.getElementById('dealsToggle');
  if (toggle) {
    toggle.textContent = toggle.textContent === 'On' ? 'Off' : 'On';
  }
}

function loadRecentActivity() {
  const container = document.getElementById('recentActivity');
  if (!container) return;
  
  const recent = transactions.slice(0, 3);
  
  container.innerHTML = recent.map(txn => `
    <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #eee;">
      <div style="font-weight: bold; color: ${txn.amount >= 0 ? '#4CAF50' : '#F44336'}">
        ${txn.amount >= 0 ? '+' : '-'}$${Math.abs(txn.amount).toFixed(2)}
      </div>
      <div style="font-size: 11px; color: #666;">${txn.description}</div>
      <div style="font-size: 10px; color: #999;">${txn.date}</div>
    </div>
  `).join('');
}

function viewTransactionDetails(id) {
  const txn = transactions.find(t => t.id === id);
  if (txn) {
    alert(`Transaction Details:\n\nDate: ${txn.date}\nDescription: ${txn.description}\nDetails: ${txn.details}\nAmount: $${txn.amount.toFixed(2)}\nBalance: $${txn.balance.toFixed(2)}\nStatus: ${txn.status === 'C' ? 'Completed' : 'Pending'}\nID: ${txn.id}`);
  }
}

// ===== NAVIGATION FUNCTIONS =====
function navigateTo(page) {
  showNotification(`Navigating to ${page}...`);
  
  if (event && event.target) {
    event.target.style.color = '#0066cc';
    setTimeout(() => {
      event.target.style.color = '';
    }, 300);
  }
}

function navigate(page) {
  const pageNames = {
    'accounts': 'Accounts',
    'billpay': 'Bill Pay',
    'transfer': 'Transfer',
    'rewards': 'Rewards & Deals',
    'tools': 'Tools & Investing',
    'open': 'Open Account',
    'help': 'Help & Support'
  };
  
  showNotification(`Navigating to ${pageNames[page] || page} page...`);
}

function signOut() {
  if (confirm('Are you sure you want to sign out?')) {
    showNotification('Signing out...');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
}

// ===== SEARCH FUNCTION =====
function handleSearch(event) {
  if (event.key === 'Enter') {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      const searchTerm = searchInput.value.trim();
      if (searchTerm) {
        showNotification(`Searching for: ${searchTerm}`);
        searchInput.value = '';
      }
    }
  }
}

// ===== ADDITIONAL FUNCTIONS FOR BALANCE PAGE =====
function updateProfile() {
  showNotification('Opening profile editor...');
}

function showSecurityCenter() {
  showNotification('Opening security center...');
}

function showAlerts() {
  showNotification('Showing all alerts...');
}

function startBillPay() {
  showNotification('Starting bill pay...');
}

function startTransfer() {
  showNotification('Starting transfer...');
}

function showMessages() {
  const messageCount = document.getElementById('messageCount');
  if (messageCount) {
    messageCount.textContent = '(0)';
  }
  showNotification('No new messages');
}

function showSpecialOffers() {
  showNotification('Showing special offers...');
}

function openAccount() {
  showNotification('Opening new account application...');
}

function showSpending() {
  showNotification('Opening spending analysis...');
}

function showGoals() {
  showNotification('Showing goals tracker...');
}

function showDeals() {
  showNotification('Showing available deals...');
}

function downloadStatement() {
  showNotification('Downloading statement...');
}

function generateReport() {
  showNotification('Generating report...');
}

function downloadTaxForms() {
  showNotification('Downloading tax forms...');
}

function showRewards() {
  showNotification('Showing rewards dashboard...');
}

function referFriend() {
  showNotification('Opening referral program...');
}

function showSecurity() {
  showNotification('Opening security settings...');
}

function editPayment(id) {
  showNotification(`Editing payment #${id}...`);
}

function viewAlert(id) {
  const alertElement = event.currentTarget;
  if (alertElement.classList.contains('new-alert')) {
    alertElement.classList.remove('new-alert');
    
    // Update alert count
    const alertCount = document.getElementById('alertCount');
    if (alertCount) {
      const currentCount = parseInt(alertCount.textContent.match(/\d+/)[0]);
      if (currentCount > 0) {
        alertCount.textContent = `(${currentCount - 1})`;
      }
    }
    
    // Update new alerts
    const newAlerts = document.getElementById('newAlerts');
    if (newAlerts) {
      const newCount = parseInt(newAlerts.textContent.match(/\d+/)[0]);
      if (newCount > 0) {
        newAlerts.textContent = `${newCount - 1} new`;
      }
    }
  }
  showNotification(`Viewing alert #${id}...`);
}

function viewInvestmentDetails(type) {
  showNotification(`Viewing ${type} investment details...`);
}

function refreshInvestments() {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Refreshing...';
  
  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = 'Refresh Data';
    showNotification('Investment data refreshed');
    updateTimeDisplay();
  }, 2000);
}

function openSpendingTool() {
  const spinner = document.getElementById('spendingSpinner');
  if (spinner) {
    spinner.style.display = 'block';
    
    setTimeout(() => {
      spinner.style.display = 'none';
      showNotification('Spending tool opened');
    }, 1500);
  }
}

function openSavingsGoals() {
  const spinner = document.getElementById('savingsSpinner');
  if (spinner) {
    spinner.style.display = 'block';
    
    setTimeout(() => {
      spinner.style.display = 'none';
      showNotification('Savings goals opened');
    }, 1500);
  }
}

function updateCreditScore() {
  const scoreElement = document.getElementById('creditScore');
  const btn = event.target;
  
  if (scoreElement && btn) {
    btn.disabled = true;
    btn.textContent = 'Checking...';
    
    setTimeout(() => {
      // Simulate score update
      const change = Math.floor(Math.random() * 10) - 5;
      const currentScore = parseInt(scoreElement.textContent);
      const newScore = Math.max(300, Math.min(850, currentScore + change));
      
      scoreElement.textContent = newScore;
      scoreElement.style.color = change >= 0 ? '#0a7c0a' : '#c41230';
      
      btn.disabled = false;
      btn.textContent = 'Check for Update';
      
      showNotification(`Credit score updated: ${change >= 0 ? '+' : ''}${change} points`);
    }, 2000);
  }
}

function showPrivacy() {
  showNotification('Opening privacy policy...');
}

function showTerms() {
  showNotification('Opening terms of use...');
}

function showAccessibility() {
  showNotification('Opening accessibility information...');
}

function switchTab(tabName) {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.classList.remove('active');
  });
  
  if (event && event.target) {
    event.target.classList.add('active');
  }
  
  showNotification(`Switching to ${tabName} tab...`);
}

function downloadTransactions() {
  showNotification('Downloading transaction history...');
}

function printView() {
  window.print();
}

// ===== 2-FACTOR AUTHENTICATION FUNCTIONS =====
let twoFactorAppTimerInterval;
let twoFactorAppTimeLeft = 30;
let twoFactorCountdownTime = 5 * 60;
let twoFactorCurrentMethod = 'sms';
let twoFactorCurrentInputIndex = 0;

function initializeTwoFactorAuth() {
  const codeInputs = document.querySelectorAll('.two-factor-code-input');
  if (codeInputs.length > 0) {
    twoFactorSetupCodeInputs();
    twoFactorStartAppTimer();
    twoFactorStartCountdown();
    
    // Welcome notification
    setTimeout(() => {
      twoFactorShowNotification('Welcome to Bank of America 2FA. Please verify your identity.', 'info');
    }, 1000);
  }
}

function twoFactorShowNotification(message, type = 'info') {
  const notification = document.getElementById('two-factor-notification');
  if (notification) {
    notification.textContent = message;
    notification.className = `two-factor-notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  } else {
    alert(message);
  }
}

function twoFactorSetupCodeInputs() {
  const codeInputs = document.querySelectorAll('.two-factor-code-input');
  
  codeInputs.forEach((input, index) => {
    // Handle input
    input.addEventListener('input', function(e) {
      const value = e.target.value;
      
      // Only allow numbers
      if (!/^\d*$/.test(value)) {
        e.target.value = '';
        this.classList.add('error');
        setTimeout(() => this.classList.remove('error'), 500);
        return;
      }
      
      // Clear error state
      this.classList.remove('error');
      
      // If a number was entered and there's a next input, focus it
      if (value && index < codeInputs.length - 1) {
        codeInputs[index + 1].focus();
        twoFactorCurrentInputIndex = index + 1;
      }
      
      // Update visual state
      twoFactorUpdateCodeInputState();
      
      // Check if all inputs are filled
      if (Array.from(codeInputs).every(input => input.value)) {
        twoFactorAutoVerify();
      }
    });
    
    // Handle paste
    input.addEventListener('paste', function(e) {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text');
      
      // Only allow numbers
      const numbers = pastedData.replace(/\D/g, '');
      
      // Fill inputs with pasted numbers
      for (let i = 0; i < Math.min(numbers.length, codeInputs.length); i++) {
        codeInputs[i].value = numbers[i];
        codeInputs[i].classList.add('filled');
        codeInputs[i].classList.remove('error');
      }
      
      // Focus last filled input or last input
      const lastFilledIndex = Math.min(numbers.length, codeInputs.length) - 1;
      codeInputs[lastFilledIndex].focus();
      twoFactorCurrentInputIndex = lastFilledIndex;
      
      twoFactorUpdateCodeInputState();
      
      // Auto-verify if all inputs filled
      if (numbers.length >= 6) {
        setTimeout(twoFactorAutoVerify, 500);
      }
    });
    
    // Handle backspace
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !this.value && index > 0) {
        codeInputs[index - 1].focus();
        twoFactorCurrentInputIndex = index - 1;
        codeInputs[index - 1].value = '';
        twoFactorUpdateCodeInputState();
      }
    });
    
    // Handle focus
    input.addEventListener('focus', function() {
      this.select();
      twoFactorCurrentInputIndex = index;
    });
  });
}

function twoFactorUpdateCodeInputState() {
  const codeInputs = document.querySelectorAll('.two-factor-code-input');
  codeInputs.forEach(input => {
    if (input.value) {
      input.classList.add('filled');
    } else {
      input.classList.remove('filled');
    }
  });
}

function twoFactorResetCodeInputs() {
  const codeInputs = document.querySelectorAll('.two-factor-code-input');
  codeInputs.forEach(input => {
    input.value = '';
    input.classList.remove('filled', 'error');
  });
  // Focus first input
  if (codeInputs.length > 0) {
    codeInputs[0].focus();
    twoFactorCurrentInputIndex = 0;
  }
}

function twoFactorStartAppTimer() {
  if (twoFactorAppTimerInterval) {
    clearInterval(twoFactorAppTimerInterval);
  }
  
  twoFactorAppTimeLeft = 30;
  const timerElement = document.getElementById('two-factor-app-timer');
  if (timerElement) {
    timerElement.textContent = twoFactorAppTimeLeft;
  }
  
  // Update timer every second
  twoFactorAppTimerInterval = setInterval(() => {
    twoFactorAppTimeLeft--;
    if (timerElement) {
      timerElement.textContent = twoFactorAppTimeLeft;
      
      // Visual feedback when timer is low
      if (twoFactorAppTimeLeft <= 10) {
        timerElement.style.color = '#ff6b35';
      } else {
        timerElement.style.color = '#0066cc';
      }
      
      if (twoFactorAppTimeLeft <= 0) {
        twoFactorAppTimeLeft = 30;
        timerElement.textContent = twoFactorAppTimeLeft;
        timerElement.style.color = '#0066cc';
      }
    }
  }, 1000);
}

function twoFactorStartCountdown() {
  const countdownElement = document.getElementById('two-factor-countdown');
  if (!countdownElement) return;
  
  function update() {
    const minutes = Math.floor(twoFactorCountdownTime / 60);
    const seconds = twoFactorCountdownTime % 60;
    
    countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update styling based on time remaining
    if (twoFactorCountdownTime <= 60) {
      countdownElement.className = 'two-factor-expiry-warning';
      if (twoFactorCountdownTime <= 30) {
        countdownElement.style.animationDuration = '0.5s';
      }
    } else if (twoFactorCountdownTime <= 120) {
      countdownElement.className = 'two-factor-expiry-warning';
    }
    
    if (twoFactorCountdownTime > 0) {
      twoFactorCountdownTime--;
      setTimeout(update, 1000);
    } else {
      countdownElement.textContent = "Expired";
      countdownElement.className = 'two-factor-expired';
      twoFactorShowNotification('Verification code has expired. Please request a new one.', 'error');
    }
  }
  
  update();
}

function twoFactorVerifyCode() {
  const codeInputs = document.querySelectorAll('.two-factor-code-input');
  const code = Array.from(codeInputs).map(input => input.value).join('');
  
  // Validate code
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    // Show error on inputs
    codeInputs.forEach(input => {
      if (!input.value) {
        input.classList.add('error');
      }
    });
    twoFactorShowNotification('Please enter a valid 6-digit code.', 'error');
    return false;
  }
  
  // Check if code is valid for current method
  if (VALID_2FA_CODES[twoFactorCurrentMethod].includes(code)) {
    // Success - redirect to balance.html
    twoFactorShowNotification('Verification successful! Redirecting to your account...', 'success');
    
    // Add success animation to inputs
    codeInputs.forEach(input => {
      input.style.transition = 'all 0.5s ease';
      input.style.background = 'linear-gradient(135deg, #d4edda, #c3e6cb)';
      input.style.borderColor = '#28a745';
    });
    
    // Simulate redirect
    setTimeout(() => {
      window.location.href = 'balance.html';
    }, 1500);
    return true;
  } else {
    // Invalid code
    codeInputs.forEach(input => {
      input.classList.add('error');
    });
    twoFactorShowNotification('Invalid verification code. Please try again.', 'error');
    return false;
  }
}

function twoFactorAutoVerify() {
  const codeInputs = document.querySelectorAll('.two-factor-code-input');
  const code = Array.from(codeInputs).map(input => input.value).join('');
  if (code.length === 6 && /^\d{6}$/.test(code)) {
    setTimeout(() => {
      twoFactorVerifyCode();
    }, 500);
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  // Initialize warning banner
  const banner = document.getElementById('warningBanner');
  if (banner) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 100) {
        banner.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
      } else {
        banner.style.boxShadow = 'none';
      }
    });
  }
  
  // Update time display
  updateTimeDisplay();
  
  // Update current date for transaction page
  updateCurrentDate();
  
  // Initialize transactions if on transaction page
  if (document.getElementById('transactionsContainer')) {
    generateTransactions();
    displayTransactions();
    loadRecentActivity();
    
    // Add live balance update
    setInterval(updateLiveBalance, 30000);
  }
  
  // Start live updates for balance page
  if (document.getElementById('updateTime')) {
    setInterval(updateTimeDisplay, 60000);
    setInterval(updateMarketStatus, 30000);
    setInterval(updatePendingTransactions, 45000);
    
    // Add slide-in animation to new content
    const containers = document.querySelectorAll('.container');
    containers.forEach((container, index) => {
      if (index > 0) {
        container.classList.add('slide-in');
      }
    });
    
    // Simulate real-time updates
    simulateLiveData();
  }
  
  // Initialize 2FA if on 2FA page
  if (document.querySelector('.two-factor-code-input')) {
    initializeTwoFactorAuth();
  }
  
  // Make all interactive elements accessible
  initializeAccessibility();
});

function updateCurrentDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  
  const currentDateElement = document.getElementById('currentDate');
  if (currentDateElement) {
    currentDateElement.textContent = now.toLocaleDateString('en-US', options);
  }
}

function updateLiveBalance() {
  const fluctuation = (Math.random() - 0.5) * 100;
  const newBalance = currentBalance + fluctuation;
  
  const balanceElement = document.getElementById('currentBalance');
  if (balanceElement) {
    balanceElement.style.transition = 'color 0.5s';
    balanceElement.style.color = fluctuation > 0 ? '#4CAF50' : '#F44336';
    
    setTimeout(() => {
      balanceElement.textContent = `$${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      balanceElement.style.color = '';
    }, 250);
  }
  
  if (Math.abs(fluctuation) > 20) {
    addLiveTransaction(fluctuation);
  }
}

function addLiveTransaction(amount) {
  const now = new Date();
  const date = formatDate(now);
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  const type = amount > 0 ? 'deposit' : 'withdrawal';
  const description = amount > 0 ? 'Interest Accrual' : 'Service Fee';
  const details = `Real-time ${amount > 0 ? 'interest' : 'fee'} at ${time}`;
  
  currentBalance += amount;
  
  const newTransaction = {
    date: date,
    description: description,
    details: details,
    type: type,
    status: 'P',
    amount: parseFloat(amount.toFixed(2)),
    balance: parseFloat(currentBalance.toFixed(2)),
    id: generateTransactionId()
  };
  
  transactions.unshift(newTransaction);
  filteredTransactions.unshift(newTransaction);
  
  if (currentPage === 0) {
    displayTransactions();
    loadRecentActivity();
  }
}

function initializeAccessibility() {
  // Add keyboard accessibility to interactive elements
  const interactiveElements = document.querySelectorAll('[onclick], .nav a, .tab, .account, .item, .promo');
  
  interactiveElements.forEach(el => {
    el.setAttribute('tabindex', '0');
    
    el.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });
}

// Simulated functions for balance page
function updateMarketStatus() {
  // Simulate market status updates
  const statusElement = document.getElementById('marketStatus');
  const marketChangeElement = document.getElementById('marketChange');
  
  if (statusElement && marketChangeElement && marketOpen) {
    // Simulate small market fluctuations
    const change = (Math.random() - 0.5) * 0.4;
    const changeFormatted = change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
    const color = change >= 0 ? '#0a7c0a' : '#c41230';
    
    marketChangeElement.textContent = changeFormatted;
    marketChangeElement.style.color = color;
  }
}

function updatePendingTransactions() {
  // Simulate pending transaction updates
  const pendingCount = document.getElementById('pendingCount');
  if (pendingCount) {
    const currentCount = parseInt(pendingCount.textContent);
    
    // Occasionally add or remove pending transactions
    if (Math.random() > 0.7) {
      if (currentCount > 1 && Math.random() > 0.5) {
        // Remove a transaction
        pendingCount.textContent = currentCount - 1;
        showNotification('Pending transaction cleared');
      } else if (currentCount < 5) {
        // Add a transaction
        pendingCount.textContent = currentCount + 1;
        showNotification('New pending transaction detected');
      }
    }
  }
}

function simulateLiveData() {
  // Simulate live data updates
  // Randomly update some balances
  setInterval(() => {
    if (Math.random() > 0.7) {
      updateRandomBalance();
    }
  }, 20000);
  
  // Add new alerts occasionally
  setInterval(() => {
    if (Math.random() > 0.8) {
      addNewAlert();
    }
  }, 60000);
}

function updateRandomBalance() {
  const balances = ['checkingBalance', 'savingsBalance', 'creditCardBalance'];
  const randomBalance = balances[Math.floor(Math.random() * balances.length)];
  const element = document.getElementById(randomBalance);
  
  if (element) {
    // Parse current balance
    let current = parseFloat(element.textContent.replace(/[$,]/g, ''));
    
    // Small random change
    const change = (Math.random() - 0.5) * 100;
    current += change;
    
    // Update display
    const formatted = current.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
    
    element.textContent = formatted;
    
    // Show notification for large changes
    if (Math.abs(change) > 50) {
      const accountName = randomBalance.replace('Balance', '').replace(/([A-Z])/g, ' $1').trim();
      showNotification(`Balance updated for ${accountName} account`);
    }
  }
}

function addNewAlert() {
  const alerts = [
    'Unusual login activity detected',
    'Credit card payment due in 3 days',
    'Large withdrawal authorized',
    'New bill payee added',
    'Account statement available'
  ];
  
  const newAlert = alerts[Math.floor(Math.random() * alerts.length)];
  const date = new Date();
  const dateString = `${date.getMonth() + 1}/${date.getDate()}`;
  
  // Update alert count
  const alertCount = document.getElementById('alertCount');
  if (alertCount) {
    const currentCount = parseInt(alertCount.textContent.match(/\d+/)[0]);
    alertCount.textContent = `(${currentCount + 1})`;
  }
  
  // Update new alerts count
  const newAlerts = document.getElementById('newAlerts');
  if (newAlerts) {
    newAlerts.textContent = `1 new`;
  }
  
  showNotification(`New alert: ${newAlert}`);
}

// Mobile menu function
function toggleMobileMenu() {
  showNotification('Mobile menu would open here');
}

// ===== EXPORT FUNCTIONS FOR HTML ONCLICK HANDLERS =====
window.redirectToTransactionPage = redirectToTransactionPage;
window.toggleAccountDetails = toggleAccountDetails;
window.refreshAccounts = refreshAccounts;
window.navigateTo = navigateTo;
window.navigate = navigate;
window.signOut = signOut;
window.handleSearch = handleSearch;
window.showNotification = showNotification;
window.filterTransactions = filterTransactions;
window.loadMoreTransactions = loadMoreTransactions;
window.sortNewest = sortNewest;
window.sortOldest = sortOldest;
window.nextPage = nextPage;
window.prevPage = prevPage;
window.toggleDeals = toggleDeals;
window.viewTransactionDetails = viewTransactionDetails;
window.switchTab = switchTab;
window.downloadTransactions = downloadTransactions;
window.printView = printView;
window.updateProfile = updateProfile;
window.showSecurityCenter = showSecurityCenter;
window.showAlerts = showAlerts;
window.startBillPay = startBillPay;
window.startTransfer = startTransfer;
window.showMessages = showMessages;
window.showSpecialOffers = showSpecialOffers;
window.openAccount = openAccount;
window.showSpending = showSpending;
window.showGoals = showGoals;
window.showDeals = showDeals;
window.downloadStatement = downloadStatement;
window.generateReport = generateReport;
window.downloadTaxForms = downloadTaxForms;
window.showRewards = showRewards;
window.referFriend = referFriend;
window.showSecurity = showSecurity;
window.editPayment = editPayment;
window.viewAlert = viewAlert;
window.viewInvestmentDetails = viewInvestmentDetails;
window.refreshInvestments = refreshInvestments;
window.openSpendingTool = openSpendingTool;
window.openSavingsGoals = openSavingsGoals;
window.updateCreditScore = updateCreditScore;
window.showPrivacy = showPrivacy;
window.showTerms = showTerms;
window.showAccessibility = showAccessibility;
window.toggleMobileMenu = toggleMobileMenu;
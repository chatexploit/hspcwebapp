-- Users and Roles
CREATE TABLE Roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL, -- Super Admin, Sales, Field Staff, Customer
  permissions JSONB -- Store module access rights
);

CREATE TABLE Users (
  id SERIAL PRIMARY KEY,
  role_id INT REFERENCES Roles(id),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  base_salary DECIMAL(10, 2), -- For staff
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Global Settings
CREATE TABLE Settings (
  id SERIAL PRIMARY KEY,
  gst_enabled BOOLEAN DEFAULT FALSE,
  razorpay_enabled BOOLEAN DEFAULT FALSE,
  razorpay_key VARCHAR(255),
  razorpay_secret VARCHAR(255),
  travel_rate_per_km DECIMAL(10, 2) DEFAULT 3.00,
  company_name VARCHAR(150),
  company_logo_url TEXT,
  company_address TEXT,
  company_gstin VARCHAR(50)
);

-- Clients (CRM)
CREATE TABLE Clients (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES Users(id), -- If they have a Customer portal login
  company_name VARCHAR(150),
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales & Billing
CREATE TABLE Quotations (
  id SERIAL PRIMARY KEY,
  client_id INT REFERENCES Clients(id),
  status VARCHAR(20), -- Pending, Approved, Rejected
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE QuotationItems (
  id SERIAL PRIMARY KEY,
  quotation_id INT REFERENCES Quotations(id) ON DELETE CASCADE,
  service_description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE Invoices (
  id SERIAL PRIMARY KEY,
  client_id INT REFERENCES Clients(id),
  quotation_id INT REFERENCES Quotations(id),
  type VARCHAR(20), -- One-time, AMC
  hsn_code VARCHAR(20),
  subtotal DECIMAL(10, 2),
  gst_amount DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  due_date DATE,
  status VARCHAR(20) -- Unpaid, Partially Paid, Paid
);

CREATE TABLE InvoiceItems (
  id SERIAL PRIMARY KEY,
  invoice_id INT REFERENCES Invoices(id) ON DELETE CASCADE,
  service_description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE Payments (
  id SERIAL PRIMARY KEY,
  invoice_id INT REFERENCES Invoices(id),
  client_id INT REFERENCES Clients(id),
  amount DECIMAL(10, 2),
  payment_method VARCHAR(50), -- Cash, UPI, Bank Transfer, Online
  transaction_id VARCHAR(100),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AMC_Contracts (
  id SERIAL PRIMARY KEY,
  client_id INT REFERENCES Clients(id),
  invoice_id INT REFERENCES Invoices(id), -- The invoice that paid for the AMC
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_services INT NOT NULL,
  frequency VARCHAR(50), -- e.g., Monthly, Quarterly
  status VARCHAR(20) DEFAULT 'Active'
);

-- Jobs (Field Staff)
CREATE TABLE Jobs (
  id SERIAL PRIMARY KEY,
  invoice_id INT REFERENCES Invoices(id), -- A job is linked to a paid/active invoice
  amc_id INT REFERENCES AMC_Contracts(id),
  client_id INT REFERENCES Clients(id),
  assigned_to INT REFERENCES Users(id), -- Field Staff ID
  scheduled_date DATE,
  status VARCHAR(20), -- Scheduled, In Progress, Completed
  customer_signature TEXT, -- Base64 or URL
  notes TEXT
);

-- Travel Tracking
CREATE TABLE TravelLogs (
  id SERIAL PRIMARY KEY,
  staff_id INT REFERENCES Users(id),
  job_id INT REFERENCES Jobs(id),
  start_km DECIMAL(10, 2),
  end_km DECIMAL(10, 2),
  allowance_calculated DECIMAL(10, 2),
  log_date DATE
);

-- Expenses & Advances
CREATE TABLE FinancialRequests (
  id SERIAL PRIMARY KEY,
  staff_id INT REFERENCES Users(id),
  type VARCHAR(20), -- Expense, Salary Advance
  amount DECIMAL(10, 2),
  description TEXT,
  receipt_url TEXT,
  status VARCHAR(20), -- Pending, Approved, Rejected
  request_date DATE DEFAULT CURRENT_DATE,
  approval_date DATE
);

-- Inventory & Equipment
CREATE TABLE Inventory (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  type VARCHAR(50), -- Chemical, Machine
  stock_quantity DECIMAL(10, 2),
  unit VARCHAR(20)
);

CREATE TABLE ChemicalUsageLogs (
  id SERIAL PRIMARY KEY,
  job_id INT REFERENCES Jobs(id),
  inventory_id INT REFERENCES Inventory(id),
  quantity_used DECIMAL(10, 2)
);

CREATE TABLE EquipmentAssignments (
  id SERIAL PRIMARY KEY,
  inventory_id INT REFERENCES Inventory(id),
  staff_id INT REFERENCES Users(id),
  assigned_date DATE,
  condition_notes TEXT
);

-- Helpdesk / Requests
CREATE TABLE SupportTickets (
  id SERIAL PRIMARY KEY,
  client_id INT REFERENCES Clients(id),
  type VARCHAR(50), -- Service Request, Quote Request, Service Complaint, Staff Complaint
  description TEXT,
  status VARCHAR(20), -- Open, In Progress, Resolved
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

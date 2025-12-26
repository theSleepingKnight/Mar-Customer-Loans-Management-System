# Import/Export Guide for Customer and Loan Management System

## Overview
You can import and export customer and loan data using Excel (.xlsx) or CSV files.

## Export Data

### How to Export:
1. Go to **Customer Management** or **Loan Portfolio Management** page
2. Click the **"📥 Export Data"** button
3. An Excel file will be downloaded automatically
4. The file will be named: `customers_YYYY-MM-DD.xlsx` or `loans_YYYY-MM-DD.xlsx`

### Export Format:
- All current data in the system will be exported
- Includes all columns and fields
- Can be opened in Excel, Google Sheets, or any spreadsheet application

## Import Data

### How to Import:
1. Go to **Customer Management** or **Loan Portfolio Management** page
2. Click the **"📤 Import Existing Data"** button
3. Select your Excel (.xlsx, .xls) or CSV file
4. The system will automatically process and import the data
5. You'll see a success message with the number of records imported

### Customer Import Format

Your Excel file should have these columns (column names are case-insensitive):

| Column Name | Required | Description | Example |
|------------|----------|-------------|---------|
| Full Name | ✅ Yes | Customer's full name | Juan Dela Cruz |
| Contact Number | ✅ Yes | Phone number | 09123456789 |
| Address | ✅ Yes | Complete address | 123 Main St, Manila |
| ID Type | ❌ No | Type of ID (defaults to "National ID") | National ID, Driver's License, Passport, etc. |
| ID Number | ✅ Yes | ID number | 1234567890 |
| Date Registered | ❌ No | Registration date (defaults to today) | 2025-12-26 |
| Status | ❌ No | Active/Inactive (defaults to "Active") | Active |

**Example Customer Data:**
```
Full Name          | Contact Number | Address              | ID Type      | ID Number  | Date Registered | Status
-------------------|----------------|----------------------|--------------|------------|-----------------|--------
Juan Dela Cruz     | 09123456789    | 123 Main St, Manila  | National ID  | 1234567890 | 2025-12-26      | Active
Maria Santos       | 09987654321    | 456 Oak Ave, Quezon  | Driver's License | 9876543210 | 2025-12-25 | Active
```

### Loan Import Format

Your Excel file should have these columns:

| Column Name | Required | Description | Example |
|------------|----------|-------------|---------|
| Customer ID | ✅ Yes | Must match an existing customer ID | 1 |
| Loan Amount | ✅ Yes | Loan amount in pesos | 50000 |
| Interest Rate | ❌ No | Interest rate percentage (defaults to 0) | 5.5 |
| Loan Term | ❌ No | Weekly or Monthly (defaults to "Monthly") | Monthly |
| Start Date | ❌ No | Loan start date (defaults to today) | 2025-12-26 |
| End Date | ✅ Yes | Loan end date | 2026-12-26 |
| Loan Status | ❌ No | Pending/Approved/Active/Closed (defaults to "Pending") | Pending |

**Example Loan Data:**
```
Customer ID | Loan Amount | Interest Rate | Loan Term | Start Date  | End Date    | Loan Status
------------|-------------|---------------|-----------|-------------|-------------|------------
1           | 50000       | 5.5           | Monthly   | 2025-12-26  | 2026-12-26  | Pending
2           | 75000       | 6.0           | Weekly    | 2025-12-25  | 2026-06-25  | Approved
```

## Important Notes

### For Customer Import:
- ✅ **Required fields:** Full Name, Contact Number, Address, ID Number
- ✅ Column names can be: "Full Name", "full_name", "FullName", "Name", etc. (case-insensitive)
- ✅ Missing optional fields will use default values
- ✅ Duplicate data will be added as new records

### For Loan Import:
- ✅ **Required fields:** Customer ID, Loan Amount, End Date
- ✅ Customer ID must exist in the system first (import customers before loans)
- ✅ Column names are flexible (case-insensitive)
- ✅ Dates should be in format: YYYY-MM-DD

### File Requirements:
- ✅ Supported formats: `.xlsx`, `.xls`, `.csv`
- ✅ Maximum file size: 10MB
- ✅ First row should contain column headers
- ✅ Data starts from the second row

## Troubleshooting

### Import Errors:
- **"Customer ID not found"** - Make sure the customer exists before importing loans
- **"Missing required fields"** - Check that all required columns are present
- **"Invalid file format"** - Ensure file is Excel (.xlsx) or CSV format
- **"File is empty"** - Make sure your file has data rows

### Tips:
1. **Export first** - Export existing data to see the exact format
2. **Use the exported file as template** - Modify the exported file and re-import
3. **Check console** - Import errors are logged in browser console
4. **Import customers first** - Always import customers before loans
5. **Validate data** - Check dates, numbers, and required fields before importing

## Example Workflow

1. **Export existing customers:**
   - Click "Export Data" in Customer Management
   - Save the file

2. **Add new customers to the file:**
   - Open the exported Excel file
   - Add new rows with customer data
   - Save the file

3. **Import updated data:**
   - Click "Import Existing Data"
   - Select your updated file
   - New customers will be added to the system

4. **Repeat for loans:**
   - Export loans
   - Add new loan records
   - Import back

## Data Merging

- ✅ **New data is ADDED** - Importing doesn't replace existing data
- ✅ **Duplicate prevention** - System will add duplicates as new records
- ✅ **Data refresh** - After import, the table automatically refreshes to show new data

